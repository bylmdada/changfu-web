# 宜蘭縣長期照護及社會福祉推廣協會官方網站專案說明

這是一個為宜蘭縣長期照護及社會福祉推廣協會設計的現代化、響應式官方網站。本專案採用純前端架構（HTML/CSS/JS），搭配 JSON 資料驅動內容，目標是提供一個高效、易維護且具備高無障礙標準的資訊平台。

## ✨ 專案特色

- **資料驅動 (Data-Driven)**：核心內容（如新聞、據點、服務項目）皆透過 `data/site-data.json` 管理，無需修改 HTML 即可更新內容。
- **UI/UX Pro Max 設計**：
  - **溫暖視覺**：採用柔和暖色系漸層與現代化排版。
  - **玻璃擬態 (Glassmorphism)**：Header 與元件採用毛玻璃效果。
  - **微互動**：卡片懸浮、按鈕回饋與滾動揭示動畫 (ScrollReveal)。
- **無障礙友善 (Accessibility)**：
  - 內建 **A11y 工具列**（字體放大、高對比模式）。
  - 完整的 ARIA 標籤與鍵盤導航支援。
- **響應式設計 (RWD)**：完美支援手機、平板與桌上型電腦。

## 🚀 快速開始

### 1. 環境準備

本專案為靜態網站，但由於使用了 `fetch` API 讀取 JSON 資料，**強烈建議**透過本地網頁伺服器 (Local Web Server) 運行，以避免瀏覽器的 CORS 安全限制問題。

您可以使用任何靜態伺服器軟體，以下以 Python 為例（Mac/Linux 系統通常已內建）。

### 2. 啟動專案

打開終端機 (Terminal)，進入專案資料夾：

```bash
cd "/Users/feng/Desktop/changfu web"
```

啟動 Python 簡易伺服器：

```bash
# Python 3 (推薦)
python3 -m http.server 8080
```

### 3. 瀏覽網站

打開瀏覽器，訪問以下網址：

[http://localhost:8080](http://localhost:8080)

## 📂 專案結構

```
changfu web/
├── index.html          # 首頁
├── about.html          # 關於我們
├── services.html       # 核心業務
├── news.html           # 最新消息
├── courses.html        # 課程訓練
├── jobs.html           # 招募徵才
├── contact.html        # 聯絡我們
├── css/
│   └── style.css       # 全站樣式表 (包含 CSS Variables 設計系統)
├── js/
│   └── main.js         # 主要邏輯 (資料載入、元件渲染、互動功能)
└── data/
    └── site-data.json  # 網站核心資料庫 (JSON 格式)
```

## 📝 如何維護與更新

### 更新網站內容 (新聞、據點、服務)
直接編輯 `data/site-data.json` 檔案。

- **新增新聞**：在 `news` 陣列中加入新的物件。
- **修改據點**：在 `serviceLocations` 中修改據點資訊。
- **調整組織資訊**：修改 `organization` 物件內的電話、地址等。

### 修改樣式 (CSS)
編輯 `css/style.css`。

- **全站配色/字體**：修改檔案頂部的 `:root` 變數區塊。
- **無障礙設定**：搜尋 `Accessibility` 相關註解區塊。

## 🛠 技術堆疊

- **核心**：HTML5, CSS3, JavaScript (ES6+)
- **資料交換**：JSON
- **外部依賴**：
  - Google Fonts (Noto Sans TC)
  - (本專案無使用 jQuery 或其他大型框架，保持輕量化)

---
© 2026 社團法人宜蘭縣長期照護及社會福祉推廣協會
