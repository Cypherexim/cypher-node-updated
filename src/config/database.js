import {Pool} from "pg";

import environment from "./environment.js";
import { writeExcelFileService } from "../services/excelWrite.js";


const connPool = new Pool({
    user: environment.database.user,
    host: environment.database.host,
    database: environment.database.dbName,
    password: environment.database.pass,
    port: environment.database.port,

    min: 2,
    max: 50,
    idleTimeoutMillis: 1000*30, 
    connectionTimeoutMillis: 1000*15,
    statement_timeout: 1000*90,
    query_timeout: 1000*90
});

connPool.on("error", async(err) => {
    await writeExcelFileService(err?.stack);
    if (err.message.includes('in recovery mode')) {
        console.error('Database is in recovery mode. Retrying in 5 seconds...');
    } else { console.error('DB Error:', err); }
});

connPool.connect().then((res) => {
    console.log("DB is connected!");
}).catch(async(err) => await writeExcelFileService(err?.stack));


export default connPool;
