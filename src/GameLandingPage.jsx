import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import PrivacyFooterLinks from "./components/PrivacyFooterLinks.jsx";
import { contactLinks } from "./data/content.js";
import { getGameLandingPageById } from "./data/gameLandingPages.js";
import {
  getEditorialServicesForGame,
  getServiceEditorialText,
} from "./data/serviceCatalog.js";
import { trackContactClick, trackQuoteEntry, trackServiceQuote } from "./lib/analytics.js";
import { buildGameLandingPath, buildQuoteEntryUrl } from "./lib/publicRoutes.js";
import { publicAsset } from "./lib/publicAsset.js";
import "./styles/game-landing.css";

const processSteps = [
  ["01", "選擇服務", "確認遊戲、目前狀況與希望達成的目標。"],
  ["02", "整理報價", "系統採用 Aurora 已確認價格；特殊要求會交由客服確認。"],
  ["03", "確認安排", "透過 WhatsApp 或 LINE 確認資料、開始時間及服務安排。"],
  ["04", "跟進進度", "服務期間按已確認方式跟進，完成後整理所需資料。"],
];

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function GameLandingPage({ gameId }) {
  const page = getGameLandingPageById(gameId);
  const services = getEditorialServicesForGame(gameId);
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const [isLightboxClosing, setIsLightboxClosing] = useState(false);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle;
    updateMeta('meta[name="description"]', "content", page.seoDescription);
    updateMeta('link[rel="canonical"]', "href", page.canonical);
    updateMeta('meta[property="og:title"]', "content", page.seoTitle);
    updateMeta('meta[property="og:description"]', "content", page.seoDescription);
    updateMeta('meta[property="og:url"]', "content", page.canonical);
  }, [page]);

  const closeLightbox = useCallback(() => {
    if (!activeCaseStudy || closeTimerRef.current !== null) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setActiveCaseStudy(null);
      return;
    }

    setIsLightboxClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setActiveCaseStudy(null);
      setIsLightboxClosing(false);
    }, 190);
  }, [activeCaseStudy]);

  const openLightbox = (caseStudy, trigger) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    triggerRef.current = trigger;
    setIsLightboxClosing(false);
    setActiveCaseStudy(caseStudy);
  };

  useEffect(() => {
    if (!activeCaseStudy) {
      triggerRef.current?.focus();
      triggerRef.current = null;
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCaseStudy, closeLightbox]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  if (!page) return null;

  const relatedPages = page.relatedGameIds
    .map((relatedGameId) => getGameLandingPageById(relatedGameId))
    .filter((relatedPage) => relatedPage && relatedPage.gameId !== gameId);

  const handleQuoteClick = (method, serviceId) => {
    trackQuoteEntry({ method, gameId, serviceId });
    if (serviceId) trackServiceQuote({ gameId, serviceId });
  };

  return (
    <div className={`game-landing game-landing--${gameId}`}>
      <header className="game-landing__header">
        <a className="game-landing__brand" href="/" aria-label="返回 Aurora Esports Studio 首頁">
          <span aria-hidden="true">A</span>
          <strong>Aurora Esports Studio</strong>
        </a>
        <nav aria-label="頁面導覽">
          <a href="#services">服務</a>
          {page.caseStudies?.length ? <a href="#case-studies">實際紀錄</a> : null}
          <a href="#details">遊戲資料</a>
          <a href="#faq">常見問題</a>
          <a className="game-landing__header-cta" href={buildQuoteEntryUrl(gameId, "manual")} onClick={() => handleQuoteClick("manual")}>填寫報價</a>
        </nav>
      </header>

      <main>
        <section className="game-landing-hero" aria-labelledby="game-landing-title">
          <div className="game-landing-hero__media" aria-hidden="true">
            <img
              src={publicAsset(page.image)}
              alt=""
              width="1200"
              height="1800"
              fetchPriority="high"
            />
          </div>
          <div className="game-landing-hero__overlay" />
          <div className="game-landing-hero__copy">
            <a className="game-landing__back" href="/#games"><ArrowLeft size={16} />返回三款遊戲</a>
            <p className="game-landing__eyebrow">{page.eyebrow}</p>
            <h1 id="game-landing-title">{page.title}</h1>
            <p className="game-landing-hero__intro">{page.intro}</p>
            <div className="game-landing__actions">
              <a className="game-landing__button game-landing__button--light" href={buildQuoteEntryUrl(gameId, "manual")} onClick={() => handleQuoteClick("manual")}>
                填寫報價表 <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="game-landing__button game-landing__button--outline" href={buildQuoteEntryUrl(gameId, "ai")} onClick={() => handleQuoteClick("ai")}>
                問 Aurora 客服 <MessageCircle size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          <p className="game-landing-hero__audience">{page.audience}</p>
        </section>

        <section className="game-landing-section game-landing-services" id="services">
          <div className="game-landing-shell">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">AURORA SERVICES</p>
              <h2>按你的目標選擇服務。</h2>
              <p>所有服務共用 Aurora 現有報價及客服流程，已確認的項目會計算暫估金額，其餘項目會清楚標示待人工確認。</p>
            </div>
            <div className="game-landing-services__grid">
              {services.map((service, index) => (
                <article className="game-landing-service" key={service.id}>
                  <span>0{index + 1}</span>
                  <small>{getServiceEditorialText(service.category, "zh-HK")}</small>
                  <h3>{getServiceEditorialText(service.title, "zh-HK")}</h3>
                  <p>{getServiceEditorialText(service.description, "zh-HK")}</p>
                  <a href={buildQuoteEntryUrl(gameId, "manual", service.id)} onClick={() => handleQuoteClick("manual", service.id)}>
                    查詢報價 <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="game-landing-section game-landing-search-guide" aria-labelledby="search-guide-title">
          <div className="game-landing-shell game-landing-search-guide__layout">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">HONG KONG · TAIWAN</p>
              <h2 id="search-guide-title">{page.searchGuide.title}</h2>
            </div>
            <div className="game-landing-search-guide__copy">
              {page.searchGuide.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <a href={buildQuoteEntryUrl(gameId, "manual")} onClick={() => handleQuoteClick("manual")}>
                整理遊戲資料並查詢報價 <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="game-landing-section game-landing-details" id="details">
          <div className="game-landing-shell game-landing-details__layout">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">GAME DETAILS</p>
              <h2>只顯示這款遊戲適用的資料。</h2>
              <p>{page.rankSummary}</p>
              <div className="game-landing__notice"><ShieldCheck size={18} aria-hidden="true" />{page.priceNotice}</div>
            </div>
            <div className="game-landing-details__lists">
              <div>
                <small>指定位置／分路</small>
                <ul>{page.lanes.map((lane) => <li key={lane}>{lane}</li>)}</ul>
              </div>
              <div>
                <small>英雄戰力標</small>
                <ul>{page.marks.map((mark) => <li key={mark}>{mark}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        {page.caseStudies?.length ? (
          <section className="game-landing-section game-landing-cases" id="case-studies" aria-labelledby="case-studies-title">
            <div className="game-landing-shell">
              <div className="game-landing-section__heading">
                <p className="game-landing__eyebrow">REAL GAME RECORDS</p>
                <h2 id="case-studies-title">{page.caseStudySection.title}</h2>
                <p>{page.caseStudySection.description}</p>
              </div>
              <div className="game-landing-cases__grid">
                {page.caseStudies.map((caseStudy, index) => (
                  <figure className={`game-landing-case${index === 0 ? " game-landing-case--wide" : ""}`} key={caseStudy.image}>
                    <button
                      className="game-landing-case__media"
                      onClick={(event) => openLightbox(caseStudy, event.currentTarget)}
                      type="button"
                      aria-label={`放大查看：${caseStudy.alt}`}
                    >
                      <img
                        src={publicAsset(caseStudy.image)}
                        alt={caseStudy.alt}
                        width={caseStudy.width}
                        height={caseStudy.height}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                    <figcaption>
                      <span>0{index + 1}</span>
                      <div><h3>{caseStudy.title}</h3><p>{caseStudy.description}</p></div>
                    </figcaption>
                  </figure>
                ))}
              </div>
              <p className="game-landing-cases__disclaimer">
                實際遊戲紀錄只用於說明服務經驗；每次結果會因玩家狀況、段位及對局環境而異，並不代表固定勝率或結果保證。
              </p>
            </div>
          </section>
        ) : null}

        <section className="game-landing-section game-landing-process">
          <div className="game-landing-shell">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">HOW IT WORKS</p>
              <h2>由查詢到安排，每一步都清楚。</h2>
            </div>
            <div className="game-landing-process__grid">
              {processSteps.map(([number, title, body]) => (
                <article key={number}>
                  <span>{number}</span><h3>{title}</h3><p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="game-landing-section game-landing-faq" id="faq">
          <div className="game-landing-shell game-landing-faq__layout">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">FREQUENTLY ASKED</p>
              <h2>查詢前常見問題。</h2>
            </div>
            <div className="game-landing-faq__list">
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="game-landing-section game-landing-related" aria-labelledby="related-games-title">
          <div className="game-landing-shell">
            <div className="game-landing-section__heading">
              <p className="game-landing__eyebrow">EXPLORE AURORA</p>
              <h2 id="related-games-title">查看其他遊戲服務。</h2>
              <p>每款遊戲使用獨立段位、分路及戰力標設定，切換頁面後不會混用資料。</p>
            </div>
            <div className="game-landing-related__grid">
              {relatedPages.map((relatedPage) => (
                <a href={buildGameLandingPath(relatedPage.gameId)} key={relatedPage.gameId}>
                  <small>{relatedPage.eyebrow}</small>
                  <h3>{relatedPage.title}</h3>
                  <span>查看服務 <ArrowRight size={15} aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="game-landing-cta">
          <div className="game-landing-shell">
            <p className="game-landing__eyebrow">PRIVATE QUOTATION</p>
            <h2>告訴 Aurora 你的目標。</h2>
            <p>先整理遊戲、段位與服務資料，再選擇 WhatsApp 或 LINE 確認安排。</p>
            <div className="game-landing__actions">
              <a className="game-landing__button game-landing__button--dark" href={buildQuoteEntryUrl(gameId, "manual")} onClick={() => handleQuoteClick("manual")}>建立專屬報價 <ArrowRight size={17} /></a>
              <a className="game-landing__text-link" href={contactLinks.whatsapp} target="_blank" rel="noreferrer" onClick={() => trackContactClick("whatsapp")}>WhatsApp</a>
              <a className="game-landing__text-link" href={contactLinks.line} target="_blank" rel="noreferrer" onClick={() => trackContactClick("line")}>LINE</a>
            </div>
          </div>
        </section>
      </main>

      {activeCaseStudy ? (
        <div
          className={`game-landing-lightbox${isLightboxClosing ? " game-landing-lightbox--closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
        >
          <div
            className="game-landing-lightbox__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`查看${activeCaseStudy.title}`}
          >
            <button
              className="game-landing-lightbox__close"
              ref={closeButtonRef}
              type="button"
              aria-label="關閉圖片預覽"
              onClick={closeLightbox}
            >
              關閉
            </button>
            <img
              src={publicAsset(activeCaseStudy.image)}
              alt={activeCaseStudy.alt}
              width={activeCaseStudy.width}
              height={activeCaseStudy.height}
            />
          </div>
        </div>
      ) : null}

      <footer className="game-landing-footer">
        <a href="/">Aurora Esports Studio</a>
        <a href="/klg-studio/">KLG Studio</a>
        <a href="/about-aurora/">關於 Aurora</a>
        <a href="/service-process-safety/">服務流程與安全</a>
        <PrivacyFooterLinks />
        <span>香港、台灣及澳門手機 MOBA 遊戲服務</span>
      </footer>
    </div>
  );
}
