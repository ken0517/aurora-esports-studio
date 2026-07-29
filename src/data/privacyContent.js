const zhHK = {
  banner: {
    title: "你的私隱選擇",
    body: "Aurora 只使用必要儲存資料來維持網站運作。你可選擇是否允許匿名分析，以協助我們了解網站使用情況。",
    acceptAll: "接受所有項目",
    rejectNonEssential: "拒絕非必要項目",
    manageSettings: "管理設定",
  },
  settings: {
    title: "Cookie 與私隱設定",
    necessary: "必要儲存資料",
    necessaryDescription: "這些資料用於記住你的私隱選擇及維持網站基本功能，不能關閉。",
    analytics: "匿名分析",
    analyticsDescription: "讓我們以匯總方式了解哪些頁面和功能較有用；不會用於廣告個人化。",
    saveSettings: "儲存設定",
    close: "關閉",
  },
  links: {
    privacyNotice: "私隱聲明",
    cookieSettings: "Cookie 設定",
  },
  inlineNotice: "提交資料或使用 Aurora 客服前，請勿分享密碼、驗證碼或其他敏感帳戶資料。",
  policy: {
    title: "私隱聲明",
    introductionHeading: "我們如何處理資料",
    body: "Aurora Esports Studio 會在提供查詢、報價及客戶服務時處理你主動提交的聯絡和服務資料。我們只會為回覆查詢、安排服務、維持網站安全及遵守適用法律而使用這些資料。必要儲存資料會保存你的私隱選擇；如你同意，我們亦會使用不識別個人的匯總分析資料以改善網站。你可隨時在 Cookie 設定中更改分析選擇。",
    contactHeading: "聯絡我們",
    contactBody: "如對私隱或資料處理有疑問，請透過 Aurora 官方聯絡渠道與我們聯絡。",
  },
};

const en = {
  banner: {
    title: "Your privacy choices",
    body: "Aurora uses necessary storage to keep the site working. You can choose whether to allow anonymous analytics that help us understand site use.",
    acceptAll: "Accept all",
    rejectNonEssential: "Reject non-essential",
    manageSettings: "Manage settings",
  },
  settings: {
    title: "Cookie and privacy settings",
    necessary: "Necessary storage",
    necessaryDescription: "This stores your privacy choice and supports essential site functions. It cannot be switched off.",
    analytics: "Anonymous analytics",
    analyticsDescription: "Helps us understand, in aggregate, which pages and features are useful. It is not used for advertising personalisation.",
    saveSettings: "Save settings",
    close: "Close",
  },
  links: {
    privacyNotice: "Privacy notice",
    cookieSettings: "Cookie settings",
  },
  inlineNotice: "Before submitting information or using Aurora Support, do not share passwords, verification codes, or other sensitive account information.",
  policy: {
    title: "Privacy notice",
    introductionHeading: "How we handle information",
    body: "Aurora Esports Studio processes the contact and service information you choose to submit when providing enquiries, quotes, and customer support. We use it only to reply to enquiries, arrange services, keep the site secure, and meet applicable legal obligations. Necessary storage keeps your privacy choice. If you agree, we also use aggregated, non-identifying analytics to improve the site. You can change your analytics choice at any time in Cookie settings.",
    contactHeading: "Contact us",
    contactBody: "For questions about privacy or information handling, contact us through Aurora's official contact channels.",
  },
};

const zhCN = {
  banner: {
    title: "你的隐私选择",
    body: "Aurora 仅使用必要存储来维持网站运行。你可以选择是否允许匿名分析，以帮助我们了解网站的使用情况。",
    acceptAll: "接受所有项目",
    rejectNonEssential: "拒绝非必要项目",
    manageSettings: "管理设置",
  },
  settings: {
    title: "Cookie 与隐私设置",
    necessary: "必要存储",
    necessaryDescription: "这些数据用于记住你的隐私选择并维持网站基本功能，不能关闭。",
    analytics: "匿名分析",
    analyticsDescription: "帮助我们以汇总方式了解哪些页面和功能更有用；不会用于广告个性化。",
    saveSettings: "保存设置",
    close: "关闭",
  },
  links: {
    privacyNotice: "隐私声明",
    cookieSettings: "Cookie 设置",
  },
  inlineNotice: "提交资料或使用 Aurora 客服前，请勿分享密码、验证码或其他敏感账户资料。",
  policy: {
    title: "隐私声明",
    introductionHeading: "我们如何处理资料",
    body: "Aurora Esports Studio 会在提供咨询、报价及客户服务时处理你主动提交的联系和服务资料。我们只会为回复咨询、安排服务、维护网站安全及遵守适用法律而使用这些资料。必要存储会保存你的隐私选择；如你同意，我们也会使用不识别个人的汇总分析资料来改善网站。你可以随时在 Cookie 设置中更改分析选择。",
    contactHeading: "联系我们",
    contactBody: "如对隐私或资料处理有疑问，请通过 Aurora 官方联系渠道联系我们。",
  },
};

export const privacyContent = {
  "zh-HK": zhHK,
  en,
  "zh-CN": zhCN,
};

export function normalizePrivacyLocale(locale) {
  const value = String(locale || "").trim().toLowerCase();
  if (value === "zh-hant" || value.startsWith("zh-hk") || value.startsWith("zh-tw")) return "zh-HK";
  if (value === "zh-hans" || value.startsWith("zh-cn") || value.startsWith("zh-sg")) return "zh-CN";
  if (value.startsWith("en")) return "en";
  return "zh-HK";
}
