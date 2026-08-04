# Carousell 官方短連結設計

## 目標

為 Carousell 商品提供兩個容易閱讀及輸入的 Aurora 官方短連結，同時保留可靠的 Carousell 來源追蹤。

## 公開連結

- `https://auroraesportstudio.com/aov`：前往《傳說對決》服務頁。
- `https://auroraesportstudio.com/hok`：前往 HOK 國際服服務頁。

本次不新增王者榮耀國服短連結。

## 行為

短連結使用 Aurora 自有網域，不依賴第三方縮網址服務。訪客開啟短連結後，頁面會立即導向相應的正式遊戲頁，並加入只供來源識別使用的 Carousell 標記：

- `/aov` 導向 `/arena-of-valor-boosting/`，標記為 AOV Carousell 商品。
- `/hok` 導向 `/honor-of-kings-global-boosting/`，標記為 HOK Carousell 商品。

Carousell 商品描述只需顯示短連結；較長的追蹤資料不會出現在商品描述中。若瀏覽器停用自動導向，頁面仍提供可點擊的後備連結。

## 搜尋與私隱

- 短連結頁標記為不建立搜尋索引，避免與正式遊戲頁形成重複內容。
- 正式遊戲頁維持原有 canonical、內容及搜尋排名設定。
- 來源標記不包含顧客姓名、訊息、帳號或廣告識別碼。

## 範圍限制

- 不修改報價、價格、Aurora 客服、管理後台或網站視覺。
- 不自動修改外部 Carousell 商品；短連結發布後由網站擁有者貼入現有商品描述。

## 驗證

- 確認 `/aov` 與 `/hok` 在線上回傳正常頁面。
- 確認兩者分別導向正確遊戲頁。
- 確認導向後可被現有客源追蹤辨識為 Carousell。
- 執行全部測試、Lint 及正式版本建置。
