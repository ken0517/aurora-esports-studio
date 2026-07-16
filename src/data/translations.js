/**
 * Editable UI copy for Aurora Esports Studio.
 * Traditional Chinese (Hong Kong) is the default locale.
 */

export const defaultLocale = "zh-HK";
export const supportedLocales = ["zh-HK", "en", "zh-CN"];

const sharedStatsValues = ["80%+", "500+", "5.0⭐", "24/7"];

const zhHK = {
  a11y: { skip: "跳到主要內容" },
  common: {
    external: "在新視窗開啟",
    yes: "是",
    no: "否",
    optional: "選填",
    required: "必填",
    notAvailable: "待人工確認",
    select: "請選擇",
    back: "返回",
    next: "下一步",
    close: "關閉",
    edit: "修改",
  },
  locale: {
    label: "語言",
    "zh-Hant": "繁體中文",
    en: "English",
    "zh-Hans": "简体中文",
  },
  nav: {
    games: "遊戲專區",
    services: "服務項目",
    process: "流程",
    proof: "實績",
    reviews: "玩家回饋",
    faq: "常見問題",
    contact: "聯絡",
    menu: "選單",
    openMenu: "開啟選單",
    closeMenu: "關閉選單",
  },
  hero: {
    eyebrow: "HK · TW MOBILE ESPORTS STUDIO",
    title: "傳說對決 × 王者榮耀",
    titleAccent: "",
    description: "走進 Aurora 的專屬戰場，為香港及台灣玩家帶來更從容、更精準的遊戲服務體驗。",
    sideNote: "香港為主 · 台灣亦可查詢",
    serviceNote: "3 GAMES · 1 TEAM · PRIVATE SERVICE",
    scroll: "向下探索",
    quoteControl: "問 Aurora 客服即時查價",
    quoteControlShort: "Aurora 客服即時查價",
    quoteDisclaimer: "Aurora 客服會按已確認的中央資料協助整理報價需求。",
    newcomerOffer: "新人優惠・全單自動享 85 折",
    paymentMethods: "支援付款方式",
    paymentNote: "付款方式及資料由 Aurora 客服確認",
    payments: { alipay: "支付寶", wechatPay: "微信支付", fps: "轉數快 FPS" },
  },
  stats: {
    eyebrow: "AURORA AT A GLANCE",
    disclaimer: "工作室累積營運資料；實際結果會按遊戲、段位、時段及個別安排而異。",
    items: [
      { value: sharedStatsValues[0], label: "高端局參考勝率" },
      { value: sharedStatsValues[1], label: "累積完成訂單" },
      { value: sharedStatsValues[2], label: "Carousell 評分" },
      { value: sharedStatsValues[3], label: "客服協作時段" },
    ],
  },
  games: {
    eyebrow: "CHOOSE YOUR ARENA",
    title: "想玩哪個？我們已經準備就緒",
    description: "選擇你的遊戲與伺服器，再查看合適服務。",
    viewServices: "查看服務",
    aov: {
      name: "傳說對決",
      shortName: "傳說對決",
      englishName: "Arena of Valor",
      eyebrow: "AOV · HK / TW",
      imageAlt: "《傳說對決》遊戲主視覺",
      description: "排位、巔峰賽、陪打及專項訓練，一站式配對高端玩家。",
    },
    "hok-cn": {
      name: "王者榮耀（國服）",
      shortName: "王者國服",
      englishName: "Honor of Kings · China",
      eyebrow: "CN SERVER",
      imageAlt: "《王者榮耀》國服遊戲主視覺",
      description: "熟悉國服節奏、分路及版本環境，按目標安排合適方案。",
    },
    "hok-global": {
      name: "Honor of Kings",
      shortName: "HOK 國際服",
      englishName: "王者榮耀（國際服）",
      eyebrow: "GLOBAL SERVER",
      imageAlt: "Honor of Kings 國際服遊戲主視覺",
      description: "面向國際服玩家的排位支援、雙排協作與個人化教學。",
    },
  },
  services: {
    eyebrow: "OUR SERVICES",
    title: "按目標選擇，不用被固定套餐限制。",
    description: "所有方案按遊戲、段位、時段及實際需求確認。",
    gameFilter: "按遊戲篩選服務",
    details: "查看詳情",
    close: "關閉服務詳情",
    modalNote: "價格按遊戲、段位、目標與時段私人報價。",
    rank: {
      title: "排位代打",
      summary: "高端玩家手動安排，按目前段位與目標制定進度。",
      description: "先確認目前段位、目標、時段及常用位置，再安排合適成員與清楚進度。",
      category: "進度服務",
      points: ["按目標評估", "進度回報", "私人客服跟進"],
    },
    peak: {
      title: "巔峰賽代打",
      summary: "針對高分段節奏、版本英雄池及積分目標安排。",
      description: "由熟悉高端局節奏的成員評估分數區間、排隊環境及時段。",
      category: "進度服務",
      points: ["高分段評估", "版本英雄池", "時段與進度確認"],
    },
    duo: {
      title: "陪玩帶飛",
      summary: "可選排位或 5V5 匹配，由高端玩家與你同行。",
      description: "在玩家本人參與的前提下提供即時協作；可以自然溝通，也可以安靜享受遊戲。",
      category: "陪玩服務",
      points: ["排位／5V5 匹配", "即時協作", "不強制語音"],
    },
    "hero-power": {
      title: "英雄戰力標",
      summary: "按指定英雄、目前及目標戰力與目標標整理專屬需求。",
      description: "目標戰力標會按遊戲分開選擇，未配置正式價格時交由客服人工確認。",
      category: "戰力服務",
      points: ["指定英雄", "目前／目標戰力", "該遊戲目標標"],
    },
    other: {
      title: "其他服務",
      summary: "復盤教學、第一視角教學及英雄教學集中在同一項查詢。",
      description: "選擇需要的方式，再把錄影、英雄或改善重點告訴 Aurora 客服。",
      category: "其他服務",
      points: ["復盤教學", "第一視角教學", "英雄教學"],
    },
  },
  process: {
    eyebrow: "HOW IT WORKS",
    title: "四個步驟，把目標說清楚。",
    description: "先了解需要，再確認方案與排程。",
    steps: [
      { title: "私訊諮詢", body: "提供遊戲、伺服器、目前段位、目標及理想時段。" },
      { title: "確認報價", body: "客服評估可行性，再確認內容、報價與排程。" },
      { title: "安排服務", body: "根據遊戲、位置與需求配對合適成員。" },
      { title: "完成跟進", body: "按約定提供進度或訓練重點，完成後續協作。" },
    ],
  },
  proof: {
    eyebrow: "PRIVATE RESULT REVIEW",
    title: "實績要看得清楚，也要保護玩家私隱。",
    description: "近期打碼紀錄可按遊戲與目標私訊索取；示意素材不會當成真實戰績。",
    request: "索取近期紀錄",
    labels: { game: "遊戲與伺服器", rank: "段位與分數", cycle: "服務與完成週期", privacy: "打碼與私隱" },
    descriptions: {
      game: "先確認 AOV／國服／國際服",
      rank: "只展示與查詢目標相關的紀錄",
      cycle: "按實際個案說明，不以示意數據代替",
      privacy: "隱藏玩家帳號及可識別資料",
    },
  },
  reviews: {
    eyebrow: "PLAYER NOTES",
    title: "玩家留下的文字回饋。",
    description: "以乾淨文字呈現，不使用示意聊天截圖冒充真實紀錄。",
  },
  testimonials: [
    { quote: "安排速度很穩，開始前會先把目標和時間講清楚。", name: "Jason Wong", meta: "排位服務" },
    { quote: "復盤講得很細，我才發現自己最大的問題其實是地圖觀念。", name: "阿傑", meta: "香港 · 其他服務／復盤教學" },
    { quote: "陪打過程不會尷尬，溝通自然，而且節奏提示很有用。", name: "Kelvin", meta: "陪打服務" },
    { quote: "客服回覆直接，方案和進度都交代得很清楚。", name: "Ryan Chan", meta: "私人方案" },
  ],
  faq: {
    eyebrow: "FAQ",
    title: "開始前，你可能想先知道。",
    description: "價格、流程、聯絡方式與服務限制，都在開始前說清楚。",
  },
  faqs: [
    { question: "目前支援哪些遊戲？", answer: "現時支援《傳說對決》、《王者榮耀》國服，以及 Honor of Kings 國際服。" },
    { question: "如何下單？", answer: "可透過 WhatsApp、Instagram、Discord、LINE 或 Carousell 私訊，提供遊戲、段位、目標和時段。" },
    { question: "價格為甚麼會按訂單調整？", answer: "網站會顯示 Aurora 已發布的公開價格或起價；遊戲、伺服器、段位、目標、加急要求和時段仍可能影響最終報價。未啟用自動報價的項目會由客服人工確認。" },
    { question: "香港和台灣玩家如何聯絡？", answer: "香港玩家建議使用 WhatsApp 或 Instagram；台灣玩家可使用 LINE、Instagram 或 Discord。" },
    { question: "是否提供售後或補單？", answer: "售後範圍會在開始前按方案說明。若時間或安排出現變動，客服會在原本的私人對話內跟進。" },
    { question: "服務是否有風險？", answer: "任何網上遊戲服務都不應描述為零風險。所有安排先說明流程與限制，並優先提供由玩家本人參與的陪打及訓練方案。" },
    { question: "可以查詢陪玩或教學服務嗎？", answer: "可以。陪玩帶飛可選排位或 5V5 匹配；復盤教學、第一視角教學及英雄教學可在「其他服務」內查詢。" },
  ],
  contact: {
    eyebrow: "READY WHEN YOU ARE",
    title: "把遊戲、段位和目標傳給我們。",
    description: "香港玩家建議使用 WhatsApp；台灣玩家可選 LINE。其他渠道同樣可以查詢。",
    whatsapp: "WhatsApp 立即查詢",
    channels: {
      whatsapp: { label: "WhatsApp", note: "香港主要查詢" },
      instagram: { label: "Instagram", note: "主要社群帳號" },
      discord: { label: "Discord", note: "錄屏與教學" },
      line: { label: "LINE", note: "台灣玩家查詢" },
      carousell: { label: "Carousell", note: "平台查詢" },
    },
  },
  footer: {
    description: "香港為主、台灣亦可使用的手機 MOBA 遊戲服務工作室。",
    navigation: "頁尾導覽",
    disclaimer: "所有遊戲名稱及商標均屬其各自權利人所有；本站並非官方合作網站。",
    rights: "© 2026 Aurora Esports Studio. All rights reserved.",
  },
  quote: {
    title: "Aurora 客服即時報價",
    subtitle: "本地規則流程會逐步收集資料，並只使用 Aurora 已設定的價格規則。",
    localOnly: "Aurora 客服只會按中央遊戲配置及已確認的報價資料回覆。",
    inputLabel: "輸入你的問題",
    inputPlaceholder: "例如：鑽石升星耀需要多少錢？",
    suggestions: "搜尋建議",
    noSuggestions: "未找到相符建議，可直接送出問題。",
    listening: "請輸入你的需要",
    manualNotice: "此訂單需要人工確認，我們可以協助你轉接 WhatsApp 客服。",
    unconfiguredNotice: "Aurora 尚未設定此項目的正式價格，因此不會顯示估算或假設金額。",
    incompleteNotice: "請先補充以下資料。",
    reference: "報價編號",
    status: { incomplete: "資料未完整", manual_review: "待人工確認", quoted: "報價完成" },
    fields: {
      game: "遊戲",
      service: "服務",
      currentRank: "目前段位",
      currentDivision: "目前分級",
      currentStars: "目前星數",
      currentPoints: "目前分數",
      currentPeakPoints: "目前巔峰賽分數",
      currentHeroPowerPoints: "目前英雄戰力分數",
      targetHeroPowerPoints: "目標英雄戰力分數",
      targetRank: "目標段位",
      targetDivision: "目標分級",
      targetStars: "目標星數",
      targetPoints: "目標分數",
      quantity: "所需數量",
      completionTime: "理想完成時間",
      preferredStartTime: "理想開始時間",
      duoMode: "陪玩模式",
      duoGuarantee: "勝負方案",
      customSchedule: "指定時段要求",
      winRate70: "全程保持勝率 70% 以上",
      express: "加急服務",
      preferredHero: "指定英雄",
      preferredRole: "指定位置／分路",
      heroPowerMark: "英雄戰力標",
      otherServiceType: "其他服務類型",
      quoteStatus: "報價狀態",
      additionalRequirements: "其他要求",
    },
    prompts: {
      game: "你玩的是哪一款遊戲？",
      service: "你想查詢哪一項服務？",
      currentRank: "你目前是甚麼段位？",
      currentDivision: "目前是哪一個小分級？",
      currentStars: "目前有多少星？",
      currentPoints: "目前有多少分？",
      targetRank: "你想升到哪一個段位？",
      targetDivision: "目標是哪一個小分級？",
      targetStars: "目標是多少星？",
      targetPoints: "目標是多少分？",
      quantity: "需要多少星、場、局或小時？",
      completionTime: "你希望甚麼時候完成？",
      preferredStartTime: "你希望預約哪一日、幾點開始陪玩？",
      express: "需要加急嗎？",
      preferredHero: "有沒有指定英雄？",
      additionalRequirements: "還有其他要求嗎？",
    },
    table: {
      title: "Aurora 專業報價",
      service: "服務",
      currentRank: "目前段位",
      targetRank: "目標段位",
      currentStars: "目前星數",
      targetStars: "目標星數",
      quantity: "所需數量",
      basePrice: "基本價格",
      optionalCharges: "附加費用",
      discount: "折扣",
      newCustomerDiscount: "新人優惠 85 折",
      estimatedCompletionTime: "預計完成時間",
      preferredStartTime: "預約開始時間",
      bookingDeposit: "預約付款",
      finalTotal: "最終總額",
      reference: "報價編號",
    },
    actions: {
      start: "開始查價",
      submit: "送出",
      copy: "複製報價",
      copied: "已複製",
      whatsapp: "傳送到 WhatsApp",
      line: "傳送至 LINE",
      lineCopied: "報價已複製；加入好友後請貼上並傳送。",
      lineCopyFailed: "瀏覽器未能自動複製。請先按「複製報價」，再前往 LINE。",
      edit: "修改選擇",
      human: "聯絡人工客服",
      reset: "重新開始",
    },
    errors: {
      gameRequired: "請選擇遊戲。",
      serviceRequired: "請選擇服務。",
      invalidRank: "所選段位不適用於這款遊戲。",
      currentRankRequired: "請選擇目前段位。",
      targetRankRequired: "請選擇目標段位。",
      divisionRequired: "請選擇小分級。",
      invalidDivision: "所選小分級不適用於這個段位。",
      targetMustBeHigher: "目標段位必須高於目前段位。",
      numberRequired: "請輸入有效數字；星數可以是零。",
      positiveNumber: "請輸入大於零的數字。",
      invalidStarRange: "星數不符合所選段位的範圍。",
      heroRequired: "請輸入指定英雄。",
      roleRequired: "請選擇指定位置／分路。",
      invalidRole: "所選分路不適用於這款遊戲。",
      heroPowerMarkRequired: "請選擇英雄戰力標。",
      invalidHeroPowerMark: "所選英雄戰力標不適用於這款遊戲。",
      expressRequired: "請選擇是否需要加急。",
      requirementsRequired: "請說明套餐或特殊要求。",
      completionTimeRequired: "請選擇理想完成時間。",
      preferredStartTimeRequired: "請選擇理想開始時間。",
      duoGuaranteeRequired: "請選擇包贏或不包贏方案。",
      invalidDuoGuarantee: "勝負方案不正確。",
      minimumQuantity: "此項服務最少需要 2 局。",
      pricingUnavailable: "價格尚未設定，必須人工確認。",
    },
    whatsapp: {
      greeting: "你好，我想查詢 Aurora Esports Studio 報價。",
      closing: "請客服按以上資料人工確認，謝謝。",
    },
    reviewBillingNotice: "復盤教學按實際通話時間每分鐘 {{unitPrice}} 計算，最少 {{minimumMinutes}} 分鐘；此金額是預約付款，超時部分於結束後補款。",
  },
};

