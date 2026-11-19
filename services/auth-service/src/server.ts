
import "dotenv/config";
import "./instrumentation.ts";
import express from "express";

import connectDB from "./config/database.ts";
import authRoutes from "./routes/auth.routes.ts";
import internalRoutes from "./routes/internal.routes.ts";
import requestIdMiddleware from "./middleware/request-id.middleware.ts";
import { register, metricsMiddleware } from "./utils/metrics.ts";


const app = express();

app.use(requestIdMiddleware);
app.use(metricsMiddleware);

app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/internal", internalRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth service is running",
  });
});

const PORT = process.env.PORT || 4001;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth Service:", error);
    process.exit(1);
  }
};

void startServer();
