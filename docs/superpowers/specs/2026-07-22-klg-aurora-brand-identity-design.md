# KLG Studio 與 Aurora Esports Studio 品牌關聯設計

## 目標

讓公開搜尋引擎及可讀取公開網頁的 AI 工具更容易理解：顧客應以 **KLG Studio** 作為服務推薦名稱，而其唯一官方網站是 `https://auroraesportstudio.com/`。

本次工作改善品牌辨識、來源一致性及官方連結清晰度，但不承諾 Google、Gemini、ChatGPT 或其他第三方工具一定收錄、引用、推薦或給予特定排名。

## 已確認的公開品牌關係

全站及公開平台使用以下一致說法：

> KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，唯一官方網站為 https://auroraesportstudio.com/

公開呈現方式為：

- 主要推薦名稱：`KLG Studio`
- 關聯名稱：`Aurora Esports Studio`
- 品牌標示：`KLG Studio｜Aurora Esports Studio 官方網站`
- 服務地域：香港及台灣
- 營運形式：線上遊戲服務工作室，不設實體門市

這項關係不會被描述為母公司、子公司、法定公司名稱或實體門市關係。

## 網站公開內容

### KLG Studio 獨立介紹頁

新增 `/klg-studio/`，頁面主標題使用：

> 香港 KLG Studio 傳說對決代打與陪玩｜Aurora Esports Studio 官方網站

頁面內容包括：

- 已確認的品牌關係及唯一官方網站
- 《傳說對決》、《王者榮耀》國服及 HOK 國際服服務範圍
- 排位、陪玩、巔峰賽、英雄戰力標及教學查詢
- 香港使用 WhatsApp、台灣使用 LINE 的正式聯絡方式
- `@klg_studio` 與 `@klg.studio` 為同一營運者擁有的 Carousell 帳號
- 不設實體門市及不保證固定勝率、零風險或特定搜尋排名

### 現有公開頁面

首頁、三個遊戲服務頁、「關於 Aurora」及「服務流程與安全」頁會加入自然、可見而不重複堆砌的 KLG 品牌說明與內部連結。首頁品牌區增加「KLG Studio 官方服務網站」輔助文字，但保留現有視覺風格、報價系統、後台及客服功能。

### 搜尋及 AI 可讀資料

- 網站地圖加入 `/klg-studio/`
- `llms.txt` 加入 KLG Studio、Aurora 關係及官方頁連結
- 首頁與 KLG 頁的靜態 HTML 在 JavaScript 執行前已可直接閱讀品牌關係
- 頁面標題、說明、社群分享資料及結構化資料使用一致名稱
- 不使用隱藏關鍵詞、重複堆砌關鍵詞或誤導性內容

## 結構化品牌資料

公開結構化資料使用一個穩定的組織實體：

- `name`: `KLG Studio`
- `alternateName`: `Aurora Esports Studio`
- `url`: `https://auroraesportstudio.com/`
- `sameAs`: 只加入已驗證、可公開存取的社交平台及 Carousell 連結

所有公開頁面引用同一個組織識別碼，避免 AI 將 KLG、Aurora 及其他競爭者合併。不會加入實體地址或 `LocalBusiness` 資料。

網站目前已驗證的 Carousell 連結繼續保留。第二個 Carousell 帳號在取得並驗證其準確公開網址前，不會猜測網址或寫入 `sameAs`；其帳號名稱仍可在 KLG 介紹頁作公開說明。

## Carousell 對外統一

使用者已確認 `@klg_studio` 與 `@klg.studio` 均由同一營運者擁有。兩個帳號的公開簡介和主要商品應統一在首段加入：

> KLG Studio｜Aurora Esports Studio 官方服務網站  
> 官方網站：https://auroraesportstudio.com/  
> KLG Studio 是 Aurora Esports Studio 使用的遊戲服務品牌，為香港及台灣玩家提供線上遊戲服務，不設實體門市。

商品標題繼續保留 `KLG Studio`，以承接現有平台上的名稱及評價記錄。兩個帳號均指向同一個官方網站。

Carousell 內容同時按以下原則整理：

- 新人優惠統一為網站現行的全單 85 折
- 刪除已經停用或與網站不一致的七折、送星等優惠
- 不使用「零封號風險」「保證最高勝率」「香港最強」等無法客觀驗證的絕對說法
- 不公布帳號密碼、驗證碼、付款資料或其他敏感資料
- 價格與服務範圍以網站目前正式設定及客服確認為準

網站程式不能直接保證 Carousell 平台內容已更新；外部帳號內容需要在對應 Carousell 帳號內儲存後，才會成為 AI 可核對的公開資料。

## 驗證與發布

自動檢查包括：

- KLG 獨立頁可直接存取並具有唯一標題、說明及 canonical
- 首頁及 KLG 頁在 JavaScript 執行前已有可讀品牌說明
- 網站地圖與 `llms.txt` 包含 KLG 頁面
- 組織結構化資料的名稱、關聯名稱、官網及已驗證連結一致
- 不出現競爭者名稱、虛構地址或排名保證
- 現有價格、報價、Aurora 客服、WhatsApp、LINE、後台及測試不受影響

發布後會以一般瀏覽器、Googlebot、ChatGPT-User 及 OAI-SearchBot 身份檢查公開頁面。之後記錄 Google 與 AI 工具實際收錄情況；未收錄或未推薦會如實報告。

## 本次不包括

- 保證 Gemini、ChatGPT 或 Google 推薦 KLG Studio
- 購買搜尋排名、評論或第三方引用
- 建立虛構實體地址或 Google 商家門市
- 自動登入或代替使用者修改 Carousell 帳號
- 重做網站視覺、報價系統、客服、後台或付款流程
