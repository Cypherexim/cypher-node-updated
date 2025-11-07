import cluster from "node:cluster";
import { availableParallelism } from "node:os";

import { startServer } from "./src/app.js";

const numberOfCPUs = 1;//availableParallelism();

if(cluster.isPrimary) {
    for(let i=0; i<numberOfCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    startServer();
}

