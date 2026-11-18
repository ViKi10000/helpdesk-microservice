
import jwt from "jsonwebtoken";
import fs from "node:fs";
import path from "node:path";

interface TokenPayload {
  sub: string;
  email: string;
  role: "user" | "admin";
}

const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;
const issuer = process.env.JWT_ISSUER;
const audience = process.env.JWT_AUDIENCE;

if (!publicKeyPath || !issuer || !audience) {
  throw new Error("JWT configuration is incomplete");
}

const resolvedPublicKeyPath = path.resolve(
  process.cwd(),
  "../../",
  publicKeyPath
);

const publicKey = fs.readFileSync(resolvedPublicKeyPath, "utf8");

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer,
    audience,
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    (decoded.role !== "user" && decoded.role !== "admin")
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };
};
