// Run after changing site-data.json, main.js renderers, or FAQ JSON-LD.
// Uses the existing browser renderers; no second card template to maintain.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
process.chdir(path.join(__dirname, '..'));
const check = process.argv.includes('--check');
const data = JSON.parse(fs.readFileSync('data/site-data.json', 'utf8'));
const base = 'https://www.changfu.me/';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grids = Object.fromEntries(['servicesGrid', 'locationsGrid', 'elderCareLocations', 'dementiaLocations'].map(id => [id, {innerHTML: ''}]));
const context = vm.createContext({window: {}, console, document: {querySelectorAll: () => [], addEventListener() {}, getElementById: id => grids[id]}});
vm.runInContext(fs.readFileSync('js/main.js', 'utf8'), context);
context.data = data;
vm.runInContext('siteData = data; initScrollReveal = () => {}; renderServices(); renderLocations(); renderServicesPage();', context);
function save(file, content) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
  if (check) throw new Error(`${file} is stale; run node scripts/sync-search-content.cjs`);
  fs.writeFileSync(file, content);
}
function block(html, id, content, before) {
  const start = `<!-- search:${id} -->`, end = `<!-- /search:${id} -->`;
  const replacement = `${start}\n${content}\n${end}`;
  if (html.includes(start)) return html.slice(0, html.indexOf(start)) + replacement + html.slice(html.indexOf(end) + end.length);
  if (!html.includes(before)) throw new Error(`Missing insertion point: ${id}`);
  return html.replace(before, replacement + '\n' + before);
}
const allFaqs = [];
for (const file of ['index.html', 'services.html', 'about.html', 'contact.html']) {
  let html = fs.readFileSync(file, 'utf8');
  for (const [id, grid] of Object.entries(grids)) {
    const opening = new RegExp(`<div class="[^"]*" id="${id}">`);
    if (!opening.test(html)) continue;
    if (!html.includes(`<!-- search:${id} -->`)) {
      html = html.replace(new RegExp(`(${opening.source})\\s*<!--[\\s\\S]*?-->`), `$1\n<!-- search:${id} --><!-- /search:${id} -->`);
    }
    html = block(html, id, grid.innerHTML.trim().replace(/[ \t]+$/gm, ''));
  }
  const faq = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m => JSON.parse(m[1])).find(obj => obj['@type'] === 'FAQPage');
  if (faq) {
    const items = faq.mainEntity.map((q, i) => {
      const source = q.name.includes('輔具') ? ['https://yilanatrc.com.tw/', '宜蘭縣溪北輔具資源中心']
        : q.name.includes('組織') ? ['about.html', '長福會協會簡介']
        : q.name.includes('聯絡') ? ['contact.html', '長福會聯絡資訊'] : ['services.html', '長福會服務說明'];
      allFaqs.push(`### ${q.name}\n\n${q.acceptedAnswer.text}\n\n來源：[${source[1]}](${new URL(source[0], base)})；[原文問答](${base}${file === 'index.html' ? '' : file}#faq-${i + 1})`);
      return `<article class="faq-item" id="faq-${i + 1}"><h3>${escape(q.name)}</h3><p>${escape(q.acceptedAnswer.text)} 資料來源：<a href="${source[0]}">${source[1]}</a>。</p></article>`;
    }).join('\n');
    html = block(html, 'faq', `<section class="section" id="faq" aria-labelledby="faq-heading"><div class="container faq-list"><h2 id="faq-heading">常見問題與解答</h2>\n${items}\n</div></section>`, file === 'index.html' ? '    <!-- CTA Section -->' : '  <!-- CTA -->');
  }
  save(file, html);
}
const org = data.organization;
const intro = `# ${org.name}（長福會）\n\n> 宜蘭縣非營利組織，提供長者日間照顧、失智社區服務據點及輔具資源服務。\n\n資料整理日期：2026-09-19。服務安排、名額與費用請洽各據點；最新公告以來源頁面為準。\n\n## 聯絡資訊\n\n- 電話：${org.phone}\n- 地址：${org.registeredAddress}\n- 電子郵件：${org.email}\n- [聯絡我們](${base}contact.html)\n\n## 網站內容\n\n- [關於長福會](${base}about.html)：組織宗旨與服務範圍\n- [日間照顧](${base}services.html#elder-care)：冬山及蘇澳日照服務\n- [失智社區服務據點](${base}services.html#dementia)：礁溪、冬山、羅東與三星\n- [輔具資源服務](${base}services.html#assistive)：諮詢、評估、借用及維修\n- [常見問題](${base}#faq)：服務與聯絡方式\n- [最新消息](${base}news.html)：公告與活動\n- [課程訓練](${base}courses.html)：最新招生與報名資訊\n- [招募徵才](${base}jobs.html)：最新職缺與應徵方式\n`;
save('llms.txt', intro + `\n## Optional\n\n- [完整服務摘要](${base}llms-full.txt)：服務、據點與可引用問答\n- [宜蘭縣溪北輔具資源中心](https://yilanatrc.com.tw/)：中心最新服務資訊\n`);
save('llms-full.txt', intro + '\n## 服務據點\n\n' + data.serviceLocations.filter(l => l.status === 'published').map(l => `### ${l.name}\n\n${l.serviceContent}\n\n- 地址：${l.address}\n- 電話：${l.phone}\n- 服務時間：${l.serviceHours}\n- 來源：[${l.externalLink ? '輔具中心官網' : '長福會服務據點'}](${l.externalLink || base + 'contact.html#locationsGrid'})`).join('\n\n') + '\n\n## 常見問題\n\n' + allFaqs.join('\n\n') + '\n');
console.log(check ? 'Static cards, visible FAQ and agent resources are in sync.' : 'Updated static cards, visible FAQ and agent resources.');
