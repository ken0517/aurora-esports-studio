import { handlePublicCatalog } from "../server/admin-api.mjs";

export default function catalogFunction(req, res) {
  return handlePublicCatalog(req, res);
}
