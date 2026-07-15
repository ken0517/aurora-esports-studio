import { handleAdminSession } from "../../server/admin-api.mjs";

export default function adminSessionFunction(req, res) {
  return handleAdminSession(req, res);
}
