/**
 * 宜蘭縣長期照護及社會福祉推廣協會 官方網站
 * 主要 JavaScript 檔案
 */

// ============================================
// 全域變數與設定
// ============================================
let siteData = null;
const DATA_URL = "data/site-data.json";

// ============================================
// 初始化
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  // 初始化功能
  initHeader();
  initA11yWidget();
  initBackToTop();
  initMobileNav();
  initLocationFilters();

  // 載入資料並渲染（loadSiteData 內部會呼叫 renderAll 渲染所有區塊，
  // 各 render 結尾自帶 initScrollReveal，故此處不再重複呼叫）
  await loadSiteData();

  // 初始化靜態頁面功能
  initContactForm();
  initHeroStats();
});

// ============================================
// 資料載入
// ============================================
async function loadSiteData() {
  try {
    // 1. Fetch site data first (base)
    const response = await fetch("data/site-data.json");
    const data = await response.json();
    siteData = data;            // Update local module variable
    window.siteData = data;     // Also expose globally

    // 2. Try to fetch dynamic data from Google Sheets (if configured)
    if (window.API && window.CONFIG && window.CONFIG.useRemoteData) {
      const dynamicNews = await window.API.fetchData('news');
      if (dynamicNews && dynamicNews.length > 0) siteData.news = dynamicNews;

      const dynamicJobs = await window.API.fetchData('jobs');
      if (dynamicJobs && dynamicJobs.length > 0) siteData.jobs = dynamicJobs;
      
      const dynamicCourses = await window.API.fetchData('courses');
      if (dynamicCourses && dynamicCourses.length > 0) siteData.courses = dynamicCourses;
    }

    renderAll();
  } catch (error) {
    console.error("Error loading site data:", error);
    // Render with fallback data if JSON fetch fails (critical error)
    siteData = getFallbackData();
    window.siteData = siteData;
    renderAll();
  }
}

// 備用資料（當 JSON 無法載入時使用）
function getFallbackData() {
  return {
    organization: {
      name: "社團法人宜蘭縣長期照護及社會福祉推廣協會",
      shortName: "社團法人宜蘭縣長期照護及社會福祉推廣協會",
      tagline: "專業照護、在地深耕、溫暖相伴",
      stats: {
        served: 5000,
        years: 10,
        locations: 8
      }
    },
    serviceTypes: [
      {
        id: "elder-care",
        name: "長者照顧服務",
        shortDescription:
          "提供日間照顧服務，讓長者在熟悉的社區環境中獲得生活照顧、健康促進及休閒社會參與活動。",
        icon: "ph-house",
        serviceItems: ["日間照顧", "健康促進", "社會參與"],
      },
      {
        id: "dementia-center",
        name: "失智社區服務據點",
        shortDescription:
          "提供在地化之失智照護與支持服務，協助長者維持生活功能。",
        icon: "ph-brain",
        serviceItems: ["認知促進", "共餐服務", "照顧者支持"],
      },
      {
        id: "assistive-devices",
        name: "輔具資源服務",
        shortDescription: "提供單一窗口之輔具服務，協助民眾獲得適當輔具。",
        icon: "ph-wheelchair",
        serviceItems: ["輔具借用", "輔具評估", "居家無障礙評估"],
      },
    ],
    serviceLocations: [
      {
        id: "babao",
        name: "八寶社區長照機構",
        locationType: "長照機構",
        township: "冬山",
        address: "宜蘭縣冬山鄉八寶路 25 號",
        phone: "+886 3 958 1020",
        serviceHours: "週一至週五 08:00-17:00",
      },
    ],
    news: [
      {
        id: "news-001",
        title: "歡迎蒞臨本會官方網站",
        category: "公告",
        summary: "社團法人宜蘭縣長期照護及社會福祉推廣協會官方網站正式上線。",
        publishDate: "2026-02-10",
      },
    ],
  };
}

// ============================================
// Header 滾動效果
// ============================================
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    // 添加滾動樣式
    if (currentScrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollY = currentScrollY;
  });
}

