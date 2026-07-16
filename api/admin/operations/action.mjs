import { handleAdminOperations } from "../../../server/operations-api.mjs";

export default function adminOperationsActionFunction(req, res) {
  return handleAdminOperations(req, res);
}

