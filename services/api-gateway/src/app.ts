
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createProxyMiddleware } from "http-proxy-middleware";

import { services } from "./config/services.ts";
import errorMiddleware from "./middleware/error.middleware.ts";
import { handleProxyError } from "./middleware/proxy-error.middleware.ts";

const app = express();

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
