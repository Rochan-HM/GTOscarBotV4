import prisma from "./database";
import { parse } from "./scraper";
import axios from "axios";
import throat from "throat";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const checkFalsy = (arg: any) => arg !== null && arg !== undefined;

const sendMessage = (update: boolean, message: string, crn: number = -1) => {
    (<any>process).send({
        update,
        message,
        crn,
    });
};

const SLEEP_TIME = +process.env.SLEEP_TIME!;
const OSCAR_URL = process.env.OSCAR_URL!;
const CONCURRENCY = +process.env.CONCURRENCY!;

process.on("message", async (msg: string) => {
    let previous;
    try {
        previous = await prisma.cRN.findMany({
            select: {
                crn_id: true,
                class_seats: true,
                waitlist_seats: true,
            },
        });
    } catch (e) {
        console.error(`[Worker] Database fetch failed -> ${e}`);
        sendMessage(false, "Database fetch to failed");
        return;
    }

    if (previous.length === 0) {
        await sleep(SLEEP_TIME);
        sendMessage(false, "Empty");
        return;
    }

    const request = previous.map(
        throat(CONCURRENCY, ({ crn_id }) =>
            axios({
                method: "get",
                url: `${OSCAR_URL}${crn_id}`,
                timeout: 5000,
            })
        )
    );

    let response;
    try {
        response = await Promise.all(request);
    } catch (e) {
        console.error(`[Worker] OSCAR Fetch Error -> ${e}`);
        await sleep(SLEEP_TIME);
        sendMessage(false, "Oscar Fetcher Error");
        return;
    }

    for (const [idx, res] of response.entries()) {
        const {
            class_seats: c_seats,
            wl_seats: w_seats,
            og_name: c_name,
        } = parse(res.data);
        const crn = previous[idx].crn_id;

        if (!c_seats && !w_seats && !c_name) {
            console.error(`[Worker] OSCAR Fetch Error -> Skipping CRN ${crn}`);
            await sleep(SLEEP_TIME);
            continue;
        }
        console.log(
            `[Worker] CRN: ${crn} -> ${c_seats} Class | ${w_seats} Waitlist | ${c_name}`
        );

        // Convert to numbers
        const class_seats = +c_seats;
        const wl_seats = +w_seats;

        // Get current status
        const curr_class_status = class_seats > 0 ? "o" : "c";
        const curr_wl_status = wl_seats > 0 ? "o" : "c";

        // Get previous status
        if (
            !checkFalsy(previous[idx].class_seats) ||
            !checkFalsy(previous[idx].waitlist_seats)
        ) {
            console.log(`${crn} does not exist in database. Skipping ... `);
            continue;
        }
        const prev_class_status = previous[idx].class_seats > 0 ? "o" : "c";
        const prev_wl_status = previous[idx].waitlist_seats > 0 ? "o" : "c";

        try {
            // Set the new status
            await prisma.cRN.update({
                where: {
                    crn_id: crn,
                },
                data: {
                    class_seats,
                    waitlist_seats: wl_seats,
                },
            });
        } catch (e) {
            console.error(`[Worker] Database update failed -> ${e.message}`);
            sendMessage(false, "Database update failed");
            return;
        }

        // Check if class status has changed and wl status has not changed
        if (
            prev_class_status !== curr_class_status &&
            prev_wl_status === curr_wl_status
        ) {
            // If previous status was closed and now it is open
            if (prev_class_status === "c" && curr_class_status === "o") {
                sendMessage(true, "Class Open Notice!", crn);
            }
            // If previous status was open and now it is closed
            else if (prev_class_status === "o" && curr_class_status === "c") {
                sendMessage(true, "Class Closure Notice!", crn);
            }
        }

        // Check if wl status has changed and class status has not changed
        else if (
            prev_wl_status !== curr_wl_status &&
            prev_class_status === curr_class_status
        ) {
            // If previous status was closed and now it is open
            if (prev_wl_status === "c" && curr_wl_status === "o") {
                sendMessage(true, "Waitlist Open Notice!", crn);
            }
            // If previous status was open and now it is closed
            else if (prev_wl_status === "o" && curr_wl_status === "c") {
                sendMessage(true, "Waitlist Closure Notice!", crn);
            }
        }

        // Else both have changed
        else {
            // If previous class status was closed and now it is open.
            if (prev_class_status === "c" && curr_class_status === "o") {
                // If previous wl status was closed and now it is open
                if (prev_wl_status === "c" && curr_wl_status === "o") {
                    sendMessage(true, "Class Open, Waitlist Open Notice!", crn);
                }
                // If previous wl status was open and now it is closed
                if (prev_wl_status === "o" && curr_wl_status === "c") {
                    sendMessage(
                        true,
                        "Class Open, Waitlist Closure Notice!",
                        crn
                    );
                }
            }
            // If previous class status was open and now it is closed
            else if (prev_class_status === "o" && curr_class_status === "c") {
                // If previous wl status was closed and now it is open
                if (prev_wl_status === "c" && curr_wl_status === "o") {
                    sendMessage(
                        true,
                        "Class Closure, Waitlist Open Notice!",
                        crn
                    );
                    // await notifier((msg = "Class Closure Notice!"), (crn = crn));
                }
                // If previous wl status was open and now it is closed
                else if (prev_wl_status === "o" && curr_wl_status === "c") {
                    sendMessage(
                        true,
                        "Class Closure, Waitlist Closure Notice!",
                        crn
                    );
                }
            }
        }
    }

    await sleep(SLEEP_TIME);
    sendMessage(false, "Success");
});
