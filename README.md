# 🧸 電競娃娃虛擬收藏室 · Esports Doll Showcase

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Free_Tier-3ECF8E?logo=supabase&logoColor=white" />
  <img alt="Fabric.js" src="https://img.shields.io/badge/Fabric.js-7-orange" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue" />
</p>

一個**開源、免費自架**的電競娃娃收藏展示網站。上傳照片、AI 自動去背、拖進場景拼圖，
把你的整櫃收藏變成一個可以分享給朋友的虛擬展示間 — 全程 **$0 成本**。

Fork 這個 repo，接上自己的 [Supabase](https://supabase.com) 免費專案，一鍵部署到
[Vercel](https://vercel.com)，就是你自己的收藏室。

---

## ✨ 核心亮點

- **$0 成本架構** — Next.js（Vercel 免費方案）+ Supabase（免費方案的 Postgres 與
  Storage）。沒有伺服器帳單，沒有月費。
- **瀏覽器端 AI 去背** — 使用 [`@imgly/background-removal`](https://github.com/imgly/background-removal-js)
  在使用者的瀏覽器裡跑 WASM 模型，圖片不需要上傳到任何第三方 API 就能去背，免費也保護隱私。
- **魔術筆（Magic Brush）手動修補** — AI 去背後難免會誤刪耳機、頭髮等細節。內建
  Canvas 筆刷工具：🟢 綠色筆刷強迫保留、🔴 紅色筆刷強迫去除，即時預覽合成結果。
- **一對多實體娃娃造型** — 一個娃娃檔案可以掛多張去背照片（預設 / 夏季穿搭 / 戰隊服…），
  前台就像電商切換商品規格一樣點擊切換造型。
- **虛擬收藏室場景拼圖** — 用 [Fabric.js](http://fabricjs.com/) 打造的畫布編輯器：上傳
  背景圖，把娃娃拖進場景，自由縮放、旋轉、調整圖層順序，儲存後訪客即可瀏覽。

---

## 🏗️ 技術架構

```
┌──────────────────────┐        ┌───────────────────────────┐
│   瀏覽器 (Client)      │        │        Vercel (Next.js)    │
│                        │        │                             │
│  Gallery / 造型切換     │◀──────▶│  App Router Server Components│
│  Fabric.js 場景畫布     │        │  Server Actions (CRUD)      │
│  @imgly 去背 + 魔術筆   │        │  Cookie-based Admin Session │
└──────────┬─────────────┘        └───────────────┬─────────────┘
           │  去背後的 PNG 直接上傳                    │  service_role（僅限已驗證管理員）
           ▼                                          ▼
                    ┌────────────────────────────────────┐
                    │              Supabase                │
                    │  Postgres：series / cabinets /       │
                    │    dolls / doll_variants / scenes    │
                    │  Storage：doll-images（公開 bucket） │
                    │  Row Level Security：公開唯讀         │
                    └────────────────────────────────────┘
```

**資料模型**

| 資料表 | 說明 |
| --- | --- |
| `series` | 自訂系列分類（如 A 系列） |
| `cabinets` | 收藏櫃 / 擺放位置（如 A 櫃） |
| `dolls` | 娃娃檔案，關聯系列與收藏櫃 |
| `doll_variants` | 一對多造型照片（去背後 PNG），前台可切換 |
| `scenes` | 虛擬收藏室場景：背景圖 + 畫布佈局 JSON（位置 / 縮放 / 旋轉 / 圖層順序） |

---

## 🛠️ 技術棧

| 分類 | 選用 |
| --- | --- |
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 樣式 / UI | Tailwind CSS 4 + shadcn/ui |
| 畫布 / 拖移 | Fabric.js |
| AI 去背 | `@imgly/background-removal`（瀏覽器端 WASM，無需後端） |
| 後端與儲存 | Supabase（Postgres + Storage，皆為免費方案） |
| 身份驗證 | 環境變數密碼 + HMAC 簽章 Cookie（無需額外服務） |
| 部署 | Vercel（免費方案） |

---

## 🚀 一鍵部署教學

### 1. 建立 Supabase 專案（免費）

1. 前往 [supabase.com](https://supabase.com) 建立新專案。
2. 打開 **SQL Editor**，貼上並執行本專案的 [`supabase/schema.sql`](./supabase/schema.sql)：
   會建立 `series`、`cabinets`、`dolls`、`doll_variants`、`scenes` 資料表、
   Row Level Security 規則，以及公開圖片 bucket `doll-images`。
3. 到 **Project Settings → API**，記下：
   - `Project URL`
   - `anon public` key
   - `service_role` key（⚠️ 保密，只用在伺服器端）

### 2. Fork 並部署到 Vercel

1. Fork 這個 repository。
2. 到 [vercel.com/new](https://vercel.com/new) 匯入你 fork 的 repo。
3. 設定環境變數（Project Settings → Environment Variables）：

   | 變數名稱 | 說明 |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `ADMIN_PASSWORD` | 你自訂的管理員登入密碼 |

4. 點擊 Deploy，等待建置完成即可開始使用！

### 3. 本機開發

```bash
git clone https://github.com/<your-username>/Collector.git
cd Collector
npm install
cp .env.example .env.local   # 填入上面四個環境變數
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 即可預覽，前往
`/login` 輸入 `ADMIN_PASSWORD` 進入管理後台。

---

## 📖 使用方式

1. **登入管理後台**（`/login`）→ 進入「庫存管理」。
2. 新增「系列」與「收藏櫃」分類，再新增娃娃檔案。
3. 進入娃娃詳細頁「新增造型」：上傳照片 → AI 自動去背 → 用魔術筆修補細節 → 儲存。
4. 前往「虛擬收藏室」建立場景、上傳背景圖，把娃娃拖進畫布擺出你的展示櫃，
   儲存佈局後點擊「發布」。
5. 訪客可在首頁瀏覽收藏、切換造型，並在 `/scenes` 檢視已發布的虛擬收藏室。

---

## 📄 授權

MIT License — 歡迎 Fork、修改、自架使用。
