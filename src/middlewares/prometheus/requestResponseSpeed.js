import { requestSize, responseSize } from "../../prometheus/prometheus.js";

export const reqResSizeSpeed = (req, res, next) => {
    let reqBytes = parseInt(req.headers['content-length'] || '0', 10);
    requestSize.labels(req.method, req.path).inc(reqBytes);

    let oldWrite = res.write, oldEnd = res.end;
    let responseBytes = 0;

    res.write = function (chunk) {
        if (chunk) responseBytes += chunk.length;
        return oldWrite.apply(res, arguments);
    };
    res.end = function (chunk) {
        if (chunk) responseBytes += chunk.length;
        responseSize.labels(req.method, req.path, res.statusCode).inc(responseBytes);
        return oldEnd.apply(res, arguments);
    };

    next();
}

