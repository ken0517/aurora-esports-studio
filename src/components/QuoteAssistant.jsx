import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "../styles/quote.css";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clipboard,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  getCentralServiceDefinition,
  getCentralServiceLabel,
  getGameOptions,
  getHeroPowerMarkLabel,
  getHeroPowerMarksForGame,
  getLaneById,
  getLaneLabel,
  getLanesForGame,
  getServicesForGame,
  getHeroPowerMarkById,
  localizeGameValue,
} from "../data/gameConfig";
import { getDivisionsForRank, getRankLabel, getRanksForGame } from "../data/ranks";
import { findSuggestions } from "../data/suggestions";
import { isPricingConfigured } from "../data/pricing";
import { normalizeLocale as normalizeDataLocale, translate as translateFromData } from "../data/translations";
import {
  buildWhatsAppUrl,
  calculateQuote,
  createQuoteDraft,
  formatLineMessage,
  formatQuoteText,
  validateQuoteDraft,
} from "../lib/quoteEngine";
import { trackContactClick, trackQuoteResult } from "../lib/analytics.js";

const AI_ENDPOINT =
  import.meta.env.VITE_QUOTE_AI_ENDPOINT ||
  (import.meta.env.DEV ? "http://localhost:8787/api/quote-ai" : "/api/quote-ai");
const ENQUIRY_ENDPOINT =
  import.meta.env.VITE_ENQUIRY_ENDPOINT ||
  (import.meta.env.DEV ? "http://localhost:8787/api/enquiries" : "/api/enquiries");

const copyByLocale = {
  "zh-HK": {
    title: "Aurora 私人報價",
    subtitle: "自行填寫報價資料，或直接向 Aurora 客服查詢。",
    manualTab: "自己填寫",
    aiTab: "Aurora 客服",
    manualEntryLabel: "手動填寫報價表",
    manualEntryHint: "選擇遊戲、服務與目標",
    supportEntryLabel: "問客服即時查價",
    supportEntryHint: "直接說出你的需要",
    manualTitle: "建立專屬報價",
    manualIntro: "選擇遊戲、服務與目標。系統只會採用 Aurora 已確認的中央定價資料。",
    aiTitle: "Aurora 客服",
    aiIntro: "直接說出你的情況，Aurora 客服會逐步確認資料並整理需求。",
    aiWelcome: "你好，我是 Aurora 客服。請告訴我遊戲、目前情況和目標；如需預約，我會再確認開始時間。未確認的價格不會自行猜測。",
    aiOnline: "Aurora 客服已連線",
    aiChecking: "正在連接 Aurora 客服…",
    aiUnavailable: "Aurora 客服暫未連線",
    aiSetup: "Aurora 客服目前未完成連線。你仍可使用手動報價表，或透過 WhatsApp 聯絡真人客服。",
    aiError: "Aurora 客服暫時繁忙，請稍後再試，或聯絡真人客服。",
    thinking: "Aurora 客服正在整理你的需要…",
    newChat: "重新對話",
    inputPlaceholder: "例如：我鑽石三，想用打野升到星耀一…",
    send: "傳送給 Aurora 客服",
    role: "指定位置／分路",
    rolePlaceholder: "例如：打野、中路、輔助",
    currentPoints: "目前巔峰賽分數",
    targetPoints: "目標巔峰賽分數",
    currentHeroPowerPoints: "目前英雄戰力分數",
    targetHeroPowerPoints: "目標英雄戰力分數",
    duoMode: "陪玩模式",
    preferredStartTime: "理想開始時間",
    preferredStartHint: "請選擇預約日期和開始時間",
    otherServiceType: "其他服務類型",
    optional: "選填",
    select: "請選擇",
    notApplicable: "不適用",
    pointsHint: "巔峰賽或戰力服務可填",
    pricingPending: "正式價格尚未設定；提交後會轉人工確認，不會顯示估算金額。",
    pricingConfigured: "已套用 Aurora 正式價格及新人 85 折。",
    pricingManual: "此項服務需要由 Aurora 客服人工確認，不會顯示估算金額。",
    displayCurrency: "顯示幣別",
    generate: "整理報價",
    edit: "修改資料",
    reset: "清除表格",
    human: "聯絡真人客服",
    incomplete: "請先補充必要資料。",
    resultTitle: "報價資料摘要",
    pending: "待人工確認",
    close: "關閉報價視窗",
    copy: "複製摘要",
    copied: "已複製",
    whatsapp: "傳送到 WhatsApp",
    line: "傳送至 LINE",
    lineCopied: "報價已複製；加入好友後請貼上並傳送。",
    lineCopyFailed: "瀏覽器未能自動複製。請先按「複製報價」，再前往 LINE。",
    yes: "是",
    no: "否",
    suggested: "相關建議",
    noPricePromise: "Aurora 客服只會引用已確認的資料；未設定的價錢會交由真人客服確認。",
    privacyWarning: "請勿傳送帳號密碼、驗證碼、付款資料或身分證明。",
    dataConsent: "我同意 Aurora 保存本次報價及對話資料，以便跟進服務。請勿傳送密碼、驗證碼或付款資料。",
    consentRequired: "請先同意保存本次對話，Aurora 客服才可以回覆並跟進。",
  },
  en: {
    title: "Aurora private quote",
    subtitle: "Complete the quote form or ask Aurora support directly.",
    manualTab: "Fill it myself",
    aiTab: "Aurora support",
    manualEntryLabel: "Complete quote form",
    manualEntryHint: "Choose your game, service and goal",
    supportEntryLabel: "Ask Aurora for a quote",
    supportEntryHint: "Tell us what you need",
    manualTitle: "Build your private quote",
    manualIntro: "Choose the game, service and target. Only Aurora's confirmed central pricing data is used.",
    aiTitle: "Aurora support",
    aiIntro: "Describe what you need. Aurora support will confirm missing details and organise your request.",
    aiWelcome: "Hi, this is Aurora support. Tell us your game, current situation, target and preferred timing. Unconfirmed prices will never be guessed.",
    aiOnline: "Aurora support is connected",
    aiChecking: "Connecting to Aurora support…",
    aiUnavailable: "Aurora support is not connected",
    aiSetup: "Aurora support is not connected yet. You can still use the manual quote form or contact human support on WhatsApp.",
    aiError: "Aurora support is temporarily busy. Please try again later or contact human support.",
    thinking: "Aurora support is organising your request…",
    newChat: "New chat",
    inputPlaceholder: "e.g. I am Diamond III and want to reach Veteran I as jungle…",
    send: "Send to Aurora support",
    role: "Preferred role / lane",
    rolePlaceholder: "e.g. Jungle, Mid, Support",
    currentPoints: "Current Peak score",
    targetPoints: "Target Peak score",
    currentHeroPowerPoints: "Current hero-power score",
    targetHeroPowerPoints: "Target hero-power score",
    duoMode: "Companion mode",
    preferredStartTime: "Preferred start time",
    preferredStartHint: "Choose the appointment date and start time",
    otherServiceType: "Other service type",
    optional: "Optional",
    select: "Select",
    notApplicable: "Not applicable",
    pointsHint: "For peak-ranked or hero-power requests",
    pricingPending: "Official pricing is not configured yet. The request will go to human review and no estimate will be shown.",
    pricingConfigured: "Aurora official pricing and the 15% newcomer discount are applied.",
    pricingManual: "Aurora support must confirm this service manually; no estimated amount is shown.",
    displayCurrency: "Display currency",
    generate: "Prepare quote",
    edit: "Edit details",
    reset: "Clear form",
    human: "Human support",
    incomplete: "Please complete the required details.",
    resultTitle: "Quote request summary",
    pending: "Human confirmation",
    close: "Close quote window",
    copy: "Copy summary",
    copied: "Copied",
    whatsapp: "Send to WhatsApp",
    line: "Send to LINE",
    lineCopied: "Quote copied. Add Aurora on LINE, then paste and send it.",
    lineCopyFailed: "Your browser could not copy automatically. Copy the quote first, then open LINE.",
    yes: "Yes",
    no: "No",
    suggested: "Suggestions",
    noPricePromise: "Aurora support only cites confirmed information. Unconfigured prices are handed to human support.",
    privacyWarning: "Do not send account passwords, verification codes, payment details, or identity documents.",
    dataConsent: "I agree that Aurora may save this quote and conversation for follow-up. Do not send passwords, verification codes, or payment details.",
    consentRequired: "Please consent to saving this conversation before Aurora support replies.",
  },
  "zh-CN": {
    title: "Aurora 私人报价",
    subtitle: "自行填写报价资料，或直接向 Aurora 客服查询。",
    manualTab: "自己填写",
    aiTab: "Aurora 客服",
    manualEntryLabel: "手动填写报价表",
    manualEntryHint: "选择游戏、服务与目标",
    supportEntryLabel: "问客服即时查价",
    supportEntryHint: "直接说出你的需要",
    manualTitle: "建立专属报价",
    manualIntro: "选择游戏、服务与目标。系统只会采用 Aurora 已确认的中央定价资料。",
    aiTitle: "Aurora 客服",
    aiIntro: "直接说出你的情况，Aurora 客服会逐步确认资料并整理需求。",
    aiWelcome: "你好，我是 Aurora 客服。请告诉我游戏、目前情况和目标；如需预约，我会再确认开始时间。未确认的价格不会自行猜测。",
    aiOnline: "Aurora 客服已连线",
    aiChecking: "正在连接 Aurora 客服…",
    aiUnavailable: "Aurora 客服暂未连线",
    aiSetup: "Aurora 客服目前未完成连接。你仍可使用手动报价表，或通过 WhatsApp 联系真人客服。",
    aiError: "Aurora 客服暂时繁忙，请稍后再试，或联系真人客服。",
    thinking: "Aurora 客服正在整理你的需要…",
    newChat: "重新对话",
    inputPlaceholder: "例如：我钻石三，想用打野升到星耀一…",
    send: "发送给 Aurora 客服",
    role: "指定位置／分路",
    rolePlaceholder: "例如：打野、中路、辅助",
    currentPoints: "目前巅峰赛分数",
    targetPoints: "目标巅峰赛分数",
    currentHeroPowerPoints: "目前英雄战力分数",
    targetHeroPowerPoints: "目标英雄战力分数",
    duoMode: "陪玩模式",
    preferredStartTime: "理想开始时间",
    preferredStartHint: "请选择预约日期和开始时间",
    otherServiceType: "其他服务类型",
    optional: "选填",
    select: "请选择",
    notApplicable: "不适用",
    pointsHint: "巅峰赛或战力服务可填",
    pricingPending: "正式价格尚未设置；提交后会转人工确认，不会显示估算金额。",
    pricingConfigured: "已套用 Aurora 正式价格及新人 85 折。",
    pricingManual: "此项服务需要由 Aurora 客服人工确认，不会显示估算金额。",
    displayCurrency: "显示币别",
    generate: "整理报价",
    edit: "修改资料",
    reset: "清除表格",
    human: "联系真人客服",
    incomplete: "请先补充必要资料。",
    resultTitle: "报价资料摘要",
    pending: "待人工确认",
    close: "关闭报价窗口",
    copy: "复制摘要",
    copied: "已复制",
    whatsapp: "发送到 WhatsApp",
    line: "发送至 LINE",
    lineCopied: "报价已复制；添加好友后请粘贴并发送。",
    lineCopyFailed: "浏览器未能自动复制。请先点击“复制报价”，再前往 LINE。",
    yes: "是",
    no: "否",
    suggested: "相关建议",
    noPricePromise: "Aurora 客服只会引用已确认的资料；未设置的价格会交由真人客服确认。",
    privacyWarning: "请勿发送账号密码、验证码、付款资料或身份证明。",
    dataConsent: "我同意 Aurora 保存本次报价及对话资料，以便跟进服务。请勿发送密码、验证码或付款资料。",
    consentRequired: "请先同意保存本次对话，Aurora 客服才可以回复并跟进。",
  },
};

