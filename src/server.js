import cors from "cors";
import express from "express";

import routers from "./routes/index.js";
import { error } from "./utils/response.js";
import { cronJobs } from "./services/cronJob.js";
import { errorFileWriter } from "./services/fileWrite.js";

import { register } from "./prometheus/prometheus.js";
import { generalPrometheusMiddleware } from "./middlewares/prometheus/general.js";
import { reqResSizeSpeed } from "./middlewares/prometheus/requestResponseSpeed.js";
import { httpReqSizeByte } from "./middlewares/prometheus/requestSizeByteCounter.js";
import { httpResSizeByte } from "./middlewares/prometheus/responseSizeByteCounter.js";
import { antiXSSPolicy } from "./middlewares/jwt.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: false, limit: "100mb"}));
app.use(express.json({limit: "100mb"}));

app.use(cors({
  origin: ["https://cypherexim.com", "https://app.cypherexim.com", "https://eximine.com", "http://localhost:4200"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Access-Token', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true
}));

cronJobs(); //start cron jobs

//metrics middlewares
app.use([
    antiXSSPolicy,
    reqResSizeSpeed,
    httpResSizeByte,
    httpReqSizeByte,
    generalPrometheusMiddleware
]);

//*********************APIs*************************//
app.get("/", (req, res, next) => res.send("Cypher Portal 2.0 APIs"));
app.use("/api", routers);

//********************Metrics***********************//
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register?.contentType);
  res.send(await register?.metrics());
});

//404 not found
app.all("/{*any}", (req, res) => res?.send("<h1>404 Not Found!</h1>"));

//error handler
app.use(async(err, req, res, next) => {
    const errMsg = err?.errorMsg || "Something went wrong";
    const errStack = err?.errorStack || "Something went wrong";
    
    await errorFileWriter(errStack); //error log writer

    return res?.status(err?.statusCode || 500)?.json(error(errMsg, err?.statusCode));
});

app.listen(PORT, () => {
    console.log("Server is running on Port:", PORT);
    console.log("click here: http://localhost:"+PORT);
});
