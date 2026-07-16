# Aurora 正式網域與 Google SEO 設計

**日期：** 2026-07-16  
**狀態：** 已獲網站擁有者批准執行第一階段

## 目標

將 Aurora Esports Studio 的正式入口改為 `https://auroraesportsstudio.com/`，保留現有 GitHub Pages 前台與 Vercel 後台，讓香港及台灣客人可透過正式網域瀏覽、查價及聯絡客服，並提交 Google Search Console 收錄。

## 網域與發布

- 主網址使用無 `www` 的 `https://auroraesportsstudio.com/`。
- `www.auroraesportsstudio.com` 指向同一網站並由平台轉往主網址。
- GitHub Pages 繼續負責公開網站；Vercel 繼續負責 AI、管理後台與資料服務。
- GitHub Pages 的正式版本改用網站根路徑建置，避免圖片、頁內連結及管理入口仍帶有舊專案子路徑。
- Namecheap 根網域設定 GitHub Pages 的四筆 A 記錄；`www` 設為指向 `ken0517.github.io` 的 CNAME。
- 網域在 GitHub Pages 設定完成後才更改 DNS；待憑證可用後啟用 HTTPS。

## SEO 與公開內容

- 所有 canonical、Open Graph、結構化資料、robots.txt 與 sitemap.xml 統一使用正式網址。
- 首頁標題與描述以繁體書面語呈現，主打香港市場並涵蓋台灣客人。
- 關鍵服務自然包含：傳說對決代打、王者榮耀代打、Honor of Kings／HOK、陪玩帶飛、巔峰賽、英雄戰力標、香港、台灣。
- 不堆砌隱藏關鍵字，不承諾排名或即時收錄，不虛構門市、地址、評價或價格。
- 結構化資料只描述現有服務、服務地區、語言與已公開的聯絡方式。

## Google 收錄

- 使用 Search Console 的「網域資源」，以 Namecheap DNS TXT 記錄驗證所有協定及子網域。
- 驗證後提交 `https://auroraesportsstudio.com/sitemap.xml`，並請求首頁重新建立索引。
- Google 是否及何時顯示網站由 Google 決定，通常需等待數天或更久；本階段只確保網站可被正常抓取及提交。
- 因工作室沒有可公開接待客人的實體地址，本階段不建立 Google 商家檔案。

## 後台、安全與跨網域

- 管理後台及 API 保持禁止搜尋引擎收錄。
- Gemini 金鑰及管理密碼只留在伺服器環境，不寫入前台、網域設定或版本庫。
- Vercel 正式環境允許新主網域與 `www` 網域存取，同時保留必要的舊網址作短期回退。
- 不公開個人地址、電話、付款資料或網域訂單資料。

## 驗證與回退

- 上線前執行全部自動測試、文字檢查及正式建置。
- 上線後檢查主網址、`www`、HTTPS、首頁圖片、報價表、AI 狀態、WhatsApp／LINE、手機排版、robots.txt 與 sitemap.xml。
- DNS 未完成傳播時，舊 GitHub Pages 網址仍可作暫時入口；不刪除現有部署。
- 若新網域出現問題，可暫時移除 Pages 自訂網域並恢復原本建置路徑，不影響後台資料。
