import {Pool} from "pg";
import environment from "./environment.js";

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

connPool.on("error", (err) => {
    console.info(err);
    if (err.message.includes('in recovery mode')) {
        console.error('Database is in recovery mode. Retrying in 5 seconds...');
    } else { console.error('DB Error:', err); }
});

connPool.connect().then((res) => {
    console.log("DB is connected!");
}).catch(err => console.log(err));


export default connPool;