// ============================================
// 手機導覽選單
// ============================================
function initMobileNav() {
  const menuToggle = document.getElementById("menuToggle");
  const navMobile = document.getElementById("navMobile");

  if (!menuToggle || !navMobile) return;

  menuToggle.addEventListener("click", () => {
    navMobile.classList.toggle("active");
    menuToggle.classList.toggle("active");
    // Toggle aria-expanded
    const expanded = menuToggle.classList.contains("active");
    menuToggle.setAttribute("aria-expanded", expanded);
    document.body.classList.toggle("nav-open");
  });

  // 點擊連結後關閉選單
  const navLinks = navMobile.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

// ============================================
// 滾動揭示動畫
// ============================================
// ponytail: 單一共用 observer，避免每次 render 都 new 一個造成疊加洩漏
let revealObserver = null;
function initScrollReveal() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            revealObserver.unobserve(entry.target); // 揭示後即停止觀察
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );
  }
  // 只觀察尚未揭示的元素
  document
    .querySelectorAll(".reveal:not(.active)")
    .forEach((el) => revealObserver.observe(el));
}

// ============================================
// 無障礙工具列 (A11y Widget)
// ============================================
function initA11yWidget() {
    // 檢查是否已存在，避免重複建立
    if (document.querySelector('.a11y-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'a11y-widget';
    widget.innerHTML = `
        <button class="a11y-toggle-btn" id="a11yFonts" aria-label="放大字體" title="放大字體">
            <span style="font-size: 1.2rem;">A+</span>
        </button>
        <button class="a11y-toggle-btn" id="a11yContrast" aria-label="高對比模式" title="高對比模式">
            <span style="font-size: 1.2rem;">◐</span>
        </button>
    `;
    document.body.appendChild(widget);

    // 字體放大功能
    const fontsBtn = document.getElementById('a11yFonts');
    let isLargeFont = false;
    fontsBtn.addEventListener('click', () => {
        isLargeFont = !isLargeFont;
        if (isLargeFont) {
            document.documentElement.style.setProperty('--font-size-base', '1.25rem'); // 20px
            fontsBtn.classList.add('active');
            fontsBtn.innerHTML = '<span style="font-size: 1rem;">A-</span>';
            fontsBtn.setAttribute('aria-label', '恢復字體大小');
        } else {
            document.documentElement.style.setProperty('--font-size-base', '1.125rem'); // 18px
            fontsBtn.classList.remove('active');
            fontsBtn.innerHTML = '<span style="font-size: 1.2rem;">A+</span>';
            fontsBtn.setAttribute('aria-label', '放大字體');
        }
    });

    // 高對比模式
    const contrastBtn = document.getElementById('a11yContrast');
    contrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
        contrastBtn.classList.toggle('active');
        const isActive = document.body.classList.contains('high-contrast');
        contrastBtn.setAttribute('aria-label', isActive ? '關閉高對比' : '開啟高對比');
    });
}

