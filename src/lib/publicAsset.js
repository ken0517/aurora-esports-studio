/**
 * Resolve files copied from `public/` against Vite's configured base path.
 * This keeps local development on `/` and GitHub Pages builds under the
 * repository subpath without hard-coded root-relative URLs.
 */
export function publicAsset(path) {
  const relativePath = String(path ?? "").replace(/^\/+/, "");
  const baseUrl = import.meta.env?.BASE_URL ?? "/";
  return `${baseUrl}${relativePath}`;
}
