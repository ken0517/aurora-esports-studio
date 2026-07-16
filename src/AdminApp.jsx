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
        ? "服务器还没有设置管理员密码，请按部署说明加入环境变量。"
        : requestError.status === 429
          ? "尝试次数过多，请稍后再试。"
          : "密码不正确，请重新输入。");
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
          <h1>网站管理后台</h1>
          <p>登录后可直接修改公开价格、预计完成时间、服务状态和公告。</p>
        </div>
        {!configured ? (
          <p className="admin-alert admin-alert--warning">后台身份验证尚未在服务器配置，部署后请设置管理员密钥。</p>
        ) : null}
        <form onSubmit={submit}>
          <label htmlFor="admin-password">管理员密码</label>
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
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "隐藏密码" : "显示密码"}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <button className="admin-primary" type="submit" disabled={status === "loading" || !password}>
            {status === "loading" ? <LoaderCircle className="admin-spin" size={17} /> : <ShieldCheck size={17} />}
            安全登录
          </button>
        </form>
        <small className="admin-login__security">12 小时安全会话 · HttpOnly Cookie · 登录限速保护</small>
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
        <h4>已批准的排位计算规则</h4>
        <div className="admin-rule-grid">
          <NumberField label="最低消费" suffix="HKD" value={item.minimumPrice} onChange={(value) => patch("minimumPrice", value)} />
          {percentage("express", "加急附加费")}
          {percentage("preferredRole", "指定分路附加费")}
          {percentage("customSchedule", "指定时段附加费")}
          {percentage("winRate70", "保持 70%+ 胜率附加费")}
          <NumberField label="每小段预计时间" suffix="小时" value={item.timeRules?.hoursPerDivision} onChange={(value) => patchNested("timeRules", "hoursPerDivision", value)} />
          <NumberField label="报价有效期" suffix="天" step="1" value={item.quoteValidityDays} onChange={(value) => patch("quoteValidityDays", value)} />
        </div>
        <h4>各 10 星区间价格（每星）</h4>
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
        <h4>各小段价格（由该小段升到下一小段）</h4>
        <div className="admin-transition-grid">
          {Object.entries(item.divisionStepPrices || {}).map(([key, value]) => {
            const [rankId, division] = key.split(":");
            const rank = getRankById(gameId, rankId);
            return (
              <NumberField
                key={key}
                label={`${getRankLabel(rank, "zh-CN") || rankId} ${division}`}
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
        <h4>已批准的陪玩计算规则</h4>
        <p>排位陪玩自动采用上方“排位代打”的小段及星数价格，再套用以下方案。</p>
        <div className="admin-rule-grid">
          <NumberField label="包赢倍率" suffix="倍" value={item.rankPricing?.guaranteedMultiplier} onChange={(value) => patchNested("rankPricing", "guaranteedMultiplier", value)} />
          <NumberField label="不包赢倍率" suffix="倍" value={item.rankPricing?.standardMultiplier} onChange={(value) => patchNested("rankPricing", "standardMultiplier", value)} />
          <NumberField label="排位最低消费" suffix="HKD" value={item.rankPricing?.minimumPrice} onChange={(value) => patchNested("rankPricing", "minimumPrice", value)} />
          <NumberField label="5V5 每局" suffix="HKD" value={item.matchPricing?.unitPrice} onChange={(value) => patchNested("matchPricing", "unitPrice", value)} />
          <NumberField label="5V5 最少局数" suffix="局" step="1" value={item.matchPricing?.minimumQuantity} onChange={(value) => patchNested("matchPricing", "minimumQuantity", value)} />
          <NumberField label="折扣门槛" suffix="局" step="1" value={item.matchPricing?.discountThreshold} onChange={(value) => patchNested("matchPricing", "discountThreshold", value)} />
          <NumberField label="达到门槛折扣" suffix="%" step="0.1" value={(item.matchPricing?.discountRate ?? 0) * 100} onChange={(value) => patchNested("matchPricing", "discountRate", Number(value || 0) / 100)} />
        </div>
      </div>
    );
  }

  if (item.pricingModel === "aov-other") {
    const teachingOptions = [
      ["review-coaching", "复盘教学"],
      ["discord-recorded-review", "第一视角教学"],
      ["hero-coaching", "英雄教学"],
    ];
    return (
      <div className="admin-approved-rule admin-field-wide">
        <h4>已批准的教学计时规则</h4>
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
                <NumberField label="每分钟" suffix="HKD" value={option.unitPrice} onChange={(value) => updateOption("unitPrice", value)} />
                <NumberField label="最低时长" suffix="分钟" step="1" value={option.minimumMinutes} onChange={(value) => updateOption("minimumMinutes", value)} />
                <NumberField label="预约付款" suffix="HKD" value={option.bookingDeposit} onChange={(value) => updateOption("bookingDeposit", value)} />
                <NumberField label="免费改期须提前" suffix="小时" step="1" value={option.freeRescheduleNoticeHours} onChange={(value) => updateOption("freeRescheduleNoticeHours", value)} />
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
  const label = getCentralServiceLabel(serviceId, "zh-CN");
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
          {item.enabled ? "已上架" : "已隐藏"}
        </label>
      </header>

      <div className="admin-service-fields">
        {!isApprovedRule ? <label>
          <span><Tag size={14} /> 公开价格（{currency}）</span>
          <input
            type="number"
            min="0"
            max="1000000"
            step="1"
            inputMode="decimal"
            value={item.basePrice ?? ""}
            placeholder="留空则显示咨询价格"
            onChange={(event) => patch("basePrice", event.target.value === "" ? null : Number(event.target.value))}
          />
        </label> : null}
        <label>
          <span>价格后缀</span>
          <input value={item.priceSuffix} maxLength="24" placeholder="例如：起／每局／每星" onChange={(event) => patch("priceSuffix", event.target.value)} />
        </label>
        <label className="admin-field-wide">
          <span><Clock3 size={14} /> 预计完成时间</span>
          <input value={item.estimatedCompletionTime} maxLength="80" placeholder="例如：1–3 天／当天开始" onChange={(event) => patch("estimatedCompletionTime", event.target.value)} />
        </label>
        <label className="admin-field-wide">
          <span>给客户看的备注</span>
          <textarea rows="2" value={item.note} maxLength="240" placeholder="例如：加急订单请先联系客服确认" onChange={(event) => patch("note", event.target.value)} />
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
          自动报价时采用此价格
        </label>
        <small>{manualOnly ? "此服务按规则保留人工确认" : isApprovedRule ? "关闭后此服务会恢复为人工确认" : "关闭时只公开展示价格，不自动生成最终报价"}</small>
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
      setMessage("无法读取服务目录，请检查服务器配置。 ");
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
      setMessage("已发布。客户刷新网站后会看到最新价格和时间。");
      window.setTimeout(() => setStatus("ready"), 1800);
    } catch (error) {
      setStatus("error");
      setMessage(error.status === 409
        ? "其他窗口已经更新过目录。请刷新页面后再修改，避免覆盖新内容。"
        : error.message === "catalog-storage-not-configured"
          ? "服务器还没有连接持久化数据库，当前内容无法安全发布。"
          : "保存失败，请检查网络后重试。");
    }
  };

  const logout = async () => {
    await api("/api/admin/session", { method: "DELETE" }).catch(() => {});
    onLogout();
  };

  if (!catalog || status === "loading") {
    return <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>正在载入 Aurora 后台…</span></div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <a className="admin-brand" href={homeHref}>
          <span>A</span><div><strong>Aurora</strong><small>Control Room</small></div>
        </a>
        <div className="admin-topbar__actions">
          <a href={homeHref} target="_blank" rel="noreferrer"><Eye size={16} /> 查看网站</a>
          <button type="button" onClick={logout}><LogOut size={16} /> 退出</button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-page-heading">
          <div><span>SERVICE CATALOG</span><h1>价格与时间管理</h1><p>修改后点击“发布更新”，前台会自动读取最新内容。</p></div>
          <button className="admin-primary admin-save" type="button" onClick={save} disabled={!dirty || status === "saving" || !storageConfigured}>
            {status === "saving" ? <LoaderCircle className="admin-spin" size={17} /> : <Save size={17} />}
            {dirty ? "发布更新" : "内容已同步"}
          </button>
        </section>

        {!storageConfigured ? <p className="admin-alert admin-alert--warning">持久化数据库尚未连接。你可以预览后台，但部署配置完成前不能发布修改。</p> : null}
        {message ? <p className={`admin-alert${status === "saved" ? " admin-alert--success" : ""}`} role="status">{message}</p> : null}

        <section className="admin-global-settings">
          <label><span>显示币种</span><select value={catalog.currency} onChange={(event) => setCatalog({ ...catalog, currency: event.target.value })}>{["HKD", "TWD", "CNY", "USD", "GBP"].map((currency) => <option key={currency}>{currency}</option>)}</select></label>
          <label><span>全站公告（留空则不显示）</span><input value={catalog.announcement} maxLength="240" placeholder="例如：本周末订单名额有限，请提前预约" onChange={(event) => setCatalog({ ...catalog, announcement: event.target.value })} /></label>
        </section>

        <nav className="admin-game-tabs" aria-label="选择游戏">
          {supportedGameIds.map((gameId) => (
            <button key={gameId} type="button" className={gameId === activeGame ? "is-active" : ""} onClick={() => setActiveGame(gameId)}>
              <span>{getGameLabel(gameId, "zh-CN")}</span><ChevronRight size={15} />
            </button>
          ))}
        </nav>

        <section className="admin-service-grid" aria-label={`${getGameLabel(activeGame, "zh-CN")}服务设置`}>
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
          <span>{dirty ? "有尚未发布的修改" : "所有修改均已发布"}</span>
          <span>最后更新：{catalog.updatedAt ? new Date(catalog.updatedAt).toLocaleString("zh-CN") : "尚未发布"}</span>
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

  if (session.loading) return <div className="admin-loading"><LoaderCircle className="admin-spin" /><span>正在验证安全会话…</span></div>;
  if (!session.authenticated) return <Login configured={session.configured} onAuthenticated={checkSession} />;
  return <Dashboard onLogout={() => setSession((current) => ({ ...current, authenticated: false }))} />;
}
