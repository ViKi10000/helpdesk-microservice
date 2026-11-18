
import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export const authenticateInternalService = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const internalKey = process.env.INTERNAL_SERVICE_KEY;
  const providedKey = req.headers["x-internal-key"];

  if (!internalKey) {
    console.error("INTERNAL_SERVICE_KEY is not configured");

    res.status(500).json({
      success: false,
      message: "Internal server configuration error",
    });
    return;
  }

  if (typeof providedKey !== "string") {
    res.status(401).json({
      success: false,
      message: "Unauthorized internal request",
    });
    return;
  }

  const expectedBuffer = Buffer.from(internalKey);
  const providedBuffer = Buffer.from(providedKey);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    res.status(401).json({
      success: false,
      message: "Unauthorized internal request",
    });
    return;
  }

  next();
};
