import { randomUUID } from "node:crypto";
import { get as getBlob, put as putBlob } from "@vercel/blob";
import { normalizeOperationsState } from "./operations-model.mjs";

const operationsKey = "aurora:operations:v1";
const operationsBlobPath = "aurora/operations-v1.json";
let memoryOperations = null;

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
  if (!response.ok) throw new Error(`operations-storage-error:${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error("operations-storage-error");
  return payload.result;
}

export function createOperationsStore({ env = process.env, fetchImpl = fetch } = {}) {
  const settings = redisSettings(env);
  const blobConfigured = Boolean(
    env.BLOB_READ_WRITE_TOKEN || (env.VERCEL_OIDC_TOKEN && env.BLOB_STORE_ID),
  );
  const allowMemory = env.AURORA_ALLOW_MEMORY_STORAGE === "true" || env.NODE_ENV === "test";

  return {
    configured: Boolean(settings || blobConfigured || allowMemory),
    backend: settings ? "redis" : blobConfigured ? "vercel-blob" : allowMemory ? "memory" : "none",

    async read() {
      let raw = null;
      if (settings) raw = await redisCommand(settings, ["GET", operationsKey], fetchImpl);
      else if (blobConfigured) {
        const result = await getBlob(operationsBlobPath, { access: "private", useCache: false });
        raw = result?.statusCode === 200 ? await new Response(result.stream).text() : null;
      } else if (allowMemory) raw = memoryOperations;
      if (!raw) return normalizeOperationsState({});
      try {
        return normalizeOperationsState(typeof raw === "string" ? JSON.parse(raw) : raw);
      } catch {
        return normalizeOperationsState({});
      }
    },

    async write(input, expectedRevision = null) {
      if (!settings && !blobConfigured && !allowMemory) throw new Error("operations-storage-not-configured");
      const current = await this.read();
      if (expectedRevision !== null && current.revision !== expectedRevision) {
        const error = new Error("operations-revision-conflict");
        error.current = current;
        throw error;
      }
      const state = normalizeOperationsState(input);
      state.updatedAt = new Date().toISOString();
      state.revision = randomUUID();
      const serialized = JSON.stringify(state);
      if (settings) await redisCommand(settings, ["SET", operationsKey, serialized], fetchImpl);
      else if (blobConfigured) {
        await putBlob(operationsBlobPath, serialized, {
          access: "private",
          allowOverwrite: true,
          contentType: "application/json; charset=utf-8",
          cacheControlMaxAge: 60,
        });
      } else memoryOperations = serialized;
      return state;
    },
  };
}
