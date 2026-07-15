import { publicAsset } from "../lib/publicAsset.js";

export const brand = {
  name: "AURORA",
  fullName: "Aurora Esports Studio",
  descriptor: "HK · TW MOBILE ESPORTS STUDIO",
};

export const contactLinks = {
  instagram:
    "https://www.instagram.com/ken._0517?igsh=MXhuNTByOXU3ZjVtdA%3D%3D&utm_source=qr",
  whatsapp: "https://wa.me/85262243840",
  line: "https://line.me/ti/p/wWXCT-txMc",
  carousell: "https://carousell.app.link/BWYWpLY692b",
  discord: "https://discord.gg/ZW9mwQRQud",
};

export const announcements = [
  "香港及台灣玩家皆可查詢",
  "所有方案按需求私人報價",
  "24/7 客服協作時段",
];

export const games = [
  {
    id: "aov",
    eyebrow: "AOV · HK / TW",
    name: "傳說對決",
    englishName: "Arena of Valor",
    description: "排位、巔峰賽、陪打及專項訓練，一站式配對高端玩家。",
    image: publicAsset("assets/generated/game-aov-user.png"),
    tone: "lilac",
    accent: "#725cff",
  },
  {
    id: "hok-cn",
    eyebrow: "CN SERVER",
    name: "王者榮耀（國服）",
    englishName: "Honor of Kings · China",
    description: "熟悉國服節奏、分路及版本環境，按目標安排合適方案。",
    image: publicAsset("assets/generated/game-hok-cn-user.png"),
    tone: "sand",
    accent: "#b7782b",
  },
  {
    id: "hok-global",
    eyebrow: "GLOBAL SERVER",
    name: "Honor of Kings",
    englishName: "王者榮耀（國際服）",
    description: "面向國際服玩家的排位支援、雙排協作與個人化教學。",
    image: publicAsset("assets/generated/game-hok-global-user.png"),
    tone: "sky",
    accent: "#327ac9",
  },
];

export const stats = [
  { value: "80%+", label: "高端局參考勝率" },
  { value: "500+", label: "累積完成訂單" },
  { value: "5.0⭐", label: "Carousell 評分" },
  { value: "24/7", label: "客服協作時段" },
];

export const services = [
  {
    id: "rank",
    icon: "Crown",
    index: "01",
    title: "排位代打",
    summary: "高端玩家手動安排，按目前段位與目標制定進度。",
    description:
      "先確認目前段位、目標、時段及常用位置，再安排合適成員與清楚進度。服務內容會按遊戲、伺服器及現行規則確認。",
    points: ["按目標評估", "進度回報", "私人客服跟進"],
    games: ["aov", "hok-cn", "hok-global"],
    category: "進度服務",
  },
  {
    id: "peak",
    icon: "TrendingUp",
    index: "02",
    title: "巔峰賽代打",
    summary: "針對高分段節奏、版本英雄池及積分目標安排。",
    description:
      "由熟悉高端局節奏的成員評估分數區間、排隊環境及時段，按實際可行性制定方案。",
    points: ["高分段評估", "版本英雄池", "時段與進度確認"],
    games: ["aov", "hok-cn", "hok-global"],
    category: "進度服務",
  },
  {
    id: "duo",
    icon: "Users",
    index: "03",
    title: "陪玩帶飛",
    summary: "可選排位或 5V5 匹配，由你親自操作並由高端隊友協作。",
    description:
      "與高端玩家同行，按需要選擇排位或 5V5 匹配；可以自然溝通，也可以安靜享受遊戲。",
    points: ["排位／5V5 匹配", "即場協作", "不強制語音"],
    games: ["aov", "hok-cn", "hok-global"],
    category: "陪打服務",
  },
  {
    id: "hero-power",
    icon: "Target",
    index: "04",
    title: "英雄戰力標",
    summary: "按指定英雄、目前及目標戰力與目標標整理專屬需求。",
    description:
      "不同遊戲使用各自的英雄戰力標選項，未配置正式價格時交由客服人工確認。",
    points: ["指定英雄", "目前／目標戰力", "該遊戲目標標"],
    games: ["aov", "hok-cn", "hok-global"],
    category: "戰力服務",
  },
  {
    id: "other",
    icon: "GraduationCap",
    index: "05",
    title: "其他服務",
    summary: "復盤教學、Discord 錄屏及英雄教學集中在同一項查詢。",
    description:
      "選擇你需要的訓練方式，再把錄影、英雄、時段或希望改善的重點告訴 Aurora 客服。",
    points: ["復盤教學", "Discord 錄屏", "英雄教學"],
    games: ["aov", "hok-cn", "hok-global"],
    category: "其他服務",
  },
];