// ============================================
// 回到頂部按鈕 (Back to Top)
// ============================================
function initBackToTop() {
    if (document.querySelector('.back-to-top')) return;

    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', '回到頂部');
    document.body.appendChild(btn);

    // 顯示控制
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    // 點擊滾動
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Hero 統計數字動畫
// ============================================
function initHeroStats() {
    const statsContainer = document.getElementById('heroStats');
    if (!statsContainer) return; // 如果頁面沒有 Stats 容器則跳過

    // 模擬數據 (如果 siteData 中沒有)
    const statsData = siteData?.organization?.stats || {
        served: 5000,
        years: 10,
        locations: 8
    };
    
    // 如果已有內容則不重複渲染 (支援靜態 HTML)
    if (statsContainer.innerHTML.trim() === '') {
        statsContainer.innerHTML = `
            <div class="stat-item reveal">
                <span class="stat-number" data-target="${statsData.served}">0</span>
                <span class="stat-label">服務人次</span>
            </div>
            <div class="stat-item reveal">
                <span class="stat-number" data-target="${statsData.years}">0</span>
                <span class="stat-label">深耕年數</span>
            </div>
            <div class="stat-item reveal">
                <span class="stat-number" data-target="${statsData.locations}">0</span>
                <span class="stat-label">服務據點</span>
            </div>
        `;
    }

    // 數字跳動動畫
    const numbers = statsContainer.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                animateValue(target, 0, endValue, 2000);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    numbers.forEach(num => observer.observe(num));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString() + (end > 100 ? '+' : '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ============================================
// 渲染服務項目
// ============================================
// ============================================
// 渲染服務項目
// ============================================
function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid || !siteData) return;

  const services = siteData.serviceTypes || [];

  grid.innerHTML = services
    .map(
      (service) => `
    <div class="service-card reveal">
      <div class="service-icon"><i class="ph ${service.icon}"></i></div>
      <h3 class="service-title">${service.name}</h3>
      <p class="service-description">${service.shortDescription}</p>
      <div class="service-features">
        ${(service.serviceItems || [])
          .slice(0, 4)
          .map(
            (item) => `
          <span class="feature-tag">${item}</span>
        `,
          )
          .join("")}
      </div>
      <a href="services.html#${service.id}" class="card-link" aria-label="瞭解更多關於${service.name}">
        瞭解更多 →
      </a>
    </div>
  `,
    )
    .join("");

  // 重新初始化滾動揭示
  initScrollReveal();
}

// ============================================
// 渲染服務據點
// ============================================
function renderLocations(filter = "all") {
  const grid = document.getElementById("locationsGrid");
  if (!grid || !siteData) return;

  let locations = siteData.serviceLocations || [];

  // 篩選
  if (filter !== "all") {
    locations = locations.filter((loc) => loc.locationType === filter);
  }

  // 只顯示前 8 個
  locations = locations.slice(0, 8);

  grid.innerHTML = locations
    .map((location) => {
      // 根據類型設定樣式
      let typeClass = "";
      let icon = "ph-house";

      if (location.locationType === "樂智據點") {
        typeClass = "dementia";
        icon = "ph-brain";
      } else if (location.locationType === "輔具中心") {
        typeClass = "assistive";
        icon = "ph-wheelchair";
      }

      const imageInner = location.images && location.images.length > 0
        ? `<img src="${location.images[0]}" alt="${location.name}" loading="lazy">`
        : `<div class="location-image-fallback"><i class="ph ${icon}"></i></div>`;

      return `
      <div class="location-card reveal ${typeClass}">
        <div class="location-image">
          ${imageInner}
          <div class="location-tag">${location.locationType}</div>
        </div>
        <div class="location-content">
          <div class="location-icon"><i class="ph ${icon}"></i></div>
          <h3 class="location-title">${location.name}</h3>
          <div class="location-info">
            <p><span>📍</span> ${location.township} | ${location.address}</p>
            <p><span>📞</span> ${location.phone}</p>
          </div>
          ${location.externalLink 
            ? `<a href="${location.externalLink}" target="_blank" class="location-link">前往網站 →</a>`
            : `<a href="contact.html" class="location-link">聯絡我們 →</a>`
          }
        </div>
      </div>
    `;
    })
    .join("");
    
  // 重新初始化滾動揭示
  initScrollReveal();
}




// ============================================
// 據點篩選功能
// ============================================
function initLocationFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 更新按鈕狀態
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.classList.remove("btn-outline");
      btn.classList.add("btn-primary");
      btn.setAttribute("aria-pressed", "true");

      // 篩選據點
      const filter = btn.dataset.filter;
      renderLocations(filter);
    });
  });
}

// ============================================
// 渲染最新消息
// ============================================
function renderNews() {
  const grid = document.getElementById("newsGrid");
  if (!grid || !siteData) return;

  const news = (siteData.news || []).slice(0, 3);

  if (news.length === 0) {
    grid.innerHTML = `
      <div class="news-card reveal" style="grid-column: 1 / -1; text-align: center;">
        <p class="text-muted">目前沒有最新消息</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = news
    .map(
      (item) => {
        let imageHtml = '';
        if (item.coverImage) {
          imageHtml = `<div class="news-image-wrapper" style="height: 200px; overflow: hidden; margin: -1.5rem -1.5rem 1.5rem -1.5rem; border-radius: var(--radius-lg) var(--radius-lg) 0 0;"><img src="${item.coverImage}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
        }
        
        // Category Icon Mapping
        let categoryIcon = 'ph-article';
        if (item.category === '公告') categoryIcon = 'ph-megaphone';
        else if (item.category === '活動') categoryIcon = 'ph-calendar-star';
        else if (item.category === '課程') categoryIcon = 'ph-chalkboard-teacher';
        else if (item.category === '徵才') categoryIcon = 'ph-briefcase';
        
        return `
    <div class="news-card reveal">
      ${imageHtml}
      <div class="news-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
        <span class="news-category" style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.85rem; color: var(--color-primary); font-weight: 500; background: var(--color-gray-100); padding: 4px 12px; border-radius: 999px;">
          <i class="ph ${categoryIcon}"></i> ${item.category}
        </span>
        <span class="news-date" style="font-size: 0.85rem; color: var(--color-gray-500);">${formatDate(item.publishDate)}</span>
      </div>
      <h3 class="news-title" style="margin-top: var(--spacing-xs);">${item.title}</h3>
      <p class="news-summary">${item.summary}</p>
      <a href="news.html#${item.id}" class="card-link" aria-label="閱讀更多關於${item.title}">
        閱讀更多 →
      </a>
    </div>
  `;
      },
    )
    .join("");

  // 重新初始化滾動揭示
  initScrollReveal();
}

