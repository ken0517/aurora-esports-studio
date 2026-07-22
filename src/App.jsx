import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import DeferredQuoteAssistant from "./components/DeferredQuoteAssistant";
import ServicesEditorial from "./components/ServicesEditorial";
import { getEditorialServicesForGame, getServiceEditorialText } from "./data/serviceCatalog";
import {
  brand,
  contactChannels,
  contactLinks,
  faqs,
  games,
  process,
  stats,
  testimonials,
} from "./data/content";
import { supportedLocales, translate } from "./data/translations";
import { useRuntimeCatalog } from "./hooks/useRuntimeCatalog";
import {
  trackContactClick,
  trackQuoteEntry,
  trackServiceQuote,
} from "./lib/analytics.js";
import { publicAsset } from "./lib/publicAsset.js";
import { buildGameLandingPath } from "./lib/publicRoutes.js";
import "./styles/index.css";

const localeFallbackLabels = {
  "zh-HK": "繁體中文",
  en: "English",
  "zh-CN": "简体中文",
};

const localeTranslationKeys = {
  "zh-HK": "locale.zh-Hant",
  en: "locale.en",
  "zh-CN": "locale.zh-Hans",
};

const brandIconPaths = {
  whatsapp: "brands/whatsapp.svg",
  instagram: "brands/instagram.svg",
  discord: "brands/discord.svg",
  line: "brands/line.svg",
  carousell: "brands/carousell.svg",
};

const menuItems = [
  { key: "nav.games", fallback: "遊戲", href: "#games" },
  { key: "nav.services", fallback: "服務", href: "#services" },
  { key: "nav.process", fallback: "流程", href: "#process" },
  { key: "nav.proof", fallback: "實績", href: "#proof" },
  { key: "nav.reviews", fallback: "評價", href: "#reviews" },
  { key: "nav.faq", fallback: "FAQ", href: "#faq" },
  { key: "nav.contact", fallback: "聯絡", href: "#contact" },
];

const proofItems = [
  {
    id: "game",
    fallbackTitle: "遊戲與伺服器",
    fallbackBody: "先確認 AOV、國服或國際服，才提供相符紀錄。",
  },
  {
    id: "rank",
    fallbackTitle: "段位與分數",
    fallbackBody: "只展示與查詢目標相關、可公開的近期資料。",
  },
  {
    id: "cycle",
    fallbackTitle: "服務與完成週期",
    fallbackBody: "按實際個案說明，不以示意數據代替結果。",
  },
  {
    id: "privacy",
    fallbackTitle: "打碼與私隱",
    fallbackBody: "玩家帳號及所有可識別資料均會隱藏。",
  },
];

