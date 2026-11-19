
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";
import { register, metricsMiddleware } from "./utils/metrics.ts";

import { services } from "./config/services.ts";
import errorMiddleware from "./middleware/error.middleware.ts";
import { handleProxyError } from "./middleware/proxy-error.middleware.ts";
import requestIdMiddleware from "./middleware/request-id.middleware.ts";

const app = express();

app.use(requestIdMiddleware);

app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "api-gateway",
    message: "API Gateway is running",
  });
});

// Forward authentication requests
app.use(
  "/auth",
  createProxyMiddleware({
    target: services.auth,
    changeOrigin: true,
    pathRewrite: (path) => `/auth${path}`,
    on: {
      error: handleProxyError,
    },
  })
);

// Forward ticket requests
app.use(
  "/tickets",
  createProxyMiddleware({
    target: services.ticket,
    changeOrigin: true,
    pathRewrite: (path) => `/tickets${path}`,
    on: {
      error: handleProxyError,
    },
  })
);

app.use(errorMiddleware);

export default app;
