import { randomUUID } from "node:crypto";
import {
  createDefaultRuntimeCatalog,
  normalizeRuntimeCatalog,
} from "../src/data/runtimeCatalog.js";

const catalogKey = "aurora:runtime-catalog:v1";
let memoryCatalog = null;

function redisSettings(env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: String(url).replace(/\/$/, ""), token } : null;
}

async function redisCommand(settings, command, fetchImpl) {
  const response = await fetchImpl(settings.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`catalog-storage-error:${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error("catalog-storage-error");
  return payload.result;
}

export function createCatalogStore({ env = process.env, fetchImpl = fetch } = {}) {
  const settings = redisSettings(env);
  const allowMemory = env.AURORA_ALLOW_MEMORY_STORAGE === "true" || env.NODE_ENV === "test";

  return {
    configured: Boolean(settings || allowMemory),
    backend: settings ? "redis" : allowMemory ? "memory" : "none",

    async read() {
      let raw = null;
      if (settings) raw = await redisCommand(settings, ["GET", catalogKey], fetchImpl);
      else if (allowMemory) raw = memoryCatalog;
      if (!raw) return createDefaultRuntimeCatalog();
      try {
        return normalizeRuntimeCatalog(typeof raw === "string" ? JSON.parse(raw) : raw);
      } catch {
        return createDefaultRuntimeCatalog();
      }
    },

    async write(input, expectedRevision = null) {
      if (!settings && !allowMemory) throw new Error("catalog-storage-not-configured");
      const current = await this.read();
      if (expectedRevision && current.revision !== expectedRevision) {
        const error = new Error("catalog-revision-conflict");
        error.current = current;
        throw error;
      }
      const catalog = normalizeRuntimeCatalog(input, { preserveRevision: false });
      catalog.updatedAt = new Date().toISOString();
      catalog.revision = randomUUID();
      const serialized = JSON.stringify(catalog);
      if (settings) await redisCommand(settings, ["SET", catalogKey, serialized], fetchImpl);
      else memoryCatalog = serialized;
      return catalog;
    },
  };
}
