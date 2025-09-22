import path from "path";
import { DateTime } from "luxon";
import { fileURLToPath } from "url";
import { unlink } from "fs/promises";
import { schedule } from "node-cron";

import { errorFileWriter } from "./fileWrite.js";
import { getCurrentIndianTime } from "../utils/utility.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetedTime = "30 11 * * 0";

const getLast7DaysFromToday = (today) => {
    const last7thDays = [];

    for(let i=1; i<=7; i++) {
        const prevDay = new Date(today);
        prevDay.setDate(prevDay.getDate() - i);
        last7thDays.push(DateTime.fromMillis(prevDay.valueOf()).toSQLDate());
    }

    return last7thDays;
}

export const cronJobs = () => {
    schedule(targetedTime, async() => {
        try {
            const today = new Date(getCurrentIndianTime().valueOf());
            const last7thDayDate = today.setDate(today.getDate() - 7);
    
            const allLast7DaysList = getLast7DaysFromToday(last7thDayDate.valueOf());
    
            for(let i=0; i<allLast7DaysList?.length; i++) {
                try {
                    const filePath =  path.join(__dirname, "../../public/logs/", `${allLast7DaysList[i]}.txt`);
                    await unlink(filePath);
                } catch (error) { continue; }
            }
        } catch (error) { await errorFileWriter(error?.stack); }
    });
}


