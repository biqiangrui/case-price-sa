const quickTerms = ["iPhone 17 Pro Max", "iPhone 17", "Samsung S25 Ultra", "Samsung A56 5G"];
const siteOrder = ["52hqb", "Noon", "SHEIN", "Amazon.sa"];
let productDatabase = [];
let dataSourceName = "products.csv";

const procurementPlatforms = [
  {
    name: "Noon",
    url: "https://www.noon.com/saudi-en/search/?q=phone%20case",
    displayUrl: "noon.com/saudi-en",
    image: "images/case-magsafe.svg",
    desc: "沙特本地常用电商平台，适合对比畅销款和本地零售价格。"
  },
  {
    name: "Amazon.sa",
    url: "https://www.amazon.sa/s?k=phone+case",
    displayUrl: "amazon.sa",
    image: "images/case-clear.svg",
    desc: "客户熟悉的沙特购物网站，适合查看品牌款、MagSafe、防摔壳价格。"
  },
  {
    name: "SHEIN",
    url: "https://ar.shein.com/pdsearch/phone%20case/",
    displayUrl: "ar.shein.com",
    image: "images/case-fashion.svg",
    desc: "沙特年轻客户常用平台，适合对比时尚款、透明款和低价款。"
  },
  {
    name: "Jarir",
    url: "https://www.jarir.com/sa-en/catalogsearch/result/?q=phone%20case",
    displayUrl: "jarir.com",
    image: "images/case-armor.svg",
    desc: "沙特知名电子产品零售商，适合参考高客单价配件价格。"
  },
  {
    name: "Extra",
    url: "https://www.extra.com/en-sa/search/?text=phone%20case",
    displayUrl: "extra.com",
    image: "images/case-silicone.svg",
    desc: "沙特大型电子零售平台，适合对比手机配件零售价格。"
  },
  {
    name: "Virgin Megastore",
    url: "https://www.virginmegastore.sa/en/search/?q=phone%20case",
    displayUrl: "virginmegastore.sa",
    image: "images/case-magsafe.svg",
    desc: "沙特常见电子和生活方式零售平台，适合参考手机配件价格。"
  }
];

const app = document.querySelector("#app");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const imageInput = document.querySelector("#imageInput");
const quickSearches = document.querySelector("#quickSearches");
const platformGrid = document.querySelector("#platformGrid");
const results = document.querySelector("#results");
const resultTitle = document.querySelector("#resultTitle");
const resultMeta = document.querySelector("#resultMeta");
const siteResults = document.querySelector("#siteResults");

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = rows.shift().map((header) => header.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function displayImageUrl(url) {
  const filename = String(url || "").split("/").pop();
  if (filename && /^case-[a-z-]+\.svg$/.test(filename)) {
    return `images/${filename}`;
  }
  return url;
}

function hydrateProduct(row) {
  return {
    id: row.id,
    title: row.title,
    model: row.model,
    site: row.platform,
    siteClass: siteClass(row.platform),
    price: Number(row.price),
    currency: row.currency || "SAR",
    imageUrl: displayImageUrl(row.image_url),
    url: row.product_url,
    displayUrl: row.display_url,
    desc: `${row.platform} · ${row.model} · ${row.tags}`,
    tags: row.tags.split(/\s+/).filter(Boolean),
    updatedAt: row.updated_at
  };
}

function siteClass(site) {
  if (site === "52hqb") return "source";
  if (site === "Noon") return "noon";
  if (site === "SHEIN") return "shein";
  if (site === "Amazon.sa") return "amazon";
  return "source";
}

function publicSiteName(site) {
  return site === "52hqb" ? "我们的报价" : site;
}

function publicDisplayUrl(item) {
  return item.site === "52hqb" ? "自有渠道报价" : item.displayUrl;
}

function publicDesc(item) {
  if (item.site !== "52hqb") return item.desc;
  return item.desc.replace(/^52hqb/, "我们的报价");
}

function publicTitle(item) {
  if (item.site !== "52hqb") return item.title;
  return item.title.replace(/^52hqb\s+/i, "自有渠道 ");
}

async function loadProducts() {
  try {
    if (window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
      const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/products?select=*&order=updated_at.desc`, {
        headers: {
          apikey: window.SUPABASE_CONFIG.anonKey,
          Authorization: `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        }
      });
      if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
      const rows = await response.json();
      productDatabase = rows.map((row) => hydrateProduct({
        id: row.id,
        title: row.title,
        model: row.model,
        platform: row.platform,
        price: row.price,
        currency: row.currency,
        image_url: row.image_url,
        product_url: row.product_url,
        display_url: row.display_url,
        tags: row.tags,
        updated_at: row.updated_at
      }));
      dataSourceName = "Supabase 云端数据库";
      return;
    }

    const response = await fetch("products.csv", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    productDatabase = parseCsv(csv).map(hydrateProduct);
    dataSourceName = "products.csv";
  } catch (error) {
    siteResults.innerHTML = `<div class="empty">商品数据库加载失败，请确认 Supabase 配置或 products.csv 可以访问。</div>`;
    console.error(error);
  }
}

