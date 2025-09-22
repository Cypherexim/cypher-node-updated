import { httpResponseSizeBytes } from "../../prometheus/prometheus.js";

export const httpResSizeByte = (req, res, next) => {
  let responseSize = 0;

  const originalWrite = res.write;
  const originalEnd = res.end;

  // Wrap res.write to count chunk sizes
  res.write = function (chunk, ...args) {
    if (chunk) {
      responseSize += Buffer.byteLength(chunk);
    }
    return originalWrite.call(this, chunk, ...args);
  };

  // Wrap res.end to count final chunk size and record the metric
  res.end = function (chunk, ...args) {
    if (chunk) {
      responseSize += Buffer.byteLength(chunk);
    }

    httpResponseSizeBytes.labels(
      req.method,
      req.route?.path || req.path,
      res.statusCode
    ).inc(responseSize);

    return originalEnd.call(this, chunk, ...args);
  };

  next();
}

