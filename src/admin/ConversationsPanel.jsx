import { useMemo, useState } from "react";
import { ArrowRight, MessageSquareText, Trash2 } from "lucide-react";

import {
  getCentralServiceLabel,
  getGameLabel,
  serviceDefinitions,
  supportedGameIds,
} from "../data/gameConfig.js";

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

function formatDate(value) {
  return value ? new Date(value).toLocaleString("zh-HK") : "—";
}

export default function ConversationsPanel({ state, onAction, busy }) {
  const [filters, setFilters] = useState({ from: "", to: "", gameId: "", serviceId: "", status: "" });
  const [selectedId, setSelectedId] = useState("");

  const records = useMemo(() => state.enquiries
    .map((enquiry) => ({
      enquiry,
      conversation: state.conversations.find((item) => item.id === enquiry.conversationId) ||
        state.conversations.find((item) => item.sessionId === enquiry.sessionId) || null,
      order: state.orders.find((item) => item.enquiryId === enquiry.id) || null,
    }))
    .filter(({ enquiry }) => {
      const date = enquiry.createdAt?.slice(0, 10) || "";
      return (!filters.from || date >= filters.from) &&
        (!filters.to || date <= filters.to) &&
        (!filters.gameId || enquiry.gameId === filters.gameId) &&
        (!filters.serviceId || enquiry.serviceId === filters.serviceId) &&
        (!filters.status || enquiry.status === filters.status);
    }), [filters, state]);

  const selected = records.find(({ enquiry }) => enquiry.id === selectedId) || records[0] || null;
  const messages = selected?.conversation ? selected.conversation.messages : [];
  const patchFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));

  return (
    <div className="admin-operations-layout">
      <aside className="admin-record-list">
        <div className="admin-filter-grid">
          <label><span>開始日期</span><input type="date" value={filters.from} onChange={(event) => patchFilter("from", event.target.value)} /></label>
          <label><span>結束日期</span><input type="date" value={filters.to} onChange={(event) => patchFilter("to", event.target.value)} /></label>
          <label><span>遊戲</span><select value={filters.gameId} onChange={(event) => patchFilter("gameId", event.target.value)}><option value="">全部遊戲</option>{supportedGameIds.map((id) => <option key={id} value={id}>{getGameLabel(id, "zh-HK")}</option>)}</select></label>
          <label><span>服務</span><select value={filters.serviceId} onChange={(event) => patchFilter("serviceId", event.target.value)}><option value="">全部服務</option>{serviceDefinitions.map((service) => <option key={service.id} value={service.id}>{getCentralServiceLabel(service.id, "zh-HK")}</option>)}</select></label>
          <label className="admin-field-wide"><span>顧客狀態</span><select value={filters.status} onChange={(event) => patchFilter("status", event.target.value)}><option value="">全部狀態</option>{Object.entries(statusLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        </div>
        <p className="admin-record-count">共 {records.length} 項查詢</p>
        {records.map(({ enquiry, conversation }) => (
          <button className={`admin-record-button${selected?.enquiry.id === enquiry.id ? " is-active" : ""}`} type="button" key={enquiry.id} onClick={() => setSelectedId(enquiry.id)}>
            <span>{getGameLabel(enquiry.gameId, "zh-HK")} · {getCentralServiceLabel(enquiry.serviceId, "zh-HK")}</span>
            <strong>{enquiry.quoteReference || "未建立報價編號"}</strong>
            <small>{statusLabels[enquiry.status]} · {conversation?.messages.length || 0} 則訊息</small>
          </button>
        ))}
      </aside>

      <section className="admin-record-detail">
        {!selected ? <div className="admin-empty"><MessageSquareText /><p>暫時沒有符合條件的查詢。</p></div> : <>
          <header className="admin-detail-heading">
            <div><span>ENQUIRY</span><h2>{selected.enquiry.quoteReference || "Aurora 客服查詢"}</h2></div>
            <span className="admin-status-pill">{statusLabels[selected.enquiry.status]}</span>
          </header>
          <dl className="admin-detail-meta">
            <div><dt>遊戲</dt><dd>{getGameLabel(selected.enquiry.gameId, "zh-HK")}</dd></div>
            <div><dt>服務</dt><dd>{getCentralServiceLabel(selected.enquiry.serviceId, "zh-HK")}</dd></div>
            <div><dt>來源</dt><dd>{selected.enquiry.source === "ai" ? "Aurora 客服" : "手動報價表"}</dd></div>
            <div><dt>同意保存時間</dt><dd>{formatDate(selected.enquiry.consentedAt || selected.conversation?.consentedAt)}</dd></div>
          </dl>
          <div className="admin-timeline" aria-label="對話時間線">
            {messages.map((message, index) => (
              <article className={`admin-message admin-message--${message.role}`} key={`${message.createdAt}-${index}`}>
                <span>{message.role === "assistant" ? "Aurora 客服" : "顧客"}</span>
                <p>{message.text}</p>
                <time>{formatDate(message.createdAt)}</time>
              </article>
            ))}
            {!messages.length ? <p className="admin-muted-copy">此查詢由手動報價表建立，沒有客服對話。</p> : null}
          </div>
          <div className="admin-detail-actions">
            <button className="admin-action-button admin-action-button--primary" type="button" disabled={busy || selected.order} onClick={() => onAction({ action: "convert_enquiry", enquiryId: selected.enquiry.id })}>
              <ArrowRight size={16} /> {selected.order ? "已轉為訂單" : "轉為訂單"}
            </button>
            {selected.conversation ? <button className="admin-action-button" type="button" disabled={busy} onClick={() => window.confirm("確定刪除這段對話紀錄嗎？") && onAction({ action: "delete_conversation", conversationId: selected.conversation.id })}>
              <Trash2 size={16} /> 刪除對話
            </button> : null}
          </div>
        </>}
      </section>
    </div>
  );
}
