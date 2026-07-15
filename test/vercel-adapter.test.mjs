import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import quoteAiFunction from "../api/quote-ai.mjs";
import quoteAiStatusFunction from "../api/quote-ai/status.mjs";

async function withFunctionServer(handler, run) {
  const server = createServer((req, res) => {
    Promise.resolve(handler(req, res)).catch((error) => {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("Vercel adapters export Node request/response handlers", () => {
  assert.equal(typeof quoteAiFunction, "function");
  assert.equal(typeof quoteAiStatusFunction, "function");
});

test("Vercel status route delegates to the shared Gemini handler", async () => {
  await withFunctionServer(quoteAiStatusFunction, async (origin) => {
    const response = await fetch(`${origin}/api/quote-ai/status`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.provider, "gemini");
    assert.equal(typeof payload.configured, "boolean");
  });
});

test("Vercel POST route accepts a streamed JSON request without invoking Gemini", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = "vercel-adapter-test-key";
  process.env.GEMINI_MODEL = "gemini-3.1-flash-lite";

  try {
    await withFunctionServer(quoteAiFunction, async (origin) => {
      const response = await fetch(`${origin}/api/quote-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "zh-HK", messages: [] }),
      });
      const payload = await response.json();

      assert.equal(response.status, 400);
      assert.equal(payload.error, "a-user-message-is-required");
    });
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = previousModel;
  }
});