// ============================================
// 工具函數
// ============================================

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

// 截斷文字
function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ============================================
// 表單處理
// ============================================
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const successBox = document.getElementById("formSuccess");
  const errorBox = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 表單有 novalidate，手動觸發必填驗證
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (successBox) successBox.style.display = "none";
    if (errorBox) errorBox.style.display = "none";

    // 載入狀態
    const originalText = submitText ? submitText.textContent : "";
    if (submitText) submitText.textContent = "送出中...";
    if (submitBtn) submitBtn.disabled = true;

    try {
      // 送至 Web3Forms（access_key 已在表單 hidden 欄位中）
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
      });
      const result = await response.json();

      if (result.success) {
        if (successBox) {
          successBox.style.display = "block";
          successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        form.reset();
      } else {
        throw new Error(result.message || "Web3Forms 回傳失敗");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      if (submitText) submitText.textContent = originalText;
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ============================================
// 平滑滾動
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerHeight =
        document.getElementById("header")?.offsetHeight || 80;
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// 渲染服務頁面據點 (Services.html)
// ============================================
function renderServicesPage() {
  if (!siteData) return;
  
  try {
    // Elder Care Locations
    const elderCareGrid = document.getElementById('elderCareLocations');
    if (elderCareGrid) {
      if (!siteData.serviceLocations) {
        elderCareGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-gray-500);">資料載入中…</p>';
      } else {
        const locations = siteData.serviceLocations.filter(loc => loc.locationType === '長照機構' || loc.serviceTypeId === 'elder-care');
        if (locations.length > 0) {
          elderCareGrid.innerHTML = locations.map(loc => createLocationCard(loc)).join('');
        } else {
          elderCareGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-gray-500);">查無長照機構資料</p>';
        }
      }
    }
    
    // Dementia Locations
    const dementiaGrid = document.getElementById('dementiaLocations');
    if (dementiaGrid) {
      const locations = (siteData.serviceLocations || []).filter(loc => loc.locationType === '樂智據點' || loc.serviceTypeId === 'dementia-center');
      if (locations.length > 0) {
        dementiaGrid.innerHTML = locations.map(loc => createLocationCard(loc, 'dementia')).join('');
      } else {
        dementiaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-gray-500);">查無樂智據點資料</p>';
      }
    }
    
    // Re-init scroll reveal for new cards
    if (elderCareGrid || dementiaGrid) {
      initScrollReveal();
    }
  } catch (error) {
    console.error("Error in renderServicesPage:", error);
  }
}

