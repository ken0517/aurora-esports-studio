# Aurora Esports Studio

Aurora Esports Studio 的单页网站，以香港为主要市场，同时服务台湾及澳门玩家，支持：

- 《传说对决》／Arena of Valor
- 《王者荣耀》国服
- Honor of Kings／《王者荣耀》国际服

网站包含三语界面、确定性报价表、搜索建议、WhatsApp 摘要、安全 Gemini 客服，以及可登录的价格／时间管理后台。

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
  AdminApp.jsx             # /admin 管理后台
  components/
    QuoteAssistant.jsx
    ServicesEditorial.jsx
  data/
    gameConfig.js       # 三个游戏共用的中央配置
    pricing.js          # 唯一正式定价资料源
    runtimeCatalog.js   # 后台动态目录的白名单与校验
    ranks.js            # 中央配置的兼容入口
    suggestions.js
    translations.js
  lib/
    quoteEngine.js      # 确定性服务器／前端共用报价规则
server/
  admin-auth.mjs        # 签名会话、密码校验
  admin-api.mjs         # 公开目录与管理员 API
  catalog-store.mjs     # Vercel KV / Upstash Redis 持久化
  quote-ai-handler.mjs  # Gemini、安全限制、函数调用
  quote-ai-server.mjs
test/
  admin-backend.test.mjs
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

## 管理后台

后台地址为 `/admin`。管理员可以分别管理三款游戏的五类服务：

- 修改公开价格、币种、价格后缀和预计完成时间；
- 填写客户可见备注及全站公告；
- 上架或隐藏单项服务；
- 决定已获核准的固定价格是否进入自动报价；
- 保存后由前台和服务器 AI 报价读取同一份动态目录。

本地 Vite 只负责前端页面。需要完整测试后台 API 时，使用 Vercel Dev 或部署到 Vercel。生产环境先运行：

如需在本机连同 API 预览，先在 `.env.local` 配置管理员变量，并仅在本地设置 `AURORA_ALLOW_MEMORY_STORAGE=true`，然后运行：

```bash
npm run build
npm run preview:full
```

本地内存目录会在进程结束后消失，只用于界面与流程测试。

生产环境先运行：

```bash
npm run admin:secrets
```

妥善保存命令输出的一次性管理员密码，并把 `AURORA_ADMIN_PASSWORD_SHA256` 与 `AURORA_ADMIN_SESSION_SECRET` 加入 Vercel 的 Production 环境变量。密码和会话密钥绝不能使用 `VITE_` 前缀。

目录优先支持 Vercel 原生 Private Blob，也兼容 Vercel Marketplace 的 Upstash Redis。连接 Private Blob 后，Vercel 会自动提供 `BLOB_STORE_ID` 与短期 OIDC 凭据；如果使用 Redis，则必须存在以下其中一组：

```dotenv
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# 或
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

没有持久化数据库时，后台仍可打开预览，但会禁止发布，避免让管理员误以为资料已经永久保存。`AURORA_ALLOW_MEMORY_STORAGE=true` 只供本地测试，不能用于生产。

## 报价安全

初始目录不包含任何假设价格，所有金额均为 `null`，规则保持 `configured: false`。

在正式价格录入前：

- 报价引擎不会估算或编造金额；
- 完整订单会返回 `manual_review`；
- 页面及 WhatsApp 摘要显示「待人工确认」；
- Gemini 只负责理解与整理需求；
- 金额只能来自服务器的正式报价函数。

正式价格由管理员在 `/admin` 录入。公开显示价格与自动报价是两个独立选择：未开启自动报价时，价格可展示给客户，但详细订单仍会转人工确认。英雄战力和其他定制服务始终保留人工确认。

## 生产部署

为了让后台使用安全的同源 HttpOnly Cookie，正式环境推荐把前端和 Functions 一起部署到同一个 Vercel 项目。GitHub Pages workflow 仍可作为公开前台备用，但后台应在 Vercel 域名使用。

1. 从 GitHub 导入项目到 Vercel；Framework Preset 选择 Vite；
2. 连接 Upstash Redis / Vercel KV，并确认 REST URL 与 Token 已注入；
3. 设置上述管理员环境变量；
4. 如需 AI 客服，再设置 `GEMINI_API_KEY`、`GEMINI_MODEL=gemini-3.1-flash-lite`、`AI_ALLOWED_ORIGINS=https://你的正式域名` 与 `AI_TRUST_PROXY=true`；
5. 部署后检查 `/api/catalog`、`/api/quote-ai/status` 和 `/admin`；
6. 登录后台录入已核准价格，发布后用无痕窗口检查前台。

若继续用 GitHub Pages 展示前台，请把仓库变量 `VITE_AURORA_API_BASE_URL` 指向 Vercel 域名。公开目录支持跨域读取，但管理员登录仍应直接在 Vercel 同源 `/admin` 完成。

GitHub Pages 的 `/admin/` 会在构建时生成一个无索引跳转页，默认安全跳转到 `https://aurora-esports-api.vercel.app/admin`。如 Vercel 项目域名改变，请设置 GitHub 仓库变量 `VITE_AURORA_ADMIN_URL`。

## Google 搜寻与访客统计

正式域名已经通过 Google Search Console 管理，并使用 `https://auroraesportstudio.com/sitemap.xml` 提交公开页面。Google 是否以及何时显示页面由 Google 决定，提交索引不代表保证排名。

如要启用 Google Analytics 4，请在 GitHub 仓库变量中设置公开变量 `VITE_GA_MEASUREMENT_ID`（格式为 `G-XXXXXXXXXX`）。网站只记录页面浏览、报价入口、报价结果状态及联络渠道；不会把顾客填写的段位、英雄、留言、聊天内容、电话号码或付款资料传送到 Google。未设置时统计功能会自动停用，不影响网站使用。

Backend 未部署和验证前，不应宣称 Gemini AI 已在正式网站上线。

## 上线前仍需确认

- 连接生产数据库并生成管理员凭据；
- 在后台录入 Aurora 正式核准的价格和完成时间；
- 复核运营数据、玩家评价及服务政策；
- 按各游戏当前条款审查账号相关服务；
- 确认正式域名后更新 canonical、sitemap 与 Open Graph 图片 URL；
- 在 Desktop 与 Mobile 上完成真实 Backend 的端到端验收。
