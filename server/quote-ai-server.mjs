import { createServer } from "node:http";
import { handleQuoteAiRequest } from "./quote-ai-handler.mjs";

const port = Number(process.env.AI_PORT || 8787);
const host = process.env.AI_HOST || "127.0.0.1";

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/quote-ai" || url.pathname === "/api/quote-ai/status") {
    handleQuoteAiRequest(req, res);
    return;
  }
  const body = JSON.stringify({ error: "not-found" });
  res.writeHead(404, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
});

server.listen(port, host, () => {
  const configured = Boolean(
    process.env.GEMINI_API_KEY &&
    (!process.env.GEMINI_MODEL || process.env.GEMINI_MODEL === "gemini-3.1-flash-lite"),
  );
  process.stdout.write(`Aurora quote AI server: http://${host}:${port}/api/quote-ai (${configured ? "configured" : "AI not configured"})\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
