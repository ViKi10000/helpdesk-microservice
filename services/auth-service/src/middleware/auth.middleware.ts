
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";

const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;

if (!publicKeyPath) {
  throw new Error("JWT_PUBLIC_KEY_PATH is not configured");
}

const resolvedPublicKeyPath = path.resolve(
  process.cwd(),
  "../../",
  publicKeyPath
);

const publicKey = fs.readFileSync(resolvedPublicKeyPath, "utf8");

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin";
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Access token required",
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      message: "Invalid authorization header",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: "helpdesk-auth",
      audience: "helpdesk-api",
    }) as JwtPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string" ||
      (decoded.role !== "user" && decoded.role !== "admin")
    ) {
      res.status(401).json({
        message: "Invalid access token",
      });
      return;
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