export const editorialCards = [
  {
    label: "CLIMB WITH A PLAN",
    title: "上分不是碰運氣，\n先把目標說清楚。",
    description: "告訴我們遊戲、伺服器、目前段位與目標，客服會先評估再提供私人方案。",
    cta: "開始查詢",
    href: contactLinks.whatsapp,
    theme: "blue",
  },
  {
    label: "PLAY · REVIEW · GROW",
    title: "陪打、復盤、教學，\n找出真正卡住你的地方。",
    description: "你親自參與每一局，從高端隊友的節奏與回饋中建立更穩定的實力。",
    cta: "查看訓練服務",
    href: "#services",
    theme: "nude",
  },
];

export const process = [
  {
    number: "01",
    title: "私訊諮詢",
    body: "告訴我們遊戲、伺服器、目前段位、目標及理想時段。",
  },
  {
    number: "02",
    title: "確認報價",
    body: "客服先評估可行性，再確認服務內容、私人報價與排程。",
  },
  {
    number: "03",
    title: "安排服務",
    body: "根據遊戲、位置與需求配對合適的高端成員。",
  },
  {
    number: "04",
    title: "完成跟進",
    body: "按約定提供進度或訓練重點，並完成後續客服協作。",
  },
];

export const testimonials = [
  {
    quote: "安排速度很穩，開始前會先把目標和時間講清楚。",
    name: "Jason Wong",
    meta: "排位服務",
  },
  {
    quote: "復盤講得很細，我才發現自己最大的問題其實是地圖觀念。",
    name: "阿傑",
    meta: "香港 · 其他服務／復盤教學",
  },
  {
    quote: "陪打過程不會尷尬，溝通自然，而且節奏提示很有用。",
    name: "Kelvin",
    meta: "陪打服務",
  },
  {
    quote: "客服回覆直接，方案和進度都交代得很清楚。",
    name: "Ryan Chan",
    meta: "私人方案",
  },
];

export const faqs = [
  {
    question: "目前支援哪些遊戲？",
    answer:
      "現時支援《傳說對決》、《王者榮耀》國服，以及 Honor of Kings《王者榮耀》國際服。查詢時請同時告訴我們伺服器與地區。",
  },
  {
    question: "如何下單？",
    answer:
      "你可以透過 WhatsApp、Instagram、Discord、LINE 或 Carousell 私訊，提供遊戲、段位、目標和時段；Aurora 客服會先確認細節，再回覆私人報價。",
  },
  {
    question: "價格為甚麼會按訂單調整？",
    answer:
      "網站會顯示 Aurora 已發布的公開價格或起價；不同遊戲、伺服器、段位、目標、加急要求和時段仍可能影響最終報價。未啟用自動報價的項目會由客服人工確認。",
  },
  {
    question: "香港和台灣玩家分別如何聯絡？",
    answer:
      "香港玩家建議使用 WhatsApp 或 Instagram；台灣玩家可使用 LINE、Instagram 或 Discord。其他渠道同樣可以查詢。",
  },
  {
    question: "是否提供售後或補單？",
    answer:
      "售後範圍會在開始前按方案說明。若時間或安排出現變動，客服會在原本的私人對話內跟進。",
  },
  {
    question: "服務是否有風險？",
    answer:
      "任何網上遊戲服務都不應被描述為零風險。所有安排會先說明流程與限制，並以遵守遊戲現行規則、由玩家本人參與的陪打及訓練方案為優先。",
  },
  {
    question: "可以查詢陪打或教學服務嗎？",
    answer:
      "可以。陪玩帶飛可選排位或 5V5 匹配；復盤教學、Discord 錄屏及英雄教學可在「其他服務」內查詢。",
  },
];

export const contactChannels = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    note: "香港主要查詢",
    href: contactLinks.whatsapp,
    icon: "MessageCircle",
  },
  {
    id: "instagram",
    label: "Instagram",
    note: "主要社群帳號",
    href: contactLinks.instagram,
    icon: "Instagram",
  },
  {
    id: "discord",
    label: "Discord",
    note: "錄屏與教學",
    href: contactLinks.discord,
    icon: "Gamepad2",
  },
  {
    id: "line",
    label: "LINE",
    note: "台灣玩家查詢",
    href: contactLinks.line,
    icon: "Send",
  },
  {
    id: "carousell",
    label: "Carousell",
    note: "平台查詢",
    href: contactLinks.carousell,
    icon: "ShoppingBag",
  },
];