const en = {
  a11y: { skip: "Skip to main content" },
  common: { external: "Opens in a new window", yes: "Yes", no: "No", optional: "Optional", required: "Required", notAvailable: "Human confirmation required", select: "Select", back: "Back", next: "Next", close: "Close", edit: "Edit" },
  locale: { label: "Language", "zh-Hant": "繁體中文", en: "English", "zh-Hans": "简体中文" },
  nav: { games: "Games", services: "Services", process: "Process", proof: "Results", reviews: "Reviews", faq: "FAQ", contact: "Contact", menu: "Menu", openMenu: "Open menu", closeMenu: "Close menu" },
  hero: {
    eyebrow: "HK · TW MOBILE ESPORTS STUDIO",
    title: "Arena of Valor × Honor of Kings",
    titleAccent: "",
    description: "Step into Aurora's private arena—a more considered, precise service experience for players across Hong Kong and Taiwan.",
    sideNote: "Hong Kong first · Taiwan welcome",
    serviceNote: "3 GAMES · 1 TEAM · PRIVATE SERVICE",
    scroll: "Explore",
    quoteControl: "Ask Aurora Support for a Quote",
    quoteControlShort: "Aurora Support quote",
    quoteDisclaimer: "Aurora Support organises quote requests using approved central data.",
    newcomerOffer: "Newcomer offer · 15% off every order",
    paymentMethods: "Supported payment methods",
    paymentNote: "Payment details are confirmed by Aurora Support",
    payments: { alipay: "Alipay", wechatPay: "WeChat Pay", fps: "FPS" },
  },
  stats: {
    eyebrow: "AURORA AT A GLANCE",
    disclaimer: "Cumulative studio figures. Outcomes vary by game, rank, schedule and individual arrangement.",
    items: [
      { value: sharedStatsValues[0], label: "Reference high-rank win rate" },
      { value: sharedStatsValues[1], label: "Completed orders" },
      { value: sharedStatsValues[2], label: "Carousell rating" },
      { value: sharedStatsValues[3], label: "Support collaboration hours" },
    ],
  },
  games: {
    eyebrow: "CHOOSE YOUR ARENA", title: "What do you want to play? We’re ready.", description: "Choose a game and server, then explore the right service.", viewServices: "View services",
    aov: { name: "Arena of Valor", shortName: "AOV", englishName: "Arena of Valor", eyebrow: "AOV · HK / TW", imageAlt: "Arena of Valor editorial game visual", description: "Ranked support, peak play, duo play and focused coaching with high-rank players." },
    "hok-cn": { name: "Honor of Kings (China)", shortName: "HOK China", englishName: "Honor of Kings · China", eyebrow: "CN SERVER", imageAlt: "Honor of Kings China server editorial game visual", description: "Support tailored to the China server's pace, roles and current environment." },
    "hok-global": { name: "Honor of Kings", shortName: "HOK Global", englishName: "Honor of Kings · Global", eyebrow: "GLOBAL SERVER", imageAlt: "Honor of Kings Global editorial game visual", description: "Ranked support, duo collaboration and personal coaching for Global players." },
  },
  services: {
    eyebrow: "OUR SERVICES", title: "Choose by objective, not a rigid package.", description: "Every arrangement depends on the game, rank, schedule and actual requirements.", gameFilter: "Filter services by game", details: "View details", close: "Close service details", modalNote: "Pricing depends on game, rank, objective and schedule.",
    rank: { title: "Ranked progression", summary: "A manually arranged plan based on your current and target rank.", description: "We confirm your current rank, target, schedule and preferred role before assigning a suitable member.", category: "Progression", points: ["Goal assessment", "Progress updates", "Private support"] },
    peak: { title: "Peak ranked progression", summary: "For high-rank tempo, current hero pools and point targets.", description: "A high-rank member assesses the score range, queue environment and timing.", category: "Progression", points: ["High-rank assessment", "Current hero pool", "Schedule confirmation"] },
    duo: { title: "Duo queue", summary: "Choose Ranked or 5V5 Match and play alongside a high-rank member.", description: "The player remains involved with live coordination; voice communication is never compulsory.", category: "Play together", points: ["Ranked / 5V5 Match", "Live coordination", "No compulsory voice"] },
    "hero-power": { title: "Hero power mark", summary: "A tailored request based on your selected hero, current and target power, and target mark.", description: "Marks remain specific to each game. Unconfigured pricing goes to human confirmation.", category: "Hero power", points: ["Selected hero", "Current / target power", "Game-specific target mark"] },
    other: { title: "Other services", summary: "Review coaching, first-person coaching and hero coaching in one enquiry.", description: "Choose the format you need and tell Aurora Support about the recording, hero or improvement goal.", category: "Other services", points: ["Review coaching", "First-person coaching", "Hero coaching"] },
  },
  process: { eyebrow: "HOW IT WORKS", title: "Four steps to a clear plan.", description: "We understand the need before confirming the arrangement.", steps: [
    { title: "Send an enquiry", body: "Share the game, server, current rank, target and preferred timing." },
    { title: "Confirm the quote", body: "Support checks feasibility, scope, quote and schedule." },
    { title: "Arrange the service", body: "We match a suitable member to the game, role and requirements." },
    { title: "Complete and follow up", body: "Receive agreed updates or coaching notes and after-service support." },
  ] },
  proof: {
    eyebrow: "PRIVATE RESULT REVIEW", title: "Clear evidence with player privacy protected.", description: "Request recent redacted records by game and objective. Illustrations are never presented as real results.", request: "Request recent records",
    labels: { game: "Game and server", rank: "Rank and score", cycle: "Service and timeframe", privacy: "Redaction and privacy" },
    descriptions: { game: "Confirm AOV, China or Global", rank: "Only show records relevant to the request", cycle: "Use real cases, never illustrative figures", privacy: "Hide accounts and identifying details" },
  },
  reviews: { eyebrow: "PLAYER NOTES", title: "Written feedback from players.", description: "Presented as clean text without simulated chat screenshots." },
  testimonials: [
    { quote: "The arrangement was steady, and the goal and timing were clear before we started.", name: "Jason Wong", meta: "Ranked service" },
    { quote: "The review was detailed. I finally realised map awareness was my biggest issue.", name: "Ah Kit", meta: "Hong Kong · Other / Review coaching" },
    { quote: "The duo session felt natural, and the tempo cues were genuinely useful.", name: "Kelvin", meta: "Duo service" },
    { quote: "Support was direct and clear about both the plan and progress.", name: "Ryan Chan", meta: "Private plan" },
  ],
  faq: { eyebrow: "FAQ", title: "What you may want to know first.", description: "Pricing, process, contact methods and limitations are explained before work begins." },
  faqs: [
    { question: "Which games are supported?", answer: "Arena of Valor, Honor of Kings China and Honor of Kings Global." },
    { question: "How do I place an order?", answer: "Message us on WhatsApp, Instagram, Discord, LINE or Carousell with your game, rank, target and timing." },
    { question: "Why can the price vary by order?", answer: "The site shows Aurora's published price or starting price. Game, server, rank, target, express requests and timing can still affect the final quote; services without automatic pricing go to human review." },
    { question: "How should Hong Kong and Taiwan players contact Aurora?", answer: "WhatsApp or Instagram is recommended for Hong Kong; LINE, Instagram or Discord works well for Taiwan." },
    { question: "Is after-sales support or a make-up service available?", answer: "The applicable after-sales scope is explained before work begins. If timing or arrangements change, support follows up in the original private conversation." },
    { question: "Is the service risk-free?", answer: "No online game service should be described as zero-risk. We explain constraints first and prioritise player-participation duo play and coaching." },
    { question: "Can I request duo play or coaching?", answer: "Yes. Duo play supports Ranked or 5V5 Match; review coaching, first-person coaching and hero coaching are available under Other services." },
  ],
  contact: {
    eyebrow: "READY WHEN YOU ARE", title: "Send us your game, rank and objective.", description: "WhatsApp is recommended for Hong Kong; Taiwan players may use LINE. Other channels are also available.", whatsapp: "Enquire on WhatsApp",
    channels: {
      whatsapp: { label: "WhatsApp", note: "Main channel for Hong Kong" },
      instagram: { label: "Instagram", note: "Main social account" },
      discord: { label: "Discord", note: "Recording and coaching" },
      line: { label: "LINE", note: "Taiwan enquiries" },
      carousell: { label: "Carousell", note: "Marketplace enquiries" },
    },
  },
  footer: { description: "A mobile MOBA service studio serving Hong Kong first and Taiwan too.", navigation: "Footer navigation", disclaimer: "All game names and trademarks belong to their respective owners. This is not an official partner website.", rights: "© 2026 Aurora Esports Studio. All rights reserved." },
  quote: {
    title: "Aurora Support quote", subtitle: "The guided flow collects the details step by step and uses only Aurora-configured pricing rules.", localOnly: "Aurora Support only replies from the central game configuration and approved quotation data.", inputLabel: "Ask about a service", inputPlaceholder: "For example: How much is Diamond to Veteran?", suggestions: "Suggestions", noSuggestions: "No matching suggestion. You can still submit your question.", listening: "Tell us what you need", manualNotice: "This order needs human confirmation. We can connect you to WhatsApp support.", unconfiguredNotice: "Aurora has not configured an approved price for this request, so no estimate or assumed amount will be shown.", incompleteNotice: "Please complete the following details.", reference: "Quote reference", status: { incomplete: "Details incomplete", manual_review: "Human confirmation", quoted: "Quote ready" },
    fields: { game: "Game", service: "Service", currentRank: "Current rank", currentDivision: "Current division", currentStars: "Current stars", currentPoints: "Current points", currentPeakPoints: "Current Peak score", currentHeroPowerPoints: "Current hero-power score", targetHeroPowerPoints: "Target hero-power score", targetRank: "Target rank", targetDivision: "Target division", targetStars: "Target stars", targetPoints: "Target points", quantity: "Quantity required", completionTime: "Preferred completion time", preferredStartTime: "Preferred start time", duoMode: "Companion mode", duoGuarantee: "Win/loss option", customSchedule: "Specified time slot", winRate70: "Maintain 70%+ win rate", express: "Express service", preferredHero: "Preferred hero", preferredRole: "Preferred role / lane", heroPowerMark: "Hero power mark", otherServiceType: "Other service type", quoteStatus: "Quote status", additionalRequirements: "Additional requirements" },
    prompts: { game: "Which game do you play?", service: "Which service do you need?", currentRank: "What is your current rank?", currentDivision: "What is your current division?", currentStars: "How many stars do you have now?", currentPoints: "What is your current score?", targetRank: "What rank are you targeting?", targetDivision: "What target division do you need?", targetStars: "How many target stars?", targetPoints: "What is your target score?", quantity: "How many stars, matches, sessions or hours?", completionTime: "When would you like it completed?", preferredStartTime: "Which date and time would you like the companion session to start?", express: "Do you need express service?", preferredHero: "Do you have a preferred hero?", additionalRequirements: "Any other requirements?" },
    table: { title: "Aurora professional quote", service: "Service", currentRank: "Current rank", targetRank: "Target rank", currentStars: "Current stars", targetStars: "Target stars", quantity: "Quantity required", basePrice: "Base price", optionalCharges: "Optional charges", discount: "Discount", newCustomerDiscount: "New customer 15% discount", estimatedCompletionTime: "Estimated completion", preferredStartTime: "Appointment start time", bookingDeposit: "Booking payment", finalTotal: "Final total", reference: "Quote reference" },
    actions: { start: "Start quote", submit: "Submit", copy: "Copy quote", copied: "Copied", whatsapp: "Send to WhatsApp", line: "Send to LINE", lineCopied: "Quote copied. Add Aurora on LINE, then paste and send it.", lineCopyFailed: "Your browser could not copy automatically. Copy the quote first, then open LINE.", edit: "Edit selections", human: "Contact human support", reset: "Start over" },
    errors: { gameRequired: "Select a game.", serviceRequired: "Select a service.", invalidRank: "That rank is not valid for this game.", currentRankRequired: "Select the current rank.", targetRankRequired: "Select the target rank.", divisionRequired: "Select a division.", invalidDivision: "That division is not valid for the selected rank.", targetMustBeHigher: "The target must be above the current rank.", numberRequired: "Enter a valid number; stars may be zero.", positiveNumber: "Enter a number greater than zero.", invalidStarRange: "The star value is outside the selected rank range.", heroRequired: "Enter the preferred hero.", roleRequired: "Select a preferred role or lane.", invalidRole: "That lane is not available for this game.", heroPowerMarkRequired: "Select a hero power mark.", invalidHeroPowerMark: "That hero power mark is not available for this game.", expressRequired: "Select whether express service is required.", requirementsRequired: "Describe the package or special requirements.", completionTimeRequired: "Select a preferred completion time.", preferredStartTimeRequired: "Select a preferred start time.", duoGuaranteeRequired: "Choose guaranteed or standard play.", invalidDuoGuarantee: "That win/loss option is invalid.", minimumQuantity: "This service requires at least 2 matches.", pricingUnavailable: "Pricing is not configured and requires human confirmation." },
    whatsapp: { greeting: "Hello, I would like an Aurora Esports Studio quote.", closing: "Please review these details and confirm the quote. Thank you." },
    reviewBillingNotice: "Review coaching is billed at {{unitPrice}} per actual call minute, with a {{minimumMinutes}}-minute minimum. This is the booking payment; extra time is settled after the session.",
  },
};