const translationKeys = {
  game: "quote.fields.game",
  service: "quote.fields.service",
  currentRank: "quote.fields.currentRank",
  currentDivision: "quote.fields.currentDivision",
  currentStars: "quote.fields.currentStars",
  targetRank: "quote.fields.targetRank",
  targetDivision: "quote.fields.targetDivision",
  targetStars: "quote.fields.targetStars",
  quantity: "quote.fields.quantity",
  preferredStartTime: "quote.fields.preferredStartTime",
  duoGuarantee: "quote.fields.duoGuarantee",
  preferredHero: "quote.fields.preferredHero",
  preferredRole: "quote.fields.preferredRole",
  heroPowerMark: "quote.fields.heroPowerMark",
  currentHeroPowerPoints: "quote.fields.currentHeroPowerPoints",
  targetHeroPowerPoints: "quote.fields.targetHeroPowerPoints",
  duoMode: "quote.fields.duoMode",
  otherServiceType: "quote.fields.otherServiceType",
  quoteStatus: "quote.fields.quoteStatus",
  requirements: "quote.fields.additionalRequirements",
  basePrice: "quote.table.basePrice",
  optionalCharges: "quote.table.optionalCharges",
  discount: "quote.table.discount",
  newCustomerDiscount: "quote.table.newCustomerDiscount",
  estimatedTime: "quote.table.estimatedCompletionTime",
  finalTotal: "quote.table.finalTotal",
  bookingDeposit: "quote.table.bookingDeposit",
  reference: "quote.table.reference",
};

const numericFields = new Set([
  "currentStars",
  "targetStars",
  "currentPoints",
  "targetPoints",
  "currentHeroPowerPoints",
  "targetHeroPowerPoints",
  "quantity",
]);

function normalizedLocale(locale) {
  return normalizeDataLocale(locale);
}

function makeDraft(locale) {
  return {
    ...createQuoteDraft(locale),
    locale,
    gameId: null,
    serviceId: null,
    currentRankId: null,
    currentDivision: null,
    currentStars: null,
    currentPoints: null,
    currentHeroPowerPoints: null,
    targetRankId: null,
    targetDivision: null,
    targetStars: null,
    targetPoints: null,
    targetHeroPowerPoints: null,
    quantity: null,
    preferredStartTime: "",
    preferredHero: "",
    preferredRole: "",
    heroPowerMarkId: null,
    duoMode: null,
    duoGuarantee: null,
    otherServiceType: null,
    additionalRequirements: "",
    displayCurrency: "HKD",
  };
}

const gameScopedDraftReset = {
  currentRankId: null,
  currentDivision: null,
  currentStars: null,
  currentPoints: null,
  currentHeroPowerPoints: null,
  targetRankId: null,
  targetDivision: null,
  targetStars: null,
  targetPoints: null,
  targetHeroPowerPoints: null,
  quantity: null,
  points: null,
  preferredHero: "",
  preferredRole: "",
  heroPowerMarkId: null,
  duoMode: null,
  duoGuarantee: null,
  preferredStartTime: "",
  otherServiceType: null,
  additionalRequirements: "",
};

const serviceScopedDraftReset = {
  currentRankId: null,
  currentDivision: null,
  currentStars: null,
  currentPoints: null,
  currentHeroPowerPoints: null,
  targetRankId: null,
  targetDivision: null,
  targetStars: null,
  targetPoints: null,
  targetHeroPowerPoints: null,
  quantity: null,
  points: null,
  preferredHero: "",
  preferredRole: "",
  heroPowerMarkId: null,
  duoMode: null,
  duoGuarantee: null,
  otherServiceType: null,
  preferredStartTime: "",
  additionalRequirements: "",
};

