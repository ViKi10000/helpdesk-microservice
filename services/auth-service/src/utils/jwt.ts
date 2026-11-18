
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";

interface TokenPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;

if (!privateKeyPath) {
  throw new Error("JWT_PRIVATE_KEY_PATH is not configured");
}

const resolvedPrivateKeyPath = path.resolve(
  process.cwd(),
  "../../",
  privateKeyPath
);

const privateKey = fs.readFileSync(resolvedPrivateKeyPath, "utf8");

export const generateAccessToken = (user: TokenPayload): string => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    privateKey,
    {
      algorithm: "RS256",
      subject: user.sub,
      expiresIn: "15m",
      issuer: "helpdesk-auth",
      audience: "helpdesk-api",
    }
  );
};
