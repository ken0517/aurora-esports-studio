import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const adminUrl = process.env.VITE_AURORA_ADMIN_URL || "https://aurora-esports-api.vercel.app/admin";
const outputDirectory = resolve("dist", "admin");
const escapedUrl = adminUrl.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const html = `<!doctype html>
<html lang="zh-Hans">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <meta http-equiv="refresh" content="0; url=${escapedUrl}" />
    <title>Aurora 管理后台</title>
  </head>
  <body>
    <p>正在打开 <a href="${escapedUrl}">Aurora 管理后台</a>…</p>
  </body>
</html>`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "index.html"), html, "utf8");
