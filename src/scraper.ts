import cheerio from "cheerio";
import axios from "axios";

const OSCAR_URL = process.env.OSCAR_URL;

const class_seat_selector =
    "body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(4)";
const wl_seat_selector =
    "body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(4)";
const class_name_selector =
    "body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(1) > th";

export function parse(data: string) {
    const $ = cheerio.load(data);
    const class_seats = $(class_seat_selector).text().trim();
    const wl_seats = $(wl_seat_selector).text().trim();
    const og_name = $(class_name_selector).text().trim();
    return { class_seats, wl_seats, og_name };
}

export async function scrape(crn: number) {
    try {
        const { data } = await axios({
            method: "get",
            url: `${OSCAR_URL}${crn}`,
            timeout: 5000,
        });
        return parse(data);
    } catch (e) {
        console.error(`[scraper] Error fetching oscar -> ${e}`);
        return { class_seats: null, wl_seats: null, og_name: null };
    }
}