function mergeDraftPatch(current, patch) {
  const incoming = patch ?? {};
  const owns = (field) => Object.prototype.hasOwnProperty.call(incoming, field);
  const gameChanged = owns("gameId") && incoming.gameId !== current.gameId;
  const serviceChanged = owns("serviceId") && incoming.serviceId !== current.serviceId;
  const currentRankChanged = owns("currentRankId") && incoming.currentRankId !== current.currentRankId;
  const targetRankChanged = owns("targetRankId") && incoming.targetRankId !== current.targetRankId;
  const next = { ...current };

  // Reset first, then apply an explicit patch. This lets a suggestion populate
  // valid fields for its new game without carrying any fields from the old one.
  if (gameChanged) Object.assign(next, gameScopedDraftReset);
  if (serviceChanged) Object.assign(next, serviceScopedDraftReset);
  if (currentRankChanged) {
    next.currentDivision = null;
    next.currentStars = null;
  }
  if (targetRankChanged) {
    next.targetDivision = null;
    next.targetStars = null;
  }

  Object.assign(next, incoming);

  const usesRankRange = next.serviceId === "rank" || (next.serviceId === "duo" && next.duoMode === "ranked");
  const usesCurrentRank = usesRankRange || next.serviceId === "hero-power";
  if (!usesCurrentRank) {
    next.currentRankId = null;
    next.currentDivision = null;
    next.currentStars = null;
  }
  if (!usesRankRange) {
    next.targetRankId = null;
    next.targetDivision = null;
    next.targetStars = null;
  }

  if (!["peak", "hero-power"].includes(next.serviceId)) next.currentPoints = null;
  if (next.serviceId !== "peak") next.targetPoints = null;
  if (next.serviceId !== "hero-power") {
    next.currentHeroPowerPoints = null;
    next.targetHeroPowerPoints = null;
    next.heroPowerMarkId = null;
  }

  if (next.serviceId !== "duo") {
    next.duoMode = null;
    next.duoGuarantee = null;
  }
  if (!(next.serviceId === "duo" && next.duoMode === "ranked")) next.duoGuarantee = null;
  const usesAppointmentStart = (next.serviceId === "duo" && next.duoMode) ||
    (next.serviceId === "other" && Boolean(next.otherServiceType));
  if (!usesAppointmentStart) next.preferredStartTime = "";
  if (!(next.serviceId === "duo" && next.duoMode === "match-5v5")) {
    next.quantity = null;
    next.points = null;
  }
  if (next.serviceId !== "other") {
    next.otherServiceType = null;
  }

  if (!["rank", "peak", "hero-power"].includes(next.serviceId)) next.preferredHero = "";
  if (!["rank", "peak"].includes(next.serviceId)) next.preferredRole = "";
  if (next.gameId) {
    const gameServices = getServicesForGame(next.gameId);
    if (next.serviceId && !gameServices.some((service) => service.id === next.serviceId)) {
      next.serviceId = null;
      Object.assign(next, serviceScopedDraftReset);
    }

    const gameRanks = getRanksForGame(next.gameId);
    const currentRank = gameRanks.find((rank) => rank.id === next.currentRankId);
    const targetRank = gameRanks.find((rank) => rank.id === next.targetRankId);
    if (next.currentRankId && !currentRank) {
      next.currentRankId = null;
      next.currentDivision = null;
      next.currentStars = null;
    } else if (
      currentRank?.divisions?.length &&
      next.currentDivision &&
      !currentRank.divisions.includes(String(next.currentDivision))
    ) {
      next.currentDivision = null;
    }
    if (next.targetRankId && !targetRank) {
      next.targetRankId = null;
      next.targetDivision = null;
      next.targetStars = null;
    } else if (
      targetRank?.divisions?.length &&
      next.targetDivision &&
      !targetRank.divisions.includes(String(next.targetDivision))
    ) {
      next.targetDivision = null;
    }

    if (next.preferredRole && !getLaneById(next.gameId, next.preferredRole)) {
      next.preferredRole = "";
    }
    if (next.heroPowerMarkId && !getHeroPowerMarkById(next.gameId, next.heroPowerMarkId)) {
      next.heroPowerMarkId = null;
    }
  }
  return next;
}

function localize(value, locale, fallback = "") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return fallback;
  return (
    value.labels?.[locale] ??
    value.label?.[locale] ??
    value[locale] ??
    value.labels?.["zh-HK"] ??
    value.label?.["zh-HK"] ??
    value.traditionalChinese ??
    value.english ??
    fallback
  );
}

function safeRanks(gameId) {
  if (!gameId) return [];
  try {
    const ranks = getRanksForGame(gameId);
    return Array.isArray(ranks) ? ranks : [];
  } catch {
    return [];
  }
}

function safeDivisions(gameId, rankId) {
  if (!gameId || !rankId) return [];
  try {
    return (getDivisionsForRank(gameId, rankId) || []).map((division) =>
      typeof division === "object"
        ? { ...division, id: String(division.id ?? division.value ?? "") }
        : { id: String(division), label: String(division) },
    );
  } catch {
    return [];
  }
}

function rankName(gameId, rank, locale) {
  if (!rank) return "—";
  try {
    return getRankLabel(rank, locale, gameId) || rank.id;
  } catch {
    return localize(rank, locale, rank.id);
  }
}

function suggestionName(suggestion, locale) {
  return localize(suggestion, locale, suggestion?.text ?? suggestion?.query ?? suggestion?.id ?? "");
}

function suggestionDraft(suggestion) {
  return suggestion?.draft ?? suggestion?.patch ?? suggestion?.prefill ?? {};
}

function formatValue(value, locale, currency, pending) {
  if (value === null || value === undefined || value === "") return pending;
  if (typeof value === "object" && value.amount !== undefined) {
    return formatValue(value.amount, locale, value.currency ?? currency, pending);
  }
  if (typeof value === "number" && currency) {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  }
  return String(value);
}

function formatAppointmentTime(value, locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ");
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return String(value).replace("T", " ");
  }
}

function Field({ label, optional, hint, wide = false, children }) {
  return (
    <label className={`quote-field${wide ? " quote-field--wide" : ""}`}>
      <span className="quote-field__label">
        <span>{label}</span>
        {optional ? <small>{optional}</small> : null}
      </span>
      {children}
      {hint ? <small className="quote-field__hint">{hint}</small> : null}
    </label>
  );
}

function Select({ value, onChange, disabled, required, placeholder, children, ...selectProps }) {
  return (
    <span className="quote-select">
      <select {...selectProps} value={value ?? ""} onChange={onChange} disabled={disabled} required={required}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
    </span>
  );
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  return Promise.resolve();
}

function createSessionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function QuoteAssistant({
  locale = "zh-HK",
  t: translate,
  contactLinks = {},
  className = "",
  onOpenChange,
  prefillRequest,
  pricingCatalog,
  initialPane = null,
}) {
  const reduceMotion = useReducedMotion();
  const localeId = normalizedLocale(locale);
  const ui = copyByLocale[localeId] ?? copyByLocale["zh-HK"];
  const [open, setOpen] = useState(Boolean(initialPane));
  const [mobilePane, setMobilePane] = useState(initialPane || "manual");
  const [draft, setDraft] = useState(() => makeDraft(localeId));
  const [quote, setQuote] = useState(null);
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lineCopyStatus, setLineCopyStatus] = useState("");
  const [sessionId, setSessionId] = useState(createSessionId);
  const [conversationConsent, setConversationConsent] = useState(false);
  const portalTarget = typeof document === "undefined" ? null : document.body;
  const [aiStatus, setAiStatus] = useState("checking");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const dialogRef = useRef(null);
  const aiInputRef = useRef(null);
  const messageListRef = useRef(null);
  const previousFocusRef = useRef(null);
  const scrollLockRef = useRef(null);
  const aiRequestRef = useRef(null);
  const copyTimerRef = useRef(null);
  const lastPrefillRequestRef = useRef(null);
  const prefillFocusRef = useRef(false);
  const manualFocusRef = useRef(false);
  const suppressSuggestionsOnFocusRef = useRef(false);
  const trackedQuoteRef = useRef("");

  const text = useCallback(
    (key, fallback) => {
      const translationKey = translationKeys[key];
      if (translationKey && typeof translate === "function") {
        const value = translate(translationKey);
        if (typeof value === "string" && value && value !== translationKey) return value;
      }
      if (translationKey) {
        const value = translateFromData(localeId, translationKey);
        if (typeof value === "string" && value && value !== translationKey) return value;
      }
      return fallback ?? key;
    },
    [localeId, translate],
  );

  const setOpenState = useCallback(
    (next) => {
      if (next) setAiStatus("checking");
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const openDialog = useCallback((pane) => {
    setMobilePane(pane);
    if (pane === "manual") {
      manualFocusRef.current = true;
    } else {
      prefillFocusRef.current = true;
    }
    setOpenState(true);
  }, [setOpenState]);

  useEffect(() => {
    const requestText = String(prefillRequest?.text ?? "").trim();
    const requestedPane = prefillRequest?.pane === "manual" ? "manual" : "ai";
    const gameId = String(prefillRequest?.gameId ?? "").trim() || null;
    const serviceId = String(prefillRequest?.serviceId ?? "").trim() || null;
    if (!requestText && !gameId && !serviceId) return;

    const requestKey = prefillRequest?.id ?? `${requestedPane}:${gameId}:${serviceId}:${requestText}`;
    if (
      lastPrefillRequestRef.current?.id === requestKey &&
      lastPrefillRequestRef.current?.text === requestText
    ) {
      return;
    }

    lastPrefillRequestRef.current = { id: requestKey, text: requestText };
    const frame = window.requestAnimationFrame(() => {
      if (gameId || serviceId) {
        setDraft((current) =>
          mergeDraftPatch(current, {
            ...(gameId ? { gameId } : {}),
            ...(serviceId ? { serviceId } : {}),
          }),
        );
      }
      setAiError("");
      setSuggestionsVisible(false);
      setActiveSuggestion(-1);
      if (requestedPane === "manual") {
        manualFocusRef.current = true;
        setMobilePane("manual");
      } else {
        prefillFocusRef.current = true;
        suppressSuggestionsOnFocusRef.current = true;
        if (requestText) setAiInput(requestText);
        setMobilePane("ai");
      }
      setOpenState(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    prefillRequest?.gameId,
    prefillRequest?.id,
    prefillRequest?.pane,
    prefillRequest?.serviceId,
    prefillRequest?.text,
    setOpenState,
  ]);

  useEffect(() => {
    if (!open || mobilePane !== "ai" || !prefillFocusRef.current) return undefined;

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const input = aiInputRef.current;
        if (!input) return;
        input.focus({ preventScroll: true });
        const cursorPosition = input.value.length;
        input.setSelectionRange(cursorPosition, cursorPosition);
        prefillFocusRef.current = false;
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [aiInput, mobilePane, open]);

  useEffect(() => {
    if (!open || mobilePane !== "manual" || !manualFocusRef.current) return undefined;

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const firstField = dialogRef.current?.querySelector(
          "#manual-quote-game, .quote-dual-panel--manual select, .quote-dual-panel--manual input, .quote-dual-panel--manual textarea",
        );
        firstField?.focus({ preventScroll: true });
        manualFocusRef.current = false;
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [mobilePane, open, quote]);

  const unlockScroll = useCallback(() => {
    if (!scrollLockRef.current || typeof document === "undefined") return;
    const lock = scrollLockRef.current;
    document.body.style.overflow = lock.bodyOverflow;
    document.body.style.overscrollBehavior = lock.bodyOverscroll;
    document.documentElement.style.overflow = lock.rootOverflow;
    document.documentElement.style.overscrollBehavior = lock.rootOverscroll;
    scrollLockRef.current = null;
  }, []);

  const closeDialog = useCallback(() => {
    aiRequestRef.current?.abort();
    setSuggestionsVisible(false);
    unlockScroll();
    setOpenState(false);
  }, [setOpenState, unlockScroll]);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const body = document.body;
    const root = document.documentElement;
    if (!scrollLockRef.current) {
      scrollLockRef.current = {
        bodyOverflow: body.style.overflow,
        bodyOverscroll: body.style.overscrollBehavior,
        rootOverflow: root.style.overflow,
        rootOverscroll: root.style.overscrollBehavior,
      };
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      root.style.overflow = "hidden";
      root.style.overscrollBehavior = "none";
    }
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    const handleKey = (event) => {
      if (event.key === "Escape") {
        closeDialog();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKey);
      unlockScroll();
      previousFocusRef.current?.focus?.();
    };
  }, [closeDialog, open, unlockScroll]);

  useEffect(
    () => () => {
      aiRequestRef.current?.abort();
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    const statusUrl = `${AI_ENDPOINT.replace(/\/$/, "")}/status`;
    fetch(statusUrl, { headers: { Accept: "application/json" }, signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.configured || payload.provider !== "gemini") {
          setAiStatus("unavailable");
          return;
        }
        setAiStatus("online");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setAiStatus("unavailable");
        }
      });
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [aiLoading, aiMessages, reduceMotion]);

  const games = useMemo(() => getGameOptions(), []);
  const services = useMemo(() => getServicesForGame(draft.gameId), [draft.gameId]);
  const ranks = useMemo(() => safeRanks(draft.gameId), [draft.gameId]);
  const lanes = useMemo(() => getLanesForGame(draft.gameId), [draft.gameId]);
  const heroPowerMarks = useMemo(
    () => getHeroPowerMarksForGame(draft.gameId),
    [draft.gameId],
  );
  const currentDivisions = useMemo(
    () => safeDivisions(draft.gameId, draft.currentRankId),
    [draft.currentRankId, draft.gameId],
  );
  const targetDivisions = useMemo(
    () => safeDivisions(draft.gameId, draft.targetRankId),
    [draft.gameId, draft.targetRankId],
  );

  const suggestions = useMemo(() => {
    if (!aiInput.trim()) return [];
    try {
      return (findSuggestions(aiInput, localeId, {
        gameId: draft.gameId,
        serviceId: draft.serviceId,
      }) || []).slice(0, 5);
    } catch {
      return [];
    }
  }, [aiInput, draft.gameId, draft.serviceId, localeId]);

  const visibleActiveSuggestion = suggestions[activeSuggestion]
    ? activeSuggestion
    : suggestions.length
      ? 0
      : -1;

  const gameName = useCallback(
    (game) => localizeGameValue(game?.labels, localeId) || game?.id || "",
    [localeId],
  );

  const serviceName = useCallback(
    (service) => getCentralServiceLabel(service, localeId) || service?.id || "",
    [localeId],
  );

  const updateDraft = useCallback((field, value) => {
    const nextValue = numericFields.has(field)
      ? value === "" || value === null
        ? null
        : Number(value)
      : value;
    setDraft((current) => mergeDraftPatch(current, { [field]: nextValue }));
    setQuote(null);
    setFormError("");
  }, []);

  const resetForm = useCallback(() => {
    setDraft(makeDraft(localeId));
    setQuote(null);
    setFormError("");
  }, [localeId]);

  const selectedGame = games.find((game) => game.id === draft.gameId);
  const selectedService = getCentralServiceDefinition(draft.serviceId);
  const selectedCurrentRank = ranks.find((rank) => rank.id === draft.currentRankId);
  const selectedTargetRank = ranks.find((rank) => rank.id === draft.targetRankId);
  const isHeroPower = draft.serviceId === "hero-power";
  const isPeak = draft.serviceId === "peak";
  const isDuo = draft.serviceId === "duo";
  const isDuoRanked = isDuo && draft.duoMode === "ranked";
  const isDuoMatch = isDuo && draft.duoMode === "match-5v5";
  const isOther = draft.serviceId === "other";
  const isTimedTeaching = isOther && Boolean(draft.otherServiceType);
  const showRankRange = draft.serviceId === "rank" || isDuoRanked;
  const showCurrentRank = showRankRange || isHeroPower;
  const showHeroAndRole = draft.serviceId === "rank" || isPeak;
  const duoModes = selectedService?.modes ?? [];
  const duoGuaranteeOptions = selectedService?.guaranteeOptions ?? [];
  const otherServiceTypes = selectedService?.options ?? [];
  const pricingReady = Boolean(
    draft.gameId &&
      draft.serviceId &&
      isPricingConfigured(draft.gameId, draft.serviceId, pricingCatalog, draft),
  );

  const captureEnquiry = useCallback(async (result) => {
    if (!conversationConsent || !result) return;
    try {
      await fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sessionId,
          consent: true,
          source: "manual_quote",
          locale: localeId,
          draft,
          quote: result,
        }),
      });
    } catch {
      // A storage outage must not block the customer from viewing a quote.
    }
  }, [conversationConsent, draft, localeId, sessionId]);

  const generateQuote = useCallback(() => {
    setFormError("");
    let validation;
    try {
      validation = validateQuoteDraft(
        { ...draft, locale: localeId },
        { pricingCatalog },
      );
    } catch {
      setFormError(ui.incomplete);
      return;
    }
    if (!validation?.valid) {
      setFormError(validation?.errors?.filter(Boolean).slice(0, 3).join(" ") || ui.incomplete);
      return;
    }
    try {
      const result = calculateQuote(
        { ...draft, locale: localeId },
        { pricingCatalog },
      );
      setQuote(result);
      void captureEnquiry(result);
    } catch {
      const result = {
        status: "manual_review",
        requiresManualReview: true,
        draft: { ...draft },
        basePrice: null,
        optionalCharges: null,
        discount: null,
        finalTotal: null,
      };
      setQuote(result);
      void captureEnquiry(result);
    }
  }, [captureEnquiry, draft, localeId, pricingCatalog, ui.incomplete]);

  const quoteText = useMemo(() => {
    if (!quote) return "";
    let base;
    try {
      base = formatQuoteText(quote, localeId);
    } catch {
      base = `${ui.resultTitle}\n${ui.pending}`;
    }
    const extras = [
      draft.currentPoints !== null ? `${ui.currentPoints}: ${draft.currentPoints}` : null,
      draft.targetPoints !== null ? `${ui.targetPoints}: ${draft.targetPoints}` : null,
    ].filter(Boolean);
    return extras.length ? `${base}\n${extras.join("\n")}` : base;
  }, [draft.currentPoints, draft.targetPoints, localeId, quote, ui]);

  const whatsappUrl = useMemo(() => {
    if (!quote) return contactLinks.whatsapp || "https://wa.me/85262243840";
    try {
      return buildWhatsAppUrl(quote, localeId, contactLinks.whatsapp);
    } catch {
      const base = contactLinks.whatsapp || "https://wa.me/85262243840";
      return `${base}${base.includes("?") ? "&" : "?"}text=${encodeURIComponent(quoteText)}`;
    }
  }, [contactLinks.whatsapp, localeId, quote, quoteText]);

  useEffect(() => {
    if (!quote) return;
    const quoteKey = String(quote.referenceNumber || quote.reference || `${draft.gameId}:${draft.serviceId}:${quote.status}`);
    if (trackedQuoteRef.current === quoteKey) return;
    trackedQuoteRef.current = quoteKey;
    trackQuoteResult({
      gameId: draft.gameId,
      serviceId: draft.serviceId,
      status: quote.status || (quote.requiresManualReview ? "manual_review" : "quoted"),
    });
  }, [draft.gameId, draft.serviceId, quote]);

  const lineMessage = useMemo(() => {
    if (!quote) return "";
    try {
      return formatLineMessage(quote, localeId);
    } catch {
      return quoteText;
    }
  }, [localeId, quote, quoteText]);

  const handleCopy = async () => {
    if (!quoteText) return;
    try {
      await copyToClipboard(quoteText);
      setCopied(true);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleLineClick = () => {
    trackContactClick("line");
    if (!lineMessage) return;
    setLineCopyStatus("");
    copyToClipboard(lineMessage)
      .then(() => setLineCopyStatus("copied"))
      .catch(() => setLineCopyStatus("failed"));
  };

  const sendAiMessage = useCallback(
    async (rawMessage, nextDraft = draft) => {
      const message = String(rawMessage || "").trim();
      if (!message || aiLoading) return;
      if (!conversationConsent) {
        setAiError(ui.consentRequired);
        return;
      }
      if (aiStatus !== "online") {
        setAiError(ui.aiSetup);
        return;
      }
      const userMessage = { role: "user", content: message, id: `user-${Date.now()}` };
      const requestMessages = [...aiMessages, userMessage]
        .filter((item) => item.role === "user" || item.role === "assistant")
        .slice(-20)
        .map(({ role, content }) => ({ role, content }));
      setAiMessages((current) => [...current, userMessage]);
      setAiInput("");
      setSuggestionsVisible(false);
      setAiError("");
      setAiLoading(true);
      aiRequestRef.current?.abort();
      const controller = new AbortController();
      aiRequestRef.current = controller;
      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            locale: localeId,
            sessionId,
            conversationConsent,
            messages: requestMessages,
            quoteContext: nextDraft,
          }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || typeof payload.message !== "string" || !payload.message.trim()) {
          throw new Error(payload.error || `HTTP ${response.status}`);
        }
        setAiMessages((current) => [
          ...current,
          { role: "assistant", content: payload.message.trim(), id: payload.responseId || `ai-${Date.now()}` },
        ]);
      } catch (error) {
        if (error.name !== "AbortError") setAiError(ui.aiError);
      } finally {
        if (aiRequestRef.current === controller) aiRequestRef.current = null;
        setAiLoading(false);
      }
    },
    [aiLoading, aiMessages, aiStatus, conversationConsent, draft, localeId, sessionId, ui.aiError, ui.aiSetup, ui.consentRequired],
  );

  const chooseSuggestion = useCallback(
    (suggestion) => {
      const label = suggestionName(suggestion, localeId);
      const patch = suggestionDraft(suggestion);
      const nextDraft = mergeDraftPatch(draft, { ...patch, locale: localeId });
      setDraft(nextDraft);
      setAiInput(label);
      setSuggestionsVisible(false);
      setActiveSuggestion(-1);
      sendAiMessage(label, nextDraft);
    },
    [draft, localeId, sendAiMessage],
  );

  const handleAiKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setSuggestionsVisible(true);
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setSuggestionsVisible(true);
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (suggestionsVisible && suggestions[visibleActiveSuggestion]) {
        chooseSuggestion(suggestions[visibleActiveSuggestion]);
      } else {
        sendAiMessage(aiInput);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (suggestionsVisible) {
        setSuggestionsVisible(false);
        setActiveSuggestion(-1);
      } else {
        closeDialog();
      }
    }
  };

  const renderManualForm = () => {
    const currentAcceptsStars = Boolean(selectedCurrentRank && selectedCurrentRank.measurement !== "leaderboard");
    const targetAcceptsStars = Boolean(selectedTargetRank && selectedTargetRank.measurement !== "leaderboard");

    return (
      <form
        className="quote-form"
        onSubmit={(event) => {
          event.preventDefault();
          generateQuote();
        }}
      >
        <div className="quote-form__grid">
          <Field label={ui.displayCurrency}>
            <Select
              id="ai-quote-currency"
              value={draft.displayCurrency}
              onChange={(event) => updateDraft("displayCurrency", event.target.value)}
            >
              <option value="HKD">HKD · 港幣</option>
              <option value="TWD">TWD · 新台幣</option>
              <option value="CNY">CNY · 人民幣</option>
            </Select>
          </Field>
          <Field label={text("game", "遊戲")}>
            <Select
              id="manual-quote-game"
              value={draft.gameId}
              onChange={(event) => updateDraft("gameId", event.target.value || null)}
              required
              placeholder={ui.select}
            >
              {games.map((game) => <option key={game.id} value={game.id}>{gameName(game)}</option>)}
            </Select>
          </Field>
          <Field label={text("service", "服務")}>
            <Select
              value={draft.serviceId}
              onChange={(event) => updateDraft("serviceId", event.target.value || null)}
              required
              disabled={!draft.gameId}
              placeholder={draft.gameId ? ui.select : text("game", "遊戲")}
            >
              {services.map((service) => <option key={service.id} value={service.id}>{serviceName(service)}</option>)}
            </Select>
          </Field>

          {isDuo ? (
            <Field label={text("duoMode", ui.duoMode)}>
              <Select
                value={draft.duoMode}
                onChange={(event) => updateDraft("duoMode", event.target.value || null)}
                required
                placeholder={ui.select}
              >
                {duoModes.map((mode) => (
                  <option key={mode.id} value={mode.id}>{localizeGameValue(mode.labels, localeId)}</option>
                ))}
              </Select>
            </Field>
          ) : null}

          {showCurrentRank ? (
            <>
              <Field label={text("currentRank", "目前段位")}>
                <Select
                  value={draft.currentRankId}
                  onChange={(event) => updateDraft("currentRankId", event.target.value || null)}
                  required
                  disabled={!draft.gameId}
                  placeholder={draft.gameId ? ui.select : text("game", "遊戲")}
                >
                  {ranks.map((rank) => <option key={rank.id} value={rank.id}>{rankName(draft.gameId, rank, localeId)}</option>)}
                </Select>
              </Field>
              <Field label={text("currentDivision", "目前分級")} optional={currentDivisions.length ? null : ui.optional}>
                <Select
                  value={draft.currentDivision}
                  onChange={(event) => updateDraft("currentDivision", event.target.value || null)}
                  disabled={!currentDivisions.length}
                  required={Boolean(currentDivisions.length)}
                  placeholder={currentDivisions.length ? ui.select : ui.notApplicable}
                >
                  {currentDivisions.map((division) => <option key={division.id} value={division.id}>{division.label ?? division.id}</option>)}
                </Select>
              </Field>
              <Field label={text("currentStars", "目前星數")} optional={currentAcceptsStars ? null : ui.optional}>
                <input
                  type="number"
                  min={selectedCurrentRank?.measurement === "stars" && Number.isFinite(selectedCurrentRank.minStars) ? selectedCurrentRank.minStars : 0}
                  max={selectedCurrentRank?.measurement === "stars" && Number.isFinite(selectedCurrentRank.maxStars) ? selectedCurrentRank.maxStars : undefined}
                  inputMode="numeric"
                  disabled={!currentAcceptsStars}
                  required={currentAcceptsStars}
                  placeholder={currentAcceptsStars ? "0" : ui.notApplicable}
                  value={draft.currentStars ?? ""}
                  onChange={(event) => updateDraft("currentStars", event.target.value)}
                />
              </Field>
            </>
          ) : null}

          {showRankRange ? (
            <>
              <Field label={text("targetRank", "目標段位")}>
                <Select
                  value={draft.targetRankId}
                  onChange={(event) => updateDraft("targetRankId", event.target.value || null)}
                  required
                  disabled={!draft.gameId}
                  placeholder={draft.gameId ? ui.select : text("game", "遊戲")}
                >
                  {ranks.map((rank) => <option key={rank.id} value={rank.id}>{rankName(draft.gameId, rank, localeId)}</option>)}
                </Select>
              </Field>
              <Field label={text("targetDivision", "目標分級")} optional={targetDivisions.length ? null : ui.optional}>
                <Select
                  value={draft.targetDivision}
                  onChange={(event) => updateDraft("targetDivision", event.target.value || null)}
                  disabled={!targetDivisions.length}
                  required={Boolean(targetDivisions.length)}
                  placeholder={targetDivisions.length ? ui.select : ui.notApplicable}
                >
                  {targetDivisions.map((division) => <option key={division.id} value={division.id}>{division.label ?? division.id}</option>)}
                </Select>
              </Field>
              <Field label={text("targetStars", "目標星數")} optional={targetAcceptsStars ? null : ui.optional}>
                <input
                  type="number"
                  min={selectedTargetRank?.measurement === "stars" && Number.isFinite(selectedTargetRank.minStars) ? selectedTargetRank.minStars : 0}
                  max={selectedTargetRank?.measurement === "stars" && Number.isFinite(selectedTargetRank.maxStars) ? selectedTargetRank.maxStars : undefined}
                  inputMode="numeric"
                  disabled={!targetAcceptsStars}
                  required={targetAcceptsStars}
                  placeholder={targetAcceptsStars ? "0" : ui.notApplicable}
                  value={draft.targetStars ?? ""}
                  onChange={(event) => updateDraft("targetStars", event.target.value)}
                />
              </Field>
            </>
          ) : null}

          {isPeak ? (
            <>
              <Field label={ui.currentPoints}>
                <input type="number" min="0" inputMode="numeric" required value={draft.currentPoints ?? ""} onChange={(event) => updateDraft("currentPoints", event.target.value)} />
              </Field>
              <Field label={ui.targetPoints}>
                <input type="number" min="0" inputMode="numeric" required value={draft.targetPoints ?? ""} onChange={(event) => updateDraft("targetPoints", event.target.value)} />
              </Field>
            </>
          ) : null}

          {isHeroPower ? (
            <>
              <Field label={ui.currentPoints}>
                <input type="number" min="0" inputMode="numeric" required value={draft.currentPoints ?? ""} onChange={(event) => updateDraft("currentPoints", event.target.value)} />
              </Field>
              <Field label={text("currentHeroPowerPoints", ui.currentHeroPowerPoints)}>
                <input type="number" min="0" inputMode="numeric" required value={draft.currentHeroPowerPoints ?? ""} onChange={(event) => updateDraft("currentHeroPowerPoints", event.target.value)} />
              </Field>
              <Field label={text("targetHeroPowerPoints", ui.targetHeroPowerPoints)}>
                <input type="number" min="0" inputMode="numeric" required value={draft.targetHeroPowerPoints ?? ""} onChange={(event) => updateDraft("targetHeroPowerPoints", event.target.value)} />
              </Field>
              <Field label={text("heroPowerMark", "英雄戰力標")}>
                <Select
                  value={draft.heroPowerMarkId}
                  onChange={(event) => updateDraft("heroPowerMarkId", event.target.value || null)}
                  disabled={!draft.gameId}
                  required
                  placeholder={draft.gameId ? ui.select : text("game", "遊戲")}
                >
                  {heroPowerMarks.map((mark) => (
                    <option key={mark.id} value={mark.id}>{localizeGameValue(mark.labels, localeId)}</option>
                  ))}
                </Select>
              </Field>
            </>
          ) : null}

          {isDuoMatch ? (
            <Field label={text("quantity", "所需數量")}>
              <input type="number" min="1" inputMode="numeric" required value={draft.quantity ?? ""} onChange={(event) => updateDraft("quantity", event.target.value)} />
            </Field>
          ) : null}

          {showHeroAndRole ? (
            <>
              <Field label={text("preferredHero", "指定英雄")} optional={ui.optional}>
                <input type="text" value={draft.preferredHero} onChange={(event) => updateDraft("preferredHero", event.target.value)} />
              </Field>
              <Field label={text("preferredRole", ui.role)} optional={ui.optional}>
                <Select
                  value={draft.preferredRole}
                  onChange={(event) => updateDraft("preferredRole", event.target.value || "")}
                  disabled={!draft.gameId}
                  placeholder={draft.gameId ? ui.select : text("game", "遊戲")}
                >
                  {lanes.map((lane) => (
                    <option key={lane.id} value={lane.id}>{localizeGameValue(lane.labels, localeId)}</option>
                  ))}
                </Select>
              </Field>
            </>
          ) : null}

          {isHeroPower ? (
            <Field label={text("preferredHero", "指定英雄")}>
              <input type="text" required value={draft.preferredHero} onChange={(event) => updateDraft("preferredHero", event.target.value)} />
            </Field>
          ) : null}

          {isOther ? (
            <>
              <Field label={text("otherServiceType", ui.otherServiceType)}>
                <Select
                  value={draft.otherServiceType}
                  onChange={(event) => updateDraft("otherServiceType", event.target.value || null)}
                  required
                  placeholder={ui.select}
                >
                  {otherServiceTypes.map((item) => (
                    <option key={item.id} value={item.id}>{localizeGameValue(item.labels, localeId)}</option>
                  ))}
                </Select>
              </Field>
            </>
          ) : null}

          {(isDuo && draft.duoMode) || isTimedTeaching ? (
            <Field
              label={text("preferredStartTime", ui.preferredStartTime)}
              hint={draft.preferredStartTime
                ? formatAppointmentTime(draft.preferredStartTime, localeId)
                : ui.preferredStartHint}
            >
              <input
                type="datetime-local"
                required
                step="1800"
                value={draft.preferredStartTime}
                onChange={(event) => updateDraft("preferredStartTime", event.target.value)}
              />
            </Field>
          ) : null}

          {isDuoRanked ? (
            <Field label={text("duoGuarantee", "勝負方案")}>
              <Select
                value={draft.duoGuarantee}
                onChange={(event) => updateDraft("duoGuarantee", event.target.value || null)}
                required
                placeholder={ui.select}
              >
                {duoGuaranteeOptions.map((option) => (
                  <option key={option.id} value={option.id}>{localizeGameValue(option.labels, localeId)}</option>
                ))}
              </Select>
            </Field>
          ) : null}

          {draft.serviceId ? (
            <Field label={text("requirements", "其他要求")} optional={ui.optional} wide>
              <textarea
                rows="3"
                placeholder={localeId === "en" ? "Optional notes for Aurora support" : "如有其他要求，可在此留言（選填）"}
                value={draft.additionalRequirements}
                onChange={(event) => updateDraft("additionalRequirements", event.target.value)}
              />
            </Field>
          ) : null}
        </div>

        {draft.gameId && draft.serviceId ? (
          <p className={`quote-pricing-note${pricingReady ? " quote-pricing-note--ready" : ""}`}>
            <ShieldCheck size={16} />
            {pricingReady ? ui.pricingConfigured : ui.pricingManual}
          </p>
        ) : null}
        <label className="quote-data-consent" htmlFor="aurora-data-consent-manual">
          <input
            id="aurora-data-consent-manual"
            type="checkbox"
            checked={conversationConsent}
            onChange={(event) => setConversationConsent(event.target.checked)}
          />
          <span>{ui.dataConsent}</span>
        </label>
        {formError ? <p className="quote-error" role="alert">{formError}</p> : null}
        <div className="quote-form__actions">
          <button type="button" className="quote-button quote-button--text" onClick={resetForm}>{ui.reset}</button>
          <button type="submit" className="quote-button quote-button--primary">{ui.generate}<ArrowRight size={17} /></button>
        </div>
      </form>
    );
  };

  const renderResult = () => {
    const currency = quote?.currency ?? quote?.pricing?.currency ?? null;
    const statusLabel = quote?.status === "quoted"
      ? translateFromData(localeId, "quote.status.quoted")
      : ui.pending;
    const selectedDuoMode = duoModes.find((mode) => mode.id === draft.duoMode);
    const selectedDuoGuarantee = duoGuaranteeOptions.find((option) => option.id === draft.duoGuarantee);
    const selectedOtherType = otherServiceTypes.find((item) => item.id === draft.otherServiceType);
    const rows = [
      [text("game", "遊戲"), selectedGame ? gameName(selectedGame) : "—"],
      [text("service", "服務"), selectedService ? serviceName(selectedService) : "—"],
      ...(isDuo
        ? [[text("duoMode", ui.duoMode), selectedDuoMode ? localizeGameValue(selectedDuoMode.labels, localeId) : "—"]]
        : []),
      ...(isDuoRanked
        ? [[text("duoGuarantee", "勝負方案"), selectedDuoGuarantee ? localizeGameValue(selectedDuoGuarantee.labels, localeId) : "—"]]
        : []),
      ...(showCurrentRank
        ? [
            [text("currentRank", "目前段位"), selectedCurrentRank ? rankName(draft.gameId, selectedCurrentRank, localeId) : "—"],
            [text("currentDivision", "目前分級"), draft.currentDivision || ui.notApplicable],
            [text("currentStars", "目前星數"), draft.currentStars ?? "—"],
          ]
        : []),
      ...(showRankRange
        ? [
            [text("targetRank", "目標段位"), selectedTargetRank ? rankName(draft.gameId, selectedTargetRank, localeId) : "—"],
            [text("targetDivision", "目標分級"), draft.targetDivision || ui.notApplicable],
            [text("targetStars", "目標星數"), draft.targetStars ?? "—"],
          ]
        : []),
      ...(isPeak
        ? [[ui.currentPoints, draft.currentPoints ?? "—"], [ui.targetPoints, draft.targetPoints ?? "—"]]
        : []),
      ...(isHeroPower
        ? [
            [ui.currentPoints, draft.currentPoints ?? "—"],
            [ui.currentHeroPowerPoints, draft.currentHeroPowerPoints ?? "—"],
            [ui.targetHeroPowerPoints, draft.targetHeroPowerPoints ?? "—"],
            [text("heroPowerMark", "英雄戰力標"), getHeroPowerMarkLabel(draft.gameId, draft.heroPowerMarkId, localeId) || "—"],
          ]
        : []),
      ...(showHeroAndRole
        ? [
            [text("preferredHero", "指定英雄"), draft.preferredHero || "—"],
            [text("preferredRole", ui.role), getLaneLabel(draft.gameId, draft.preferredRole, localeId) || "—"],
          ]
        : []),
      ...(isHeroPower ? [[text("preferredHero", "指定英雄"), draft.preferredHero || "—"]] : []),
      ...(isDuoMatch ? [[text("quantity", "所需數量"), draft.quantity ?? "—"]] : []),
      ...(isOther
        ? [
            [text("otherServiceType", ui.otherServiceType), selectedOtherType ? localizeGameValue(selectedOtherType.labels, localeId) : "—"],
          ]
        : []),
      ...(String(draft.additionalRequirements || "").trim()
        ? [[text("requirements", "其他要求"), String(draft.additionalRequirements).trim()]]
        : []),
      [text("basePrice", "基本價格"), formatValue(quote?.basePrice, localeId, currency, ui.pending)],
      [text("optionalCharges", "附加費用"), formatValue(quote?.optionalCharges, localeId, currency, ui.pending)],
      [text("discount", "折扣"), formatValue(quote?.discount, localeId, currency, ui.pending)],
      [text("newCustomerDiscount", "新人優惠 85 折"), formatValue(quote?.newCustomerDiscount, localeId, currency, ui.pending)],
      ...(isDuo || isTimedTeaching
        ? [[text("preferredStartTime", ui.preferredStartTime), formatAppointmentTime(draft.preferredStartTime, localeId) || ui.pending]]
        : []),
      [
        quote?.amountType === "booking-deposit" ? text("bookingDeposit", "預約付款") : text("finalTotal", "最終總額"),
        formatValue(quote?.finalTotal, localeId, currency, ui.pending),
      ],
      [text("quoteStatus", "報價狀態"), statusLabel],
      [text("reference", "報價編號"), quote?.referenceNumber ?? quote?.reference ?? "—"],
    ];
    return (
      <div className="quote-result">
        <div className="quote-result__heading">
          <span>AURORA ESPORTS STUDIO</span>
          <h3>{ui.resultTitle}</h3>
        </div>
        {(quote?.requiresManualReview || quote?.status === "manual_review") ? (
          <p className="quote-pricing-note"><MessageCircle size={17} />{ui.pricingPending}</p>
        ) : null}
        <dl className="quote-result__rows">
          {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        <div className="quote-result__actions">
          <button type="button" className="quote-button quote-button--secondary" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? ui.copied : ui.copy}
          </button>
          <a className="quote-button quote-button--primary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => trackContactClick("whatsapp")}><Send size={16} />{ui.whatsapp}</a>
          <a
            className="quote-button quote-button--secondary"
            href={contactLinks.line || "https://line.me/ti/p/wWXCT-txMc"}
            target="_blank"
            rel="noreferrer"
            onClick={handleLineClick}
          >
            <MessageCircle size={16} />{ui.line}
          </a>
          <button type="button" className="quote-button quote-button--text" onClick={() => setQuote(null)}>{ui.edit}</button>
        </div>
        {lineCopyStatus ? (
          <p className={`quote-line-status quote-line-status--${lineCopyStatus}`} role="status">
            {lineCopyStatus === "copied" ? ui.lineCopied : ui.lineCopyFailed}
          </p>
        ) : null}
      </div>
    );
  };

  const renderAiPanel = () => (
    <>
      <div className="quote-panel__heading">
        <span className="quote-panel__icon"><MessageCircle size={21} /></span>
        <div><h3>{ui.aiTitle}</h3><p>{ui.aiIntro}</p></div>
      </div>
      <div className={`quote-ai-status quote-ai-status--${aiStatus}`} role="status">
        {aiStatus === "checking" ? <LoaderCircle size={15} className="quote-spin" /> : aiStatus === "online" ? <ShieldCheck size={15} /> : <MessageCircle size={15} />}
        <span>{aiStatus === "checking" ? ui.aiChecking : aiStatus === "online" ? ui.aiOnline : ui.aiUnavailable}</span>
      </div>
      {aiStatus === "unavailable" ? <p className="quote-ai-setup">{ui.aiSetup}</p> : null}

      <label className="quote-data-consent" htmlFor="aurora-data-consent-ai">
        <input
          id="aurora-data-consent-ai"
          type="checkbox"
          checked={conversationConsent}
          onChange={(event) => {
            setConversationConsent(event.target.checked);
            if (event.target.checked) setAiError("");
          }}
        />
        <span>{ui.dataConsent}</span>
      </label>

      <div className="quote-chat" ref={messageListRef} role="log" aria-live="polite" aria-label={ui.aiTitle}>
        <div className="quote-message quote-message--assistant">
          <span className="quote-message__avatar"><MessageCircle size={15} /></span>
          <p>{ui.aiWelcome}</p>
        </div>
        {aiMessages.map((message) => (
          <div className={`quote-message quote-message--${message.role}`} key={message.id}>
            <span className="quote-message__avatar">{message.role === "assistant" ? <MessageCircle size={15} /> : <UserRound size={15} />}</span>
            <p>{message.content}</p>
          </div>
        ))}
        {aiLoading ? (
          <div className="quote-message quote-message--assistant quote-message--loading">
            <span className="quote-message__avatar"><LoaderCircle size={15} className="quote-spin" /></span>
            <p>{ui.thinking}</p>
          </div>
        ) : null}
        {aiError ? <p className="quote-error" role="alert">{aiError}</p> : null}
      </div>

      <div className="quote-ai-composer">
        {suggestionsVisible && suggestions.length ? (
          <ul id="quote-ai-suggestions" className="quote-ai-suggestions" role="listbox" aria-label={ui.suggested}>
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id ?? `${index}-${suggestionName(suggestion, localeId)}`} role="none">
                <button
                  id={`quote-ai-suggestion-${index}`}
                  type="button"
                  role="option"
                  aria-selected={visibleActiveSuggestion === index}
                  className={visibleActiveSuggestion === index ? "active" : ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  <Search size={14} /><span>{suggestionName(suggestion, localeId)}</span><ArrowRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="sr-only" htmlFor="ai-quote-input">{ui.inputPlaceholder}</label>
        <textarea
          ref={aiInputRef}
          id="ai-quote-input"
          rows="2"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestionsVisible && suggestions.length > 0}
          aria-controls="quote-ai-suggestions"
          aria-activedescendant={visibleActiveSuggestion >= 0 ? `quote-ai-suggestion-${visibleActiveSuggestion}` : undefined}
          value={aiInput}
          disabled={aiLoading}
          placeholder={ui.inputPlaceholder}
          onChange={(event) => {
            setAiInput(event.target.value);
            setSuggestionsVisible(Boolean(event.target.value.trim()));
          }}
          onFocus={() => {
            if (suppressSuggestionsOnFocusRef.current) {
              suppressSuggestionsOnFocusRef.current = false;
              setSuggestionsVisible(false);
              return;
            }
            setSuggestionsVisible(Boolean(aiInput.trim()));
          }}
          onKeyDown={handleAiKeyDown}
        />
        <button
          type="button"
          className="quote-ai-send"
          disabled={aiStatus !== "online" || aiLoading || !aiInput.trim() || !conversationConsent}
          aria-label={ui.send}
          onClick={() => sendAiMessage(aiInput)}
        >
          {aiLoading ? <LoaderCircle size={18} className="quote-spin" /> : <Send size={18} />}
        </button>
      </div>
      <div className="quote-ai-footer">
        <p><ShieldCheck size={13} /><span>{ui.noPricePromise} {ui.privacyWarning}</span></p>
        <div>
          <button type="button" onClick={() => { setAiMessages([]); setAiError(""); setAiInput(""); setSessionId(createSessionId()); setConversationConsent(false); aiInputRef.current?.focus(); }}><RefreshCw size={14} />{ui.newChat}</button>
          <a href={contactLinks.whatsapp || "https://wa.me/85262243840"} target="_blank" rel="noreferrer"><ExternalLink size={14} />{ui.human}</a>
        </div>
      </div>
    </>
  );

  return (
    <div className={`quote-assistant ${className}`.trim()}>
      <div className="quote-entry-control" role="group" aria-label={ui.title}>
        <motion.button
          type="button"
          className="quote-entry-choice quote-entry-choice--manual"
          aria-haspopup="dialog"
          aria-expanded={open && mobilePane === "manual"}
          aria-controls="aurora-quote-dialog"
          onClick={() => openDialog("manual")}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        >
          <span className="quote-entry-choice__icon" aria-hidden="true"><UserRound size={18} /></span>
          <span className="quote-entry-copy"><strong>{ui.manualEntryLabel}</strong><small>{ui.manualEntryHint}</small></span>
          <ArrowRight className="quote-entry-choice__arrow" size={18} aria-hidden="true" />
        </motion.button>
        <motion.button
          type="button"
          className="quote-entry-choice quote-entry-choice--support"
          aria-haspopup="dialog"
          aria-expanded={open && mobilePane === "ai"}
          aria-controls="aurora-quote-dialog"
          onClick={() => openDialog("ai")}
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        >
          <span className="quote-entry-choice__icon" aria-hidden="true"><MessageCircle size={18} /></span>
          <span className="quote-entry-copy"><strong>{ui.supportEntryLabel}</strong><small>{ui.supportEntryHint}</small></span>
          <ArrowRight className="quote-entry-choice__arrow" size={18} aria-hidden="true" />
        </motion.button>
      </div>

      {portalTarget ? createPortal(
        <AnimatePresence>
          {open ? (
            <motion.div
              className="quote-dialog-backdrop"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}
            >
              <motion.section
                ref={dialogRef}
                id="aurora-quote-dialog"
                className={`quote-dialog quote-dialog--single quote-dialog--${mobilePane === "manual" ? "manual" : "support"}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="aurora-quote-title"
                tabIndex="-1"
                initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.99 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <header className="quote-dialog__header">
                  <div>
                    <span className="quote-kicker"><Sparkles size={14} /> AURORA PRIVATE DESK</span>
                    <h2 id="aurora-quote-title">{mobilePane === "manual" ? ui.manualTitle : ui.aiTitle}</h2>
                    <p>{mobilePane === "manual" ? ui.manualIntro : ui.aiIntro}</p>
                  </div>
                  <button type="button" className="quote-close" onClick={closeDialog} aria-label={ui.close}><X size={20} /></button>
                </header>

                <div className="quote-single-grid">
                  {mobilePane === "manual" ? (
                    <section className="quote-dual-panel quote-dual-panel--manual" aria-label={ui.manualTitle}>
                    <div className="quote-panel__heading">
                      <span className="quote-panel__icon"><UserRound size={21} /></span>
                      <div><h3>{ui.manualTitle}</h3><p>{ui.manualIntro}</p></div>
                    </div>
                    <div className="quote-panel__scroll">{quote ? renderResult() : renderManualForm()}</div>
                    </section>
                  ) : (
                    <section className="quote-dual-panel quote-dual-panel--ai" aria-label={ui.aiTitle}>
                      {renderAiPanel()}
                    </section>
                  )}
                </div>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        portalTarget,
      ) : null}
    </div>
  );
}

export default QuoteAssistant;