function matchesQuery(item, query) {
  if (!query) return false;
  const text = `${item.site} ${item.model} ${item.title} ${item.desc} ${item.tags.join(" ")}`;
  return normalize(text).includes(normalize(query));
}

function searchCases(query) {
  const direct = productDatabase.filter((item) => matchesQuery(item, query));
  if (direct.length) return direct;

  const words = normalize(query).split(" ").filter(Boolean);
  return productDatabase.filter((item) => {
    const text = normalize(`${item.model} ${item.title} ${item.tags.join(" ")}`);
    return words.some((word) => text.includes(word));
  });
}

function groupedBySite(items) {
  return siteOrder.map((site) => ({
    site,
    items: items.filter((item) => item.site === site)
  })).filter((group) => group.items.length);
}

function priceSummary(items) {
  const prices = items.map((item) => item.price);
  return `${Math.min(...prices).toFixed(2).replace(".00", "")}-${Math.max(...prices).toFixed(2).replace(".00", "")} SAR`;
}

function renderItem(item) {
  const title = publicTitle(item);
  const titleMarkup = item.site === "52hqb"
    ? `<span class="result-title-text">${title}</span>`
    : `<a href="${item.url}" target="_blank" rel="noreferrer">${title}</a>`;
  const imageMarkup = item.site === "52hqb"
    ? `<div class="thumb image-thumb" aria-label="${title}">
        <img src="${item.imageUrl}" alt="${title}" loading="lazy">
      </div>`
    : `<a class="thumb image-thumb" href="${item.url}" target="_blank" rel="noreferrer" aria-label="${title}">
        <img src="${item.imageUrl}" alt="${title}" loading="lazy">
      </a>`;

  return `
    <article class="result-item">
      ${imageMarkup}
      <div class="result-copy">
        ${titleMarkup}
        <p class="url">${publicDisplayUrl(item)}</p>
        <p class="desc">${publicDesc(item)}</p>
        <div class="tags">${item.tags.slice(0, 5).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </div>
      <div class="price">
        <strong>${item.price.toFixed(2).replace(".00", "")}</strong>
        <span>${item.currency}</span>
      </div>
    </article>
  `;
}

function renderResults(query, items) {
  app.classList.remove("home");
  app.classList.add("has-results");
  results.hidden = false;
  resultTitle.textContent = `${query} 价格搜索结果`;
  resultMeta.textContent = `从 ${dataSourceName} 找到 ${items.length} 个手机壳结果`;

  if (!items.length) {
    siteResults.innerHTML = `<div class="empty">没有找到匹配结果，试试 iPhone 17 或 Samsung S25 Ultra。</div>`;
    return;
  }

  siteResults.innerHTML = groupedBySite(items).map((group) => `
    <section class="site-block">
      <div class="site-head">
        <div class="site-title">
          <span class="site-dot ${group.items[0].siteClass}"></span>
          <h2>${publicSiteName(group.site)}</h2>
        </div>
        <p class="site-summary">${group.items.length} 个结果 · 价格 ${priceSummary(group.items)}</p>
      </div>
      <div class="result-list">${group.items.map(renderItem).join("")}</div>
    </section>
  `).join("");
}

function submitSearch(query) {
  const cleaned = query.trim();
  if (!cleaned) return;
  searchInput.value = cleaned;
  renderResults(cleaned, searchCases(cleaned));
}

function renderQuickSearches() {
  quickSearches.innerHTML = quickTerms.map((term) => `<button type="button">${term}</button>`).join("");
  quickSearches.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => submitSearch(button.textContent));
  });
}

function renderPlatforms() {
  platformGrid.innerHTML = procurementPlatforms.map((platform) => `
    <a class="platform-card" href="${platform.url}" target="_blank" rel="noreferrer">
      <div class="platform-shot">
        <img src="${platform.image}" alt="${platform.name} 手机壳采购入口" loading="lazy">
      </div>
      <div class="platform-info">
        <div class="platform-title">
          <h2>${platform.name}</h2>
          <span>打开</span>
        </div>
        <p>${platform.desc}</p>
        <div class="platform-url">${platform.displayUrl}</div>
      </div>
    </a>
  `).join("");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitSearch(searchInput.value);
});

imageInput.addEventListener("change", () => {
  if (!imageInput.files[0]) return;
  submitSearch("iPhone 17 Pro Max");
});

async function init() {
  renderQuickSearches();
  renderPlatforms();
  await loadProducts();
  submitSearch("iPhone 17 Pro Max");
}

init();
