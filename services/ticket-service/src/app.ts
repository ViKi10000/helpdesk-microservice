
import express from "express";
import helmet from "helmet";
import ticketRoutes from "./routes/ticket.routes.ts";
import errorMiddleware from "./middleware/error.middleware.ts";

const app = express();

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
