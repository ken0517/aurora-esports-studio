import { useEffect } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { contactLinks } from "./data/content.js";
import { getPublicInfoPageBySlug } from "./data/publicInfoPages.js";
import { trackContactClick } from "./lib/analytics.js";
import "./styles/public-info.css";

function updateMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function PublicInfoPage({ slug }) {
  const page = getPublicInfoPageBySlug(slug);

  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle;
    updateMeta('meta[name="description"]', "content", page.seoDescription);
    updateMeta('link[rel="canonical"]', "href", page.canonical);
    updateMeta('meta[property="og:title"]', "content", page.seoTitle);
    updateMeta('meta[property="og:description"]', "content", page.seoDescription);
    updateMeta('meta[property="og:url"]', "content", page.canonical);
  }, [page]);

  if (!page) return null;

  return (
    <div className="public-info">
      <header className="public-info__header">
        <a href="/" className="public-info__brand">
          <span aria-hidden="true">A</span>
          <strong>Aurora Esports Studio</strong>
        </a>
        <nav aria-label="公開資料頁導覽">
          <a href="/about-aurora/">關於 Aurora</a>
          <a href="/service-process-safety/">流程與安全</a>
          <a href="/#games">遊戲服務</a>
        </nav>
      </header>

      <main>
        <section className="public-info__hero">
          <div className="public-info__shell">
            <a href="/" className="public-info__back">
              <ArrowLeft size={16} />
              返回首頁
            </a>
            <p className="public-info__eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
          </div>
        </section>

        <section className="public-info__content">
          <div className="public-info__shell public-info__sections">
            {page.sections.map((section, index) => (
              <article id={section.id} key={section.id}>
                <span>0{index + 1}</span>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.points?.length ? (
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="public-info__faq" aria-labelledby="public-info-faq-title">
          <div className="public-info__shell public-info__faq-layout">
            <div>
              <p className="public-info__eyebrow">FREQUENTLY ASKED</p>
              <h2 id="public-info-faq-title">常見問題</h2>
            </div>
            <div>
              {page.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="public-info__cta">
          <div className="public-info__shell">
            <ShieldCheck aria-hidden="true" />
            <h2>先整理資料，再由 Aurora 客服確認。</h2>
            <p>香港玩家可使用 WhatsApp；台灣玩家可使用 LINE。</p>
            <div>
              <a href="/#ai-quote">
                填寫報價表 <ArrowRight size={16} />
              </a>
              <a
                href={contactLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackContactClick("whatsapp")}
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-info__footer">
        <a href="/">Aurora Esports Studio</a>
        <span>香港及台灣線上遊戲服務工作室</span>
      </footer>
    </div>
  );
}
