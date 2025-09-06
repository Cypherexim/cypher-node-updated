import dotEnv from "dotenv";

dotEnv.config();

const environment = {
    development: {
        database: {
            host: "18.214.151.123",
            port: "5432",
            user: "apiuser",
            pass: "api123",
            dbName: "exim_portal_db"
        }
    },

    production: {
        database: {
            host: "",
            port: "",
            user: "",
            pass: "",
            dbName: ""
        }
    }
}

export default environment[process.env.IS_PRODUCTION ? "production": "development"];

