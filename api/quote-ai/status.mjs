import { handleQuoteAiRequest } from "../../server/quote-ai-handler.mjs";

export default function quoteAiStatusFunction(req, res) {
  return handleQuoteAiRequest(req, res);
}
