import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({

    register

});

export const httpRequestCounter =

    new client.Counter({

        name: "http_requests_total",

        help: "Total HTTP Requests"

    });

export const activeRequests =

    new client.Gauge({

        name: "active_requests",

        help: "Current Active Requests"

    });

export const responseTimeHistogram =

    new client.Histogram({

        name: "http_response_time_ms",

        help: "HTTP Response Time",

        buckets: [50, 100, 200, 300, 500, 1000]

    });

register.registerMetric(httpRequestCounter);

register.registerMetric(activeRequests);

register.registerMetric(responseTimeHistogram);

export default register;