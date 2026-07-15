import { handleAdminCatalog } from "../../server/admin-api.mjs";

export default function adminCatalogFunction(req, res) {
  return handleAdminCatalog(req, res);
}
