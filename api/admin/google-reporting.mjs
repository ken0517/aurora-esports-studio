import { handleAdminGoogleReporting } from "../../server/google-reporting-api.mjs";

export default function adminGoogleReportingFunction(req, res) {
  return handleAdminGoogleReporting(req, res);
}
