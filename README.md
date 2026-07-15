# Aurora Esports Studio

Aurora Esports Studio 的单页网站，服务香港及台湾玩家，支持：

- 《传说对决》／Arena of Valor
- 《王者荣耀》国服
- Honor of Kings／《王者荣耀》国际服

网站包含三语界面、确定性报价表、搜索建议、WhatsApp 摘要，以及由安全后端提供的 Gemini AI 顾问。

## 技术栈

- React + Vite
- Framer Motion
- Lucide React
- Google Gen AI JavaScript SDK：`@google/genai`
- Node.js HTTP Backend
- Node Test Runner + ESLint

## 主要结构

```text
src/
  App.jsx
  components/
    QuoteAssistant.jsx
    ServicesEditorial.jsx
  data/
    gameConfig.js       # 三个游戏共用的中央配置
    pricing.js          # 唯一正式定价资料源
    ranks.js            # 中央配置的兼容入口
    suggestions.js
    translations.js
  lib/
    quoteEngine.js      # 确定性服务器／前端共用报价规则
server/
  quote-ai-handler.mjs  # Gemini、安全限制、函数调用
  quote-ai-server.mjs
test/
  game-config.test.mjs
  quote-engine.test.mjs
  quote-ai-handler.test.mjs
```

## 本地启动

安装依赖并启动网站：

```bash
npm install
npm run dev
```

开发服务器通常位于 `http://localhost:4173/`。

### Gemini AI 顾问

API Key 只允许由 Node Backend 读取，绝不能放入 React、Vite 变量或提交到 Git。

1. 复制 `.env.example` 为 `.env.local`。
2. 在 `.env.local` 填写：

```dotenv
GEMINI_API_KEY=你的本地Key
GEMINI_MODEL=gemini-3.1-flash-lite
```

3. 在第二个终端启动 AI Backend：

```bash
npm run ai:server
```

本地前端使用 `http://localhost:8787/api/quote-ai`。没有 Key 时，网站会如实显示 AI 尚未连线，左边的报价表仍然可以正常使用。

不要为 Gemini Key 使用任何 `VITE_` 前缀，也不要把真实 Key 发送到聊天、浏览器或 GitHub。

## 检查命令

```bash
npm run lint
npm test
npm run build
```

## 报价安全

目前尚未提供 Aurora 的正式价目表，因此 `src/data/pricing.js` 中所有金额均为 `null`，规则保持 `configured: false`。

在正式价格录入前：

- 报价引擎不会估算或编造金额；
- 完整订单会返回 `manual_review`；
- 页面及 WhatsApp 摘要显示「待人工确认」；
- Gemini 只负责理解与整理需求；
- 金额只能来自服务器的正式报价函数。

正式价格只能在 `src/data/pricing.js` 更新。人工核准整份价目表后，才可同时启用目录总开关及对应规则开关。

## 生产部署

`npm run build` 只会产生静态前端。GitHub Pages 不能运行 Node Backend，因此正式上线 AI 功能还需要：

1. 将 `server/quote-ai-handler.mjs` 和 `server/quote-ai-server.mjs` 部署到可运行 Node.js 的 HTTPS 服务；
2. 在该服务的服务器环境变量中设置 `GEMINI_API_KEY` 与 `GEMINI_MODEL=gemini-3.1-flash-lite`；
3. 通过 `AI_ALLOWED_ORIGINS` 允许正式网站来源；
4. 将 `VITE_QUOTE_AI_ENDPOINT` 指向部署后的 `/api/quote-ai`（如果前后端不同域）；
5. 验证 `/api/quote-ai/status`、CORS、速率限制和超时处理。

Backend 未部署和验证前，不应宣称 Gemini AI 已在正式网站上线。

## 上线前仍需确认

- 录入 Aurora 正式核准的价格、附加费、折扣和完成时间；
- 复核运营数据、玩家评价及服务政策；
- 按各游戏当前条款审查账号相关服务；
- 确认正式域名后设置绝对 Open Graph 图片 URL；
- 在 Desktop 与 Mobile 上完成真实 Backend 的端到端验收。
