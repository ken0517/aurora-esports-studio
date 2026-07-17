import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, MessageCircle, UserRound } from "lucide-react";
import { trackQuoteEntry } from "../lib/analytics.js";

const LazyQuoteAssistant = lazy(() => import("./QuoteAssistant.jsx"));

const entryCopy = {
  "zh-HK": {
    label: "選擇報價方式",
    manual: "手動填寫報價表",
    manualHint: "選擇遊戲、服務與目標",
    support: "問客服即時查價",
    supportHint: "由 Aurora 客服協助整理需求",
    loading: "正在開啟報價工具…",
  },
  en: {
    label: "Choose quote method",
    manual: "Complete quote form",
    manualHint: "Choose your game, service and goal",
    support: "Ask Aurora Support",
    supportHint: "Let Aurora help organise your request",
    loading: "Opening quote assistant…",
  },
  "zh-CN": {
    label: "选择报价方式",
    manual: "手动填写报价表",
    manualHint: "选择游戏、服务与目标",
    support: "向客服即时查价",
    supportHint: "由 Aurora 客服协助整理需求",
    loading: "正在打开报价工具…",
  },
};

export default function DeferredQuoteAssistant({ locale = "zh-HK", prefillRequest, ...props }) {
  const [initialPane, setInitialPane] = useState(null);
  const copy = entryCopy[locale] || entryCopy["zh-HK"];

  useEffect(() => {
    const preload = () => import("./QuoteAssistant.jsx");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(preload, { timeout: 4_000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(preload, 2_500);
    return () => window.clearTimeout(timer);
  }, []);

  const requestedPane = ["manual", "ai"].includes(prefillRequest?.pane)
    ? prefillRequest.pane
    : null;
  const effectivePane = initialPane || requestedPane || (prefillRequest?.text ? "ai" : null);

  const openManualQuote = () => {
    trackQuoteEntry({
      method: "manual",
      gameId: prefillRequest?.gameId,
      serviceId: prefillRequest?.serviceId,
    });
    setInitialPane("manual");
  };

  const openSupportQuote = () => {
    trackQuoteEntry({
      method: "ai",
      gameId: prefillRequest?.gameId,
      serviceId: prefillRequest?.serviceId,
    });
    setInitialPane("ai");
  };

  if (effectivePane) {
    return (
      <Suspense fallback={<div className="quote-deferred-loading" role="status"><LoaderCircle aria-hidden="true" />{copy.loading}</div>}>
        <LazyQuoteAssistant {...props} locale={locale} prefillRequest={prefillRequest} initialPane={effectivePane} />
      </Suspense>
    );
  }

  return (
    <div className="quote-entry-control quote-entry-control--placeholder" role="group" aria-label={copy.label}>
      <button type="button" className="quote-entry-choice quote-entry-choice--manual" onClick={openManualQuote}>
        <span className="quote-entry-choice__icon" aria-hidden="true"><UserRound size={18} /></span>
        <span className="quote-entry-copy"><strong>{copy.manual}</strong><small>{copy.manualHint}</small></span>
        <ArrowRight className="quote-entry-choice__arrow" size={18} aria-hidden="true" />
      </button>
      <button type="button" className="quote-entry-choice quote-entry-choice--support" onClick={openSupportQuote}>
        <span className="quote-entry-choice__icon" aria-hidden="true"><MessageCircle size={18} /></span>
        <span className="quote-entry-copy"><strong>{copy.support}</strong><small>{copy.supportHint}</small></span>
        <ArrowRight className="quote-entry-choice__arrow" size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
