# AEO／GEO 準備度檢查與優化

檢查日期：2026-09-19。範圍：長福會靜態官網。截圖為問題線索；不把第三方分數當成搜尋引擎的評分，也未推算優化後分數。

| 面向 | 原始缺口 | 本次完成／驗證 |
| --- | --- | --- |
| 爬取性 | 首頁服務、首頁／聯絡頁據點、服務頁據點只有 JS 渲染；`.reveal` 預設透明 | 使用現有 renderer 產生靜態 HTML；內容預設可見；JS 或 JSON 失敗仍保留已發布內容 |
| 答案式內容 | 首屏為標語，沒有直接服務摘要 | 首屏直接交代組織、地區、服務及電話；新增三段獨立摘要及來源連結 |
| 常見問答 | 首頁、服務頁、關於頁有 FAQPage，正文沒有對應問答 | 5＋3＋2 共 10 組可見問答，從同頁 JSON-LD 同步產生，附可引用錨點及來源 |
| 結構化資料 | 組織標為 LocalBusiness；額外社群網址、座標缺乏一致證據；成立年份正文僅標示「約」 | 使用 Organization 與既有實體 ID；移除未確認 sameAs、座標與精確 foundingDate，保留既有 Service／Breadcrumb |
| 可引用性 | 服務及聯絡資訊散落，輔具中心電話不一致 | 摘要／問答同段附來源，依中心官網同步電話、時間；移除未有資料支持的預設服務統計 |
| Agent 資源 | llms 信箱與網站不同，全文含易過時的課程名額／免費／薪資 | 從網站資料及 FAQ 產生 llms.txt、llms-full.txt；課程與招募導向原頁，不固定複製時效資訊 |
| 導覽 | 兩個服務卡片錨點與服務頁 ID 不符 | 修正失智、輔具服務錨點；驗證全站 HTML 靜態內部連結 |

## 驗證結果

- `python3 scripts/check-search-readiness.py`：7 頁 canonical／單一 H1、10 組問答與 schema 對應、7 個靜態據點、內部連結、9 筆 sitemap URL，以及 6 種 agent robots 政策通過。
- `node scripts/sync-search-content.cjs --check`：靜態卡片、可見 FAQ、LLM 文件無同步落差。
- `node --check js/main.js` 與 `git diff --check` 通過。
- 使用現有 Playwright：390px 手機寬度、首頁／服務／關於／聯絡四頁，在 JavaScript 開啟及停用時通過；無水平溢出、無頁面 JS 例外，FAQ 可見；據點篩選仍可運作。
- 1440px 桌面及 JSON 請求失敗情境：保留 3 個服務、7 個據點。
- 正式站基線：首頁一般請求、OAI-SearchBot、PerplexityBot User-Agent 請求皆 HTTP 200，robots.txt 允許 `*`。僅測試自有請求端點，不是官方 crawler IP，不能證明 Cloudflare 對官方 IP 的策略或實際收錄。
- 本次修改尚未部署；上述新版驗證在本機完成。正式站目前仍為原版本，未重跑截圖中的第三方評分工具。

## 維護方式

修改 `data/site-data.json`、卡片 renderer 或頁面 FAQ JSON-LD 後，執行：

```sh
node scripts/sync-search-content.cjs
python3 scripts/check-search-readiness.py
```

將產生的 HTML 與 llms 文件一起發布。FAQ 文案以各頁 JSON-LD 為編輯來源，生成可見正文；避免只修改生成區塊。服務摘要、手寫服務介紹及 sitemap 的修改日期仍需隨實際內容更新，不應每次部署都更新日期。

## 尚待驗證與下一步

- AI 可見度的實際成效待部署後，用固定查詢（例如「宜蘭冬山日間照顧」、「長福會失智據點」、「宜蘭溪北輔具借用」）記錄 ChatGPT／Perplexity 的查詢時間、回答、引用 URL；搭配站方存取紀錄與 Search Console 追蹤。沒有實際引用樣本，不能宣稱排名或引用率提升。
- 最新消息、課程與職缺仍依賴 JS；本次優先處理可長期引用的組織／服務／據點。若要讓個別消息與招生被引用，再補獨立內容 URL 與靜態正文，避免將 CMS 即時資訊複製成失效快照。
- 協會成立年份、登記資料、信箱與各非輔具據點資訊仍以 repo 既有資料為基礎，未外部重新查證；沒有新增認證、醫療成效或資格保證。輔具中心電話／時間已依中心官網核對。

## 官方依據

- [OpenAI crawler 說明](https://developers.openai.com/api/docs/bots)：OAI-SearchBot 用於搜尋、GPTBot 用於訓練；ChatGPT-User 屬使用者發起的讀取，並非搜尋收錄開關。現有 wildcard 允許規則已涵蓋這些名稱，無需重複規則。
- [Perplexity crawler 說明](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)：PerplexityBot 用於搜尋；使用者發起的 Perplexity-User 與搜尋爬蟲不同；若受 WAF 阻擋，需檢查官方 IP 範圍。
- [Google AI 搜尋指引](https://developers.google.com/search/docs/appearance/ai-features)：重要資訊應有文字形式、結構化資料需與可見內容一致，無額外 AI 專用 schema 或文字檔要求；llms 文件僅作補充資源，不能保證收錄或引用。
- [宜蘭縣溪北輔具資源中心](https://yilanatrc.com.tw/)：官網公布電話 03-9320920，週一至週五 08:00–12:00／13:00–17:00，週三夜間 17:30–19:30 採預約制。
