import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("operations control room is lazy loaded behind the authenticated admin navigation", async () => {
  const admin = await source("src/AdminApp.jsx");
  const operations = await source("src/admin/OperationsApp.jsx");
  assert.match(admin, /lazy\(\(\) => import\("\.\/admin\/OperationsApp\.jsx"\)\)/);
  assert.match(admin, /價格管理/);
  assert.match(admin, /營運管理/);
  assert.match(operations, /對話與查詢/);
  assert.match(operations, /訂單與預約/);
  assert.match(operations, /人員與營業規則/);
});

test("conversation panel offers required filters, consent context and enquiry conversion", async () => {
  const panel = await source("src/admin/ConversationsPanel.jsx");
  for (const copy of ["開始日期", "結束日期", "遊戲", "服務", "顧客狀態", "同意保存時間", "轉為訂單", "刪除對話"]) {
    assert.match(panel, new RegExp(copy));
  }
  assert.match(panel, /conversation\.messages/);
  assert.match(panel, /convert_enquiry/);
  assert.match(panel, /delete_conversation/);
});

test("orders panel covers all statuses, appointments, staff and conflict warnings", async () => {
  const panel = await source("src/admin/OrdersPanel.jsx");
  const operations = await source("src/admin/OperationsApp.jsx");
  for (const status of [
    "new_enquiry",
    "awaiting_details",
    "awaiting_quote_confirmation",
    "awaiting_payment",
    "confirmed",
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ]) assert.match(panel, new RegExp(status));
  for (const copy of ["預約日期", "開始時間", "預計分鐘", "分配服務人員", "內部備註", "服務人員時段重疊", "已達每日接單上限"]) {
    assert.match(panel, new RegExp(copy));
  }
  assert.match(panel, /update_appointment/);
  assert.match(panel, /action: "update_order"[\s\S]*staffId: draft\.staffId/);
  assert.doesNotMatch(panel, /await onAction\(\{ action: "assign_staff"/);
  assert.doesNotMatch(operations, /<OrdersPanel key=\{state\.revision\}/);
});

test("staff and business rules panel covers availability, closures, capacity and retention", async () => {
  const panel = await source("src/admin/StaffRulesPanel.jsx");
  for (const copy of ["服務人員", "可接遊戲", "可接服務", "每週營業時間", "休息日期", "每日接單上限", "最早預約時間", "免費改期通知", "對話保存日數"]) {
    assert.match(panel, new RegExp(copy));
  }
  assert.match(panel, /update_business_rules/);
  assert.match(panel, /upsert_staff/);
});

test("operations admin layout has a mobile single-column treatment", async () => {
  const styles = await source("src/styles/admin.css");
  assert.match(styles, /\.admin-operations-layout/);
  assert.match(styles, /@media \(max-width: 820px\)[\s\S]*\.admin-operations-layout[^{]*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(styles, /\.admin-action-button/);
});
