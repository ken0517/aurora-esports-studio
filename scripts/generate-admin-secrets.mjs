import { createHash, randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
const bytes = randomBytes(22);
const password = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
const passwordHash = createHash("sha256").update(password).digest("hex");
const sessionSecret = randomBytes(48).toString("base64url");

process.stdout.write([
  "Aurora admin credentials (save the password somewhere secure):",
  "",
  `ADMIN PASSWORD: ${password}`,
  "",
  "Add these server-side environment variables to Vercel:",
  `AURORA_ADMIN_PASSWORD_SHA256=${passwordHash}`,
  `AURORA_ADMIN_SESSION_SECRET=${sessionSecret}`,
  "",
].join("\n"));
