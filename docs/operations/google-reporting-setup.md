# Aurora 後台 Google 數據連接

Aurora 後台已準備以唯讀方式顯示最近完整 28 日的 Google Analytics 與 Search Console 數據，包括訪客、來源、平均停留時間、重要活動、HOK 頁面及 Google 搜尋字詞。

## 上線前需要完成的 Google 授權

1. 在 Google Cloud 建立專用服務帳戶，不要使用私人 Google 密碼。
2. 在 Google Analytics 將該服務帳戶電郵加入資源，權限只設為「檢視者」。
3. 在 Search Console 將同一電郵加入 `auroraesportstudio.com` 資源，使用可讀取成效資料的最低權限。
4. 只在 Vercel 後端加入下列環境變數：
   - `GOOGLE_ANALYTICS_PROPERTY_ID`
   - `GOOGLE_SEARCH_CONSOLE_SITE_URL`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
5. 重新部署 Vercel 後端；不需要把任何密鑰放進前端或 GitHub。

若尚未完成授權，後台會如實顯示「Google 數據尚未連接」，不會假裝有數據，也不影響查詢及訂單功能。

## 轉化追蹤

網站會在報價查詢成功保存後記錄 `enquiry_submitted`，並繼續記錄 WhatsApp、LINE 及其他聯絡按鈕。應在 Google Analytics 把 `enquiry_submitted` 設為重要活動，之後才能用「完成查詢」衡量廣告及各來源成效。

## 安全原則

- Google 權限只讀。
- 私鑰只存在 Vercel 後端環境。
- 不在瀏覽器、網址、報價摘要或管理畫面顯示私鑰。
- 不把訪客的密碼、驗證碼或付款資料送到 Google。
