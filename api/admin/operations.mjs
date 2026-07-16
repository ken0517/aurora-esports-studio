import { handleAdminOperations } from "../../server/operations-api.mjs";

export default function adminOperationsFunction(req, res) {
  return handleAdminOperations(req, res);
}

