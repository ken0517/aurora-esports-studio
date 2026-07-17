import { useCallback, useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, MessageSquareText, RefreshCw, Users } from "lucide-react";

import ConversationsPanel from "./ConversationsPanel.jsx";
import OrdersPanel from "./OrdersPanel.jsx";
import StaffRulesPanel from "./StaffRulesPanel.jsx";
import { loadOperations, runOperationsAction } from "./operationsClient.js";

const panels = [
  ["conversations", "對話與查詢", MessageSquareText],
  ["orders", "訂單與預約", CalendarDays],
  ["staff", "人員與營業規則", Users],
];

export default function OperationsApp({ onUnauthorized }) {
  const [state, setState] = useState(null);
  const [activePanel, setActivePanel] = useState("conversations");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [warnings, setWarnings] = useState([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setMessage("");
    try {
      const payload = await loadOperations();
      setState(payload.state);
      setStatus("ready");
      if (payload.storageConfigured === false) setMessage("營運資料庫尚未連接，暫時不能儲存修改。");
    } catch (error) {
      if (error.status === 401) return onUnauthorized();
      setStatus("error");
      setMessage("無法讀取營運資料，請稍後再試。");
    }
  }, [onUnauthorized]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const action = async (body) => {
    setStatus("saving");
    setMessage("");
    try {
      const payload = await runOperationsAction(body);
      setState(payload.state);
      setWarnings(payload.warnings || []);
      setStatus("ready");
      setMessage("已儲存最新營運資料。");
      return payload;
    } catch (error) {
      if (error.status === 401) return onUnauthorized();
      setStatus("error");
      setMessage(error.message === "invalid-status-transition" ? "訂單狀態不能直接跳到該階段，請按正常流程更新。" : "儲存失敗，請檢查資料後再試。");
      return null;
    }
  };

  if (!state || status === "loading") return <main className="admin-main"><div className="admin-loading admin-loading--inline"><LoaderCircle className="admin-spin" /><span>正在載入營運資料…</span></div></main>;

  return (
    <main className="admin-main admin-main--operations">
      <section className="admin-page-heading">
        <div><span>OPERATIONS</span><h1>顧客與訂單管理</h1><p>管理已同意保存的客服對話、報價查詢、預約及服務人員安排。</p></div>
        <button className="admin-action-button" type="button" onClick={load}><RefreshCw size={16} /> 重新整理</button>
      </section>
      {message ? <p className={`admin-alert${status === "ready" ? " admin-alert--success" : " admin-alert--warning"}`} role="status">{message}</p> : null}
      <nav className="admin-operations-tabs" aria-label="營運管理分頁">
        {panels.map(([id, label, Icon]) => <button className={activePanel === id ? "is-active" : ""} type="button" key={id} onClick={() => setActivePanel(id)}><Icon size={17} />{label}</button>)}
      </nav>
      {activePanel === "conversations" ? <ConversationsPanel state={state} onAction={action} busy={status === "saving"} /> : null}
      {activePanel === "orders" ? <OrdersPanel state={state} onAction={action} busy={status === "saving"} warnings={warnings} /> : null}
      {activePanel === "staff" ? <StaffRulesPanel key={state.revision} state={state} onAction={action} busy={status === "saving"} /> : null}
    </main>
  );
}
