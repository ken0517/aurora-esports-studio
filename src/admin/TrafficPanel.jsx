import { useMemo, useState } from "react";
import { BarChart3, ExternalLink } from "lucide-react";

import {
  getCentralServiceLabel,
  getGameLabel,
  serviceDefinitions,
  supportedGameIds,
} from "../data/gameConfig.js";
import {
  acquisitionChannelLabels,
  enquiryAcquisitionChannel,
  summarizeAcquisition,
} from "./acquisitionSummary.js";

export default function TrafficPanel({ state }) {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    gameId: "",
    serviceId: "",
    channel: "",
  });
  const enquiries = useMemo(() => state.enquiries.filter((enquiry) => {
    const date = enquiry.createdAt?.slice(0, 10) || "";
    return (!filters.from || date >= filters.from) &&
      (!filters.to || date <= filters.to) &&
      (!filters.gameId || enquiry.gameId === filters.gameId) &&
      (!filters.serviceId || enquiry.serviceId === filters.serviceId) &&
      (!filters.channel || enquiryAcquisitionChannel(enquiry) === filters.channel);
  }), [filters, state.enquiries]);
  const summary = useMemo(
    () => summarizeAcquisition({ enquiries, orders: state.orders }),
    [enquiries, state.orders],
  );
  const patchFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));

  return (
    <section className="admin-traffic-panel">
      <header className="admin-traffic-heading">
        <div>
          <span>ACQUISITION</span>
          <h2>已提交查詢的客源概況</h2>
          <p>只統計已同意保存並提交查詢的顧客，不代表全站所有訪客。</p>
        </div>
        <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
          開啟 Search Console <ExternalLink size={15} />
        </a>
      </header>

      <div className="admin-filter-grid admin-traffic-filters">
        <label><span>開始日期</span><input type="date" value={filters.from} onChange={(event) => patchFilter("from", event.target.value)} /></label>
        <label><span>結束日期</span><input type="date" value={filters.to} onChange={(event) => patchFilter("to", event.target.value)} /></label>
        <label><span>遊戲</span><select value={filters.gameId} onChange={(event) => patchFilter("gameId", event.target.value)}><option value="">全部遊戲</option>{supportedGameIds.map((id) => <option key={id} value={id}>{getGameLabel(id, "zh-HK")}</option>)}</select></label>
        <label><span>服務</span><select value={filters.serviceId} onChange={(event) => patchFilter("serviceId", event.target.value)}><option value="">全部服務</option>{serviceDefinitions.map((service) => <option key={service.id} value={service.id}>{getCentralServiceLabel(service.id, "zh-HK")}</option>)}</select></label>
        <label><span>客源</span><select value={filters.channel} onChange={(event) => patchFilter("channel", event.target.value)}><option value="">全部客源</option>{Object.entries(acquisitionChannelLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </div>

      <div className="admin-traffic-kpis">
        <article><span>已提交查詢</span><strong>{summary.totalEnquiries}</strong></article>
        <article><span>已轉訂單</span><strong>{summary.convertedOrders}</strong></article>
        <article><span>查詢轉單率</span><strong>{summary.conversionRate}%</strong></article>
      </div>

      <div className="admin-traffic-table-wrap">
        <table className="admin-traffic-table">
          <thead><tr><th>客源</th><th>查詢</th><th>已轉訂單</th><th>轉單率</th></tr></thead>
          <tbody>
            {summary.channels.map((row) => (
              <tr key={row.channel}>
                <th>{acquisitionChannelLabels[row.channel] || row.channel}</th>
                <td>{row.enquiries}</td>
                <td>{row.orders}</td>
                <td>{row.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!summary.channels.length ? <div className="admin-empty admin-empty--compact"><BarChart3 /><p>暫時沒有符合條件的查詢。</p></div> : null}
      </div>

      <p className="admin-traffic-note">
        Google 的總曝光、點擊、搜尋字詞及平均排名請以 Search Console 為準；網站停留時間與全站訪客請以 Google Analytics 為準。
      </p>
    </section>
  );
}
