import Client from "prom-client";

export const register = new Client.Registry();

Client.collectDefaultMetrics({register});

// number of open connections
export const openConnections = new Client.Gauge({
  name: 'expressjs_number_of_open_connections',
  help: 'Number of open HTTP connections',
  labelNames: ['instance']
});
register.registerMetric(openConnections);

// Counter: Count HTTP requests
export const requestCounter = new Client.Counter({
    name: 'http_requests_total_counts',
    help: 'Total HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
register.registerMetric(requestCounter);

// Histogram: Measure response duration
export const requestDuration = new Client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});
register.registerMetric(requestDuration);

////////////////////////// REQUEST / RESPONSE (SPEED) /////////////////////////////
export const responseSize = new Client.Counter({
  name: 'http_response_size_bytes',
  help: 'Total size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status']
});
register.registerMetric(responseSize);

export const requestSize = new Client.Counter({
  name: 'http_request_size_bytes',
  help: 'Total size of HTTP requests in bytes',
  labelNames: ['method', 'route']
});
register.registerMetric(requestSize);


////////// response & request byte size counter ///////////////
export const httpResponseSizeBytes = new Client.Counter({
  name: 'http_response_size_bytes_sum',
  help: 'Total size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'code']
});
register.registerMetric(httpResponseSizeBytes);

export const httpRequestSizeBytes = new Client.Counter({
  name: 'http_request_size_bytes_sum',
  help: 'Total size of incoming HTTP requests in bytes',
  labelNames: ['method', 'route'],
});
register.registerMetric(httpRequestSizeBytes);

