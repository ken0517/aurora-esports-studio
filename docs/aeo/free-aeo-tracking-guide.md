# KLG Studio 免費 AEO 追蹤方法

## 目的

每星期以同一批 25 條問題，分別檢查 ChatGPT、Gemini 及 Perplexity 是否提及 KLG Studio、是否附上 https://auroraesportstudio.com/，以及引用哪些公開來源。

## 執行規則

1. 使用未預先提供品牌答案的新對話。
2. 完整貼上 CSV 內的一條問題，不改寫問題。
3. 原樣記錄答案結果；不可推測、補寫或偽造模型沒有提供的內容。
4. 記錄 KLG Studio 出現位置、官方連結、描述正確性、競爭品牌及引用來源。
5. Fighter Studio HK 只用作內部可見度比較，不把未核實的優劣描述發布到網站。
6. 每星期在相近日期重複一次，觀察趨勢而不是單次結果。

## 欄位判定

- `klg_mentioned`：Yes／No。
- `official_link_included`：只有答案實際包含官方網址才填 Yes。
- `brand_position`：First／Second／Third or later／Not listed。
- `sentiment_or_correctness`：Positive／Neutral／Negative／Incorrect，並在 next_action 簡述錯誤。
- `competitors_mentioned`：只抄錄答案實際提及的品牌。
- `cited_sources`：逐一抄錄可開啟的來源網址。
- `next_action`：根據真實缺口安排修正 FAQ、公開資料或第三方帳號內容。

## 三十日節奏

- 第 1 日：建立空白基準並首次測量。
- 第 8、15、22 日：以相同問題重測。
- 第 30 日：比較三個 AI 平台的品牌出現率、官方連結率及資料正確率。