const zhCN = {
  a11y: { skip: "跳到主要内容" },
  common: { external: "在新窗口打开", yes: "是", no: "否", optional: "选填", required: "必填", notAvailable: "待人工确认", select: "请选择", back: "返回", next: "下一步", close: "关闭", edit: "修改" },
  locale: { label: "语言", "zh-Hant": "繁體中文", en: "English", "zh-Hans": "简体中文" },
  nav: { games: "游戏专区", services: "服务项目", process: "流程", proof: "实绩", reviews: "玩家反馈", faq: "常见问题", contact: "联系", menu: "菜单", openMenu: "打开菜单", closeMenu: "关闭菜单" },
  hero: {
    eyebrow: "HK · TW MOBILE ESPORTS STUDIO", title: "传说对决 × 王者荣耀", titleAccent: "", description: "走进 Aurora 的专属战场，为香港及台湾玩家带来更从容、更精准的游戏服务体验。", sideNote: "香港为主 · 台湾亦可咨询", serviceNote: "3 GAMES · 1 TEAM · PRIVATE SERVICE", scroll: "向下探索", quoteControl: "向 Aurora客服查询报价", quoteControlShort: "Aurora客服即时报价", quoteDisclaimer: "Aurora客服会按已确认的中央资料协助整理报价需求。", newcomerOffer: "新人优惠・全单自动享 85 折", paymentMethods: "支持付款方式", paymentNote: "付款方式及资料由 Aurora 客服确认", payments: { alipay: "支付宝", wechatPay: "微信支付", fps: "转数快 FPS" },
  },
  stats: { eyebrow: "AURORA AT A GLANCE", disclaimer: "工作室累计运营数据；实际结果会按游戏、段位、时段及个别安排而异。", items: [
    { value: sharedStatsValues[0], label: "高端局参考胜率" }, { value: sharedStatsValues[1], label: "累计完成订单" }, { value: sharedStatsValues[2], label: "Carousell 评分" }, { value: sharedStatsValues[3], label: "客服协作时段" },
  ] },
  games: {
    eyebrow: "CHOOSE YOUR ARENA", title: "想玩哪个？我们已经准备就绪", description: "选择你的游戏与服务器，再查看合适服务。", viewServices: "查看服务",
    aov: { name: "传说对决", shortName: "传说对决", englishName: "Arena of Valor", eyebrow: "AOV · HK / TW", imageAlt: "《传说对决》游戏主视觉", description: "排位、巅峰赛、陪打及专项训练，一站式匹配高端玩家。" },
    "hok-cn": { name: "王者荣耀（国服）", shortName: "王者国服", englishName: "Honor of Kings · China", eyebrow: "CN SERVER", imageAlt: "《王者荣耀》国服游戏主视觉", description: "熟悉国服节奏、分路及版本环境，按目标安排合适方案。" },
    "hok-global": { name: "Honor of Kings", shortName: "HOK 国际服", englishName: "王者荣耀（国际服）", eyebrow: "GLOBAL SERVER", imageAlt: "Honor of Kings 国际服游戏主视觉", description: "面向国际服玩家的排位支持、双排协作与个性化教学。" },
  },
  services: {
    eyebrow: "OUR SERVICES", title: "按目标选择，不受固定套餐限制。", description: "所有方案按游戏、段位、时段及实际需求确认。", gameFilter: "按游戏筛选服务", details: "查看详情", close: "关闭服务详情", modalNote: "价格按游戏、段位、目标与时段私人报价。",
    rank: { title: "排位代打", summary: "高端玩家手动安排，按目前段位与目标制定进度。", description: "先确认目前段位、目标、时段及常用位置，再安排合适成员。", category: "进度服务", points: ["按目标评估", "进度汇报", "私人客服跟进"] },
    peak: { title: "巅峰赛代打", summary: "针对高分段节奏、版本英雄池及积分目标安排。", description: "由熟悉高端局节奏的成员评估分数区间、排队环境及时段。", category: "进度服务", points: ["高分段评估", "版本英雄池", "时段与进度确认"] },
    duo: { title: "陪玩带飞", summary: "可选排位或5V5匹配，由高端玩家与你同行。", description: "在玩家本人参与的前提下提供即时协作；可以自然沟通，也可以安静享受游戏。", category: "陪玩服务", points: ["排位／5V5匹配", "即时协作", "不强制语音"] },
    "hero-power": { title: "英雄战力标", summary: "按指定英雄、目前及目标战力与目标标整理专属需求。", description: "目标战力标会按游戏分开选择，未配置正式价格时交由客服人工确认。", category: "战力服务", points: ["指定英雄", "目前／目标战力", "该游戏目标标"] },
    other: { title: "其他服务", summary: "复盘教学、第一视角教学及英雄教学集中在同一项咨询。", description: "选择需要的方式，再把录像、英雄或改善重点告诉 Aurora客服。", category: "其他服务", points: ["复盘教学", "第一视角教学", "英雄教学"] },
  },
  process: { eyebrow: "HOW IT WORKS", title: "四个步骤，把目标说清楚。", description: "先了解需要，再确认方案与排期。", steps: [
    { title: "私信咨询", body: "提供游戏、服务器、目前段位、目标及理想时段。" }, { title: "确认报价", body: "客服评估可行性，再确认内容、报价与排期。" }, { title: "安排服务", body: "根据游戏、位置与需求匹配合适成员。" }, { title: "完成跟进", body: "按约定提供进度或训练重点，完成后续协作。" },
  ] },
  proof: { eyebrow: "PRIVATE RESULT REVIEW", title: "实绩要看得清楚，也要保护玩家隐私。", description: "近期打码记录可按游戏与目标私信索取；示意素材不会当成真实战绩。", request: "索取近期记录", labels: { game: "游戏与服务器", rank: "段位与分数", cycle: "服务与完成周期", privacy: "打码与隐私" }, descriptions: { game: "先确认 AOV／国服／国际服", rank: "只展示与咨询目标相关的记录", cycle: "按实际个案说明，不以示意数据代替", privacy: "隐藏玩家账号及可识别资料" } },
  reviews: { eyebrow: "PLAYER NOTES", title: "玩家留下的文字反馈。", description: "以清晰文字呈现，不使用示意聊天截图冒充真实记录。" },
  testimonials: [
    { quote: "安排速度很稳，开始前会先把目标和时间讲清楚。", name: "Jason Wong", meta: "排位服务" }, { quote: "复盘讲得很细，我才发现自己最大的问题其实是地图观念。", name: "阿杰", meta: "香港 · 其他服务／复盘教学" }, { quote: "陪打过程不尴尬，沟通自然，而且节奏提示很有用。", name: "Kelvin", meta: "陪打服务" }, { quote: "客服回复直接，方案和进度都交代得很清楚。", name: "Ryan Chan", meta: "私人方案" },
  ],
  faq: { eyebrow: "FAQ", title: "开始前，你可能想先知道。", description: "价格、流程、联系方式与服务限制，都在开始前说清楚。" },
  faqs: [
    { question: "目前支持哪些游戏？", answer: "现时支持《传说对决》、《王者荣耀》国服，以及 Honor of Kings 国际服。" }, { question: "如何下单？", answer: "可通过 WhatsApp、Instagram、Discord、LINE 或 Carousell 私信，提供游戏、段位、目标和时段。" }, { question: "价格为什么会按订单调整？", answer: "网站会显示 Aurora 已发布的公开价格或起价；游戏、服务器、段位、目标、加急要求和时段仍可能影响最终报价。未启用自动报价的项目会由客服人工确认。" }, { question: "香港和台湾玩家如何联系？", answer: "香港玩家建议使用 WhatsApp 或 Instagram；台湾玩家可使用 LINE、Instagram 或 Discord。" }, { question: "是否提供售后或补单？", answer: "售后范围会在开始前按方案说明。如果时间或安排发生变化，客服会在原来的私人对话中跟进。" }, { question: "服务是否有风险？", answer: "任何网上游戏服务都不应描述为零风险。所有安排先说明流程与限制，并优先提供由玩家本人参与的陪玩及训练方案。" }, { question: "可以咨询陪玩或教学服务吗？", answer: "可以。陪玩带飞可选排位或5V5匹配；复盘教学、第一视角教学及英雄教学可在“其他服务”内咨询。" },
  ],
  contact: {
    eyebrow: "READY WHEN YOU ARE", title: "把游戏、段位和目标发给我们。", description: "香港玩家建议使用 WhatsApp；台湾玩家可选 LINE。其他渠道同样可以咨询。", whatsapp: "WhatsApp 立即咨询",
    channels: {
      whatsapp: { label: "WhatsApp", note: "香港主要咨询" },
      instagram: { label: "Instagram", note: "主要社交账号" },
      discord: { label: "Discord", note: "录屏与教学" },
      line: { label: "LINE", note: "台湾玩家咨询" },
      carousell: { label: "Carousell", note: "平台咨询" },
    },
  },
  footer: { description: "香港为主、台湾亦可使用的手机 MOBA 游戏服务工作室。", navigation: "页脚导航", disclaimer: "所有游戏名称及商标均属其各自权利人所有；本站并非官方合作网站。", rights: "© 2026 Aurora Esports Studio. All rights reserved." },
  quote: {
    title: "Aurora客服即时报价", subtitle: "规则流程会逐步收集资料，并只使用 Aurora 已设置的价格规则。", localOnly: "Aurora客服只会按中央游戏配置及已确认的报价资料回复。", inputLabel: "输入你的问题", inputPlaceholder: "例如：钻石升星耀多少钱？", suggestions: "搜索建议", noSuggestions: "未找到相关建议，可以直接提交问题。", listening: "请输入你的需要", manualNotice: "此订单需要人工确认，我们可以帮你转接 WhatsApp 客服。", unconfiguredNotice: "Aurora 尚未设置此项目的正式价格，因此不会显示估算或假设金额。", incompleteNotice: "请先补充以下资料。", reference: "报价编号", status: { incomplete: "资料未完整", manual_review: "待人工确认", quoted: "报价完成" },
    fields: { game: "游戏", service: "服务", currentRank: "目前段位", currentDivision: "目前分级", currentStars: "目前星数", currentPoints: "目前分数", currentPeakPoints: "目前巅峰赛分数", currentHeroPowerPoints: "目前英雄战力分数", targetHeroPowerPoints: "目标英雄战力分数", targetRank: "目标段位", targetDivision: "目标分级", targetStars: "目标星数", targetPoints: "目标分数", quantity: "所需数量", completionTime: "理想完成时间", preferredStartTime: "理想开始时间", duoMode: "陪玩模式", duoGuarantee: "胜负方案", customSchedule: "指定时段要求", winRate70: "全程保持胜率 70% 以上", express: "加急服务", preferredHero: "指定英雄", preferredRole: "指定位置／分路", heroPowerMark: "英雄战力标", otherServiceType: "其他服务类型", quoteStatus: "报价状态", additionalRequirements: "其他要求" },
    prompts: { game: "你玩哪一款游戏？", service: "你想咨询哪一项服务？", currentRank: "你目前是什么段位？", currentDivision: "目前是哪一个小分级？", currentStars: "目前有多少星？", currentPoints: "目前有多少分？", targetRank: "你想升到哪一个段位？", targetDivision: "目标是哪一个小分级？", targetStars: "目标是多少星？", targetPoints: "目标是多少分？", quantity: "需要多少星、场、局或小时？", completionTime: "你希望什么时候完成？", preferredStartTime: "你希望预约哪一天、几点开始陪玩？", express: "需要加急吗？", preferredHero: "有没有指定英雄？", additionalRequirements: "还有其他要求吗？" },
    table: { title: "Aurora 专业报价", service: "服务", currentRank: "目前段位", targetRank: "目标段位", currentStars: "目前星数", targetStars: "目标星数", quantity: "所需数量", basePrice: "基本价格", optionalCharges: "附加费用", discount: "折扣", newCustomerDiscount: "新人优惠 85 折", estimatedCompletionTime: "预计完成时间", preferredStartTime: "预约开始时间", bookingDeposit: "预约付款", finalTotal: "最终总额", reference: "报价编号" },
    actions: { start: "开始查询", submit: "提交", copy: "复制报价", copied: "已复制", whatsapp: "发送到 WhatsApp", line: "发送至 LINE", lineCopied: "报价已复制；添加好友后请粘贴并发送。", lineCopyFailed: "浏览器未能自动复制。请先点击“复制报价”，再前往 LINE。", edit: "修改选择", human: "联系人工客服", reset: "重新开始" },
    errors: { gameRequired: "请选择游戏。", serviceRequired: "请选择服务。", invalidRank: "所选段位不适用于这款游戏。", currentRankRequired: "请选择目前段位。", targetRankRequired: "请选择目标段位。", divisionRequired: "请选择小分级。", invalidDivision: "所选小分级不适用于这个段位。", targetMustBeHigher: "目标段位必须高于目前段位。", numberRequired: "请输入有效数字；星数可以是零。", positiveNumber: "请输入大于零的数字。", invalidStarRange: "星数不符合所选段位的范围。", heroRequired: "请输入指定英雄。", roleRequired: "请选择指定位置／分路。", invalidRole: "所选分路不适用于这款游戏。", heroPowerMarkRequired: "请选择英雄战力标。", invalidHeroPowerMark: "所选英雄战力标不适用于这款游戏。", expressRequired: "请选择是否需要加急。", requirementsRequired: "请说明套餐或特殊要求。", completionTimeRequired: "请选择理想完成时间。", preferredStartTimeRequired: "请选择理想开始时间。", duoGuaranteeRequired: "请选择包赢或不包赢方案。", invalidDuoGuarantee: "胜负方案不正确。", minimumQuantity: "此项服务最少需要 2 局。", pricingUnavailable: "价格尚未设置，必须人工确认。" },
    whatsapp: { greeting: "你好，我想咨询 Aurora Esports Studio 报价。", closing: "请客服按以上资料人工确认，谢谢。" },
    reviewBillingNotice: "复盘教学按实际通话时间每分钟 {{unitPrice}} 计算，最少 {{minimumMinutes}} 分钟；此金额是预约付款，超时部分于结束后补款。",
  },
};

