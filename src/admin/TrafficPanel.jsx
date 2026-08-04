import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock3,
  ExternalLink,
  MousePointerClick,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";

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
import { loadGoogleReporting } from "./googleReportingClient.js";

function formatSeconds(value) {
  const seconds = Math.max(0, Math.round(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes ? `${minutes} 分 ${remaining} 秒` : `${remaining} 秒`;
}

function formatPercent(value) {
  return `${Math.round((Number(value) || 0) * 1000) / 10}%`;
}

function GoogleReporting() {
  const [status, setStatus] = useState("loading");
  const [report, setReport] = useState(null);

  const retry = async () => {
    setStatus("loading");
    try {
      const payload = await loadGoogleReporting();
      setReport(payload);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadGoogleReporting({ signal: controller.signal })
      .then((payload) => {
        setReport(payload);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status === "loading") {
    return <div className="admin-google-state"><RefreshCw className="admin-spin" size={18} /><p>正在讀取 Google 網站數據…</p></div>;
  }

  if (status === "error") {
    return (
      <div className="admin-google-state" role="alert">
        <BarChart3 size={22} />
        <div><strong>暫時無法讀取 Google 數據</strong><p>不影響查詢及訂單管理，請稍後重新嘗試。</p></div>
        <button className="admin-action-button" type="button" onClick={retry}><RefreshCw size={15} />重新嘗試</button>
      </div>
    );
  }

  if (report?.configured === false) {
    return (
      <div className="admin-google-state">
        <BarChart3 size={22} />
        <div>
          <strong>Google 數據尚未連接到 Aurora 後台</strong>
          <p>網站現有追蹤不受影響；完成唯讀授權後，這裡會直接顯示訪客、來源、停留時間、HOK 頁面及搜尋表現。</p>
        </div>
        <a className="admin-action-button" href="https://analytics.google.com/" target="_blank" rel="noreferrer">開啟 Analytics <ExternalLink size={14} /></a>
      </div>
    );
  }

  const overview = report?.analytics?.overview || {};
  const sources = report?.analytics?.sources || [];
  const hokPages = report?.analytics?.hokPages || [];
  const queries = report?.searchConsole?.queries || [];
  const pages = report?.searchConsole?.pages || [];

  return (
    <div className="admin-google-reporting">
      <div className="admin-google-period">
        <span>GOOGLE · 最近完整 28 日</span>
        <small>{report.period?.startDate} 至 {report.period?.endDate}</small>
      </div>
      <div className="admin-traffic-kpis admin-traffic-kpis--google">
        <article><UsersRound size={18} /><span>網站訪客</span><strong>{overview.activeUsers || 0}</strong></article>
        <article><BarChart3 size={18} /><span>瀏覽工作階段</span><strong>{overview.sessions || 0}</strong></article>
        <article><Clock3 size={18} /><span>平均停留時間</span><strong>{formatSeconds(overview.averageSessionDuration)}</strong></article>
        <article><MousePointerClick size={18} /><span>重要活動</span><strong>{overview.keyEvents || 0}</strong></article>
        <article><BarChart3 size={18} /><span>互動率</span><strong>{formatPercent(overview.engagementRate)}</strong></article>
      </div>

      <div className="admin-report-grid">
        <section>
          <h3>訪客來源</h3>
          <div className="admin-traffic-table-wrap">
            <table className="admin-traffic-table"><thead><tr><th>來源／媒介</th><th>工作階段</th><th>訪客</th><th>重要活動</th></tr></thead><tbody>
              {sources.map((row) => <tr key={row.sourceMedium}><th>{row.sourceMedium}</th><td>{row.sessions}</td><td>{row.activeUsers}</td><td>{row.keyEvents}</td></tr>)}
            </tbody></table>
            {!sources.length ? <p className="admin-table-empty">暫時沒有來源數據。</p> : null}
          </div>
        </section>
        <section>
          <h3>HOK 頁面表現</h3>
          <div className="admin-traffic-table-wrap">
            <table className="admin-traffic-table"><thead><tr><th>頁面</th><th>瀏覽</th><th>訪客</th><th>互動時間</th></tr></thead><tbody>
              {hokPages.map((row) => <tr key={row.path}><th>{row.path}</th><td>{row.views}</td><td>{row.activeUsers}</td><td>{formatSeconds(row.engagementSeconds)}</td></tr>)}
            </tbody></table>
            {!hokPages.length ? <p className="admin-table-empty">暫時沒有 HOK 頁面數據。</p> : null}
          </div>
        </section>
      </div>

      <div className="admin-report-grid">
        <section>
          <h3><Search size={16} />Google 搜尋字詞</h3>
          <div className="admin-traffic-table-wrap">
            <table className="admin-traffic-table"><thead><tr><th>搜尋字詞</th><th>點擊</th><th>曝光</th><th>平均排名</th></tr></thead><tbody>
              {queries.map((row) => <tr key={row.query}><th>{row.query}</th><td>{row.clicks}</td><td>{row.impressions}</td><td>{row.position.toFixed(1)}</td></tr>)}
            </tbody></table>
            {!queries.length ? <p className="admin-table-empty">暫時沒有搜尋字詞數據。</p> : null}
          </div>
        </section>
        <section>
          <h3>Google 收錄頁面</h3>
          <div className="admin-traffic-table-wrap">
            <table className="admin-traffic-table"><thead><tr><th>HOK 頁面</th><th>點擊</th><th>曝光</th><th>平均排名</th></tr></thead><tbody>
              {pages.map((row) => <tr key={row.page}><th>{row.page}</th><td>{row.clicks}</td><td>{row.impressions}</td><td>{row.position.toFixed(1)}</td></tr>)}
            </tbody></table>
            {!pages.length ? <p className="admin-table-empty">暫時沒有 HOK 搜尋頁面數據。</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TrafficPanel({ state }) {
  const [filters, setFilters] = useState({ from: "", to: "", gameId: "", serviceId: "", channel: "" });
  const enquiries = useMemo(() => state.enquiries.filter((enquiry) => {
    const date = enquiry.createdAt?.slice(0, 10) || "";
    return (!filters.from || date >= filters.from)
      && (!filters.to || date <= filters.to)
      && (!filters.gameId || enquiry.gameId === filters.gameId)
      && (!filters.serviceId || enquiry.serviceId === filters.serviceId)
      && (!filters.channel || enquiryAcquisitionChannel(enquiry) === filters.channel);
  }), [filters, state.enquiries]);
  const summary = useMemo(() => summarizeAcquisition({ enquiries, orders: state.orders }), [enquiries, state.orders]);
  const patchFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));

  return (
    <section className="admin-traffic-panel">
      <header className="admin-traffic-heading">
        <div><span>TRAFFIC & ACQUISITION</span><h2>網站流量與顧客來源</h2><p>Google 數據顯示所有同意分析的訪客；下方 Aurora 數據只統計已提交的查詢及訂單。</p></div>
        <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer">開啟 Search Console <ExternalLink size={15} /></a>
      </header>

      <GoogleReporting />

      <div className="admin-internal-report">
        <h3>已提交查詢的客源概況</h3>
        <p>可按日期、遊戲、服務及來源篩選；未同意分析或未提交表格的匿名訪客不會出現在此表。</p>
      </div>
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
        <table className="admin-traffic-table"><thead><tr><th>客源</th><th>查詢</th><th>已轉訂單</th><th>轉單率</th></tr></thead><tbody>
          {summary.channels.map((row) => <tr key={row.channel}><th>{acquisitionChannelLabels[row.channel] || row.channel}</th><td>{row.enquiries}</td><td>{row.orders}</td><td>{row.conversionRate}%</td></tr>)}
        </tbody></table>
        {!summary.channels.length ? <div className="admin-empty admin-empty--compact"><BarChart3 /><p>暫時沒有符合條件的查詢。</p></div> : null}
      </div>
    </section>
  );
}
