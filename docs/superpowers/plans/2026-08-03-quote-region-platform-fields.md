# Aurora 報價地區與平台欄位實施計劃

> 執行時遵守測試先行：每一階段先加入會失敗的測試，確認失敗原因，再作最小修改令其通過。

## 1. 中央遊戲配置

- 修改 `src/data/gameConfig.js`，加入三組中央選項與查詢／本地化 helper。
- 修改 `test/game-config.test.mjs`，驗證各遊戲只暴露正確選項，且 HOK 國際服恰好為六個大區。

## 2. 報價資料與伺服器驗證

- 修改 `src/lib/quoteEngine.js`，加入草稿欄位、條件式必填、合法選項檢查與聯絡摘要。
- 修改 `test/quote-engine.test.mjs`，覆蓋所有服務、跨遊戲偽造值、缺少欄位及摘要文字。

## 3. 手動報價介面

- 修改 `src/components/QuoteAssistant.jsx`，按遊戲／服務顯示欄位，切換時清除不適用值，結果頁顯示已選資料。
- 修改 `src/data/translations.js`，補齊繁體中文、英文及簡體中文標籤與錯誤提示。
- 更新相關介面契約測試，確保手機與桌面沿用現有響應式表單。

## 4. Aurora 客服與營運資料

- 修改 `server/quote-ai-handler.mjs`，把新增欄位加入安全白名單、Gemini 工具定義及中央遊戲內容。
- 檢查查詢／訂單正規化與後台詳情；只在現有白名單阻擋欄位時作最小修改。
- 更新 AI、查詢與營運測試，驗證客戶輸入不能混用其他遊戲的選項。

## 5. 驗證

- 執行聚焦測試：遊戲配置、報價引擎、AI、查詢及營運後台。
- 執行完整 `npm test`、`npm run lint` 與 `npm run build`。
- 檢查桌面與手機表單操作，確認切換遊戲、切換服務、WhatsApp／LINE 摘要與後台資料一致。
