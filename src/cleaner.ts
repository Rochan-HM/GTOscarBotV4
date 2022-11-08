import cron from "node-cron";
import prisma from "./database";

export default () => {
  cron.schedule("*/1 * * * *", async () => {
    const orphanCourses = await prisma.cRN.deleteMany({
      where: {
        UserTracking: {
          none: {},
        },
      },
    });

    console.log(`[Cleaner] ${orphanCourses.count} orphan course(s) deleted`);
  });
};
