import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
  Save,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  getCentralServiceDefinition,
  getCentralServiceLabel,
  getGameLabel,
  supportedGameIds,
} from "./data/gameConfig.js";
import { normalizeRuntimeCatalog, runtimeServiceIds } from "./data/runtimeCatalog.js";
import { getRankById, getRankLabel } from "./data/ranks.js";
import { catalogApiUrl } from "./lib/catalogClient.js";
import "./styles/admin.css";

const serviceIds = runtimeServiceIds();
const homeHref = import.meta.env.BASE_URL || "/";

async function api(path, options = {}) {
  const response = await fetch(catalogApiUrl(path), {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `request-failed:${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function Login({ configured, onAuthenticated }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await api("/api/admin/session", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setStatus("success");
      onAuthenticated();
    } catch (requestError) {
      setStatus("error");
      setError(requestError.message === "admin-auth-not-configured"
        ? "伺服器尚未設定管理員密碼，請按照部署說明加入環境變數。"
        : requestError.status === 429
          ? "嘗試次數過多，請稍後再試。"
          : "密碼不正確，請重新輸入。");
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login__panel">
        <a className="admin-brand" href={homeHref}>
          <span>A</span>
          <div><strong>Aurora</strong><small>Esports Studio</small></div>
        </a>
        <div className="admin-login__intro">
          <span><ShieldCheck size={15} /> PRIVATE CONTROL ROOM</span>
          <h1>網站管理後台</h1>
          <p>登入後可直接修改公開價格、預計完成時間、服務狀態和公告。</p>
        </div>
        {!configured ? (
          <p className="admin-alert admin-alert--warning">後台身分驗證尚未在伺服器設定，部署後請設定管理員金鑰。</p>
        ) : null}
        <form onSubmit={submit}>
          <label htmlFor="admin-password">管理員密碼</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              autoFocus
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <button className="admin-primary" type="submit" disabled={status === "loading" || !password}>
            {status === "loading" ? <LoaderCircle className="admin-spin" size={17} /> : <ShieldCheck size={17} />}
            安全登入
          </button>
        </form>
        <small className="admin-login__security">12 小時安全工作階段 · HttpOnly Cookie · 登入限速保護</small>
      </section>
    </main>
  );
}

function NumberField({ label, value, onChange, step = "0.01", min = "0", suffix = "" }) {
  return (
    <label>
      <span>{label}{suffix ? `（${suffix}）` : ""}</span>
      <input
        type="number"
        min={min}
        step={step}
        inputMode="decimal"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      />
    </label>
  );
}

function ApprovedRuleEditor({ gameId, item, onChange }) {
  const patch = (field, value) => onChange({ ...item, [field]: value });
  const patchNested = (group, field, value) => patch(group, { ...item[group], [field]: value });

  if (item.pricingModel === "aov-rank-progression") {
    const percentage = (id, label) => (
      <NumberField
        key={id}
        label={label}
        suffix="%"
        step="0.1"
        value={(item.optionalCharges?.[id]?.value ?? 0) * 100}
        onChange={(value) => patch("optionalCharges", {
          ...item.optionalCharges,
          [id]: { type: "percentage", value: Number(value || 0) / 100 },
        })}
      />
    );
    return (
      <div className="admin-approved-rule admin-field-wide">
        <h4>已批准的排位計算規則</h4>
        <div className="admin-rule-grid">
          <NumberField label="最低消費" suffix="HKD" value={item.minimumPrice} onChange={(value) => patch("minimumPrice", value)} />
          {percentage("preferredRole", "指定分路附加費")}
          <NumberField label="每小段預計時間" suffix="小時" value={item.timeRules?.hoursPerDivision} onChange={(value) => patchNested("timeRules", "hoursPerDivision", value)} />
          <NumberField label="報價有效期" suffix="天" step="1" value={item.quoteValidityDays} onChange={(value) => patch("quoteValidityDays", value)} />
        </div>
        <h4>各 10 星區間價格（每星）</h4>
        <div className="admin-transition-grid">
          {(item.starPricing?.bandPrices || []).map((value, index) => (
            <NumberField
              key={index}
              label={`${index * 10}–${index * 10 + 9} 星`}
              suffix="HKD／星"
              value={value}
              onChange={(nextValue) => patchNested("starPricing", "bandPrices", item.starPricing.bandPrices.map((price, priceIndex) => priceIndex === index ? nextValue : price))}
            />
          ))}
        </div>
        <h4>各小段價格（由該小段升到下一小段）</h4>
        <div className="admin-transition-grid">
          {Object.entries(item.divisionStepPrices || {}).map(([key, value]) => {
            const [rankId, division] = key.split(":");
            const rank = getRankById(gameId, rankId);
            return (
              <NumberField
                key={key}
                label={`${getRankLabel(rank, "zh-HK") || rankId} ${division}`}
                suffix="HKD"
                value={value}
                onChange={(nextValue) => patch("divisionStepPrices", { ...item.divisionStepPrices, [key]: nextValue })}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (item.pricingModel === "aov-duo") {
    return (
      <div className="admin-approved-rule admin-field-wide">
        <h4>已批准的陪玩計算規則</h4>
        <p>排位陪玩自動採用上方「排位代打」的小段及星數價格，再套用以下方案。</p>
        <div className="admin-rule-grid">
          <NumberField label="包贏倍率" suffix="倍" value={item.rankPricing?.guaranteedMultiplier} onChange={(value) => patchNested("rankPricing", "guaranteedMultiplier", value)} />
          <NumberField label="不包贏倍率" suffix="倍" value={item.rankPricing?.standardMultiplier} onChange={(value) => patchNested("rankPricing", "standardMultiplier", value)} />
          <NumberField label="排位最低消費" suffix="HKD" value={item.rankPricing?.minimumPrice} onChange={(value) => patchNested("rankPricing", "minimumPrice", value)} />
          <NumberField label="5V5 每局" suffix="HKD" value={item.matchPricing?.unitPrice} onChange={(value) => patchNested("matchPricing", "unitPrice", value)} />
          <NumberField label="5V5 最少局數" suffix="局" step="1" value={item.matchPricing?.minimumQuantity} onChange={(value) => patchNested("matchPricing", "minimumQuantity", value)} />
          <NumberField label="折扣門檻" suffix="局" step="1" value={item.matchPricing?.discountThreshold} onChange={(value) => patchNested("matchPricing", "discountThreshold", value)} />
          <NumberField label="達到門檻折扣" suffix="%" step="0.1" value={(item.matchPricing?.discountRate ?? 0) * 100} onChange={(value) => patchNested("matchPricing", "discountRate", Number(value || 0) / 100)} />
        </div>
      </div>
    );
  }

  if (item.pricingModel === "aov-other") {
    const teachingOptions = [
      ["review-coaching", "復盤教學"],
      ["discord-recorded-review", "第一視角教學"],
      ["hero-coaching", "英雄教學"],
    ];
    return (
      <div className="admin-approved-rule admin-field-wide">
        <h4>已批准的教學計時規則</h4>
        {teachingOptions.map(([optionId, label]) => {
          const option = item.options?.[optionId] || {};
          const updateOption = (field, value) => patch("options", {
            ...item.options,
            [optionId]: { ...option, [field]: value },
          });
          return (
            <section className="admin-teaching-rule" key={optionId}>
              <h5>{label}</h5>
              <div className="admin-rule-grid">
                <NumberField label="每分鐘" suffix="HKD" value={option.unitPrice} onChange={(value) => updateOption("unitPrice", value)} />
                <NumberField label="最低時長" suffix="分鐘" step="1" value={option.minimumMinutes} onChange={(value) => updateOption("minimumMinutes", value)} />
                <NumberField label="預約付款" suffix="HKD" value={option.bookingDeposit} onChange={(value) => updateOption("bookingDeposit", value)} />
                <NumberField label="免費改期須提前" suffix="小時" step="1" value={option.freeRescheduleNoticeHours} onChange={(value) => updateOption("freeRescheduleNoticeHours", value)} />
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return null;
}

function ServiceEditor({ gameId, serviceId, item, currency, onChange }) {
  const service = getCentralServiceDefinition(serviceId);
  const manualOnly = Boolean(service?.manualOnly);
  const label = getCentralServiceLabel(serviceId, "zh-HK");
  const patch = (field, value) => onChange({ ...item, [field]: value });
  const isApprovedRule = ["aov-rank-progression", "aov-duo", "aov-other"].includes(item.pricingModel);

  return (
    <article className={`admin-service-card${item.enabled ? "" : " is-hidden"}${isApprovedRule ? " is-rule" : ""}`}>
      <header>
        <div>
          <span>{gameId.toUpperCase()}</span>
          <h3>{label}</h3>
        </div>
        <label className="admin-switch">
          <input type="checkbox" checked={item.enabled} onChange={(event) => patch("enabled", event.target.checked)} />
          <span aria-hidden="true" />
          {item.enabled ? "已上架" : "已隱藏"}
        </label>
      </header>

      <div className="admin-service-fields">
        {!isApprovedRule ? <label>
          <span><Tag size={14} /> 公開價格（{currency}）</span>
          <input
            type="number"
            min="0"
            max="1000000"
            step="1"
            inputMode="decimal"
            value={item.basePrice ?? ""}
            placeholder="留空則顯示查詢價格"
            onChange={(event) => patch("basePrice", event.target.value === "" ? null : Number(event.target.value))}
          />
        </label> : null}
        <label>
          <span>價格後綴</span>
          <input value={item.priceSuffix} maxLength="24" placeholder="例如：起／每局／每星" onChange={(event) => patch("priceSuffix", event.target.value)} />
        </label>
        <label className="admin-field-wide">
          <span><Clock3 size={14} /> 預計完成時間</span>
          <input value={item.estimatedCompletionTime} maxLength="80" placeholder="例如：1–3 天／當天開始" onChange={(event) => patch("estimatedCompletionTime", event.target.value)} />
        </label>
        <label className="admin-field-wide">
          <span>顧客可見備註</span>
          <textarea rows="2" value={item.note} maxLength="240" placeholder="例如：加急訂單請先聯絡客服確認" onChange={(event) => patch("note", event.target.value)} />
        </label>
        {isApprovedRule ? <ApprovedRuleEditor gameId={gameId} item={item} onChange={onChange} /> : null}
      </div>

      <footer>
        <label className={`admin-check${manualOnly ? " is-disabled" : ""}`}>
          <input
            type="checkbox"
            checked={item.configured}
            disabled={manualOnly || (!isApprovedRule && !Number.isFinite(item.basePrice))}
            onChange={(event) => patch("configured", event.target.checked)}
          />
          <span><Check size={13} /></span>
          自動報價時採用此價格
        </label>
        <small>{manualOnly ? "此服務按規則保留人工確認" : isApprovedRule ? "關閉後此服務會恢復為人工確認" : "關閉時只公開展示價格，不自動產生最終報價"}</small>
      </footer>
    </article>
  );
}

function Dashboard({ onLogout }) {
  const [catalog, setCatalog] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [activeGame, setActiveGame] = useState(supportedGameIds[0]);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const payload = await api("/api/admin/catalog");
      const next = normalizeRuntimeCatalog(payload.catalog);
      setCatalog(next);
      setSavedSnapshot(JSON.stringify(next));
      setStorageConfigured(payload.storageConfigured !== false);
      setStatus("ready");
    } catch (error) {
      if (error.status === 401) return onLogout();
      setMessage("無法讀取服務目錄，請檢查伺服器設定。");
      setStatus("error");
    }
  }, [onLogout]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const dirty = useMemo(
    () => Boolean(catalog && savedSnapshot && JSON.stringify(catalog) !== savedSnapshot),
    [catalog, savedSnapshot],
  );

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const updateService = (gameId, serviceId, value) => {
    setCatalog((current) => {
      const nextGame = { ...current.games[gameId], [serviceId]: value };
      if (serviceId === "rank" && nextGame.duo?.pricingModel === "aov-duo") {
        nextGame.duo = {
          ...nextGame.duo,
          rankPricing: {
            ...nextGame.duo.rankPricing,
            minimumPrice: value.minimumPrice,
            divisionStepPrices: { ...value.divisionStepPrices },
            starPricing: { ...value.starPricing },
          },
        };
      }
      return {
        ...current,
        games: { ...current.games, [gameId]: nextGame },
      };
    });
    setMessage("");
  };

  const save = async () => {
    if (!window.confirm("確定要發布這次修改嗎？發布後，顧客重新整理網站便會看到最新內容。")) return;
    setStatus("saving");
    setMessage("");
    try {
      const payload = await api("/api/admin/catalog", {
        method: "PUT",
        body: JSON.stringify({ catalog, expectedRevision: catalog.revision }),
      });
      const next = normalizeRuntimeCatalog(payload.catalog);
      setCatalog(next);
      setSavedSnapshot(JSON.stringify(next));
      setStatus("saved");
      setMessage("已發布。顧客重新整理網站後便會看到最新價格和時間。");
      window.setTimeout(() => setStatus("ready"), 1800);
    } catch (error) {
      setStatus("error");
      setMessage(error.status === 409
        ? "其他視窗已經更新目錄。請重新整理頁面後再修改，避免覆蓋新內容。"
        : error.message === "catalog-storage-not-configured"
          ? "伺服器尚未連接持久化資料庫，目前內容無法安全發布。"
          : "儲存失敗，請檢查網路後再試。");
    }
  };

  const logout = async () => {
    await api("/api/admin/session", { method: "DELETE" }).catch(() => {});
    onLogout();
  };

  if (!catalog || status === "loading") {
    return <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>正在載入 Aurora 後台…</span></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <a className="admin-brand" href={homeHref}>
          <span>A</span><div><strong>Aurora</strong><small>Control Room</small></div>
        </a>
        <div className="admin-topbar__actions">
          <a href={homeHref} target="_blank" rel="noreferrer"><Eye size={16} /> 查看網站</a>
          <button type="button" onClick={logout}><LogOut size={16} /> 登出</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-page-heading">
          <div><span>SERVICE CATALOG</span><h1>價格與時間管理</h1><p>修改後按下「發布更新」，前台會自動讀取最新內容。</p></div>
          <button className="admin-primary admin-save" type="button" onClick={save} disabled={!dirty || status === "saving" || !storageConfigured}>
            {status === "saving" ? <LoaderCircle className="admin-spin" size={17} /> : <Save size={17} />}
            {dirty ? "發布更新" : "內容已同步"}
          </button>
        </section>

        {!storageConfigured ? <p className="admin-alert admin-alert--warning">持久化資料庫尚未連接。你可以預覽後台，但完成部署設定前不能發布修改。</p> : null}
        {message ? <p className={`admin-alert${status === "saved" ? " admin-alert--success" : ""}`} role="status">{message}</p> : null}

        <section className="admin-global-settings">
          <label><span>中央定價幣種</span><select value={catalog.currency} onChange={(event) => setCatalog({ ...catalog, currency: event.target.value })}>{["HKD", "TWD", "CNY"].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
          <NumberField
            label="新人優惠折扣"
            suffix="%"
            step="0.1"
            value={(catalog.newCustomerDiscountRate ?? 0.15) * 100}
            onChange={(value) => setCatalog({ ...catalog, newCustomerDiscountRate: Number(value || 0) / 100 })}
          />
          <NumberField
            label="新台幣匯率"
            suffix="1 HKD = TWD"
            step="0.01"
            value={catalog.exchangeRates?.TWD ?? 4.25}
            onChange={(value) => setCatalog({ ...catalog, exchangeRates: { ...catalog.exchangeRates, TWD: Number(value || 0) } })}
          />
          <NumberField
            label="人民幣匯率"
            suffix="1 HKD = CNY"
            step="0.01"
            value={catalog.exchangeRates?.CNY ?? 1}
            onChange={(value) => setCatalog({ ...catalog, exchangeRates: { ...catalog.exchangeRates, CNY: Number(value || 0) } })}
          />
          <label><span>全站公告（留空則不顯示）</span><input value={catalog.announcement} maxLength="240" placeholder="例如：本週末訂單名額有限，請提前預約" onChange={(event) => setCatalog({ ...catalog, announcement: event.target.value })} /></label>
        </section>

        <nav className="admin-game-tabs" aria-label="選擇遊戲">
          {supportedGameIds.map((gameId) => (
            <button key={gameId} type="button" className={gameId === activeGame ? "is-active" : ""} onClick={() => setActiveGame(gameId)}>
              <span>{getGameLabel(gameId, "zh-HK")}</span><ChevronRight size={15} />
            </button>
          ))}
        </nav>

        <section className="admin-service-grid" aria-label={`${getGameLabel(activeGame, "zh-HK")}服務設定`}>
          {serviceIds.map((serviceId) => (
            <ServiceEditor
              key={`${activeGame}-${serviceId}`}
              gameId={activeGame}
              serviceId={serviceId}
              item={catalog.games[activeGame][serviceId]}
              currency={catalog.currency}
              onChange={(value) => updateService(activeGame, serviceId, value)}
            />
          ))}
        </section>

        <footer className="admin-meta">
          <span>{dirty ? "有尚未發布的修改" : "所有修改均已發布"}</span>
          <span>最後更新：{catalog.updatedAt ? new Date(catalog.updatedAt).toLocaleString("zh-HK") : "尚未發布"}</span>
        </footer>
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState({ loading: true, authenticated: false, configured: true });

  const checkSession = useCallback(async () => {
    try {
      const payload = await api("/api/admin/session");
      setSession({ loading: false, ...payload });
    } catch {
      setSession({ loading: false, authenticated: false, configured: false });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(checkSession, 0);
    return () => window.clearTimeout(timer);
  }, [checkSession]);

  if (session.loading) return <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>正在驗證安全工作階段…</span></div>;
  if (!session.authenticated) return <Login configured={session.configured} onAuthenticated={checkSession} />;
  return <Dashboard onLogout={() => setSession((current) => ({ ...current, authenticated: false }))} />;
}
