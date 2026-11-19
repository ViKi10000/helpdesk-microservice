import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incomingRequestId = req.headers["x-request-id"];

  const requestId =
    typeof incomingRequestId === "string" && incomingRequestId.trim()
      ? incomingRequestId
      : randomUUID();

  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  next();
};

export default requestIdMiddleware;
