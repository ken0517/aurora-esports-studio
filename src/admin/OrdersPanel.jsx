import { useMemo, useState } from "react";
import { CalendarClock, Save } from "lucide-react";

import { getCentralServiceLabel, getGameLabel } from "../data/gameConfig.js";

const statusLabels = {
  new_enquiry: "新查詢",
  awaiting_details: "待補資料",
  awaiting_quote_confirmation: "待確認報價",
  awaiting_payment: "待付款",
  confirmed: "已確認",
  scheduled: "已預約",
  in_progress: "進行中",
  completed: "已完成",
  cancelled: "已取消",
};

const contactMethods = [
  ["whatsapp", "WhatsApp"], ["line", "LINE"], ["instagram", "Instagram"],
  ["discord", "Discord"], ["carousell", "Carousell"], ["other", "其他"],
];

export default function OrdersPanel({ state, onAction, busy, warnings }) {
  const [selectedId, setSelectedId] = useState("");
  const [drafts, setDrafts] = useState({});
  const selected = state.orders.find((order) => order.id === selectedId) || state.orders[0] || null;
  const draft = selected ? drafts[selected.id] || {
      customerName: selected.customerName || "",
      contactMethod: selected.contactMethod || "whatsapp",
      contactValue: selected.contactValue || "",
      internalNotes: selected.internalNotes || "",
      staffId: selected.staffId || "",
      appointment: selected.appointment || { date: "", startTime: "", durationMinutes: 60, timezone: "Asia/Hong_Kong" },
    } : null;

  const availableStaff = useMemo(() => state.staff.filter((staff) => staff.active &&
    (!staff.gameIds.length || staff.gameIds.includes(selected?.gameId)) &&
    (!staff.serviceIds.length || staff.serviceIds.includes(selected?.serviceId))), [selected, state.staff]);
  const patch = (field, value) => setDrafts((current) => ({ ...current, [selected.id]: { ...draft, [field]: value } }));
  const patchAppointment = (field, value) => setDrafts((current) => ({ ...current, [selected.id]: { ...draft, appointment: { ...draft.appointment, [field]: value } } }));

  const saveDetails = async () => {
    await onAction({ action: "update_order", orderId: selected.id, order: draft });
    await onAction({ action: "assign_staff", orderId: selected.id, staffId: draft.staffId || null });
  };
  const saveAppointment = () => onAction({
    action: "update_appointment",
    orderId: selected.id,
    appointment: { ...draft.appointment, durationMinutes: Number(draft.appointment.durationMinutes) },
  });

  return (
    <div className="admin-operations-layout">
      <aside className="admin-record-list">
        <p className="admin-record-count">共 {state.orders.length} 張訂單</p>
        {state.orders.map((order) => (
          <button className={`admin-record-button${selected?.id === order.id ? " is-active" : ""}`} type="button" key={order.id} onClick={() => setSelectedId(order.id)}>
            <span>{getGameLabel(order.gameId, "zh-HK")} · {getCentralServiceLabel(order.serviceId, "zh-HK")}</span>
            <strong>{order.reference || order.quoteReference}</strong>
            <small>{statusLabels[order.status]} · {order.appointment?.date || "尚未預約"}</small>
          </button>
        ))}
      </aside>

      <section className="admin-record-detail">
        {!selected || !draft ? <div className="admin-empty"><CalendarClock /><p>尚未建立訂單。請先在「對話與查詢」將查詢轉為訂單。</p></div> : <>
          <header className="admin-detail-heading"><div><span>ORDER</span><h2>{selected.reference}</h2></div><span className="admin-status-pill">{statusLabels[selected.status]}</span></header>
          <div className="admin-form-grid">
            <label><span>顧客名稱</span><input value={draft.customerName} onChange={(event) => patch("customerName", event.target.value)} /></label>
            <label><span>聯絡方式</span><select value={draft.contactMethod} onChange={(event) => patch("contactMethod", event.target.value)}>{contactMethods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="admin-field-wide"><span>聯絡資料</span><input value={draft.contactValue} onChange={(event) => patch("contactValue", event.target.value)} /></label>
            <label><span>顧客狀態</span><select value={selected.status} onChange={(event) => onAction({ action: "update_order_status", orderId: selected.id, status: event.target.value })}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label><span>分配服務人員</span><select value={draft.staffId} onChange={(event) => patch("staffId", event.target.value)}><option value="">尚未分配</option>{availableStaff.map((staff) => <option key={staff.id} value={staff.id}>{staff.displayName}</option>)}</select></label>
            <label className="admin-field-wide"><span>內部備註</span><textarea rows="3" value={draft.internalNotes} onChange={(event) => patch("internalNotes", event.target.value)} /></label>
          </div>
          <button className="admin-action-button admin-action-button--primary" type="button" disabled={busy} onClick={saveDetails}><Save size={16} /> 儲存訂單資料</button>

          <section className="admin-appointment-card">
            <h3>預約安排</h3>
            <div className="admin-form-grid admin-form-grid--three">
              <label><span>預約日期</span><input type="date" value={draft.appointment.date || ""} onChange={(event) => patchAppointment("date", event.target.value)} /></label>
              <label><span>開始時間</span><input type="time" value={draft.appointment.startTime || ""} onChange={(event) => patchAppointment("startTime", event.target.value)} /></label>
              <label><span>預計分鐘</span><input type="number" min="15" step="15" value={draft.appointment.durationMinutes || 60} onChange={(event) => patchAppointment("durationMinutes", event.target.value)} /></label>
            </div>
            {warnings.includes("staff-overlap") ? <p className="admin-conflict-warning">服務人員時段重疊：請重新安排人員或時間。</p> : null}
            {warnings.includes("daily-capacity-reached") ? <p className="admin-conflict-warning">已達每日接單上限：仍可保存，但請先確認人手。</p> : null}
            {warnings.includes("closure-date") ? <p className="admin-conflict-warning">此日期已設定為休息日。</p> : null}
            {warnings.includes("outside-business-hours") ? <p className="admin-conflict-warning">預約時間超出營業時間。</p> : null}
            <button className="admin-action-button" type="button" disabled={busy || !draft.appointment.date || !draft.appointment.startTime} onClick={saveAppointment}><CalendarClock size={16} /> 儲存預約</button>
          </section>
        </>}
      </section>
    </div>
  );
}
