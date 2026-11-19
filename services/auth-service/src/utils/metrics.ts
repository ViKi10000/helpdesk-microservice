import {
  Registry,
  collectDefaultMetrics,
  Counter,
  Histogram,
} from "prom-client";

import type { RequestHandler } from "express";

export const register = new Registry();

collectDefaultMetrics({ register });

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "status_code"],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "status_code"],
  registers: [register],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const labels = {
      method: req.method,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    end(labels);
  });

  next();
};
