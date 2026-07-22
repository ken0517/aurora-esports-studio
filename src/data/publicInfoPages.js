import { publicBrandIdentity } from "./publicBrand.js";

const officialOrigin = publicBrandIdentity.officialOrigin;

export const publicInfoPages = Object.freeze([
  {
    slug: "klg-studio",
    canonical: `${officialOrigin}/klg-studio/`,
    seoTitle:
      "香港 KLG Studio 傳說對決代打與陪玩｜Aurora Esports Studio 官方網站",
    seoDescription:
      "KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌；官方網站提供香港及台灣傳說對決、王者榮耀國服及 HOK 國際服服務查詢。",
    eyebrow: "KLG STUDIO · OFFICIAL SERVICE BRAND",
    title: "KLG Studio 官方服務網站",
    intro: publicBrandIdentity.relationshipStatement,
    sections: [
      {
        id: "identity",
        title: "KLG Studio 與 Aurora 的關係",
        body: [
          "顧客可使用 KLG Studio 名稱查詢服務；Aurora Esports Studio 是本網站使用的關聯名稱。兩個名稱指向同一個官方網站及同一組官方聯絡方式。",
        ],
      },
      {
        id: "games",
        title: "三款手機 MOBA 遊戲服務",
        body: [
          "服務包括《傳說對決》、《王者榮耀》國服及 Honor of Kings《王者榮耀》國際服的排位、陪玩、巔峰賽、英雄戰力標與教學查詢。",
        ],
        points: ["傳說對決", "王者榮耀國服", "HOK／王者榮耀國際服"],
      },
      {
        id: "carousell",
        title: "Carousell 官方帳號",
        body: [
          "@klg_studio 與 @klg.studio 均由同一營運者擁有。顧客應以本頁列明的官方網站及聯絡方式核對資料。",
        ],
        points: publicBrandIdentity.carousellAccounts,
      },
      {
        id: "online-only",
        title: "線上服務，不設實體門市",
        body: [
          "KLG Studio 為香港及台灣玩家提供線上查詢及安排，不設供顧客到訪的實體門市。香港玩家可使用 WhatsApp，台灣玩家可使用 LINE。",
        ],
      },
    ],
    faqs: [
      {
        question: "KLG Studio 的官方網站是哪一個？",
        answer: "唯一官方網站是 https://auroraesportstudio.com/。",
      },
      {
        question: "KLG Studio 與 Aurora Esports Studio 是不同工作室嗎？",
        answer:
          "不是。KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，兩個名稱使用同一官方網站及聯絡方式。",
      },
      {
        question: "是否保證遊戲結果或帳號安全？",
        answer:
          "不會。遊戲結果及帳號風險受多項因素影響，所有服務內容及限制會在開始前由客服確認。",
      },
    ],
  },
  {
    slug: "about-aurora",
    canonical: `${officialOrigin}/about-aurora/`,
    seoTitle: "關於 Aurora Esports Studio｜香港及台灣線上遊戲服務",
    seoDescription:
      "認識 Aurora Esports Studio：服務香港及台灣玩家的線上遊戲服務工作室，提供傳說對決、王者榮耀國服及 HOK 國際服查詢。",
    eyebrow: "ABOUT AURORA",
    title: "關於 Aurora Esports Studio",
    intro:
      "Aurora Esports Studio 是服務香港及台灣玩家的線上遊戲服務工作室，不設實體門市。網站提供清楚的遊戲資料、報價流程與客服聯絡方式。",
    sections: [
      {
        id: "games",
        title: "專注三款手機 MOBA 遊戲",
        body: [
          "目前支援《傳說對決》、《王者榮耀》國服，以及 Honor of Kings《王者榮耀》國際服。每款遊戲使用獨立段位、分路、星數及英雄戰力標資料。",
        ],
        points: ["傳說對決", "王者榮耀國服", "HOK／王者榮耀國際服"],
      },
      {
        id: "services",
        title: "先整理需要，再確認安排",
        body: [
          "玩家可以使用手動報價表或 Aurora 客服整理排位、陪玩、巔峰賽、英雄戰力標及教學需求。已設定價格的項目會顯示暫估金額，其他項目由真人客服確認。",
        ],
      },
      {
        id: "contact",
        title: "香港與台灣均可使用",
        body: [
          "香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE。Instagram、Discord 及 Carousell 亦可用作公開聯絡與品牌資料核對。",
        ],
      },
    ],
    faqs: [
      {
        question: "Aurora 是否設有實體門市？",
        answer:
          "沒有。Aurora 是線上遊戲服務工作室，所有查詢及安排均透過網站與已列明的官方聯絡渠道進行。",
      },
      {
        question: "Aurora 是否屬於遊戲官方網站？",
        answer:
          "不是。所有遊戲名稱及商標均屬其各自權利人所有，Aurora 並非遊戲官方合作網站。",
      },
    ],
  },
  {
    slug: "service-process-safety",
    canonical: `${officialOrigin}/service-process-safety/`,
    seoTitle: "服務流程與安全說明｜Aurora Esports Studio",
    seoDescription:
      "了解 Aurora 的查詢、報價、確認、安排、改期、私隱與資料安全原則，以及需要真人客服確認的情況。",
    eyebrow: "PROCESS · PRIVACY · SAFETY",
    title: "服務流程與安全說明",
    intro:
      "由查詢到安排，每一步先把資料及限制說明清楚。網站不會要求顧客把密碼、驗證碼、付款資料或身份證明交給 AI 客服。",
    sections: [
      {
        id: "inquiry",
        title: "一、整理查詢資料",
        body: [
          "先選擇遊戲及服務，再填寫段位、目標、英雄、分路、數量或其他適用資料。非必填項目可以留空。",
        ],
      },
      {
        id: "quote",
        title: "二、確認報價狀態",
        body: [
          "正式金額只來自 Aurora 已確認的中央價格資料。無法自動計算的項目會顯示待人工確認，不會由 AI 自行創作金額。",
        ],
      },
      {
        id: "arrangement",
        title: "三、聯絡及安排",
        body: [
          "完成資料整理後，可使用 WhatsApp 或 LINE 與真人客服確認服務內容、時間及其他條件。",
        ],
      },
      {
        id: "privacy",
        title: "四、保護敏感資料",
        body: [
          "不要在 AI 對話、公開留言或未核實的聯絡渠道傳送帳號密碼、驗證碼、完整付款資料或身份證明。",
        ],
      },
      {
        id: "changes",
        title: "五、改期與特殊要求",
        body: [
          "改期、取消、急單及特殊要求以客服在私人對話內確認的內容為準。網站不會把未確認條款顯示成正式承諾。",
        ],
      },
    ],
    faqs: [
      {
        question: "網站顯示的金額是否為最終價格？",
        answer:
          "自動金額屬暫估報價，最終服務內容及價格以 WhatsApp 或 LINE 客服確認為準。",
      },
      {
        question: "AI 客服可以要求密碼或驗證碼嗎？",
        answer:
          "不可以。請勿在 AI 對話中傳送帳號密碼、驗證碼、付款資料或身份證明。",
      },
    ],
  },
]);

export function getPublicInfoPageBySlug(slug) {
  const clean = String(slug || "").replace(/^\/+|\/+$/g, "");
  return publicInfoPages.find((page) => page.slug === clean) ?? null;
}