function createLocationCard(location, type = '') {
  let typeClass = type === 'dementia' ? 'dementia' : '';
  let imageHtml = '';
  
  let iconClass = location.icon || (type === 'dementia' ? 'ph-brain' : 'ph-house');
  
  if (location.images && location.images.length > 0) {
    imageHtml = `<div class="location-image-wrapper" style="height: 200px; overflow: hidden;"><img src="${location.images[0]}" alt="${location.name}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
  } else {
    imageHtml = `<div style="width: 100%; height: 200px; background: var(--color-gray-100); display: flex; align-items: center; justify-content: center; font-size: 3rem;"><i class="ph ${iconClass}"></i></div>`;
  }
  
  return `
    <div class="location-card reveal" style="overflow: hidden; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      ${imageHtml}
      <div class="location-body" style="padding: 1.5rem;">
        <span class="location-type ${typeClass}" style="display: inline-block; padding: 0.25rem 0.75rem; background: var(--color-primary-bg); color: var(--color-primary); border-radius: var(--radius-full); font-size: 0.875rem; margin-bottom: 0.5rem;">${location.locationType}</span>
        <h3 class="location-title" style="margin-bottom: 1rem;">${location.name}</h3>
        <div class="location-info" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="location-info-item" style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="location-info-icon"><i class="ph ph-map-pin"></i></span>
            <span>${location.township}</span>
          </div>
          <div class="location-info-item" style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="location-info-icon"><i class="ph ph-phone"></i></span>
            <span>${location.phone}</span>
          </div>
          <div class="location-info-item" style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="location-info-icon"><i class="ph ph-clock"></i></span>
            <span>${location.serviceHours}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// 渲染招募徵才 (Jobs.html)
// ============================================
function renderJobs() {
  const grid = document.getElementById('jobsGrid');
  if (!grid || !siteData) return;
  
  const jobs = siteData.jobs || [];

  if (jobs.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-3xl); color: var(--color-gray-500);">
        <p style="font-size: 4rem; line-height: 1;"><i class="ph ph-briefcase"></i></p>
        <p>目前暫無招募職缺</p>
        <p style="font-size: var(--font-size-sm);">歡迎投遞履歷加入人才庫</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = jobs.map(job => {
    // Parse lists (handle both array from JSON and string from CSV)
    const requirements = Array.isArray(job.requirements) 
      ? job.requirements 
      : (job.requirements || '').split('\n').filter(i => i.trim());
      
    const duties = Array.isArray(job.duties) 
      ? job.duties 
      : (job.duties || '').split('\n').filter(i => i.trim());
      
    const benefits = Array.isArray(job.benefits) 
      ? job.benefits 
      : (job.benefits || '').split('\n').filter(i => i.trim());

    return `
    <article class="job-card reveal">
      <div class="job-header">
        <div class="job-title-group">
          <h3 class="job-title">${job.title}</h3>
          <div class="job-meta">
            <span><i class="ph ph-map-pin"></i> ${job.location}</span>
            <span><i class="ph ph-briefcase"></i> ${job.type}</span>
            <span><i class="ph ph-calendar-blank"></i> ${formatDate(job.postedDate)} 刊登</span>
          </div>
        </div>
        <span class="job-status ${job.status}">${job.statusText || '招募中'}</span>
      </div>
      <div class="job-body">
        <div class="job-section">
          <div class="job-section-title"><i class="ph ph-currency-dollar"></i> 薪資待遇</div>
          <div class="job-section-content">${job.salary}</div>
        </div>
        <div class="job-section">
          <div class="job-section-title"><i class="ph ph-clipboard-text"></i> 工作職責</div>
          <div class="job-section-content">
            <ul>
              ${duties.map(duty => `<li>${duty}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="job-section">
          <div class="job-section-title"><i class="ph ph-check-circle"></i> 應徵條件</div>
          <div class="job-section-content">
            <ul>
              ${requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="job-tags">
          ${benefits.map(b => `<span class="job-tag">${b}</span>`).join('')}
        </div>
      </div>
      <div class="job-footer">
         <a href="#" class="btn btn-primary" onclick="window.open(window.CONFIG.forms.jobApply || 'contact.html?subject=job&job=${job.id}', '_blank'); return false;">立即應徵</a>
        <a href="contact.html?subject=job&job=${job.id}" class="btn" style="background: var(--color-gray-100); color: var(--color-gray-700);">詢問詳情</a>
      </div>
    </article>
  `}).join('');
  
  initScrollReveal();
}

// ============================================
// 渲染課程訓練 (Courses.html)
// ============================================
function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid || !siteData) return;
  
  const courses = siteData.courses || [];
  
  if (courses.length === 0) {
    grid.innerHTML = `
      <div class="no-courses">
        <p style="font-size: var(--font-size-xl);">📚</p>
        <p>目前尚無招生中課程</p>
        <p style="font-size: var(--font-size-sm);">請稍後再來查看，或訂閱我們的消息通知</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = courses.map(course => `
    <article class="course-card reveal">
      <div class="course-header">
        <span class="course-status ${course.status}">${course.statusText || '報名中'}</span>
        <h3 class="course-title">${course.title}</h3>
        <div class="course-category">${course.category}</div>
      </div>
      <div class="course-body">
        <div class="course-info">
          <div class="course-info-item">
            <span class="course-info-label">課程期間</span>
            <span class="course-info-value">${formatDate(course.startDate)} ~ ${formatDate(course.endDate)}</span>
          </div>
          <div class="course-info-item">
            <span class="course-info-label">課程時數</span>
            <span class="course-info-value">${course.hours} 小時</span>
          </div>
          <div class="course-info-item">
            <span class="course-info-label">上課地點</span>
            <span class="course-info-value">${course.location}</span>
          </div>
          <div class="course-info-item">
            <span class="course-info-label">課程費用</span>
            <span class="course-info-value">${course.fee}</span>
          </div>
          <div class="course-info-item">
            <span class="course-info-label">招生名額</span>
            <span class="course-info-value">${course.quota} 名</span>
          </div>
        </div>
        <p class="course-description">${course.description}</p>
        <div class="course-footer">
          ${course.status === 'open' 
            ? `<a href="#" onclick="window.open(window.CONFIG.forms.courseRegister || 'contact.html?subject=course&course=${course.id}', '_blank'); return false;" class="btn btn-primary">立即報名</a>` 
            : `<button class="btn" disabled style="background: var(--color-gray-200); color: var(--color-gray-500);">尚未開放報名</button>`
          }
          <button class="btn" style="background: var(--color-gray-100); color: var(--color-gray-700);">查看詳情</button>
        </div>
      </div>
    </article>
  `).join('');
  
  initScrollReveal();
}

// ============================================
// 渲染最新消息頁面 (News.html)
// ============================================
function renderNewsPage(filter = 'all') {
  const newsList = document.getElementById('newsList');
  if (!newsList || !siteData) return;
  
  const newsData = siteData.news || [];
  
  const filteredNews = filter === 'all' 
    ? newsData 
    : newsData.filter(n => n.category === filter);
  
  if (filteredNews.length === 0) {
    newsList.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--color-gray-500); grid-column: 1 / -1;">
        <p style="font-size: 3rem; margin-bottom: 1rem;">📭</p>
        <p>目前此分類尚無消息</p>
      </div>
    `;
    return;
  }
  
  newsList.innerHTML = filteredNews.map(news => {
    let imageHtml = `<div class="news-item-image">${news.image || '📰'}</div>`;
    if (news.coverImage) {
      imageHtml = `<div class="news-item-image" style="background-image: url('${news.coverImage}'); background-size: cover; background-position: center;"></div>`;
    }

    return `
    <article class="news-item reveal">
      ${imageHtml}
      <div class="news-item-body">
        <div class="news-item-meta">
          <span>${formatDate(news.publishDate || news.date)}</span>
          <span style="background: var(--color-primary-bg); color: var(--color-primary); padding: 2px 8px; border-radius: var(--radius-sm);">${news.category}</span>
        </div>
        <h3 class="news-item-title">${news.title}</h3>
        <p class="news-item-excerpt">${news.summary || news.excerpt}</p>
        <a href="news.html#${news.id}" class="news-item-link" onclick="alert('詳細內容頁面尚未實作，敬請期待！'); return false;">閱讀更多 →</a>
      </div>
    </article>
  `}).join('');
  
  // Re-init scroll reveal
  if (window.SiteApp && window.SiteApp.initScrollReveal) {
    window.SiteApp.initScrollReveal();
  } else if (typeof initScrollReveal === 'function') {
    initScrollReveal();
  }
}


// ============================================
// Render All Function
// ============================================
function renderAll() {
  // Common renderers
  if (typeof renderServices === 'function') renderServices();
  if (typeof renderLocations === 'function') renderLocations();
  if (typeof renderNews === 'function') renderNews();
  if (typeof renderJobs === 'function') renderJobs();
  if (typeof renderCourses === 'function') renderCourses();
  
  // Specific page renderers
  if (typeof renderServicesPage === 'function') renderServicesPage();
  if (typeof renderNewsPage === 'function') {
      // Check if we are on the news page
      if (document.getElementById('newsList')) {
          renderNewsPage();
      }
  }

  // Re-init scroll reveal after rendering
  if (window.SiteApp && window.SiteApp.initScrollReveal) {
    window.SiteApp.initScrollReveal();
  } else if (typeof initScrollReveal === 'function') {
    initScrollReveal();
  }
}

// ============================================
// 匯出函數（供其他頁面使用）
// ============================================
window.SiteApp = {
  loadSiteData,
  renderServices,
  renderLocations,
  renderNews,
  renderNewsPage,
  renderJobs,
  renderCourses,
  formatDate,
  truncate,
  initContactForm,
  initA11yWidget,
  initBackToTop,
  initHeroStats,
  initMobileNav,
  renderAll
};