const assistantExtras = {
  "zh-HK": {
    guidedMode: "逐步查價", manualMode: "手動填寫", resultMode: "報價結果", step: "步驟 {current} / {total}", continue: "繼續", skip: "略過", generate: "生成報價", reset: "重新開始", notApplicable: "不適用", summary: "已收集資料", querySaved: "已保留你的問題，請繼續補充資料。", currentStarsPlaceholder: "例如 2", targetStarsPlaceholder: "例如 5", quantityPlaceholder: "例如 12", completionPlaceholder: "例如：今日晚上／24 小時內", heroPlaceholder: "例如：莉莉安", requirementsPlaceholder: "指定位置、時段或其他要求", quoteDisclaimer: "本地規則式客服報價只會使用 Aurora 已確認的中央價目資料。",
  },
  en: {
    guidedMode: "Guided quote", manualMode: "Manual form", resultMode: "Quote result", step: "Step {current} of {total}", continue: "Continue", skip: "Skip", generate: "Generate quote", reset: "Start again", notApplicable: "Not applicable", summary: "Information collected", querySaved: "Your question has been saved. Please continue with the missing details.", currentStarsPlaceholder: "e.g. 2", targetStarsPlaceholder: "e.g. 5", quantityPlaceholder: "e.g. 12", completionPlaceholder: "e.g. tonight / within 24 hours", heroPlaceholder: "e.g. Liliana", requirementsPlaceholder: "Role, schedule, or other requirements", quoteDisclaimer: "This local rule-based customer-service quote uses only Aurora's confirmed central pricing data.",
  },
  "zh-CN": {
    guidedMode: "逐步询价", manualMode: "手动填写", resultMode: "报价结果", step: "步骤 {current} / {total}", continue: "继续", skip: "跳过", generate: "生成报价", reset: "重新开始", notApplicable: "不适用", summary: "已收集资料", querySaved: "已保留您的问题，请继续补充资料。", currentStarsPlaceholder: "例如 2", targetStarsPlaceholder: "例如 5", quantityPlaceholder: "例如 12", completionPlaceholder: "例如：今晚／24 小时内", heroPlaceholder: "例如：莉莉安", requirementsPlaceholder: "指定位置、时段或其他要求", quoteDisclaimer: "本地规则式客服报价只使用 Aurora 已确认的中央价格资料。",
  },
};

