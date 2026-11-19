
import express from "express";
import helmet from "helmet";
import ticketRoutes from "./routes/ticket.routes.ts";
import errorMiddleware from "./middleware/error.middleware.ts";
import requestIdMiddleware from "./middleware/request-id.middleware.ts";
import { register, metricsMiddleware } from "./utils/metrics.ts";

const app = express();

app.use(requestIdMiddleware);
app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "ticket-service",
    message: "Ticket Service is running",
  });
});

app.use("/tickets", ticketRoutes);

// Centralized error handler must be registered last.
app.use(errorMiddleware);

export default app;
