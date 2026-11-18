
import type { RequestHandler } from "express";

const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Admin access required",
      },
    });
    return;
  }

  next();
};

export default requireAdmin;