function buildQuoteAssistantCopy(data, extras) {
  const quote = data.quote;
  return {
    entryLabel: data.hero.quoteControl,
    entryHint: quote.inputPlaceholder,
    dialogTitle: quote.title,
    close: data.common.close,
    deterministicNote: quote.localOnly,
    pricingWarning: quote.unconfiguredNotice,
    searchLabel: quote.inputLabel,
    searchPlaceholder: quote.inputPlaceholder,
    searchAction: quote.actions.start,
    suggestions: quote.suggestions,
    guidedMode: extras.guidedMode,
    manualMode: extras.manualMode,
    resultMode: extras.resultMode,
    step: extras.step,
    continue: extras.continue,
    skip: extras.skip,
    generate: extras.generate,
    reset: extras.reset,
    game: quote.fields.game,
    service: quote.fields.service,
    currentRank: quote.fields.currentRank,
    currentDivision: quote.fields.currentDivision,
    currentStars: quote.fields.currentStars,
    targetRank: quote.fields.targetRank,
    targetDivision: quote.fields.targetDivision,
    targetStars: quote.fields.targetStars,
    quantity: quote.fields.quantity,
    completionTime: quote.fields.completionTime,
    preferredStartTime: quote.fields.preferredStartTime,
    express: quote.fields.express,
    preferredHero: quote.fields.preferredHero,
    requirements: quote.fields.additionalRequirements,
    chooseGame: quote.prompts.game,
    chooseService: quote.prompts.service,
    chooseCurrentRank: quote.prompts.currentRank,
    chooseCurrentDivision: quote.prompts.currentDivision,
    enterCurrentStars: quote.prompts.currentStars,
    chooseTargetRank: quote.prompts.targetRank,
    chooseTargetDivision: quote.prompts.targetDivision,
    enterTargetStars: quote.prompts.targetStars,
    enterQuantity: quote.prompts.quantity,
    enterCompletionTime: quote.prompts.completionTime,
    enterPreferredStartTime: quote.prompts.preferredStartTime,
    chooseExpress: quote.prompts.express,
    enterHero: quote.prompts.preferredHero,
    enterRequirements: quote.prompts.additionalRequirements,
    yes: data.common.yes,
    no: data.common.no,
    optional: data.common.optional,
    select: data.common.select,
    notApplicable: extras.notApplicable,
    incomplete: quote.incompleteNotice,
    calculationError: quote.manualNotice,
    manualMessage: quote.manualNotice,
    quoteTitle: quote.table.title,
    basePrice: quote.table.basePrice,
    optionalCharges: quote.table.optionalCharges,
    discount: quote.table.discount,
    estimatedTime: quote.table.estimatedCompletionTime,
    finalTotal: quote.table.finalTotal,
    reference: quote.table.reference,
    pending: data.common.notAvailable,
    copy: quote.actions.copy,
    copied: quote.actions.copied,
    whatsapp: quote.actions.whatsapp,
    edit: quote.actions.edit,
    humanSupport: quote.actions.human,
    summary: extras.summary,
    noSuggestions: quote.noSuggestions,
    querySaved: extras.querySaved,
    currentStarsPlaceholder: extras.currentStarsPlaceholder,
    targetStarsPlaceholder: extras.targetStarsPlaceholder,
    quantityPlaceholder: extras.quantityPlaceholder,
    completionPlaceholder: extras.completionPlaceholder,
    heroPlaceholder: extras.heroPlaceholder,
    requirementsPlaceholder: extras.requirementsPlaceholder,
    quoteDisclaimer: extras.quoteDisclaimer,
  };
}

