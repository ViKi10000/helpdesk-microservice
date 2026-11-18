
import type { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  console.error("Gateway Error:", error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
};

export default errorMiddleware;
