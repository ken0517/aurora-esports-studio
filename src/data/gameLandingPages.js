import { publicBrandIdentity } from "./publicBrand.js";

const brandRelationship = publicBrandIdentity.relationshipStatement;

const malaysiaHokAlternates = Object.freeze([
  { hreflang: "ms-MY", href: "https://auroraesportstudio.com/my/honor-of-kings/" },
  { hreflang: "en-MY", href: "https://auroraesportstudio.com/my/en/honor-of-kings/" },
  { hreflang: "zh-Hans-MY", href: "https://auroraesportstudio.com/my/zh-cn/honor-of-kings/" },
  { hreflang: "x-default", href: "https://auroraesportstudio.com/honor-of-kings-global-boosting/" },
]);

const malaysiaHokShared = {
  gameId: "hok-global",
  image: "assets/cases/hok-global-battle-zone-top10-04.jpg",
  serviceMarkets: ["Malaysia"],
  relatedGameIds: ["aov", "hok-cn", "hok-global"],
  alternates: malaysiaHokAlternates,
};

export const gameLandingPages = Object.freeze([
  {
    gameId: "aov",
    slug: "arena-of-valor-boosting",
    canonical: "https://auroraesportstudio.com/arena-of-valor-boosting/",
    seoTitle: "香港 KLG Studio 傳說對決代打・陪玩｜Aurora 官方網站",
    seoDescription:
      "KLG Studio 為香港、台灣及澳門玩家提供傳說對決排位代打、陪玩帶飛、巔峰賽及英雄戰力標查詢；官方網站由 Aurora Esports Studio 使用。",
    eyebrow: "ARENA OF VALOR · HK / TW / MO",
    title: "香港傳說對決代打與陪玩服務",
    intro:
      "按目前段位、目標與遊戲習慣安排合適服務。你可以先自行填寫資料，亦可由 Aurora 客服逐步協助整理需求。",
    image: "assets/generated/game-aov-user.webp",
    imageAlt: "Aurora 傳說對決遊戲服務實績",
    audience: "香港、台灣及澳門《傳說對決》玩家",
    searchGuide: {
      title: "香港、台灣及澳門傳說對決代打、陪玩查詢",
      paragraphs: [
        brandRelationship,
        "如果你正在尋找香港傳說對決代打、排位上分或傳說對決陪玩服務，可以先在 Aurora 報價表選擇目前段位、目標段位、星數、指定英雄及分路。系統會依照已確認的中央價格規則整理暫估報價，無法自動計算的要求則交由客服確認。",
        "香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。服務範圍包括排位代打、陪玩帶飛、巔峰賽、英雄戰力標，以及第一視角教學或復盤等其他需求。",
      ],
    },
    relatedGameIds: ["aov", "hok-cn", "hok-global"],
    caseStudySection: {
      title: "《傳說對決》實際遊戲紀錄。",
      description: "以下圖片由 Aurora 提供，展示近期賽季、段位及排位對局紀錄；玩家可識別資料會按需要隱藏。",
    },
    caseStudies: [
      {
        image: "assets/cases/aov-season-record.jpeg",
        alt: "傳說對決 2025 賽季實際對局、勝場與勝率紀錄",
        width: 1029,
        height: 513,
        title: "賽季對局與勝率紀錄",
        description: "畫面顯示 2025 賽季共 336 場、243 勝及 72.3% 勝率，作為近期實際遊戲紀錄展示。",
      },
      {
        image: "assets/cases/aov-highest-rank.jpeg",
        alt: "傳說對決上賽季最高段位永恆冥獄幻刃 165 星紀錄",
        width: 1138,
        height: 570,
        title: "上賽季最高段位紀錄",
        description: "畫面顯示上賽季最高段位為永恆冥獄幻刃 165 星，用以說明高端排位對局經驗。",
      },
      {
        image: "assets/cases/aov-ranked-history.jpeg",
        alt: "傳說對決近期排位賽勝利及打野表現紀錄",
        width: 1290,
        height: 593,
        title: "近期排位對局紀錄",
        description: "畫面顯示多場近期排位勝利、評分及打野表現，作為實際排位遊戲紀錄展示。",
      },
    ],
    rankSummary: "支援中央報價表內已設定的青銅、白銀、黃金、鉑金、鑽石、星耀及傳說以上段位。",
    lanes: ["凱撒路", "打野", "中路", "魔龍路", "輔助"],
    marks: ["綠標", "藍標", "紫標", "紅標", "全服標"],
    priceNotice: "巔峰賽及英雄戰力標會按實際資料顯示待人工確認，不會自行推算金額。",
    faqs: [
      {
        question: "傳說對決排位代打需要提供甚麼資料？",
        answer: "請選擇目前段位、分級與星數，再填寫目標段位、指定英雄、分路及其他要求。",
      },
      {
        question: "可以選擇陪玩帶飛嗎？",
        answer: "可以。陪玩帶飛可按排位或 5V5 匹配整理需求，實際安排會在確認報價時說明。",
      },
      {
        question: "英雄戰力標會即時顯示價格嗎？",
        answer: "戰力標需要按英雄、目前戰力、目標戰力與標誌確認，因此會交由 Aurora 客服人工報價。",
      },
      {
        question: "香港、台灣及澳門玩家可以使用哪些方式聯絡？",
        answer: "香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。",
      },
      {
        question: "傳說對決服務是否保證勝率或指定結果？",
        answer: "不會保證固定勝率或每場結果。實際表現會受段位、對局環境、英雄選擇及配對狀況影響，所有安排以客服確認內容為準。",
      },
    ],
  },
  {
    gameId: "hok-cn",
    slug: "honor-of-kings-cn-boosting",
    canonical: "https://auroraesportstudio.com/honor-of-kings-cn-boosting/",
    seoTitle: "KLG Studio 王者榮耀國服代打・陪玩｜Aurora 官方網站",
    seoDescription:
      "KLG Studio 為香港、台灣及澳門玩家提供王者榮耀國服排位代打、陪玩帶飛、巔峰賽及英雄戰力標需求整理；官方網站為 auroraesportstudio.com。",
    eyebrow: "HONOR OF KINGS · CHINA SERVER",
    title: "王者榮耀國服代打與陪玩服務",
    intro:
      "按照國服段位、星數、指定分路與目標整理專屬報價，所有金額只會採用 Aurora 已確認的中央價格資料。",
    image: "assets/generated/game-hok-cn-user.webp",
    imageAlt: "Aurora 王者榮耀國服遊戲服務實績",
    audience: "需要王者榮耀國服服務的香港、台灣及澳門玩家",
    searchGuide: {
      title: "香港、台灣及澳門王者榮耀國服代打查詢",
      paragraphs: [
        brandRelationship,
        "Aurora 的王者榮耀國服代打頁面把國服段位、分級、王者星數、指定英雄及分路分開處理，避免與 HOK 國際服資料混用。排位代打與陪玩帶飛可按網站已確認規則整理暫估報價。",
        "如需國服巔峰賽代打、小國標、大國標或其他特殊安排，網站會先收集目標分數、英雄及位置，再顯示待人工確認。香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。",
      ],
    },
    relatedGameIds: ["aov", "hok-cn", "hok-global"],
    rankSummary: "支援倔強青銅至至尊星耀，以及最強王者至傳奇王者的中央段位設定。",
    lanes: ["對抗路", "打野", "中路", "發育路", "輔助"],
    marks: ["銅標", "銀標", "金標", "小國標", "大國標"],
    priceNotice: "國服巔峰賽及英雄戰力標需要 Aurora 客服按實際要求人工確認。",
    faqs: [
      {
        question: "王者榮耀國服排位如何查詢？",
        answer: "選擇目前及目標段位、分級與星數後，系統會按已確認的國服價格規則整理暫估報價。",
      },
      {
        question: "國標可以直接自動報價嗎？",
        answer: "不可以。小國標與大國標會受英雄、戰區及排名要求影響，因此需要人工確認。",
      },
      {
        question: "是否可以指定分路或英雄？",
        answer: "可以在報價表填寫指定英雄、對抗路、打野、中路、發育路或輔助，客服會按要求確認安排。",
      },
      {
        question: "王者榮耀國服與 HOK 國際服會使用同一組資料嗎？",
        answer: "不會。國服與國際服擁有各自的段位、星數區間及英雄戰力標，切換遊戲時網站會載入對應設定。",
      },
      {
        question: "國服代打報價可以直接透過 WhatsApp 或 LINE 確認嗎？",
        answer: "可以。完成網站報價表後，可把同一份資料交給 WhatsApp 或 LINE 客服確認；網站顯示的自動金額屬暫估報價。",
      },
    ],
  },
  {
    gameId: "hok-global",
    slug: "honor-of-kings-global-boosting",
    canonical: "https://auroraesportstudio.com/honor-of-kings-global-boosting/",
    seoTitle: "KLG Studio HOK 國際服代打・陪玩｜Aurora 官方網站",
    seoDescription:
      "KLG Studio 為香港、台灣及澳門玩家提供 HOK／Honor of Kings 國際服排位代打、陪玩帶飛、巔峰賽及英雄戰力標查詢。",
    eyebrow: "HONOR OF KINGS · GLOBAL SERVER",
    title: "HOK 國際服代打與陪玩服務",
    intro:
      "針對 Honor of Kings 國際服段位、星數及伺服器環境整理服務需求，並以繁體書面語提供清楚的報價流程。",
    image: "assets/generated/game-hok-global-user.webp",
    imageAlt: "Aurora HOK 國際服遊戲服務實績",
    audience: "香港、台灣及澳門 Honor of Kings 國際服玩家",
    searchGuide: {
      title: "香港、台灣及澳門 HOK 國際服代打、陪玩查詢",
      paragraphs: [
        brandRelationship,
        "HOK 國際服代打與王者榮耀國服並非同一套段位資料。Aurora 會按 Honor of Kings 國際服的目前段位、分級、王者星數、指定英雄與分路整理排位代打或陪玩帶飛需求。",
        "國際服巔峰賽與英雄戰力標需要依照分數、英雄、戰區及目標標誌人工確認。香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。",
      ],
    },
    relatedGameIds: ["aov", "hok-cn", "hok-global"],
    caseStudySection: {
      title: "HOK 國際服月度戰區 Top 10 紀錄。",
      description: "以下圖片展示月度戰區 Top 10 中可見的英雄排名歷史紀錄；不代表未來名次、結果或勝率。",
    },
    caseStudies: [
      {
        image: "assets/cases/hok-global-battle-zone-top10-01.jpg",
        alt: "HOK 國際服月度戰區 Top 10 三位英雄排名紀錄",
        width: 1280,
        height: 574,
        title: "月度戰區 Top 10 三位英雄紀錄",
        description: "畫面顯示月度戰區 Top 10 中三位英雄的可見排名紀錄。",
      },
      {
        image: "assets/cases/hok-global-battle-zone-top10-02.jpg",
        alt: "HOK 國際服月度戰區 Top 10 三位英雄排名紀錄",
        width: 1280,
        height: 587,
        title: "月度戰區 Top 10 三位英雄紀錄",
        description: "畫面顯示月度戰區 Top 10 中三位英雄的可見排名紀錄。",
      },
      {
        image: "assets/cases/hok-global-battle-zone-top10-03.jpg",
        alt: "HOK 國際服月度戰區 Top 10 六位英雄排名紀錄",
        width: 1280,
        height: 587,
        title: "月度戰區 Top 10 六位英雄紀錄",
        description: "畫面顯示月度戰區 Top 10 中六位英雄的可見排名紀錄。",
      },
      {
        image: "assets/cases/hok-global-battle-zone-top10-04.jpg",
        alt: "HOK 國際服月度戰區 Top 10 九位英雄排名紀錄",
        width: 1280,
        height: 592,
        title: "月度戰區 Top 10 九位英雄紀錄",
        description: "畫面顯示月度戰區 Top 10 中九位英雄的可見排名紀錄。",
      },
    ],
    rankSummary: "支援倔強青銅至至尊星耀，以及最強王者、無雙王者、榮耀王者與傳奇王者。",
    lanes: ["對抗路", "打野", "中路", "發育路", "輔助"],
    marks: ["銅標", "銀標", "金標", "小國標", "大國標", "紅標"],
    priceNotice: "HOK 國際服巔峰賽及英雄戰力標會顯示待人工確認，避免提供未核實金額。",
    faqs: [
      {
        question: "HOK 國際服與王者榮耀國服的段位相同嗎？",
        answer: "兩款遊戲的王者星數區間與部分戰力標不同，報價表會按所選遊戲載入各自設定。",
      },
      {
        question: "HOK 國際服可以選擇紅標嗎？",
        answer: "可以。國際服戰力標選項包含銅標、銀標、金標、小國標、大國標及紅標。",
      },
      {
        question: "如何聯絡 Aurora 確認服務？",
        answer: "香港玩家建議使用 WhatsApp；台灣玩家可使用 LINE；澳門玩家可選擇 WhatsApp、Instagram、Discord、LINE 或 Carousell 查詢。",
      },
      {
        question: "HOK 國際服排位代打會顯示哪一種貨幣？",
        answer: "報價表預設顯示港幣，也可切換台幣或人民幣。換算只會在港幣價格完成後進行，人工報價項目不會自行產生金額。",
      },
      {
        question: "國際服可以查詢陪玩帶飛或第一視角教學嗎？",
        answer: "可以。陪玩帶飛可按排位或 5V5 匹配整理需求；第一視角教學及復盤可在其他服務中選擇。",
      },
    ],
  },
  {
    ...malaysiaHokShared,
    slug: "my/honor-of-kings",
    canonical: "https://auroraesportstudio.com/my/honor-of-kings/",
    language: "ms-MY",
    seoTitle: "KLG Studio HOK Malaysia: Teman Bermain, Bimbingan & Ulasan | Aurora",
    seoDescription:
      "KLG Studio oleh Aurora Esports Studio menyediakan sesi teman bermain, bimbingan hero, ulasan perlawanan dan bimbingan sudut pandang pertama untuk pemain Honor of Kings di Malaysia.",
    eyebrow: "HONOR OF KINGS · MALAYSIA",
    title: "Sokongan permainan Honor of Kings untuk pemain Malaysia",
    intro:
      "Pilih sesi teman bermain, bimbingan atau ulasan perlawanan mengikut matlamat anda. Aurora akan menyusun keperluan anda sebelum pengesahan melalui WhatsApp.",
    imageAlt: "Rekod Top 10 zon pertempuran Honor of Kings oleh Aurora Esports Studio",
    audience: "Pemain Honor of Kings di Malaysia",
    searchGuide: {
      title: "Teman bermain, bimbingan dan ulasan HOK Malaysia",
      paragraphs: [
        "Aurora Esports Studio mengendalikan laman rasmi KLG untuk perkhidmatan permainan mudah alih. Halaman Malaysia ini menerangkan sokongan Honor of Kings dalam Bahasa Melayu.",
        "Pemain boleh meminta sesi duo, bimbingan ranked, ulasan perlawanan, bimbingan sudut pandang pertama atau bimbingan hero. Setiap permintaan disemak berdasarkan rank, server Asia Tenggara, hero dan masa yang sesuai.",
        "Kami tidak menjanjikan kemenangan, kadar kemenangan atau kedudukan tertentu. Harga yang belum mempunyai peraturan rasmi akan ditandakan untuk pengesahan manusia dan tidak akan direka oleh sistem.",
      ],
    },
    serviceCards: [
      { id: "duo", category: "Teman bermain", title: "Sesi duo", description: "Main bersama pemain berpengalaman untuk komunikasi dan pengalaman permainan yang lebih teratur." },
      { id: "other", category: "Bimbingan", title: "Bimbingan ranked", description: "Bincangkan makro, pemilihan hero, lane dan keputusan semasa perlawanan." },
      { id: "other", category: "Ulasan", title: "Ulasan perlawanan", description: "Semak rakaman atau perlawanan anda dan kenal pasti perkara yang boleh diperbaiki." },
      { id: "other", category: "Bimbingan", title: "Bimbingan sudut pandang pertama", description: "Lihat cara permainan secara langsung sambil menerima penerangan tentang keputusan penting." },
      { id: "other", category: "Hero", title: "Bimbingan hero", description: "Latihan khusus mengikut hero, lane dan tahap permainan semasa anda." },
    ],
    rankSummary: "Menyokong rank HOK Global daripada Bronze hingga Legendary King mengikut konfigurasi pusat Aurora.",
    lanes: ["Clash Lane", "Jungle", "Mid Lane", "Farm Lane", "Roamer"],
    marks: ["Bronze", "Silver", "Gold", "Minor National", "Major National", "Red"],
    priceNotice: "Permintaan khas dan harga yang belum disahkan akan dihantar kepada Aurora Support untuk semakan manusia.",
    faqs: [
      { question: "Adakah Malaysia berada dalam server Asia Tenggara?", answer: "Ya. Malaysia dipetakan kepada rantau server Asia Tenggara dalam borang Aurora." },
      { question: "Apakah jenis sokongan HOK yang tersedia?", answer: "Anda boleh bertanya tentang sesi duo, bimbingan ranked, ulasan perlawanan, sudut pandang pertama dan bimbingan hero." },
      { question: "Adakah hasil atau kemenangan dijamin?", answer: "Tidak. Keputusan permainan bergantung pada matchmaking, rank, hero dan keadaan perlawanan." },
      { question: "Bagaimanakah harga disahkan?", answer: "Sistem hanya menggunakan peraturan harga Aurora yang telah diluluskan. Permintaan lain akan ditandakan untuk pengesahan manusia." },
      { question: "Bagaimanakah pemain Malaysia menghubungi Aurora?", answer: "Lengkapkan borang pertanyaan dan sahkan butiran melalui WhatsApp." },
    ],
    ui: {
      navigation: { label: "Navigasi halaman", services: "Perkhidmatan", details: "Butiran permainan", faq: "Soalan lazim", quote: "Minta sebut harga", home: "Kembali ke permainan" },
      services: { eyebrow: "PERKHIDMATAN AURORA", title: "Pilih sokongan mengikut matlamat anda.", description: "Setiap permintaan disusun dahulu; harga yang belum disahkan akan dirujuk kepada manusia.", quote: "Minta sebut harga" },
      guideEyebrow: "MALAYSIA",
      guideCta: "Susun butiran dan minta sebut harga",
      details: { eyebrow: "BUTIRAN PERMAINAN", title: "Maklumat khusus untuk HOK Global.", lanes: "Lane", marks: "Tanda kuasa hero" },
      process: { eyebrow: "CARA IA BERFUNGSI", title: "Proses yang jelas dari pertanyaan hingga pengesahan." },
      processSteps: [
        ["01", "Pilih sokongan", "Beritahu kami permainan, rank, server dan matlamat anda."],
        ["02", "Susun permintaan", "Aurora menyemak butiran dan peraturan harga yang tersedia."],
        ["03", "Sahkan melalui WhatsApp", "Sahkan masa, keperluan dan sebut harga sebelum bermula."],
        ["04", "Terima susulan", "Ikuti aturan yang telah dipersetujui dan simpan maklumat penting."],
      ],
      faq: { eyebrow: "SOALAN LAZIM", title: "Perkara yang perlu diketahui sebelum bertanya." },
      related: { eyebrow: "TEROKAI AURORA", title: "Lihat halaman permainan lain.", description: "Setiap permainan menggunakan rank, lane dan tanda yang berasingan.", view: "Lihat halaman" },
      cta: { eyebrow: "PERTANYAAN PERIBADI", title: "Beritahu Aurora matlamat anda.", description: "Susun maklumat anda dahulu, kemudian sahkan melalui WhatsApp.", manual: "Minta sebut harga", support: "Tanya Aurora Support" },
      footer: "Perkhidmatan permainan mudah alih untuk Malaysia, Hong Kong, Taiwan dan Macau",
    },
  },
  {
    ...malaysiaHokShared,
    slug: "my/en/honor-of-kings",
    canonical: "https://auroraesportstudio.com/my/en/honor-of-kings/",
    language: "en-MY",
    seoTitle: "KLG Studio HOK Malaysia: Duo Play, Coaching & Match Review | Aurora",
    seoDescription:
      "KLG Studio by Aurora Esports Studio offers Honor of Kings duo play, hero coaching, match review and first-person coaching enquiries for players in Malaysia.",
    eyebrow: "HONOR OF KINGS · MALAYSIA",
    title: "Honor of Kings support for players in Malaysia",
    intro:
      "Choose duo play, coaching or match review around your goals. Aurora organises your requirements before confirmation through WhatsApp.",
    imageAlt: "Honor of Kings battle-zone Top 10 record from Aurora Esports Studio",
    audience: "Honor of Kings players in Malaysia",
    searchGuide: {
      title: "HOK Malaysia duo play, coaching and match review",
      paragraphs: [
        "Aurora Esports Studio operates the official KLG gaming service website. This Malaysia page explains Honor of Kings support in English.",
        "Players can enquire about duo sessions, ranked coaching, match review, first-person coaching or hero coaching. Each request is organised around your rank, Southeast Asia server, hero and preferred schedule.",
        "We do not promise wins, fixed win rates or a particular rank result. Any service without an approved price rule is sent for human confirmation instead of being estimated by the system.",
      ],
    },
    serviceCards: [
      { id: "duo", category: "Companion", title: "Duo play", description: "Play alongside an experienced player with clear communication and a structured session." },
      { id: "other", category: "Coaching", title: "Ranked coaching", description: "Discuss macro play, hero selection, lanes and in-match decision making." },
      { id: "other", category: "Review", title: "Match review", description: "Review your match or recording and identify practical areas to improve." },
      { id: "other", category: "Coaching", title: "First-person coaching", description: "Watch live first-person play with explanations of key decisions." },
      { id: "other", category: "Hero", title: "Hero coaching", description: "Focused guidance based on your hero, lane and current level." },
    ],
    rankSummary: "Supports HOK Global ranks from Bronze to Legendary King through Aurora's central game configuration.",
    lanes: ["Clash Lane", "Jungle", "Mid Lane", "Farm Lane", "Roamer"],
    marks: ["Bronze", "Silver", "Gold", "Minor National", "Major National", "Red"],
    priceNotice: "Special requests and services without an approved price rule are sent to Aurora Support for human confirmation.",
    faqs: [
      { question: "Is Malaysia in the Southeast Asia server region?", answer: "Yes. Aurora maps Malaysia to the Southeast Asia server region." },
      { question: "Which HOK support sessions are available?", answer: "You can enquire about duo play, ranked coaching, match review, first-person coaching and hero coaching." },
      { question: "Do you guarantee wins or results?", answer: "No. Results depend on matchmaking, rank, heroes and match conditions." },
      { question: "How are prices confirmed?", answer: "The site only uses Aurora's approved pricing rules. Other requests are marked for human confirmation." },
      { question: "How can Malaysian players contact Aurora?", answer: "Complete the enquiry form and confirm the details through WhatsApp." },
    ],
    ui: {
      navigation: { label: "Page navigation", services: "Services", details: "Game details", faq: "FAQ", quote: "Request a quote", home: "Back to games" },
      services: { eyebrow: "AURORA SERVICES", title: "Choose support around your goals.", description: "Each request is organised first; unconfirmed pricing is referred to a person.", quote: "Request a quote" },
      guideEyebrow: "MALAYSIA",
      guideCta: "Organise details and request a quote",
      details: { eyebrow: "GAME DETAILS", title: "Information specific to HOK Global.", lanes: "Lanes", marks: "Hero power marks" },
      process: { eyebrow: "HOW IT WORKS", title: "A clear process from enquiry to confirmation." },
      processSteps: [
        ["01", "Choose support", "Tell us your game, rank, server and goal."],
        ["02", "Organise the request", "Aurora checks your details and any available pricing rules."],
        ["03", "Confirm on WhatsApp", "Confirm timing, requirements and the quote before starting."],
        ["04", "Receive follow-up", "Continue under the agreed arrangement and keep important updates."],
      ],
      faq: { eyebrow: "FREQUENTLY ASKED", title: "What to know before you enquire." },
      related: { eyebrow: "EXPLORE AURORA", title: "View other game pages.", description: "Each game keeps its own ranks, lanes and marks.", view: "View page" },
      cta: { eyebrow: "PRIVATE ENQUIRY", title: "Tell Aurora your goal.", description: "Organise your game details, then confirm through WhatsApp.", manual: "Request a quote", support: "Ask Aurora Support" },
      footer: "Mobile game services for Malaysia, Hong Kong, Taiwan and Macau",
    },
  },
  {
    ...malaysiaHokShared,
    slug: "my/zh-cn/honor-of-kings",
    canonical: "https://auroraesportstudio.com/my/zh-cn/honor-of-kings/",
    language: "zh-Hans-MY",
    seoTitle: "KLG Studio 马来西亚 HOK 陪玩、教学与复盘｜Aurora",
    seoDescription:
      "KLG Studio 是 Aurora Esports Studio 的游戏服务品牌，为马来西亚玩家提供 Honor of Kings 陪玩、英雄教学、对局复盘及第一视角教学查询。",
    eyebrow: "HONOR OF KINGS · 马来西亚",
    title: "面向马来西亚玩家的 Honor of Kings 游戏服务",
    intro: "按你的目标选择陪玩、教学或复盘。Aurora 会先整理需求，再通过 WhatsApp 确认安排。",
    imageAlt: "Aurora Esports Studio 的 Honor of Kings 战区前十记录",
    audience: "马来西亚 Honor of Kings 玩家",
    searchGuide: {
      title: "马来西亚 HOK 陪玩、教学及对局复盘",
      paragraphs: [
        "Aurora Esports Studio 运营 KLG 游戏服务官方网站。本页面以简体中文说明马来西亚 Honor of Kings 服务。",
        "玩家可以查询双排陪玩、排位教学、对局复盘、第一视角教学或英雄教学。每项需求会按当前段位、东南亚服务器、英雄和合适时间整理。",
        "我们不会保证胜利、固定胜率或指定排名结果。没有正式价格规则的服务会交由真人确认，系统不会自行生成金额。",
      ],
    },
    serviceCards: [
      { id: "duo", category: "陪玩", title: "双排陪玩", description: "与有经验的玩家一起游戏，获得清楚沟通及有规划的游戏体验。" },
      { id: "other", category: "教学", title: "排位教学", description: "了解地图观念、英雄选择、分路及对局决策。" },
      { id: "other", category: "复盘", title: "对局复盘", description: "查看你的对局或录像，找出可以实际改善的地方。" },
      { id: "other", category: "教学", title: "第一视角教学", description: "观看第一视角游戏过程，并听取关键决策说明。" },
      { id: "other", category: "英雄", title: "英雄教学", description: "按指定英雄、分路和目前水平提供针对性指导。" },
    ],
    rankSummary: "通过 Aurora 中央游戏配置支持 HOK 国际服从青铜至传奇王者段位。",
    lanes: ["对抗路", "打野", "中路", "发育路", "辅助"],
    marks: ["铜标", "银标", "金标", "小国标", "大国标", "红标"],
    priceNotice: "特殊要求及没有正式价格规则的服务会交由 Aurora 客服真人确认。",
    faqs: [
      { question: "马来西亚属于东南亚服务器吗？", answer: "是。Aurora 表单会把马来西亚归入东南亚服务器大区。" },
      { question: "可以查询哪些 HOK 服务？", answer: "你可以查询双排陪玩、排位教学、对局复盘、第一视角教学及英雄教学。" },
      { question: "服务会保证胜利或结果吗？", answer: "不会。结果会受匹配、段位、英雄及对局情况影响。" },
      { question: "价格如何确认？", answer: "网站只使用 Aurora 已批准的价格规则，其他需求会显示等待真人确认。" },
      { question: "马来西亚玩家怎样联络 Aurora？", answer: "填写查询表后，可以通过 WhatsApp 确认资料。" },
    ],
    ui: {
      navigation: { label: "页面导航", services: "服务", details: "游戏资料", faq: "常见问题", quote: "查询报价", home: "返回游戏列表" },
      services: { eyebrow: "AURORA 服务", title: "按你的目标选择服务。", description: "网站会先整理需求；尚未确认的价格会交由真人处理。", quote: "查询报价" },
      guideEyebrow: "马来西亚",
      guideCta: "整理游戏资料并查询报价",
      details: { eyebrow: "游戏资料", title: "只显示 HOK 国际服适用的资料。", lanes: "指定位置／分路", marks: "英雄战力标" },
      process: { eyebrow: "查询流程", title: "从查询到确认，每一步都清楚。" },
      processSteps: [
        ["01", "选择服务", "填写游戏、段位、服务器和目标。"],
        ["02", "整理需求", "Aurora 会检查资料和现有价格规则。"],
        ["03", "WhatsApp 确认", "开始前确认时间、要求和报价。"],
        ["04", "跟进安排", "按已确认方式进行，并保留重要进度。"],
      ],
      faq: { eyebrow: "常见问题", title: "查询前需要了解的内容。" },
      related: { eyebrow: "探索 AURORA", title: "查看其他游戏页面。", description: "每款游戏使用独立段位、分路及战力标。", view: "查看页面" },
      cta: { eyebrow: "专属查询", title: "告诉 Aurora 你的目标。", description: "先整理游戏资料，再通过 WhatsApp 确认。", manual: "查询报价", support: "询问 Aurora 客服" },
      footer: "服务马来西亚、香港、台湾及澳门的手机游戏玩家",
    },
  },
]);

export function getGameLandingPageById(gameId) {
  return gameLandingPages.find((page) => page.gameId === gameId) ?? null;
}

export function getGameLandingPageBySlug(slug) {
  return gameLandingPages.find((page) => page.slug === String(slug || "").replace(/^\/+|\/+$/g, "")) ?? null;
}
