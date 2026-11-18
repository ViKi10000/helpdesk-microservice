
import type { RequestHandler } from "express";
import { verifyAccessToken } from "../utils/jwt.ts";

const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check authorization header
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token is required",
      },
    });
    return;
  }

  // Extract token
  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid authorization header",
      },
    });
    return;
  }

  try {
    // Verify JWT
    const decoded = verifyAccessToken(token);

    // Attach authenticated user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token",
      },
    });
  }
};

export default authMiddleware;
