import { handlePublicEnquiry } from "../server/enquiry-api.mjs";

export default function enquiriesFunction(req, res) {
  return handlePublicEnquiry(req, res);
}
