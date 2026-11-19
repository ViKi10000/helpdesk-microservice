
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin@12345";

function ensureEnv(examplePath, envPath) {
  const example = path.join(root, examplePath);
  const target = path.join(root, envPath);

  if (!fs.existsSync(target)) {
    if (!fs.existsSync(example)) {
      throw new Error(`Missing environment example: ${examplePath}`);
    }

    fs.copyFileSync(example, target);
    console.log(`Created ${envPath}`);
  } else {
    console.log(`Already exists: ${envPath}`);
  }
}

function readEnv(file) {
  return fs.readFileSync(file, "utf8");
}

function getValue(content, key) {
  const line = content.split(/\r?\n/).find((item) =>
    item.startsWith(`${key}=`)
  );

  return line ? line.slice(key.length + 1).trim() : "";
}

function setValue(file, key, value) {
  let content = readEnv(file);
  const pattern = new RegExp(`^${key}=.*$`, "m");

  if (pattern.test(content)) {
    content = content.replace(pattern, `${key}=${value}`);
  } else {
    content += `${content.endsWith("\n") ? "" : "\n"}${key}=${value}\n`;
  }

  fs.writeFileSync(file, content);
}

const envFiles = {
  gateway: "services/api-gateway/.env",
  auth: "services/auth-service/.env",
  ticket: "services/ticket-service/.env",
  frontend: "frontend/.env",
};

ensureEnv("services/api-gateway/.env.example", envFiles.gateway);
ensureEnv("services/auth-service/.env.example", envFiles.auth);
ensureEnv("services/ticket-service/.env.example", envFiles.ticket);
ensureEnv("frontend/.env.example", envFiles.frontend);

// Configure one shared internal service secret.
const authKey = getValue(readEnv(envFiles.auth), "INTERNAL_SERVICE_KEY");
const ticketKey = getValue(readEnv(envFiles.ticket), "INTERNAL_SERVICE_KEY");
const placeholder = "replace-with-a-long-random-secret";

if (
  authKey &&
  ticketKey &&
  authKey !== placeholder &&
  ticketKey !== placeholder &&
  authKey !== ticketKey
) {
  throw new Error(
    "Auth and Ticket have different INTERNAL_SERVICE_KEY values. " +
    "Make them identical, then run setup again."
  );
}

const sharedKey =
  authKey && authKey !== placeholder
    ? authKey
    : ticketKey && ticketKey !== placeholder
      ? ticketKey
      : crypto.randomBytes(32).toString("hex");

setValue(envFiles.auth, "INTERNAL_SERVICE_KEY", sharedKey);
setValue(envFiles.ticket, "INTERNAL_SERVICE_KEY", sharedKey);

console.log("Configured shared internal service key.");

// Configure fixed local admin credentials.
setValue(envFiles.auth, "ADMIN_EMAIL", ADMIN_EMAIL);
setValue(envFiles.auth, "ADMIN_PASSWORD", ADMIN_PASSWORD);

console.log("\nAdmin credentials configured:");
console.log(`Email: ${ADMIN_EMAIL}`);
console.log(`Password: ${ADMIN_PASSWORD}`);

// Generate matching RSA keys if either key is missing.
const keysDir = path.join(root, "keys");
const privateKeyPath = path.join(keysDir, "private.pem");
const publicKeyPath = path.join(keysDir, "public.pem");

fs.mkdirSync(keysDir, { recursive: true });

if (
  !fs.existsSync(privateKeyPath) ||
  !fs.existsSync(publicKeyPath)
) {
  const pair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  fs.writeFileSync(privateKeyPath, pair.privateKey);
  fs.writeFileSync(publicKeyPath, pair.publicKey);

  console.log("Generated matching RSA key pair.");
} else {
  console.log("Existing RSA key pair preserved.");
}

console.log("\nLocal setup completed.");