function ExternalAnchor({ children, analyticsChannel, onClick, ...props }) {
  const handleClick = (event) => {
    if (analyticsChannel) trackContactClick(analyticsChannel);
    onClick?.(event);
  };

  return (
    <a target="_blank" rel="noreferrer" onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

function OverlayMenu({ onClose, text }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="editorial-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={text("nav.menu", "選單")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="editorial-menu__topline">
        <span>{brand.fullName}</span>
        <button
          ref={closeRef}
          type="button"
          className="editorial-menu__close"
          onClick={onClose}
          aria-label={text("nav.closeMenu", "關閉選單")}
        >
          <span>{text("common.close", "關閉")}</span>
          <X aria-hidden="true" />
        </button>
      </div>

      <nav className="editorial-menu__nav" aria-label={text("nav.menu", "選單")}>
        {menuItems.map((item, index) => (
          <a key={item.href} href={item.href} onClick={onClose}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{text(item.key, item.fallback)}</strong>
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </nav>

      <div className="editorial-menu__footer">
        <span>{text("hero.sideNote", "HK · TW · MO · MOBILE ESPORTS")}</span>
        <ExternalAnchor href={contactLinks.whatsapp} analyticsChannel="whatsapp">
          {text("contact.whatsapp", "WhatsApp 查詢")}
          <ExternalLink aria-hidden="true" />
        </ExternalAnchor>
      </div>
    </motion.div>
  );
}

function HeroHeader({ locale, setLocale, menuOpen, setMenuOpen, text }) {
  return (
    <header className="hero-header">
      <label className="locale-control">
        <span className="sr-only">{text("locale.label", "語言")}</span>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value)}
          aria-label={text("locale.label", "語言")}
        >
          {supportedLocales.map((item) => {
            const code = typeof item === "string" ? item : item.code || item.id;
            const fallback =
              (typeof item === "object" && item.label) || localeFallbackLabels[code] || code;
            return (
              <option key={code} value={code}>
                {text(localeTranslationKeys[code] || `locale.${code}`, fallback)}
              </option>
            );
          })}
        </select>
        <ChevronDown aria-hidden="true" />
      </label>

      <a className="hero-wordmark" href="#top" aria-label={brand.fullName}>
        <span className="hero-wordmark__monogram" aria-hidden="true">A</span>
        <span>{brand.fullName}</span>
        <span className="hero-wordmark__service-brand">{brand.serviceLabel}</span>
        <span className="hero-wordmark__offer">
          {text("hero.newcomerOffer", "新人優惠・全單自動享 85 折")}
        </span>
      </a>

      <button
        className="hero-menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-label={text("nav.openMenu", "開啟選單")}
        onClick={() => setMenuOpen(true)}
      >
        <span>{text("nav.menu", "Menu")}</span>
        <Menu aria-hidden="true" />
      </button>
    </header>
  );
}

function SectionIntro({ eyebrow, title, description, inverse = false }) {
  return (
    <div className={`editorial-heading${inverse ? " editorial-heading--inverse" : ""}`}>
      <span className="editorial-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const { catalog: runtimeCatalog } = useRuntimeCatalog();
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") return supportedLocales[0] || "zh-HK";
    try {
      const savedLocale = window.localStorage.getItem("aurora-locale");
      return supportedLocales.includes(savedLocale) ? savedLocale : supportedLocales[0] || "zh-HK";
    } catch {
      return supportedLocales[0] || "zh-HK";
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeGameId, setActiveGameId] = useState(games[0].id);
  const [openFaq, setOpenFaq] = useState(0);
  const [serviceQuoteRequest, setServiceQuoteRequest] = useState(null);
  const serviceQuoteRequestId = useRef(0);
  const quoteNavigationCleanupRef = useRef(null);

  const t = useCallback((key, params) => translate(locale, key, params), [locale]);
  const text = useCallback(
    (key, fallback, params) => {
      const translated = t(key, params);
      return translated && translated !== key ? translated : fallback;
    },
    [t],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem("aurora-locale", locale);
    } catch {
      // Language switching still works when storage is unavailable.
    }
  }, [locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quoteGame = params.get("quoteGame");
    const quotePane = params.get("quotePane") === "ai" ? "ai" : "manual";
    const quoteService = params.get("quoteService");
    const game = games.find((item) => item.id === quoteGame);
    if (!game) return;

    const service = getEditorialServicesForGame(game.id).find((item) => item.id === quoteService);
    const gameName = getServiceEditorialText(game.name, locale);
    const serviceName = service ? getServiceEditorialText(service.title, locale) : "";
    const question = serviceName
      ? `我想查詢${gameName}－${serviceName}的報價`
      : `我想查詢${gameName}的服務報價`;

    params.delete("quoteGame");
    params.delete("quotePane");
    params.delete("quoteService");
    const remainingSearch = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ""}${window.location.hash}`,
    );

    const frame = window.requestAnimationFrame(() => {
      trackQuoteEntry({ method: quotePane, gameId: game.id, serviceId: service?.id });
      setActiveGameId(game.id);
      serviceQuoteRequestId.current += 1;
      setServiceQuoteRequest({
        id: serviceQuoteRequestId.current,
        pane: quotePane,
        gameId: game.id,
        serviceId: service?.id ?? null,
        text: quotePane === "ai" ? question : "",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [locale]);

  useEffect(
    () => () => {
      quoteNavigationCleanupRef.current?.();
    },
    [],
  );

  const handleServiceQuote = useCallback(
    ({ service, game, locale: requestLocale = locale }) => {
      trackServiceQuote({ gameId: game?.id, serviceId: service?.id });
      const gameName = getServiceEditorialText(game?.name, requestLocale);
      const serviceName = getServiceEditorialText(service?.title, requestLocale);
      const question =
        requestLocale === "en"
          ? `I'd like a quote for ${gameName} — ${serviceName}.`
          : requestLocale === "zh-CN"
            ? `我想查询${gameName}－${serviceName}的报价`
            : `我想查詢${gameName}－${serviceName}的報價`;

      const createPrefillRequest = () => {
        serviceQuoteRequestId.current += 1;
        setServiceQuoteRequest({
          id: serviceQuoteRequestId.current,
          text: question,
        });
      };

      quoteNavigationCleanupRef.current?.();
      const quoteRegion = document.getElementById("ai-quote");
      if (!quoteRegion) {
        createPrefillRequest();
        return;
      }

      if (reduceMotion) {
        quoteRegion.scrollIntoView({ behavior: "auto", block: "center" });
        window.requestAnimationFrame(createPrefillRequest);
        return;
      }

      let completed = false;
      let fallbackTimer;
      const finishNavigation = () => {
        if (completed) return;
        completed = true;
        window.removeEventListener("scrollend", finishNavigation);
        window.clearTimeout(fallbackTimer);
        quoteNavigationCleanupRef.current = null;
        createPrefillRequest();
      };
      const cleanupNavigation = () => {
        completed = true;
        window.removeEventListener("scrollend", finishNavigation);
        window.clearTimeout(fallbackTimer);
        quoteNavigationCleanupRef.current = null;
      };

      quoteNavigationCleanupRef.current = cleanupNavigation;
      window.addEventListener("scrollend", finishNavigation, { once: true });
      quoteRegion.scrollIntoView({ behavior: "smooth", block: "center" });
      fallbackTimer = window.setTimeout(finishNavigation, 1400);
    },
    [locale, reduceMotion],
  );

  return (
    <div className="aurora-editorial">
      <a className="skip-link" href="#main-content">
        {text("a11y.skip", "跳到主要內容")}
      </a>

      {runtimeCatalog.announcement ? (
        <aside className="site-announcement" role="status">
          <span>{runtimeCatalog.announcement}</span>
        </aside>
      ) : null}

      <main id="main-content">
        <section className="cinematic-hero" id="top" aria-labelledby="hero-title">
          <div className="cinematic-hero__art" aria-hidden="true">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={publicAsset("assets/generated/hero-mobile.webp")}
              />
              <motion.img
                className="cinematic-hero__image cinematic-hero__image--responsive"
                src={publicAsset("assets/generated/hero-desktop.webp")}
                alt=""
                width="1672"
                height="941"
                fetchPriority="high"
                initial={false}
                animate={reduceMotion ? undefined : { scale: [1, 1.025, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              />
            </picture>
          </div>
          <div className="cinematic-hero__veil" aria-hidden="true" />

          <HeroHeader
            locale={locale}
            setLocale={setLocale}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            text={text}
          />

          <motion.div
            className="cinematic-hero__copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{text("hero.eyebrow", "AURORA · HONG KONG / TAIWAN")}</span>
            <h1 id="hero-title">{text("hero.title", "傳說對決 × 王者榮耀")}</h1>
            <p>
              {text(
                "hero.description",
                "專注三個手機 MOBA 戰場，以清楚方案、私人溝通與專人跟進，陪你走向下一個目標。",
              )}
            </p>
          </motion.div>

          <nav className="cinematic-hero__socials" aria-label={text("contact.socialLinks", "社交平台")}> 
            {contactChannels.map((channel) => (
              <ExternalAnchor
                key={channel.id}
                href={channel.href}
                analyticsChannel={channel.id}
                className="cinematic-hero__social-link"
                aria-label={text(`contact.channels.${channel.id}.label`, channel.label)}
                title={text(`contact.channels.${channel.id}.label`, channel.label)}
              >
                <img
                  className="brandIcon"
                  src={publicAsset(brandIconPaths[channel.id])}
                  alt=""
                  width="18"
                  height="18"
                />
                <span>{text(`contact.channels.${channel.id}.label`, channel.label)}</span>
              </ExternalAnchor>
            ))}
          </nav>

          <div className="cinematic-hero__quote" id="ai-quote">
            <DeferredQuoteAssistant
              className="hero-quote-assistant"
              locale={locale}
              t={t}
              contactLinks={contactLinks}
              prefillRequest={serviceQuoteRequest}
              pricingCatalog={runtimeCatalog}
            />
          </div>

          <a className="cinematic-hero__scroll" href="#studio-stats">
            <span>{text("hero.scroll", "Explore")}</span>
            <ArrowDown aria-hidden="true" />
          </a>
        </section>

        <section className="studio-stats" id="studio-stats" aria-label={text("stats.eyebrow", "工作室資料")}>
          <div className="editorial-shell studio-stats__inner">
            <span className="editorial-kicker">{text("stats.eyebrow", "AT A GLANCE")}</span>
            <div className="studio-stats__grid">
              {stats.map((stat, index) => (
                <div key={stat.label} className="studio-stat">
                  <strong className="studio-stat__value">
                    {text(`stats.items.${index}.value`, stat.value)}
                  </strong>
                  <span className="studio-stat__label">
                    {text(`stats.items.${index}.label`, stat.label)}
                  </span>
                </div>
              ))}
            </div>
            <p className="studio-stats__note">
              {text(
                "stats.disclaimer",
                "累積營運資料；實際結果會按遊戲、段位、時段及個別安排而異。",
              )}
            </p>
          </div>
        </section>

        <section className="games-editorial" id="games">
          <div className="editorial-shell">
            <Reveal>
              <SectionIntro
                eyebrow={text("games.eyebrow", "CHOOSE YOUR ARENA")}
                title={text("games.title", "三個戰場，一套克制而清楚的專業流程。")}
                description={text(
                  "games.description",
                  "選擇遊戲後，我們會按伺服器環境、段位與目標安排合適服務。",
                )}
              />
            </Reveal>

            <div className="game-stories">
              {games.map((game, index) => (
                <Reveal
                  key={game.id}
                  as="article"
                  className={`game-story${index % 2 ? " game-story--reverse" : ""}`}
                >
                  <div className="game-story__media">
                    <img
                      className="game-story__image game-story__image--evidence"
                      src={game.image}
                      alt={text(`games.${game.id}.imageAlt`, text(`games.${game.id}.name`, game.name))}
                      width="1200"
                      height="1800"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="game-story__copy">
                    <span className="game-story__number">0{index + 1}</span>
                    <span className="editorial-kicker">
                      {text(`games.${game.id}.eyebrow`, game.eyebrow)}
                    </span>
                    <h3>{text(`games.${game.id}.name`, game.name)}</h3>
                    <small>{text(`games.${game.id}.englishName`, game.englishName)}</small>
                    <p>{text(`games.${game.id}.description`, game.description)}</p>
                    <a className="editorial-text-link" href={buildGameLandingPath(game.id)}>
                      {text("games.viewServices", "查看服務")}
                      <ArrowRight aria-hidden="true" />
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ServicesEditorial
          locale={locale}
          activeGameId={activeGameId}
          onGameChange={setActiveGameId}
          onServiceSelect={handleServiceQuote}
          pricingCatalog={runtimeCatalog}
        />

        <section className="process-editorial" id="process">
          <div className="editorial-shell">
            <Reveal>
              <SectionIntro
                eyebrow={text("process.eyebrow", "HOW IT WORKS")}
                title={text("process.title", "由查詢到完成，每一步都清楚。")}
                description={text(
                  "process.description",
                  "先了解需求，再確認報價與安排；沒有模糊流程，也不會要求你猜測適合哪一項服務。",
                )}
              />
            </Reveal>
            <div className="process-sequence">
              {process.map((step, index) => (
                <Reveal key={step.number} as="article" className="process-step" delay={index * 0.04}>
                  <span>{step.number}</span>
                  <h3>{text(`process.steps.${index}.title`, step.title)}</h3>
                  <p>{text(`process.steps.${index}.body`, step.body)}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-editorial" id="proof">
          <div className="editorial-shell proof-editorial__layout">
            <Reveal className="proof-editorial__copy">
              <SectionIntro
                inverse
                eyebrow={text("proof.eyebrow", "PRIVATE RESULT REVIEW")}
                title={text("proof.title", "看得清楚，也保護每一位玩家。")}
                description={text(
                  "proof.description",
                  "我們不以示意圖片假裝真實戰績。你可以按遊戲、伺服器及目標，私訊索取已打碼的近期紀錄。",
                )}
              />
              <ExternalAnchor className="editorial-button editorial-button--light" href={contactLinks.whatsapp} analyticsChannel="whatsapp">
                {text("proof.request", "索取近期紀錄")}
                <ArrowRight aria-hidden="true" />
              </ExternalAnchor>
            </Reveal>

            <div className="proof-principles">
              {proofItems.map((item, index) => (
                <Reveal key={item.id} as="article" className="proof-principle" delay={index * 0.05}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{text(`proof.labels.${item.id}`, item.fallbackTitle)}</h3>
                    <p>{text(`proof.descriptions.${item.id}`, item.fallbackBody)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="reviews-editorial" id="reviews">
          <div className="editorial-shell">
            <Reveal>
              <SectionIntro
                eyebrow={text("reviews.eyebrow", "PLAYER NOTES")}
                title={text("reviews.title", "玩家留下的文字，簡單而直接。")}
                description={text(
                  "reviews.description",
                  "保留既有回饋內容，以文字呈現，不使用示意聊天截圖。",
                )}
              />
            </Reveal>
            <div className="review-ledger">
              {testimonials.map((item, index) => (
                <Reveal key={`${item.name}-${index}`} as="article" className="review-entry">
                  <span className="review-entry__number">0{index + 1}</span>
                  <blockquote>
                    “{text(`testimonials.${index}.quote`, item.quote)}”
                  </blockquote>
                  <footer>
                    <strong>{text(`testimonials.${index}.name`, item.name)}</strong>
                    <span>{text(`testimonials.${index}.meta`, item.meta)}</span>
                  </footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-editorial" id="faq">
          <div className="editorial-shell faq-editorial__layout">
            <Reveal>
              <SectionIntro
                eyebrow={text("faq.eyebrow", "FAQ")}
                title={text("faq.title", "開始前，先把重要的事說清楚。")}
                description={text(
                  "faq.description",
                  "價格、流程、聯絡方式與服務限制，都可以在確認前了解。",
                )}
              />
            </Reveal>

            <div className="faq-list-editorial">
              {faqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.question} className={`faq-row${isOpen ? " open" : ""}`}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    >
                      <span>0{index + 1}</span>
                      <strong>{text(`faqs.${index}.question`, item.question)}</strong>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    <div id={`faq-answer-${index}`} hidden={!isOpen}>
                      <p>{text(`faqs.${index}.answer`, item.answer)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="contact-editorial" id="contact">
          <div className="editorial-shell contact-editorial__layout">
            <Reveal className="contact-editorial__copy">
              <span className="editorial-kicker">{text("contact.eyebrow", "READY WHEN YOU ARE")}</span>
              <h2>{text("contact.title", "把遊戲、段位與目標告訴我們。")}</h2>
              <p>
                {text(
                  "contact.description",
                  "香港玩家建議使用 WhatsApp；台灣玩家可選 LINE。其他平台同樣可以查詢。",
                )}
              </p>
              <ExternalAnchor className="editorial-button editorial-button--dark" href={contactLinks.whatsapp} analyticsChannel="whatsapp">
                <MessageCircle aria-hidden="true" />
                {text("contact.whatsapp", "WhatsApp 立即查詢")}
              </ExternalAnchor>
            </Reveal>

            <div className="contact-links">
              {contactChannels.map((channel, index) => (
                <Reveal key={channel.id} delay={index * 0.035}>
                  <ExternalAnchor href={channel.href} className="contact-link-row" analyticsChannel={channel.id}>
                    <span>0{index + 1}</span>
                    <div>
                      <strong>{text(`contact.channels.${channel.id}.label`, channel.label)}</strong>
                      <small>{text(`contact.channels.${channel.id}.note`, channel.note)}</small>
                    </div>
                    <ExternalLink aria-hidden="true" />
                  </ExternalAnchor>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="editorial-footer">
        <div className="editorial-shell editorial-footer__top">
          <a className="footer-wordmark" href="#top">
            <span aria-hidden="true">A</span>
            <strong>{brand.fullName}</strong>
          </a>
          <p>{text("footer.description", "香港為主，台灣及澳門均可查詢的手機 MOBA 遊戲服務工作室。")}</p>
          <nav aria-label={text("footer.navigation", "頁尾導覽") }>
            {menuItems.slice(0, 4).map((item) => (
              <a key={item.href} href={item.href}>{text(item.key, item.fallback)}</a>
            ))}
            <a href="/klg-studio/">KLG Studio</a>
            <a href="/about-aurora/">關於 Aurora</a>
            <a href="/service-process-safety/">服務流程與安全</a>
          </nav>
        </div>
        <div className="editorial-shell editorial-footer__bottom">
          <span>© 2026 {brand.fullName}. {text("footer.rights", "All rights reserved.")}</span>
          <span>
            {text(
              "footer.disclaimer",
              "所有遊戲名稱及商標均屬其各自權利人所有；本站並非官方合作網站。",
            )}
          </span>
        </div>
      </footer>

      <AnimatePresence>
        {menuOpen ? <OverlayMenu onClose={() => setMenuOpen(false)} text={text} /> : null}
      </AnimatePresence>

    </div>
  );
}
