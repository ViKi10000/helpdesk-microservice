
import type { Request, Response } from "express";
import type { Socket } from "node:net";

export const handleProxyError = (
  error: Error,
  _req: Request,
  res: Response | Socket
): void => {
  console.error("Downstream Service Error:", error);

  if ("headersSent" in res) {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "The requested service is currently unavailable",
        },
      });
    }

    return;
  }

  res.destroy();
};
