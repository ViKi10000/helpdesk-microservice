
import type { ErrorRequestHandler } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

const errorMiddleware: ErrorRequestHandler = (
  error: AppError,
  req,
  res,
  next
) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    typeof error.statusCode === "number" &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
      ? error.statusCode
      : 500;

  const isProduction = process.env.NODE_ENV === "production";

  const errorCode =
    error.code ||
    (statusCode === 500
      ? "INTERNAL_SERVER_ERROR"
      : "REQUEST_ERROR");

  const message =
    statusCode === 500 && isProduction
      ? "Something went wrong. Please try again later."
      : error.message || "Something went wrong";

  console.error({
    message: "API Gateway Error",
    error: error.message,
    code: errorCode,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    requestId: req.headers["x-request-id"],
    stack: isProduction ? undefined : error.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
    },
    requestId: req.headers["x-request-id"] || undefined,
  });
};

export default errorMiddleware;
