import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { getCurrentIndianTime } from "../utils/utility.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getErrorContent = (errorStack) => {
    const errorTime = getCurrentIndianTime()?.toFormat("hh:mm a");
    const partitionStart = `/*********************************************[ ${errorTime} ]***********************************************/\n\n`;
    const partitionEnd = `\n\n/****************************************************************************************************/\n\n\n`;

    return partitionStart + errorStack + partitionEnd;
}

export const errorFileWriter = async(wholeErrorStack) => {
    const todayDate = getCurrentIndianTime()?.toSQLDate();
    const errorContent = getErrorContent(wholeErrorStack);
    const filePath =  path.join(__dirname, "../../public/logs/", `${todayDate}.txt`);

    await fs?.appendFile(filePath, errorContent, "utf-8");
}