zhHK.quoteAssistant = buildQuoteAssistantCopy(zhHK, assistantExtras["zh-HK"]);
en.quoteAssistant = buildQuoteAssistantCopy(en, assistantExtras.en);
zhCN.quoteAssistant = buildQuoteAssistantCopy(zhCN, assistantExtras["zh-CN"]);

export const translations = {
  "zh-HK": zhHK,
  en,
  "zh-CN": zhCN,
};

export function normalizeLocale(locale) {
  if (!locale) return defaultLocale;
  const normalized = String(locale).replace("_", "-");
  const lower = normalized.toLowerCase();
  if (lower === "zh-hant" || lower.startsWith("zh-hk") || lower.startsWith("zh-tw")) return "zh-HK";
  if (lower === "zh-hans" || lower.startsWith("zh-cn") || lower.startsWith("zh-sg")) return "zh-CN";
  if (lower.startsWith("en")) return "en";
  return supportedLocales.includes(normalized) ? normalized : defaultLocale;
}

function getByPath(source, key) {
  return String(key)
    .split(".")
    .reduce((value, segment) => (value == null ? undefined : value[segment]), source);
}

function interpolate(value, params) {
  if (typeof value !== "string" || !params) return value;
  return value.replace(/\{\{?([\w.-]+)\}?\}/g, (match, token) =>
    Object.prototype.hasOwnProperty.call(params, token) ? String(params[token]) : match,
  );
}

export function translate(locale, key, params = {}) {
  const resolvedLocale = normalizeLocale(locale);
  const localized = getByPath(translations[resolvedLocale], key);
  const fallback = getByPath(translations[defaultLocale], key);
  const value = localized ?? fallback;
  return value == null ? key : interpolate(value, params);
}

export function localize(value, locale = defaultLocale) {
  if (value == null) return "";
  if (typeof value !== "object") return value;

  if (value.labels) return localize(value.labels, locale);
  const resolvedLocale = normalizeLocale(locale);
  return (
    value[resolvedLocale] ??
    value[defaultLocale] ??
    (resolvedLocale === "zh-CN" ? value.simplifiedChinese : null) ??
    (resolvedLocale === "en" ? value.english : null) ??
    value.traditionalChinese ??
    value.en ??
    Object.values(value).find((candidate) => typeof candidate === "string") ??
    ""
  );
}
