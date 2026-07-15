import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { handleAdminCatalog, handleAdminSession, handlePublicCatalog } from "./admin-api.mjs";
import { handleQuoteAiRequest } from "./quote-ai-handler.mjs";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = resolve(projectRoot, "dist");
const host = process.env.SITE_HOST || "127.0.0.1";
const port = Number(process.env.SITE_PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

async function serveFile(req, res, pathname) {
  const requested = pathname === "/" || pathname === "/admin" || pathname === "/admin/"
    ? "index.html"
    : decodeURIComponent(pathname).replace(/^\/+/, "");
  let filePath = resolve(distRoot, requested);
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const details = await stat(filePath);
    if (details.isDirectory()) filePath = resolve(filePath, "index.html");
    const body = await readFile(filePath);
    res.setHeader("Content-Type", contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.statusCode = 200;
    if (req.method === "HEAD") res.end();
    else res.end(body);
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
}

const server = createServer((req, res) => {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
  let action;
  if (pathname === "/api/catalog") action = handlePublicCatalog(req, res);
  else if (pathname === "/api/admin/session") action = handleAdminSession(req, res);
  else if (pathname === "/api/admin/catalog") action = handleAdminCatalog(req, res);
  else if (pathname === "/api/quote-ai" || pathname === "/api/quote-ai/status") action = handleQuoteAiRequest(req, res);
  else if (req.method === "GET" || req.method === "HEAD") action = serveFile(req, res, pathname);
  else {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }
  Promise.resolve(action).catch(() => {
    if (res.headersSent) return res.end();
    res.statusCode = 500;
    res.end("Internal server error");
  });
});

server.listen(port, host, () => {
  process.stdout.write(`Aurora full-site preview: http://${host}:${port}\n`);
});
