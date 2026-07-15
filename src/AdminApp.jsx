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

function ServiceEditor({ gameId, serviceId, item, currency, onChange }) {
  const service = getCentralServiceDefinition(serviceId);
  const manualOnly = Boolean(service?.manualOnly);
  const label = getCentralServiceLabel(serviceId, "zh-CN");
  const patch = (field, value) => onChange({ ...item, [field]: value });

  return (
    <article className={`admin-service-card${item.enabled ? "" : " is-hidden"}`}>
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
        <label>
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
        </label>
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
      </div>

      <footer>
        <label className={`admin-check${manualOnly ? " is-disabled" : ""}`}>
          <input
            type="checkbox"
            checked={item.configured}
            disabled={manualOnly || !Number.isFinite(item.basePrice)}
            onChange={(event) => patch("configured", event.target.checked)}
          />
          <span><Check size={13} /></span>
          自动报价时采用此价格
        </label>
        <small>{manualOnly ? "此服务按规则保留人工确认" : "关闭时只公开展示价格，不自动生成最终报价"}</small>
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
    setCatalog((current) => ({
      ...current,
      games: {
        ...current.games,
        [gameId]: { ...current.games[gameId], [serviceId]: value },
      },
    }));
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
