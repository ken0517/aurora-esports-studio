import { handleQuoteAiRequest } from "../server/quote-ai-handler.mjs";

export default function quoteAiFunction(req, res) {
  return handleQuoteAiRequest(req, res);
}
