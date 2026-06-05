const quickTerms = ["iPhone 17 Pro Max", "iPhone 17", "Samsung S25 Ultra", "Samsung A56 5G"];
const siteOrder = ["52hqb", "Noon", "SHEIN", "Amazon.sa"];
let productDatabase = [];
let dataSourceName = "products.csv";
let activeSiteFilter = "all";
let activeSort = "recommended";
let currentQuery = "";
let currentItems = [];

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

const matchTypes = [
  { label: "MagSafe 磁吸款", words: ["magsafe", "magnetic"] },
  { label: "透明防黄款", words: ["clear", "transparent", "anti", "yellow"] },
  { label: "防摔保护款", words: ["armor", "shockproof", "military", "heavy"] },
  { label: "支架功能款", words: ["kickstand", "stand"] },
  { label: "时尚图案款", words: ["fashion", "cute", "pattern", "colorful", "glitter"] }
];

const productImageOverrides = [
  {
    key: "Z8DFD3DE5976FEE6B5A73Z",
    image: "https://f.nooncdn.com/p/pzsku/Z8DFD3DE5976FEE6B5A73Z/45/1758276303/238c8d86-c03e-4dee-9c7c-6a510cdccce8.jpg?width=1200"
  },
  {
    key: "ZED82E893E697B0929490Z",
    image: "https://f.nooncdn.com/p/pzsku/ZED82E893E697B0929490Z/45/1756375193/10262aef-ee16-4093-8644-7e5db37e0ae0.jpg?width=1200"
  },
  {
    key: "Z01C5FDB9BA07BBE44F71Z",
    image: "https://f.nooncdn.com/p/pzsku/Z01C5FDB9BA07BBE44F71Z/45/1756910673/ed70ef70-9041-4dc6-bbc0-39cf36dd1834.jpg?width=1200"
  },
  {
    key: "ZABC3DA6741AB2ED28FC0Z",
    image: "https://f.nooncdn.com/p/pzsku/ZABC3DA6741AB2ED28FC0Z/45/1756432514/3809e9e5-6f5d-487e-a1c6-c0c2c11ef469.jpg?width=1200"
  },
  {
    key: "N70213940V",
    image: "https://f.nooncdn.com/p/pzsku/ZD7DBCA95D9BAEFFEFAD9Z/45/_/1779094030/e2e2d909-0329-4f8c-9e48-bacb33d7f173.jpg?width=1200"
  },
  {
    id: "6",
    url: "https://www.noon.com/saudi-en/iphone-17-case-ultra-thin-light-design-iphone-17-cases-support-magsafe-wireless-charging-anti-yellowing-iphone-17-cover-phone-case-with-strong-shock-resistant-edges-clear-iphone-cover/ZC570993CE5DD3D7B3366Z/p/?o=d21049576a19f16c",
    image: "https://f.nooncdn.com/p/pzsku/ZC570993CE5DD3D7B3366Z/45/1761033563/57dbc78d-72ad-41bf-bbfd-de890bfb3004.jpg?width=800"
  },
  {
    id: "7",
    url: "https://www.noon.com/saudi-en/for-samsung-s25-ultra-case-compatible-with-magsafe-magnetic-translucent-matte-back-shockproof-cover-with-strong-magnet-slim-thin-full-protection-phone-case-for-galaxy-s25-ultra-5g-black/Z30C6BFDF54ACB5570B88Z/p/?o=aab68234dfe6b33e",
    image: "https://f.nooncdn.com/p/pzsku/Z30C6BFDF54ACB5570B88Z/45/_/1737402633/700ce314-a80a-4435-ab70-857e639b1449.jpg?width=800"
  },
  {
    id: "8",
    url: "https://www.noon.com/saudi-en/samsung-galaxy-a56-5g-premium-case-premium-silicone-case-cover-designed-for-samsung-galaxy-a56-5g-samsung-galaxy-a56-5g-case-camera-and-drop-protection-thin-protective-back-cover-case-for-samsung-galaxy-a56-5g-clear/Z3103EF0654C5BED31106Z/p/?o=z3103ef0654c5bed31106z-1",
    image: "https://f.nooncdn.com/p/pzsku/Z3103EF0654C5BED31106Z/45/1745087086/182999c0-3ce3-41a2-b563-cde3ef7027df.jpg?width=800"
  },
  {
    id: "16",
    url: "https://www.amazon.sa/dp/B0FDJH4QBN",
    image: "https://m.media-amazon.com/images/I/41ti-B0lJRL._AC_SL1000_.jpg"
  },
  {
    id: "17",
    url: "https://www.amazon.sa/dp/B0FDJQWGT2",
    image: "https://m.media-amazon.com/images/I/41cjN0w03fL._AC_SL1000_.jpg"
  },
  {
    id: "18",
    url: "https://www.amazon.sa/dp/B0FDJH4QBN",
    image: "https://m.media-amazon.com/images/I/41ti-B0lJRL._AC_SL1000_.jpg"
  },
  {
    id: "19",
    url: "https://www.amazon.sa/dp/B0FDJQWGT2",
    image: "https://m.media-amazon.com/images/I/41cjN0w03fL._AC_SL1000_.jpg"
  },
  {
    id: "20",
    url: "https://www.amazon.sa/dp/B0FDJQWGT2",
    image: "https://m.media-amazon.com/images/I/41cjN0w03fL._AC_SL1000_.jpg"
  },
  {
    id: "21",
    url: "https://www.amazon.sa/dp/B0DPFWRPVD",
    image: "https://m.media-amazon.com/images/I/51atkgOLjFL._AC_SL1000_.jpg"
  },
  {
    id: "22",
    url: "https://www.amazon.sa/dp/B0DXTHZX1G",
    image: "https://m.media-amazon.com/images/I/51atkgOLjFL._AC_SL1000_.jpg"
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
const priceInsights = document.querySelector("#priceInsights");
const dataTrust = document.querySelector("#dataTrust");
const matchCompare = document.querySelector("#matchCompare");
const filterTabs = document.querySelector("#filterTabs");
const sortSelect = document.querySelector("#sortSelect");
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

function findProductOverride(row) {
  return productImageOverrides.find((item) => {
    if (item.id && String(row.id) === item.id) return true;
    return item.key && String(row.product_url || "").includes(item.key);
  });
}

function inferProductImage(row) {
  const override = findProductOverride(row);
  if (override) return override.image;

  const sourceImage = displayImageUrl(row.image_url);
  if (sourceImage && !sourceImage.startsWith("images/")) return sourceImage;

  const text = normalize(`${row.title} ${row.model} ${row.platform} ${row.tags}`);
  if (text.includes("glitter")) return "images/case-clear-glitter.svg";
  if (text.includes("nillkin") || text.includes("black") || text.includes("matte")) return "images/case-black-magnetic.svg";
  if (text.includes("kickstand") || text.includes("stand")) return "images/case-kickstand-armor.svg";
  if (text.includes("camera") || text.includes("lens")) return "images/case-samsung-camera.svg";
  if (text.includes("cute") || text.includes("pattern") || text.includes("colorful")) return "images/case-cute-pattern.svg";
  if (text.includes("apple") || text.includes("premium")) return "images/case-premium-clear.svg";
  if ((text.includes("magsafe") || text.includes("magnetic")) && (text.includes("clear") || text.includes("transparent"))) return "images/case-magsafe.svg";
  if (text.includes("shockproof") || text.includes("military") || text.includes("heavy") || text.includes("armor")) return "images/case-shockproof-soft.svg";
  if (text.includes("clear") || text.includes("transparent") || text.includes("anti yellow")) return "images/case-clear.svg";
  if (text.includes("magsafe") || text.includes("magnetic")) return "images/case-magsafe.svg";
  return sourceImage;
}

function hydrateProduct(row) {
  const override = findProductOverride(row);
  return {
    id: row.id,
    title: row.title,
    model: row.model,
    site: row.platform,
    siteClass: siteClass(row.platform),
    price: Number(row.price),
    currency: row.currency || "SAR",
    imageUrl: inferProductImage(row),
    url: override?.url || row.product_url,
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
  async function loadCsvProducts() {
    const response = await fetch("products.csv", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    productDatabase = parseCsv(csv).map(hydrateProduct);
    dataSourceName = "products.csv";
  }

  if (window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
    try {
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
    } catch (error) {
      console.warn("Supabase 加载失败，改用 products.csv。", error);
    }
  }

  try {
    await loadCsvProducts();
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
  const orderedSites = activeSort === "recommended"
    ? siteOrder
    : [...new Set(items.map((item) => item.site))];

  return orderedSites.map((site) => ({
    site,
    items: items.filter((item) => item.site === site)
  })).filter((group) => group.items.length);
}

function priceSummary(items) {
  const prices = items.map((item) => item.price);
  return `${Math.min(...prices).toFixed(2).replace(".00", "")}-${Math.max(...prices).toFixed(2).replace(".00", "")} SAR`;
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace(".00", "");
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "未知时间";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function latestUpdate(items) {
  const times = items
    .map((item) => parseDate(item.updatedAt)?.getTime())
    .filter(Boolean);
  if (!times.length) return null;
  return new Date(Math.max(...times)).toISOString();
}

function siteRank(site) {
  const index = siteOrder.indexOf(site);
  return index === -1 ? siteOrder.length : index;
}

function sortedItems(items) {
  return [...items].sort((a, b) => {
    if (activeSort === "price-low") return a.price - b.price;
    if (activeSort === "price-high") return b.price - a.price;
    if (activeSort === "newest") return String(b.updatedAt).localeCompare(String(a.updatedAt));
    return siteRank(a.site) - siteRank(b.site) || a.price - b.price;
  });
}

function filteredItems(items) {
  if (activeSiteFilter === "all") return items;
  return items.filter((item) => item.site === activeSiteFilter);
}

function renderInsights(items) {
  if (!items.length) {
    priceInsights.innerHTML = "";
    return;
  }

  const marketItems = items.filter((item) => item.site !== "52hqb");
  const ownItems = items.filter((item) => item.site === "52hqb");
  const marketPrices = marketItems.map((item) => item.price);
  const ownPrices = ownItems.map((item) => item.price);
  const lowestMarket = marketPrices.length ? Math.min(...marketPrices) : null;
  const averageMarket = marketPrices.length
    ? marketPrices.reduce((sum, price) => sum + price, 0) / marketPrices.length
    : null;
  const ownLowest = ownPrices.length ? Math.min(...ownPrices) : null;
  const saving = lowestMarket !== null && ownLowest !== null ? lowestMarket - ownLowest : null;
  const savingRate = saving !== null && lowestMarket > 0 ? Math.round((saving / lowestMarket) * 100) : null;

  const cards = [
    {
      label: "最低市场价",
      value: lowestMarket === null ? "-" : `${formatPrice(lowestMarket)} SAR`,
      note: marketItems.length ? "沙特平台最低价" : "暂无市场数据"
    },
    {
      label: "我们的报价",
      value: ownLowest === null ? "-" : `${formatPrice(ownLowest)} SAR`,
      note: ownItems.length ? "自有渠道报价" : "暂无报价"
    },
    {
      label: "价格优势",
      value: saving === null ? "-" : `${formatPrice(Math.max(saving, 0))} SAR`,
      note: savingRate === null ? "等待更多数据" : `约低 ${Math.max(savingRate, 0)}%`
    },
    {
      label: "市场均价",
      value: averageMarket === null ? "-" : `${formatPrice(averageMarket)} SAR`,
      note: `${marketItems.length} 个沙特平台结果`
    }
  ];

  priceInsights.innerHTML = cards.map((card) => `
    <div class="insight-card">
      <span>${card.label}</span>
      <strong>${card.value}</strong>
      <p>${card.note}</p>
    </div>
  `).join("");
}

function renderDataTrust(items) {
  if (!items.length) {
    dataTrust.innerHTML = "";
    return;
  }

  const updateText = formatDate(latestUpdate(items));
  const sourceCount = new Set(items.map((item) => publicSiteName(item.site))).size;
  dataTrust.innerHTML = `
    <div>
      <strong>数据更新时间：${updateText}</strong>
      <span>${sourceCount} 个价格来源 · 商品链接可直接打开原平台核对</span>
    </div>
    <p>价格会随平台活动和库存变化，请以原平台页面实时价格为准。</p>
  `;
}

function itemMatchesType(item, type) {
  const text = normalize(`${item.title} ${item.tags.join(" ")}`);
  return type.words.some((word) => text.includes(word));
}

function lowestBySite(items) {
  return items.reduce((best, item) => {
    const current = best[item.site];
    if (!current || item.price < current.price) best[item.site] = item;
    return best;
  }, {});
}

function renderMatchCompare(items) {
  const rows = matchTypes.map((type) => {
    const matches = items.filter((item) => itemMatchesType(item, type));
    return {
      type,
      count: matches.length,
      bySite: lowestBySite(matches)
    };
  }).filter((row) => row.count >= 2);

  if (!rows.length) {
    matchCompare.innerHTML = "";
    return;
  }

  const columns = siteOrder.filter((site) => rows.some((row) => row.bySite[site]));
  matchCompare.innerHTML = `
    <div class="compare-head">
      <div>
        <h2>同类款式对比</h2>
        <p>按款式聚合同类手机壳，显示每个平台当前最低价。</p>
      </div>
    </div>
    <div class="compare-table">
      <div class="compare-row compare-row-head">
        <span>款式</span>
        ${columns.map((site) => `<span>${publicSiteName(site)}</span>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="compare-row">
          <strong>${row.type.label}</strong>
          ${columns.map((site) => {
            const item = row.bySite[site];
            if (!item) return `<span class="missing">-</span>`;
            const price = `${formatPrice(item.price)} ${item.currency}`;
            return item.site === "52hqb"
              ? `<span>${price}</span>`
              : `<a href="${item.url}" target="_blank" rel="noreferrer">${price}</a>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderFilters(items) {
  const sites = ["all", ...siteOrder.filter((site) => items.some((item) => item.site === site))];
  filterTabs.innerHTML = sites.map((site) => {
    const count = site === "all" ? items.length : items.filter((item) => item.site === site).length;
    const label = site === "all" ? "全部平台" : publicSiteName(site);
    return `<button type="button" class="${activeSiteFilter === site ? "active" : ""}" data-site="${site}">${label}<span>${count}</span></button>`;
  }).join("");

  filterTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeSiteFilter = button.dataset.site;
      renderFilters(items);
      renderResultsView();
    });
  });
}

function renderItem(item) {
  const title = publicTitle(item);
  const titleMarkup = item.site === "52hqb"
    ? `<span class="result-title-text">${title}</span>`
    : `<a href="${item.url}" target="_blank" rel="noreferrer">${title}</a>`;
  const imageMarkup = item.site === "52hqb"
    ? `<div class="thumb image-thumb" aria-label="${title}">
        <img src="${item.imageUrl}" alt="${title}" loading="eager" referrerpolicy="no-referrer">
      </div>`
    : `<a class="thumb image-thumb" href="${item.url}" target="_blank" rel="noreferrer" aria-label="${title}">
        <img src="${item.imageUrl}" alt="${title}" loading="eager" referrerpolicy="no-referrer">
      </a>`;

  return `
    <article class="result-item">
      ${imageMarkup}
      <div class="result-copy">
        ${titleMarkup}
        <p class="url">${publicDisplayUrl(item)}</p>
        <p class="desc">${publicDesc(item)}</p>
        <p class="freshness">更新：${formatDate(item.updatedAt)} · 来源：${publicSiteName(item.site)}</p>
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
  currentQuery = query;
  currentItems = items;
  activeSiteFilter = "all";
  resultTitle.textContent = `${query} 价格搜索结果`;
  resultMeta.textContent = `从 ${dataSourceName} 找到 ${items.length} 个手机壳结果`;

  if (!items.length) {
    priceInsights.innerHTML = "";
    dataTrust.innerHTML = "";
    matchCompare.innerHTML = "";
    filterTabs.innerHTML = "";
    siteResults.innerHTML = `<div class="empty">没有找到匹配结果，试试 iPhone 17 或 Samsung S25 Ultra。</div>`;
    return;
  }

  renderInsights(items);
  renderDataTrust(items);
  renderMatchCompare(items);
  renderFilters(items);
  renderResultsView();
}

function renderResultsView() {
  const visibleItems = sortedItems(filteredItems(currentItems));

  if (!visibleItems.length) {
    siteResults.innerHTML = `<div class="empty">这个平台暂时没有匹配结果。</div>`;
    return;
  }

  siteResults.innerHTML = groupedBySite(visibleItems).map((group) => `
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

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value;
  renderResultsView();
});

async function init() {
  renderQuickSearches();
  renderPlatforms();
  await loadProducts();
  submitSearch("iPhone 17 Pro Max");
}

init();
