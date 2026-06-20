const excludedPlatforms = ["SHEIN"];
const siteOrder = ["Trivvo", "Noon", "Amazon.sa"];
const whatsappNumber = "966506420327";
const resultsPerPage = 12;
const ownResultsPerPage = 8;
let currentLanguage = localStorage.getItem("trivvo-language") || "zh-CN";
let productDatabase = [];
let dataSourceName = "products.csv";
let activeSiteFilter = "all";
let activeSort = "recommended";
let currentQuery = "";
let currentItems = [];
const ownDetailItems = new Map();
const latestDetailItems = new Map();
const sitePages = new Map();
let activeDetailItem = null;
let cartItems = JSON.parse(localStorage.getItem("trivvo-cart") || "[]");
let procurementRequests = JSON.parse(localStorage.getItem("trivvo-procurement-requests") || "[]");
let currentUser = null;
let authToken = localStorage.getItem("trivvo-auth-token") || "";
const guestPricePreviewIds = new Set();
const favoriteProductIds = new Set(JSON.parse(localStorage.getItem("trivvo-favorites") || "[]").map(String));

const translations = {
  "zh-CN": {
    pageTitle: "TRIVVO 手机壳商城", product: "商品", search: "搜索", language: "语言",
    searchPlaceholder: "搜索 iPhone 17 Pro Max 手机壳价格", imageSearchTitle: "上传图片并输入手机型号或关键词",
    latest: "最新动态", loading: "加载中", loadingCases: "正在读取最新手机壳资料。",
    priceAdvantage: "价格优势", proofSubtitle: "真实商品图 · 多平台对比 · 自有报价",
    ownProducts: "自有商品", saudiPlatforms: "沙特平台", hd: "高清", multiImageDetails: "多图详情",
    saudiMainPlatforms: "沙特主流购物平台", platformSubtitle: "查看客户熟悉的网站价格，快速对比同款手机壳行情。",
    searchResults: "搜索结果", ourQuote: "我们的报价", sort: "排序", recommended: "推荐",
    priceLow: "价格从低到高", priceHigh: "价格从高到低", newest: "最新数据", open: "打开",
    allPlatforms: "全部平台", resultsCount: "找到 {count} 个手机壳结果", searchResultTitle: "{query} 价格搜索结果",
    noResults: "没有找到匹配结果，试试 iPhone 17 或 Samsung S25 Ultra。", noPlatformResults: "这个平台暂时没有匹配结果。",
    updated: "更新", source: "来源", productDetails: "商品详情", service: "服务", ownDatabase: "自有资料库",
    material: "产品材质", listedAt: "上架时间", updatedAt: "更新时间", certifiedSupply: "认证供应链", internalCatalog: "内部采购资料",
    images: "商品图片", models: "可选型号", currentQuote: "当前报价", dataStatus: "资料状态", verified: "已核对",
    noColors: "暂无颜色规格", defaultColor: "默认颜色",
    dropshipping: "代发服务", qualityCheck: "质检服务", ourPrice: "我们的报价", color: "颜色",
    sizeModel: "尺码 / 型号", whatsappInquiry: "WhatsApp 发送询价", reviews: "商品评价",
    imageAuthentic: "图片真实", newStyle: "款式新", goodPrice: "价格有优势",
    customerFeedback: "客户反馈", customerFeedbackText: "图片清楚，适合快速看款式和报价。",
    purchaseFeedback: "采购反馈", purchaseFeedbackText: "同款对比明显，适合做沙特市场价格参考。",
    selectSkuFirst: "请先选择尺码/型号数量，再发送询价。",
    imageKeywordPrompt: "图片已上传。请输入手机型号或商品关键词进行搜索：", imageKeywordRequired: "需要输入手机型号或关键词才能搜索。",
    inquiryHello: "你好，我想询价：", inquiryProduct: "商品", selectedModels: "已选择型号",
    referencePrice: "价格", productImage: "商品图片", inquiryEnd: "请告诉我最终价格和发货方式。",
    platformNoon: "沙特本地常用电商平台，适合对比畅销款和本地零售价格。",
    platformAmazon: "客户熟悉的沙特购物网站，适合查看品牌款、MagSafe、防摔壳价格。",
    platformShein: "沙特客户常看的时尚购物平台，适合参考流行款式、颜色和年轻客群偏好。",
    platformJarir: "沙特知名电子产品零售商，适合参考高客单价配件价格。",
    platformExtra: "沙特大型电子零售平台，适合对比手机配件零售价格。",
    platformVirgin: "沙特常见电子和生活方式零售平台，适合参考手机配件价格。",
    lowestMarket: "最低市场价", lowestSaudi: "沙特平台最低价", noMarketData: "暂无市场数据",
    ownChannelQuote: "自有渠道报价", noQuote: "暂无报价", waitingData: "等待更多数据", aboutLower: "约低 {rate}%",
    averageMarket: "市场均价", marketResultCount: "{count} 个沙特平台结果",
    dataUpdated: "数据更新时间：{date}", sourceCount: "{count} 个价格来源 · 商品链接可直接打开原平台核对",
    priceDisclaimer: "价格会随平台活动和库存变化，请以原平台页面实时价格为准。",
    similarCompare: "同类款式对比", compareSubtitle: "按款式聚合同类手机壳，显示每个平台当前最低价。", style: "款式",
    magsafeStyle: "MagSafe 磁吸款", clearStyle: "透明防黄款", shockStyle: "防摔保护款", standStyle: "支架功能款", fashionStyle: "时尚图案款",
    shopByDevice: "按手机型号浏览", viewDetails: "查看详情", visitPlatform: "打开平台"
    ,productHighlights: "产品亮点", realPhotos: "真实商品图片", multiAngle: "多角度高清详情", quickReply: "WhatsApp 快速报价"
  },
  en: {
    pageTitle: "TRIVVO Phone Cases", product: "Products", search: "Search", language: "Language",
    searchPlaceholder: "Search iPhone 17 Pro Max case prices", imageSearchTitle: "Upload an image, then enter a phone model or keyword",
    latest: "Latest", loading: "Loading", loadingCases: "Loading the latest phone cases.",
    priceAdvantage: "Price advantage", proofSubtitle: "Real photos · Multi-platform comparison · Our quote",
    ownProducts: "Our products", saudiPlatforms: "Saudi platforms", hd: "HD", multiImageDetails: "Multi-image details",
    saudiMainPlatforms: "Popular Saudi shopping platforms", platformSubtitle: "Compare phone case prices across familiar Saudi websites.",
    searchResults: "Search results", ourQuote: "Our quote", sort: "Sort", recommended: "Recommended",
    priceLow: "Price: low to high", priceHigh: "Price: high to low", newest: "Newest", open: "Open",
    allPlatforms: "All platforms", resultsCount: "Found {count} phone case results", searchResultTitle: "{query} price results",
    noResults: "No matching results. Try iPhone 17 or Samsung S25 Ultra.", noPlatformResults: "No matching results on this platform.",
    updated: "Updated", source: "Source", productDetails: "Product details", service: "Services", ownDatabase: "Our catalog",
    material: "Material", listedAt: "Listed", updatedAt: "Updated", certifiedSupply: "Verified supply", internalCatalog: "Internal catalog",
    images: "Product images", models: "Available models", currentQuote: "Current quote", dataStatus: "Data status", verified: "Verified",
    noColors: "No color options", defaultColor: "Default color",
    dropshipping: "Dropshipping", qualityCheck: "Quality inspection", ourPrice: "Our price", color: "Color",
    sizeModel: "Size / Model", whatsappInquiry: "Send WhatsApp inquiry", reviews: "Product reviews",
    imageAuthentic: "Accurate photos", newStyle: "New styles", goodPrice: "Competitive price",
    customerFeedback: "Customer feedback", customerFeedbackText: "Clear images make styles and prices easy to review.",
    purchaseFeedback: "Buyer feedback", purchaseFeedbackText: "Easy comparison for the Saudi market.",
    selectSkuFirst: "Select at least one model quantity before sending an inquiry.",
    imageKeywordPrompt: "Image uploaded. Enter the phone model or product keyword to search:", imageKeywordRequired: "Enter a phone model or keyword to search.",
    inquiryHello: "Hello, I would like a quote:", inquiryProduct: "Product", selectedModels: "Selected models",
    referencePrice: "Price", productImage: "Product image", inquiryEnd: "Please confirm the final price and shipping options.",
    platformNoon: "A popular Saudi marketplace for comparing bestsellers and local retail prices.",
    platformAmazon: "A familiar Saudi shopping site for branded, MagSafe, and protective cases.",
    platformShein: "A fashion marketplace useful for tracking popular styles and colors.",
    platformJarir: "A major Saudi electronics retailer useful for premium accessory pricing.",
    platformExtra: "A major Saudi electronics platform for retail accessory price comparison.",
    platformVirgin: "A Saudi lifestyle and electronics retailer for accessory price reference.",
    lowestMarket: "Lowest market price", lowestSaudi: "Lowest Saudi platform price", noMarketData: "No market data",
    ownChannelQuote: "Our channel quote", noQuote: "No quote", waitingData: "Waiting for more data", aboutLower: "About {rate}% lower",
    averageMarket: "Average market price", marketResultCount: "{count} Saudi platform results",
    dataUpdated: "Data updated: {date}", sourceCount: "{count} price sources · Open original links to verify",
    priceDisclaimer: "Prices may change with promotions and stock. Confirm the live price on the original platform.",
    similarCompare: "Similar style comparison", compareSubtitle: "Groups similar cases and shows the lowest current price on each platform.", style: "Style",
    magsafeStyle: "MagSafe cases", clearStyle: "Clear anti-yellow cases", shockStyle: "Shockproof cases", standStyle: "Stand cases", fashionStyle: "Fashion cases",
    shopByDevice: "Shop by device", viewDetails: "View details", visitPlatform: "Visit platform"
    ,productHighlights: "Product highlights", realPhotos: "Real product photos", multiAngle: "HD multi-angle details", quickReply: "Fast WhatsApp quote"
  },
  ar: {
    pageTitle: "TRIVVO أغطية الجوال", product: "المنتجات", search: "بحث", language: "اللغة",
    searchPlaceholder: "ابحث عن أسعار غطاء iPhone 17 Pro Max", imageSearchTitle: "ارفع صورة ثم أدخل موديل الجوال أو كلمة البحث",
    latest: "أحدث المنتجات", loading: "جار التحميل", loadingCases: "جار تحميل أحدث أغطية الجوال.",
    priceAdvantage: "ميزة السعر", proofSubtitle: "صور حقيقية · مقارنة منصات · عرضنا",
    ownProducts: "منتجاتنا", saudiPlatforms: "منصات سعودية", hd: "عالية الدقة", multiImageDetails: "صور متعددة",
    saudiMainPlatforms: "أشهر منصات التسوق السعودية", platformSubtitle: "قارن أسعار أغطية الجوال في المواقع المعروفة.",
    searchResults: "نتائج البحث", ourQuote: "عرضنا", sort: "الترتيب", recommended: "موصى به",
    priceLow: "السعر: من الأقل", priceHigh: "السعر: من الأعلى", newest: "الأحدث", open: "فتح",
    allPlatforms: "كل المنصات", resultsCount: "تم العثور على {count} نتيجة", searchResultTitle: "نتائج أسعار {query}",
    noResults: "لا توجد نتائج مطابقة. جرّب iPhone 17 أو Samsung S25 Ultra.", noPlatformResults: "لا توجد نتائج مطابقة في هذه المنصة.",
    updated: "تحديث", source: "المصدر", productDetails: "تفاصيل المنتج", service: "الخدمات", ownDatabase: "كتالوجنا",
    material: "الخامة", listedAt: "تاريخ الإدراج", updatedAt: "آخر تحديث", certifiedSupply: "توريد موثق", internalCatalog: "كتالوج داخلي",
    images: "صور المنتج", models: "الموديلات المتاحة", currentQuote: "السعر الحالي", dataStatus: "حالة البيانات", verified: "تم التحقق",
    noColors: "لا توجد خيارات ألوان", defaultColor: "اللون الافتراضي",
    dropshipping: "شحن مباشر", qualityCheck: "فحص الجودة", ourPrice: "سعرنا", color: "اللون",
    sizeModel: "المقاس / الموديل", whatsappInquiry: "إرسال استفسار واتساب", reviews: "تقييمات المنتج",
    imageAuthentic: "صور حقيقية", newStyle: "موديلات جديدة", goodPrice: "سعر منافس",
    customerFeedback: "رأي العميل", customerFeedbackText: "الصور واضحة وتسهل مراجعة الموديلات والأسعار.",
    purchaseFeedback: "رأي المشتري", purchaseFeedbackText: "مقارنة سهلة للسوق السعودي.",
    selectSkuFirst: "اختر كمية لموديل واحد على الأقل قبل إرسال الاستفسار.",
    imageKeywordPrompt: "تم رفع الصورة. أدخل موديل الجوال أو كلمة البحث:", imageKeywordRequired: "أدخل موديل الجوال أو كلمة بحث.",
    inquiryHello: "مرحباً، أود طلب عرض سعر:", inquiryProduct: "المنتج", selectedModels: "الموديلات المختارة",
    referencePrice: "السعر", productImage: "صورة المنتج", inquiryEnd: "يرجى تأكيد السعر النهائي وخيارات الشحن.",
    platformNoon: "منصة سعودية شائعة لمقارنة المنتجات الأكثر مبيعاً والأسعار المحلية.",
    platformAmazon: "موقع تسوق معروف لمقارنة الأغطية ذات العلامات التجارية وMagSafe.",
    platformShein: "منصة أزياء لمتابعة الموديلات والألوان الرائجة.",
    platformJarir: "متجر إلكترونيات سعودي معروف لمقارنة أسعار الإكسسوارات المميزة.",
    platformExtra: "منصة إلكترونيات سعودية كبيرة لمقارنة أسعار الإكسسوارات.",
    platformVirgin: "متجر إلكترونيات ومنتجات عصرية لمراجعة أسعار الإكسسوارات.",
    lowestMarket: "أقل سعر في السوق", lowestSaudi: "أقل سعر في المنصات السعودية", noMarketData: "لا توجد بيانات سوق",
    ownChannelQuote: "عرضنا", noQuote: "لا يوجد عرض", waitingData: "بانتظار بيانات إضافية", aboutLower: "أقل بحوالي {rate}%",
    averageMarket: "متوسط سعر السوق", marketResultCount: "{count} نتائج من منصات سعودية",
    dataUpdated: "آخر تحديث: {date}", sourceCount: "{count} مصادر أسعار · يمكن فتح الروابط للتحقق",
    priceDisclaimer: "قد تتغير الأسعار حسب العروض والمخزون. يرجى تأكيد السعر في المنصة الأصلية.",
    similarCompare: "مقارنة الموديلات المتشابهة", compareSubtitle: "يعرض أقل سعر حالي لكل منصة.", style: "الموديل",
    magsafeStyle: "أغطية MagSafe", clearStyle: "أغطية شفافة", shockStyle: "أغطية مقاومة للصدمات", standStyle: "أغطية بحامل", fashionStyle: "أغطية عصرية",
    shopByDevice: "تسوق حسب الجهاز", viewDetails: "عرض التفاصيل", visitPlatform: "فتح المنصة"
    ,productHighlights: "مميزات المنتج", realPhotos: "صور حقيقية للمنتج", multiAngle: "صور عالية الدقة من عدة زوايا", quickReply: "عرض سريع عبر واتساب"
  }
};

const lockedPriceLabel = "注册后查看价格";
const guestPricePreviewLimit = 10;

function isMember() {
  return Boolean(currentUser && authToken);
}

function canViewOwnPrice(item) {
  return isMember() || item?.site !== "Trivvo" || guestPricePreviewIds.has(String(item?.id));
}

function memberPrice(item) {
  return canViewOwnPrice(item) ? `${formatPrice(item.price)} ${item.currency}` : lockedPriceLabel;
}

function requireMember() {
  if (isMember()) return true;
  openAuthModal();
  return false;
}

function favoriteKey(item) {
  return String(item?.id || "");
}

function isFavorite(item) {
  return favoriteProductIds.has(favoriteKey(item));
}

function saveFavorites() {
  localStorage.setItem("trivvo-favorites", JSON.stringify([...favoriteProductIds]));
}

function favoriteButton(item, className = "favorite-button") {
  const active = isFavorite(item);
  return `<button class="${className}${active ? " active" : ""}" type="button" data-favorite-key="${favoriteKey(item)}" aria-label="${active ? "取消收藏" : "加入收藏"}" aria-pressed="${active}"><span class="favorite-icon" aria-hidden="true"></span></button>`;
}

function toggleFavorite(item) {
  if (!item) return;
  const key = favoriteKey(item);
  if (favoriteProductIds.has(key)) favoriteProductIds.delete(key);
  else favoriteProductIds.add(key);
  saveFavorites();
  document.querySelectorAll(`[data-favorite-key="${CSS.escape(key)}"]`).forEach((button) => {
    const active = favoriteProductIds.has(key);
    button.classList.toggle("active", active);
    button.classList.remove("favorite-pop");
    void button.offsetWidth;
    button.classList.add("favorite-pop");
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "取消收藏" : "加入收藏");
  });
}

function updateGuestPricePreviews(items = currentItems) {
  guestPricePreviewIds.clear();
  if (isMember()) return;
  items.filter((item) => item.site === "Trivvo" && item.guestPreview && Number.isFinite(item.price))
    .sort((a, b) => a.price - b.price)
    .slice(0, guestPricePreviewLimit)
    .forEach((item) => guestPricePreviewIds.add(String(item.id)));
}

translations.ja = { ...translations.en, language: "言語", search: "検索", product: "商品", ourQuote: "当社価格", latest: "最新情報", whatsappInquiry: "WhatsAppで見積依頼" };
translations.ko = { ...translations.en, language: "언어", search: "검색", product: "상품", ourQuote: "당사 견적", latest: "최신 소식", whatsappInquiry: "WhatsApp 견적 문의" };
translations.tr = { ...translations.en, language: "Dil", search: "Ara", product: "Ürünler", ourQuote: "Teklifimiz", latest: "En yeniler", whatsappInquiry: "WhatsApp fiyat teklifi gönder" };

function t(key, values = {}) {
  const dictionary = translations[currentLanguage] || translations.en;
  let text = dictionary[key] || translations.en[key] || translations["zh-CN"][key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

const procurementPlatforms = [
  {
    name: "Noon",
    url: "https://www.noon.com/saudi-en/search/?q=phone%20case",
    displayUrl: "noon.com/saudi-en",
    image: "images/platform-noon.svg",
    descKey: "platformNoon"
  },
  {
    name: "Amazon.sa",
    url: "https://www.amazon.sa/s?k=phone+case",
    displayUrl: "amazon.sa",
    image: "images/platform-amazon.svg",
    descKey: "platformAmazon"
  },
  {
    name: "SHEIN",
    url: "https://ar.shein.com/pdsearch/phone%20case/",
    displayUrl: "shein.com",
    image: "images/platform-shein.svg",
    descKey: "platformShein"
  },
  {
    name: "Jarir",
    url: "https://www.jarir.com/sa-en/catalogsearch/result/?q=phone%20case",
    displayUrl: "jarir.com",
    image: "images/platform-jarir.svg",
    descKey: "platformJarir"
  },
  {
    name: "Extra",
    url: "https://www.extra.com/en-sa/search/?text=phone%20case",
    displayUrl: "extra.com",
    image: "images/platform-extra.svg",
    descKey: "platformExtra"
  },
  {
    name: "Virgin Megastore",
    url: "https://www.virginmegastore.sa/en/search/?q=phone%20case",
    displayUrl: "virginmegastore.sa",
    image: "images/platform-virgin.svg",
    descKey: "platformVirgin"
  }
];

const matchTypes = [
  { labelKey: "magsafeStyle", words: ["magsafe", "magnetic"] },
  { labelKey: "clearStyle", words: ["clear", "transparent", "anti", "yellow"] },
  { labelKey: "shockStyle", words: ["armor", "shockproof", "military", "heavy"] },
  { labelKey: "standStyle", words: ["kickstand", "stand"] },
  { labelKey: "fashionStyle", words: ["fashion", "cute", "pattern", "colorful", "glitter"] }
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
const latestTrack = document.querySelector("#latestTrack");
const languagePicker = document.querySelector(".language-picker select");
const platformCount = document.querySelector("#platformCount");
const homeGallery = document.querySelector(".home-gallery");
const storeFavorites = document.querySelector("#storeFavorites");
const storeProductGrid = document.querySelector("#storeProductGrid");
const storeCategoryPills = document.querySelector("#storeCategoryPills");
const homeCollections = document.querySelector("#homeCollections");
const cbStoryGrid = document.querySelector("#cbStoryGrid");
const cbSeriesRowOne = document.querySelector("#cbSeriesRowOne");
const cbSeriesRowTwo = document.querySelector("#cbSeriesRowTwo");
const homeGalleryItems = new Map();
const storeProductItems = new Map();
let homeGalleryActiveImages = [];
let homeGalleryActiveIndex = 0;
let homeGalleryTimer = null;
let activeStoreFilter = "all";
let storeProductLimit = 6;
let pageDrag = null;
let suppressDragClick = false;

function applyLanguage() {
  const dictionary = translations[currentLanguage] || translations.en;
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });
  if (languagePicker) languagePicker.value = currentLanguage;
  if (platformCount) platformCount.textContent = String(procurementPlatforms.length);
  renderPlatforms();
  if (productDatabase.length) {
    renderLatestTicker();
    if (currentQuery) renderResults(currentQuery, currentItems);
  }
  closeOwnDetail();
  return dictionary;
}

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
  const detailImageUrls = Array.isArray(row.detail_image_urls)
    ? row.detail_image_urls.filter(Boolean)
    : [];
  return {
    id: row.id,
    title: row.title,
    model: row.model,
    site: row.platform,
    siteClass: siteClass(row.platform),
    price: row.price === null || row.price === undefined || row.price === "" ? null : Number(row.price),
    guestPreview: Boolean(row.guest_preview),
    currency: row.currency || "SAR",
    imageUrl: inferProductImage(row),
    url: override?.url || row.product_url,
    displayUrl: row.display_url,
    desc: `${row.platform} · ${row.model} · ${row.tags}`,
    tags: row.tags.split(/\s+/).filter(Boolean),
    updatedAt: row.updated_at,
    detailImageUrls,
    sourcePayload: row.source_payload || null,
    stockStatus: row.stock_status || "库存需确认",
    minimumOrderQuantity: Number(row.minimum_order_quantity) || 10,
    leadTime: row.lead_time || "2–5 个工作日"
  };
}

function visibleProducts(rows) {
  return rows.filter((item) => !excludedPlatforms.includes(item.site));
}

function siteClass(site) {
  if (site === "Trivvo") return "source";
  if (site === "Noon") return "noon";
  if (site === "Amazon.sa") return "amazon";
  return "source";
}

function publicSiteName(site) {
  return site === "Trivvo" ? t("ourQuote") : site;
}

function publicDisplayUrl(item) {
  return item.site === "Trivvo" ? t("ourQuote") : item.displayUrl;
}

function publicDesc(item) {
  if (item.site !== "Trivvo") return item.desc;
  return item.desc.replace(/^Trivvo/, t("ourQuote"));
}

function publicTitle(item) {
  if (item.site !== "Trivvo") return item.title;
  return item.title.replace(/^Trivvo\s+/i, "自有渠道 ");
}

async function loadProducts() {
  async function loadCsvProducts() {
    const response = await fetch("products.csv", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csv = await response.text();
    productDatabase = visibleProducts(parseCsv(csv).map(hydrateProduct));
    dataSourceName = "products.csv";
  }

  async function loadRealHqbProducts() {
    const response = await fetch("products-public.json", { cache: "no-store" });
    if (!response.ok) return [];
    const rows = await response.json();
    return visibleProducts(rows.map((row) => hydrateProduct({
      id: row.source_id,
      title: row.title,
      model: row.model,
      platform: "Trivvo",
      price: row.price,
      guest_preview: row.guest_preview,
      currency: row.currency,
      image_url: row.main_image_url,
      product_url: row.product_url,
      display_url: row.display_url,
      tags: row.tags,
      updated_at: row.updated_at,
      detail_image_urls: row.detail_images,
      source_payload: row.source_payload,
      stock_status: row.stock_status,
      minimum_order_quantity: row.minimum_order_quantity,
      lead_time: row.lead_time
    })));
  }

  async function mergeRealHqbProducts() {
    try {
      const realItems = await loadRealHqbProducts();
      if (!realItems.length) return;
      productDatabase = [
        ...productDatabase.filter((item) => item.site !== "Trivvo"),
        ...realItems
      ];
      dataSourceName = `${dataSourceName} + Trivvo 真实多图`;
    } catch (error) {
      console.warn("Trivvo 真实多图数据加载失败。", error);
    }
  }

  if (window.SUPABASE_CONFIG?.url && window.SUPABASE_CONFIG?.anonKey) {
    try {
      const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/products?select=id,title,model,platform,price,currency,image_url,product_url,display_url,tags,updated_at,detail_image_urls&order=updated_at.desc`, {
        headers: {
          apikey: window.SUPABASE_CONFIG.anonKey,
          Authorization: `Bearer ${window.SUPABASE_CONFIG.anonKey}`
        }
      });
      if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
      const rows = await response.json();
      productDatabase = visibleProducts(rows.map((row) => hydrateProduct({
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
        updated_at: row.updated_at,
        detail_image_urls: row.detail_image_urls,
        source_payload: null
      })));
      dataSourceName = "Supabase 云端数据库";
      await mergeRealHqbProducts();
      return;
    } catch (error) {
      console.warn("Supabase 加载失败，改用 products.csv。", error);
    }
  }

  try {
    await loadCsvProducts();
    await mergeRealHqbProducts();
  } catch (error) {
    siteResults.innerHTML = `<div class="empty">商品数据库加载失败，请确认 Supabase 配置或 products.csv 可以访问。</div>`;
    console.error(error);
  }
}

async function loadMemberPrices() {
  if (!isMember() || !window.SUPABASE_CONFIG?.url) return;
  const response = await fetch(`${window.SUPABASE_CONFIG.url}/rest/v1/member_prices?select=source_id,price,currency`, {
    headers: authHeaders(authToken)
  });
  if (!response.ok) throw new Error(`会员报价加载失败：HTTP ${response.status}`);
  const prices = new Map((await response.json()).map((row) => [String(row.source_id), row]));
  productDatabase.forEach((item) => {
    if (item.site !== "Trivvo") return;
    const quote = prices.get(String(item.id));
    if (!quote) return;
    item.price = Number(quote.price);
    item.currency = quote.currency || "SAR";
  });
}

function matchesQuery(item, query) {
  if (!query) return false;
  const text = `${item.site} ${item.model} ${item.title} ${item.desc} ${item.tags.join(" ")}`;
  return normalize(text).includes(normalize(query));
}

function detectedPhoneModel(query) {
  const text = normalize(query);
  const models = [
    "iphone 17 pro max",
    "iphone 17 pro",
    "iphone 17",
    "samsung s25 ultra",
    "samsung a56 5g"
  ];
  return models.find((model) => text.includes(model)) || "";
}

function supportedModels(item) {
  return new Set([
    item.model,
    ...sourceSpecGroup(item, "型号").map((model) => model.value)
  ].filter(Boolean).map(normalize));
}

function dedupeSearchResults(items) {
  const best = new Map();
  items.forEach((item) => {
    const key = `${item.site}|${normalize(item.title)}`;
    const current = best.get(key);
    if (!current
      || ownDetailImages(item).length > ownDetailImages(current).length
      || (Number.isFinite(item.price) && !Number.isFinite(current.price))) {
      best.set(key, item);
    }
  });
  return [...best.values()];
}

function displayModel(item) {
  const searchedModel = detectedPhoneModel(currentQuery);
  if (searchedModel && supportedModels(item).has(searchedModel)) {
    return searchedModel.replace(/\biphone\b/i, "iPhone").replace(/\bsamsung\b/i, "Samsung")
      .replace(/\bpro max\b/i, "Pro Max").replace(/\bpro\b/i, "Pro").replace(/\bultra\b/i, "Ultra");
  }
  return item.model;
}

function searchCases(query) {
  const model = detectedPhoneModel(query);
  const exactModel = model
    ? productDatabase.filter((item) => supportedModels(item).has(model) && matchesQuery(item, query))
    : [];
  if (exactModel.length) return dedupeSearchResults(exactModel);

  const direct = productDatabase.filter((item) => matchesQuery(item, query));
  if (direct.length) return dedupeSearchResults(direct);

  const words = normalize(query).split(" ").filter(Boolean);
  return dedupeSearchResults(productDatabase.filter((item) => {
    const text = normalize(`${item.model} ${item.title} ${item.tags.join(" ")}`);
    return words.some((word) => text.includes(word));
  }));
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

function resultsPerPageForSite(site) {
  return site === "Trivvo" ? ownResultsPerPage : resultsPerPage;
}

function renderPagination(site, itemCount) {
  const pageCount = Math.ceil(itemCount / resultsPerPageForSite(site));
  if (pageCount <= 1) return "";
  const currentPage = Math.min(sitePages.get(site) || 1, pageCount);
  const visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === pageCount || Math.abs(page - currentPage) <= 1);
  const buttons = [];

  visiblePages.forEach((page, index) => {
    if (index && page - visiblePages[index - 1] > 1) buttons.push("<span>…</span>");
    buttons.push(`<button class="${page === currentPage ? "active" : ""}" type="button" data-page-site="${site}" data-page="${page}" aria-label="第 ${page} 页">${page}</button>`);
  });

  return `
    <nav class="site-pagination" aria-label="${publicSiteName(site)} 商品翻页">
      <button type="button" data-page-site="${site}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="上一页">‹</button>
      ${buttons.join("")}
      <button type="button" data-page-site="${site}" data-page="${currentPage + 1}" ${currentPage === pageCount ? "disabled" : ""} aria-label="下一页">›</button>
      <em>第 ${currentPage} / ${pageCount} 页</em>
    </nav>
  `;
}

function priceSummary(items) {
  if (items[0]?.site === "Trivvo" && !isMember()) {
    const previews = items.filter((item) => canViewOwnPrice(item));
    return previews.length ? `${formatPrice(Math.min(...previews.map((item) => item.price)))} SAR 起 · 更多价格注册后查看` : lockedPriceLabel;
  }
  const prices = items.map((item) => item.price).filter(Number.isFinite);
  if (!prices.length) return lockedPriceLabel;
  return `${Math.min(...prices).toFixed(2).replace(".00", "")}-${Math.max(...prices).toFixed(2).replace(".00", "")} SAR`;
}

function formatPrice(value) {
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value).toFixed(2).replace(".00", "");
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(currentLanguage, {
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
    const aPrice = Number.isFinite(a.price) ? a.price : Number.POSITIVE_INFINITY;
    const bPrice = Number.isFinite(b.price) ? b.price : Number.POSITIVE_INFINITY;
    if (activeSort === "price-low") return aPrice - bPrice;
    if (activeSort === "price-high") return (Number.isFinite(b.price) ? b.price : Number.NEGATIVE_INFINITY) - (Number.isFinite(a.price) ? a.price : Number.NEGATIVE_INFINITY);
    if (activeSort === "newest") return String(b.updatedAt).localeCompare(String(a.updatedAt));
    return siteRank(a.site) - siteRank(b.site) || aPrice - bPrice;
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

  const marketItems = items.filter((item) => item.site !== "Trivvo");
  const ownItems = items.filter((item) => item.site === "Trivvo");
  const marketPrices = marketItems.map((item) => item.price).filter(Number.isFinite);
  const ownPrices = ownItems.map((item) => item.price).filter(Number.isFinite);
  const lowestMarket = marketPrices.length ? Math.min(...marketPrices) : null;
  const averageMarket = marketPrices.length
    ? marketPrices.reduce((sum, price) => sum + price, 0) / marketPrices.length
    : null;
  const ownLowest = ownPrices.length ? Math.min(...ownPrices) : null;
  const saving = lowestMarket !== null && ownLowest !== null ? lowestMarket - ownLowest : null;
  const savingRate = saving !== null && lowestMarket > 0 ? Math.round((saving / lowestMarket) * 100) : null;

  const cards = [
    {
      label: t("ourQuote"),
      value: !isMember() ? `${formatPrice(ownLowest)} SAR 起` : ownLowest === null ? "-" : `${formatPrice(ownLowest)} SAR`,
      note: !isMember() ? "已开放 10 款试看价，注册查看全部报价" : ownItems.length ? t("ownChannelQuote") : t("noQuote"),
      featured: true
    },
    {
      label: t("lowestMarket"),
      value: lowestMarket === null ? "-" : `${formatPrice(lowestMarket)} SAR`,
      note: marketItems.length ? t("lowestSaudi") : t("noMarketData")
    },
    {
      label: t("priceAdvantage"),
      value: !isMember() ? "登录后计算" : saving === null ? "-" : `${formatPrice(Math.max(saving, 0))} SAR`,
      note: !isMember() ? "登录后查看你的价格优势" : savingRate === null ? t("waitingData") : t("aboutLower", { rate: Math.max(savingRate, 0) })
    },
    {
      label: t("averageMarket"),
      value: averageMarket === null ? "-" : `${formatPrice(averageMarket)} SAR`,
      note: t("marketResultCount", { count: marketItems.length })
    }
  ];

  priceInsights.innerHTML = cards.map((card) => `
    <div class="insight-card${card.featured ? " insight-card-featured" : ""}">
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
      <strong>${t("dataUpdated", { date: updateText })}</strong>
      <span>${t("sourceCount", { count: sourceCount })}</span>
    </div>
    <p>${t("priceDisclaimer")}</p>
  `;
}

function itemMatchesType(item, type) {
  const text = normalize(`${item.title} ${item.tags.join(" ")}`);
  return type.words.some((word) => text.includes(word));
}

function lowestBySite(items) {
  return items.reduce((best, item) => {
    if (!Number.isFinite(item.price)) return best;
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
        <h2>${t("similarCompare")}</h2>
        <p>${t("compareSubtitle")}</p>
      </div>
    </div>
    <div class="compare-table">
      <div class="compare-row compare-row-head">
        <span>${t("style")}</span>
        ${columns.map((site) => `<span>${publicSiteName(site)}</span>`).join("")}
      </div>
      ${rows.map((row) => `
        <div class="compare-row">
          <strong>${t(row.type.labelKey)}</strong>
          ${columns.map((site) => {
            const item = row.bySite[site];
            if (!item) return `<span class="missing">-</span>`;
            const price = item.site === "Trivvo" ? memberPrice(item) : `${formatPrice(item.price)} ${item.currency}`;
            return item.site === "Trivvo"
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
    const label = site === "all" ? t("allPlatforms") : publicSiteName(site);
    return `<button type="button" class="${activeSiteFilter === site ? "active" : ""}" data-site="${site}">${label}<span>${count}</span></button>`;
  }).join("");

  filterTabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeSiteFilter = button.dataset.site;
      sitePages.clear();
      renderFilters(items);
      renderResultsView();
    });
  });
}

function renderItem(item) {
  const fullTitle = publicTitle(item);
  const title = item.site === "Trivvo" ? latestShortTitle(item) : fullTitle;
  const detailKey = `${item.site}-${item.id}`;
  if (item.site === "Trivvo") ownDetailItems.set(detailKey, item);
  const titleMarkup = item.site === "Trivvo"
    ? `<button class="result-title-text own-detail-trigger" type="button" data-detail-key="${detailKey}" title="${fullTitle}">${title}</button>`
    : `<a href="${item.url}" target="_blank" rel="noreferrer">${title}</a>`;
  const imageMarkup = item.site === "Trivvo"
    ? `<button class="thumb image-thumb own-detail-trigger" type="button" data-detail-key="${detailKey}" aria-label="${fullTitle}">
        <img src="${item.imageUrl}" alt="${fullTitle}" loading="eager" referrerpolicy="no-referrer">
      </button>`
    : `<a class="thumb image-thumb" href="${item.url}" target="_blank" rel="noreferrer" aria-label="${title}">
        <img src="${item.imageUrl}" alt="${title}" loading="eager" referrerpolicy="no-referrer">
      </a>`;
  const actionMarkup = item.site === "Trivvo"
    ? `<div class="result-actions">
        <button class="result-cart-add" type="button" data-cart-key="${detailKey}">加入购物车</button>
        <button class="result-action own-detail-trigger" type="button" data-detail-key="${detailKey}">${t("viewDetails")}</button>
      </div>`
    : `<a class="result-action" href="${item.url}" target="_blank" rel="noreferrer">${t("visitPlatform")}</a>`;

  const guestPreview = item.site === "Trivvo" && !isMember() && canViewOwnPrice(item);
  return `
    <article class="result-item${guestPreview ? " guest-price-preview" : ""}">
      ${item.site === "Trivvo" ? favoriteButton(item) : ""}
      ${imageMarkup}
      <div class="result-copy">
        ${titleMarkup}
        <span class="result-model">${displayModel(item)}</span>
        <p class="url">${publicSiteName(item.site)}</p>
        <span class="result-material">${item.site === "Trivvo" ? productMaterial(item) : item.tags.slice(0, 2).join(" · ")}</span>
        ${item.site === "Trivvo" ? `<div class="result-order-info">
          <span>${orderInfo(item).stock}</span>
          <span>${orderInfo(item).moq}</span>
          <span>${orderInfo(item).leadTime}</span>
        </div>` : ""}
      </div>
      <div class="price">
        <strong>${item.site === "Trivvo" && !canViewOwnPrice(item) ? "会员价" : formatPrice(item.price)}</strong>
        <span>${item.site === "Trivvo" && !canViewOwnPrice(item) ? "注册后查看" : guestPreview ? `试看价 · ${item.currency}` : item.currency}</span>
      </div>
      ${actionMarkup}
    </article>
  `;
}

function ownDetailImages(item) {
  return Array.from(new Set([item.imageUrl, ...(item.detailImageUrls || [])].filter(Boolean)));
}

function sourceShopName(item) {
  return item.sourcePayload?.shop
    || item.sourcePayload?.shopName
    || item.sourcePayload?.info?.shopInfo?.shopName
    || "自有资料库";
}

function sourceInfo(item) {
  return item.sourcePayload?.info || {};
}

function sourceListItem(item) {
  return item.sourcePayload?.listItem || {};
}

function sourceShopInfo(item) {
  return sourceListItem(item).shopInfo || sourceInfo(item).shopInfo || {};
}

function sourceSpecGroups(item) {
  return Object.values(sourceInfo(item).specsList || {}).map((group) => ({
    name: group.specName || "规格",
    items: Array.isArray(group.items) ? group.items : []
  })).filter((group) => group.items.length);
}

function sourceSpecGroup(item, name) {
  return sourceSpecGroups(item).find((group) => group.name.includes(name))?.items || [];
}

function sourceCategory(item) {
  return sourceInfo(item).catePath || "3C数码配件>手机配件>手机保护套/壳";
}

function sourceGoodsId(item) {
  return sourceInfo(item).id || sourceListItem(item).goodsId || item.id;
}

function sourceGoodsSn(item) {
  return sourceInfo(item).goodsSn || sourceListItem(item).goodsSn || item.model;
}

function productMaterial(item) {
  const text = `${item.title || ""} ${item.tags?.join?.(" ") || ""} ${item.tags || ""}`.toLowerCase();
  const materials = [
    [/液态硅胶|硅胶|silicone/, "液态硅胶"],
    [/亚克力|acrylic/, "亚克力"],
    [/\btpu\b|软胶|软边/, "TPU 软胶"],
    [/\bpc\b|硬壳|硬胶/, "PC 硬壳"],
    [/玻璃|glass/, "玻璃"],
    [/皮革|leather/, "皮革"],
    [/磁吸|magsafe|magnetic/, "磁吸保护壳"],
    [/透明|clear/, "透明保护壳"]
  ];
  return materials.find(([pattern]) => pattern.test(text))?.[1] || "手机壳材质";
}

function orderInfo(item) {
  return {
    stock: item.stockStatus || "库存需确认",
    moq: `${item.minimumOrderQuantity || 10} 件起订`,
    leadTime: `${item.leadTime || "2–5 个工作日"}发出`
  };
}

function customerPrice(item) {
  return memberPrice(item);
}

function supplierMetrics(item) {
  return [
    [t("images"), ownDetailImages(item).length],
    [t("models"), sourceSpecGroup(item, "型号").length || 1],
    [t("updatedAt"), formatDate(item.updatedAt)],
    [t("currentQuote"), customerPrice(item)],
    [t("dataStatus"), t("verified")]
  ];
}

function renderSourceMeta(item) {
  const info = sourceInfo(item);
  return [
    [t("material"), productMaterial(item)],
    ["库存状态", orderInfo(item).stock],
    ["最低订购量", orderInfo(item).moq],
    ["预计发货", orderInfo(item).leadTime],
    [t("listedAt"), info.createTime || formatDate(item.updatedAt)],
    [t("updatedAt"), info.updateTime || formatDate(item.updatedAt)]
  ].map(([label, value]) => `<div><strong>${label}</strong><span>${value || "-"}</span></div>`).join("");
}

function renderColorOptions(item) {
  const colors = sourceSpecGroup(item, "颜色").slice(0, 12);
  if (!colors.length) return `<p class="detail-muted">${t("noColors")}</p>`;
  return colors.map((color, index) => `
    <button class="${index === 0 ? "active" : ""}" type="button" data-swatch-image="${color.imgSrc || color.thumbUrl || ""}" aria-label="查看 ${color.value || "颜色"}">
      ${color.thumbUrl || color.imgSrc ? `<img src="${color.thumbUrl || color.imgSrc}" alt="${color.value || "颜色"}" referrerpolicy="no-referrer">` : ""}
      <span>${color.value || "颜色"}</span>
    </button>
  `).join("");
}

function renderSkuRows(item) {
  const colors = sourceSpecGroup(item, "颜色");
  const models = sourceSpecGroup(item, "型号").slice(0, 12);
  const cover = colors[0]?.thumbUrl || colors[0]?.imgSrc || item.imageUrl;
  const colorName = colors[0]?.value || t("defaultColor");
  const rows = models.length ? models : [{ value: item.model }];
  return rows.map((model) => `
    <div class="sku-row" data-sku-name="${colorName}_${model.value || item.model}" data-sku-price="${customerPrice(item)}">
      <img src="${cover}" alt="${colorName} ${model.value || item.model}" referrerpolicy="no-referrer">
      <span>${colorName}_${model.value || item.model}</span>
      <strong>${customerPrice(item)}</strong>
      <button type="button" data-qty-step="-1" aria-label="减少" disabled>−</button>
      <em data-qty-value>0</em>
      <button type="button" data-qty-step="1" aria-label="增加">+</button>
    </div>
  `).join("");
}

function ensureOwnDetailModal() {
  let modal = document.querySelector("#ownDetailModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "ownDetailModal";
  modal.className = "own-detail-modal";
  modal.hidden = true;
  document.body.append(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-detail]")) {
      closeOwnDetail();
      return;
    }

    if (event.target.closest("[data-favorite-key]")) {
      toggleFavorite(activeDetailItem);
      return;
    }

    const stepButton = event.target.closest("[data-gallery-step]");
    if (stepButton) {
      const step = Number(stepButton.dataset.galleryStep);
      moveDetailImage(modal, step);
      return;
    }

    const thumbButton = event.target.closest("[data-gallery-index]");
    if (thumbButton) {
      setDetailImage(modal, Number(thumbButton.dataset.galleryIndex));
      return;
    }

    const swatchButton = event.target.closest("[data-swatch-image]");
    if (swatchButton) {
      setDetailMainImage(modal, swatchButton.dataset.swatchImage);
      modal.querySelectorAll("[data-swatch-image]").forEach((button) => {
        button.classList.toggle("active", button === swatchButton);
      });
      return;
    }

    const qtyButton = event.target.closest("[data-qty-step]");
    if (qtyButton) {
      updateSkuQuantity(qtyButton, Number(qtyButton.dataset.qtyStep));
      return;
    }

    const whatsappButton = event.target.closest("[data-send-whatsapp]");
    if (whatsappButton) {
      sendWhatsappInquiry(modal);
      return;
    }

    if (event.target.closest("[data-add-selected-cart]")) {
      addSelectedToCart(modal);
      return;
    }

    const zoomTarget = event.target.closest("[data-zoom-image]");
    if (zoomTarget) {
      openImageZoom(zoomTarget.dataset.zoomImage, zoomTarget.alt || "");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeOwnDetail();
    if (event.key === "ArrowLeft") moveDetailImage(modal, -1);
    if (event.key === "ArrowRight") moveDetailImage(modal, 1);
  });
  return modal;
}

function updateSkuQuantity(button, step) {
  const row = button.closest(".sku-row");
  const value = row?.querySelector("[data-qty-value]");
  if (!row || !value || !Number.isFinite(step)) return;
  const current = Number(value.textContent) || 0;
  const next = Math.max(0, current + step);
  value.textContent = String(next);
  row.classList.toggle("has-qty", next > 0);
  const minus = row.querySelector('[data-qty-step="-1"]');
  if (minus) minus.disabled = next === 0;
}

function selectedSkuRows(modal) {
  return [...modal.querySelectorAll(".sku-row")].map((row) => {
    const quantity = Number(row.querySelector("[data-qty-value]")?.textContent) || 0;
    return {
      name: row.dataset.skuName || row.querySelector("span")?.textContent?.trim() || "型号",
      price: row.dataset.skuPrice || row.querySelector("strong")?.textContent?.trim() || "",
      quantity
    };
  }).filter((row) => row.quantity > 0);
}

function buildWhatsappMessage(modal) {
  const title = modal.querySelector(".detail-procurement h2")?.textContent?.trim() || t("product");
  const image = modal.querySelector(".detail-main-image")?.src || "";
  const selectedRows = selectedSkuRows(modal);
  const lines = [
    t("inquiryHello"),
    `${t("inquiryProduct")}：${title}`,
    `库存：${orderInfo(activeDetailItem || {}).stock}`,
    `最低订购量：${orderInfo(activeDetailItem || {}).moq}`,
    `预计发货：${orderInfo(activeDetailItem || {}).leadTime}`,
    "",
    `${t("selectedModels")}：`,
    ...selectedRows.map((row) => `- ${row.name} x ${row.quantity}，${t("referencePrice")}：${row.price}`),
    "",
    image ? `${t("productImage")}：${image}` : "",
    t("inquiryEnd")
  ].filter(Boolean);
  return lines.join("\n");
}

function sendWhatsappInquiry(modal) {
  if (!requireMember()) return;
  const selectedRows = selectedSkuRows(modal);
  if (!selectedRows.length) {
    alert(t("selectSkuFirst"));
    return;
  }
  const message = encodeURIComponent(buildWhatsappMessage(modal));
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const url = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function saveCart() {
  localStorage.setItem("trivvo-cart", JSON.stringify(cartItems));
  renderCartCount();
}

function renderCartCount() {
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.querySelector("#cartCount");
  if (counter) counter.textContent = String(count);
}

function authHeaders(token = "") {
  return {
    apikey: window.SUPABASE_CONFIG?.anonKey || "",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function authEndpoint(path) {
  return `${window.SUPABASE_CONFIG?.url || ""}/auth/v1/${path}`;
}

function restEndpoint(path) {
  return `${window.SUPABASE_CONFIG?.url || ""}/rest/v1/${path}`;
}

function ensureAuthModal() {
  let modal = document.querySelector("#authModal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "auth-modal";
  modal.hidden = true;
  document.body.append(modal);
  modal.addEventListener("click", async (event) => {
    if (event.target === modal || event.target.closest("[data-close-auth]")) {
      closeAuthModal();
      return;
    }
    const modeButton = event.target.closest("[data-auth-mode]");
    if (modeButton) {
      modal.dataset.mode = modeButton.dataset.authMode;
      renderAuthModal(modal);
      return;
    }
    if (event.target.closest("[data-sign-out]")) {
      await signOutMember();
      closeAuthModal();
    }
    if (event.target.closest("[data-show-my-requests]")) {
      await renderMyRequests(modal);
    }
  });
  modal.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target.closest("#authForm");
    if (!form) return;
    await submitAuthForm(form, modal.dataset.mode || "signup");
  });
  return modal;
}

function renderAuthModal(modal = ensureAuthModal()) {
  const mode = modal.dataset.mode || "signup";
  if (isMember()) {
    modal.innerHTML = `
      <div class="auth-panel" role="dialog" aria-modal="true" aria-label="会员中心">
        <button class="auth-close" type="button" data-close-auth aria-label="关闭">×</button>
        <span class="auth-kicker">TRIVVO MEMBER</span>
        <h2>会员报价已解锁</h2>
        <p>${currentUser.email || currentUser.phone || "已登录会员"}</p>
        <button class="auth-secondary" type="button" data-show-my-requests>我的采购申请</button>
        <button class="auth-primary" type="button" data-sign-out>退出登录</button>
      </div>`;
    return;
  }
  modal.innerHTML = `
    <div class="auth-panel" role="dialog" aria-modal="true" aria-label="注册或登录">
      <button class="auth-close" type="button" data-close-auth aria-label="关闭">×</button>
      <span class="auth-kicker">MEMBER PRICE</span>
      <h2>${mode === "signup" ? "免费注册，解锁全部价格" : "登录查看全部价格"}</h2>
      <p>无需注册也能浏览图片、商品详情和部分价格。注册后可查看全部价格、加入购物车并获取报价。</p>
      <div class="auth-tabs">
        <button class="${mode === "signup" ? "active" : ""}" type="button" data-auth-mode="signup">免费注册</button>
        <button class="${mode === "login" ? "active" : ""}" type="button" data-auth-mode="login">登录</button>
      </div>
      <form id="authForm">
        <label><span>邮箱或手机号</span><input name="identifier" type="text" autocomplete="username" required placeholder="name@example.com 或 050 123 4567"></label>
        <label><span>密码</span><input name="password" type="password" autocomplete="${mode === "signup" ? "new-password" : "current-password"}" minlength="6" required placeholder="至少 6 位密码"></label>
        <button class="auth-primary" type="submit">${mode === "signup" ? "免费注册并解锁" : "登录并继续"}</button>
        <em data-auth-message></em>
      </form>
    </div>`;
}

function openAuthModal(mode = "signup") {
  const modal = ensureAuthModal();
  modal.dataset.mode = mode;
  renderAuthModal(modal);
  modal.hidden = false;
}

async function loadProcurementRequests() {
  const local = procurementRequests.filter((request) => !currentUser?.id || request.user_id === currentUser.id);
  if (!isMember() || !window.SUPABASE_CONFIG?.url) return local;
  try {
    const response = await fetch(`${restEndpoint("procurement_requests")}?select=request_number,items,reference_total,currency,status,final_total,noon_url,tracking_number,created_at&order=created_at.desc`, {
      headers: authHeaders(authToken)
    });
    if (!response.ok) throw new Error("无法读取云端申请");
    const cloud = await response.json();
    const merged = new Map([...local, ...cloud].map((request) => [request.request_number, request]));
    return [...merged.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch {
    return local;
  }
}

async function renderMyRequests(modal = ensureAuthModal()) {
  const requests = await loadProcurementRequests();
  modal.innerHTML = `
    <div class="auth-panel requests-panel" role="dialog" aria-modal="true" aria-label="我的采购申请">
      <button class="auth-close" type="button" data-close-auth aria-label="关闭">×</button>
      <span class="auth-kicker">MY REQUESTS</span>
      <h2>我的采购申请</h2>
      <div class="my-request-list">
        ${requests.length ? requests.map((request) => `
          <article class="my-request-item">
            <div><strong>${request.request_number}</strong><span>${formatDate(request.created_at)}</span></div>
            <em>${requestStatusLabel(request.status)}</em>
            <p>${request.items?.length || 0} 种商品 · 参考金额 ${formatPrice(request.reference_total)} ${request.currency || "SAR"}</p>
            ${Number.isFinite(Number(request.final_total)) ? `<b>最终报价 ${formatPrice(request.final_total)} ${request.currency || "SAR"}</b>` : ""}
            ${request.noon_url ? `<a class="request-noon-link" href="${request.noon_url}" target="_blank" rel="noreferrer">前往 Noon 下单</a>` : ""}
            ${request.tracking_number ? `<small>物流单号：${request.tracking_number}</small>` : ""}
          </article>
        `).join("") : `<div class="requests-empty"><strong>还没有采购申请</strong><span>将喜欢的商品加入购物车后即可提交。</span></div>`}
      </div>
    </div>`;
}

function closeAuthModal() {
  const modal = document.querySelector("#authModal");
  if (modal) modal.hidden = true;
}

function friendlyAuthError(error) {
  const message = String(error?.message || error || "");
  if (/invalid login credentials/i.test(message)) return "账号或密码不正确。";
  if (/user already registered/i.test(message)) return "这个账号已经注册，请直接登录。";
  if (/password/i.test(message)) return "密码至少需要 6 位。";
  if (/phone|sms/i.test(message)) return "手机号注册暂未开通，请先使用邮箱注册。";
  if (/email/i.test(message)) return "请输入有效邮箱地址。";
  return message || "操作失败，请稍后重试。";
}

function authIdentityPayload(identifier) {
  const value = identifier.trim();
  if (value.includes("@")) return { email: value };
  const digits = value.replace(/\D/g, "");
  if (/^05\d{8}$/.test(digits)) return { phone: `+966${digits.slice(1)}` };
  if (/^9665\d{8}$/.test(digits)) return { phone: `+${digits}` };
  return { phone: value.startsWith("+") ? value : `+${digits}` };
}

async function submitAuthForm(form, mode) {
  const message = form.querySelector("[data-auth-message]");
  const submit = form.querySelector('[type="submit"]');
  const identity = authIdentityPayload(form.elements.identifier.value);
  const password = form.elements.password.value;
  submit.disabled = true;
  message.textContent = "处理中…";
  try {
    const path = mode === "signup" ? "signup" : "token?grant_type=password";
    const response = await fetch(authEndpoint(path), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ...identity, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || data.message || data.error_description || "操作失败");
    if (data.access_token && data.user) {
      authToken = data.access_token;
      currentUser = data.user;
      localStorage.setItem("trivvo-auth-token", authToken);
      await loadMemberPrices();
      refreshMemberView();
      closeAuthModal();
      return;
    }
    message.textContent = "注册成功，请完成账号验证后登录。";
  } catch (error) {
    message.textContent = friendlyAuthError(error);
  } finally {
    submit.disabled = false;
  }
}

async function restoreMemberSession() {
  if (!authToken || !window.SUPABASE_CONFIG?.url) return;
  try {
    const response = await fetch(authEndpoint("user"), { headers: authHeaders(authToken) });
    if (!response.ok) throw new Error("Session expired");
    currentUser = await response.json();
  } catch {
    authToken = "";
    currentUser = null;
    localStorage.removeItem("trivvo-auth-token");
  }
}

async function signOutMember() {
  if (authToken) {
    fetch(authEndpoint("logout"), { method: "POST", headers: authHeaders(authToken) }).catch(() => {});
  }
  authToken = "";
  currentUser = null;
  localStorage.removeItem("trivvo-auth-token");
  refreshMemberView();
}

function refreshMemberView() {
  const trigger = document.querySelector("#memberTrigger");
  if (trigger) trigger.textContent = isMember() ? "会员中心" : "登录 / 免费注册";
  document.body.classList.toggle("is-member", isMember());
  updateGuestPricePreviews();
  renderCartCount();
  renderLatestTicker();
  renderHomeGallery();
  if (currentItems.length) {
    renderInsights(currentItems);
    renderMatchCompare(currentItems);
    renderResultsView();
  }
}

function addCartEntry(item, sku, quantity = 1) {
  const key = `${item.site}-${item.id}-${sku}`;
  const existing = cartItems.find((entry) => entry.key === key);
  if (existing) existing.quantity += quantity;
  else {
    cartItems.push({
      key,
      itemId: item.id,
      site: item.site,
      title: publicTitle(item),
      image: item.imageUrl,
      model: item.model,
      sku,
      price: item.price,
      currency: item.currency,
      quantity,
      stockStatus: item.stockStatus,
      minimumOrderQuantity: item.minimumOrderQuantity,
      leadTime: item.leadTime
    });
  }
  saveCart();
}

function quickAddToCart(item) {
  if (!requireMember()) return;
  addCartEntry(item, item.model || "默认型号", 1);
  openCart();
}

function addSelectedToCart(modal) {
  if (!requireMember()) return;
  if (!activeDetailItem) return;
  const selectedRows = selectedSkuRows(modal);
  if (!selectedRows.length) {
    alert(t("selectSkuFirst"));
    return;
  }
  selectedRows.forEach((row) => addCartEntry(activeDetailItem, row.name, row.quantity));
  closeOwnDetail();
  openCart();
}

function cartTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function ensureCartDrawer() {
  let drawer = document.querySelector("#cartDrawer");
  if (drawer) return drawer;
  drawer = document.createElement("div");
  drawer.id = "cartDrawer";
  drawer.className = "cart-drawer";
  drawer.hidden = true;
  document.body.append(drawer);
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer || event.target.closest("[data-close-cart]")) {
      closeCart();
      return;
    }
    const step = event.target.closest("[data-cart-step]");
    if (step) {
      const entry = cartItems.find((item) => item.key === step.dataset.cartKey);
      if (!entry) return;
      entry.quantity = Math.max(0, entry.quantity + Number(step.dataset.cartStep));
      cartItems = cartItems.filter((item) => item.quantity > 0);
      saveCart();
      renderCartDrawer(drawer);
      return;
    }
    const remove = event.target.closest("[data-cart-remove]");
    if (remove) {
      cartItems = cartItems.filter((item) => item.key !== remove.dataset.cartRemove);
      saveCart();
      renderCartDrawer(drawer);
      return;
    }
    if (event.target.closest("[data-cart-whatsapp]")) sendCartWhatsapp();
    if (event.target.closest("[data-submit-procurement]")) openProcurementForm();
  });
  return drawer;
}

function renderCartDrawer(drawer = ensureCartDrawer()) {
  drawer.innerHTML = `
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="购物车">
      <div class="cart-head">
        <div><strong>购物车</strong><span>${cartItems.length} 种商品</span></div>
        <button type="button" data-close-cart aria-label="关闭">×</button>
      </div>
      <div class="cart-list">
        ${cartItems.length ? cartItems.map((item) => `
          <article class="cart-item">
            <img src="${item.image}" alt="${item.title}" referrerpolicy="no-referrer">
            <div>
              <strong>${item.title}</strong>
              <span>${item.sku}</span>
              <span>${item.stockStatus || "库存需确认"} · ${item.minimumOrderQuantity || 10} 件起订 · ${item.leadTime || "2–5 个工作日"}发出</span>
              <b>${formatPrice(item.price)} ${item.currency}</b>
            </div>
            <div class="cart-qty">
              <button type="button" data-cart-step="-1" data-cart-key="${item.key}" aria-label="减少">−</button>
              <em>${item.quantity}</em>
              <button type="button" data-cart-step="1" data-cart-key="${item.key}" aria-label="增加">+</button>
            </div>
            <button class="cart-remove" type="button" data-cart-remove="${item.key}">删除</button>
          </article>
        `).join("") : `<div class="cart-empty"><strong>购物车还是空的</strong><span>从我们的报价中选择喜欢的手机壳。</span></div>`}
      </div>
      <div class="cart-footer">
        <p><span>参考总价</span><strong>${formatPrice(cartTotal())} SAR</strong></p>
        <button class="cart-submit-request" type="button" data-submit-procurement ${cartItems.length ? "" : "disabled"}>提交采购申请</button>
        <button type="button" data-cart-whatsapp ${cartItems.length ? "" : "disabled"}>通过 WhatsApp 发送购物车</button>
      </div>
    </aside>
  `;
}

function openCart() {
  if (!requireMember()) return;
  const drawer = ensureCartDrawer();
  renderCartDrawer(drawer);
  drawer.hidden = false;
  document.body.classList.add("cart-open");
}

function closeCart() {
  const drawer = document.querySelector("#cartDrawer");
  if (drawer) drawer.hidden = true;
  document.body.classList.remove("cart-open");
}

function requestNumber() {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date()).replaceAll("-", "");
  return `TRV-${date}-${String(Date.now()).slice(-6)}`;
}

function saveProcurementRequests() {
  localStorage.setItem("trivvo-procurement-requests", JSON.stringify(procurementRequests));
}

function requestStatusLabel(status) {
  return {
    pending: "待确认", confirmed: "可以采购", quoted: "已报价", noon_ready: "Noon 链接已生成",
    noon_ordered: "顾客已在 Noon 下单", sourcing: "采购中", shipped: "已发货", completed: "已完成",
    unavailable: "无法采购", cancelled: "已取消"
  }[status] || status;
}

function ensureProcurementModal() {
  let modal = document.querySelector("#procurementModal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "procurementModal";
  modal.className = "procurement-modal";
  modal.hidden = true;
  document.body.append(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-procurement]")) closeProcurementModal();
    if (event.target.closest("[data-show-request-form]")) renderProcurementForm(modal);
  });
  modal.addEventListener("submit", async (event) => {
    const form = event.target.closest("#procurementForm");
    if (!form) return;
    event.preventDefault();
    await submitProcurementRequest(form, modal);
  });
  return modal;
}

function openProcurementForm() {
  if (!requireMember()) return;
  if (!cartItems.length) return;
  closeCart();
  const modal = ensureProcurementModal();
  renderProcurementForm(modal);
  modal.hidden = false;
}

function renderProcurementForm(modal = ensureProcurementModal()) {
  modal.innerHTML = `
    <section class="procurement-panel" role="dialog" aria-modal="true" aria-label="提交采购申请">
      <button class="procurement-close" type="button" data-close-procurement aria-label="关闭">×</button>
      <span class="auth-kicker">TRIVVO REQUEST</span>
      <h2>提交采购申请</h2>
      <p>提交后我们会确认库存和最终价格；对应商品在 Noon 上架后，您可前往 Noon 安全下单。</p>
      <div class="request-summary">
        <strong>${cartItems.length} 种商品</strong>
        <span>参考总价 ${formatPrice(cartTotal())} SAR</span>
      </div>
      <form id="procurementForm">
        <label><span>姓名</span><input name="customer_name" required autocomplete="name" placeholder="您的姓名"></label>
        <label><span>WhatsApp</span><input name="whatsapp" required autocomplete="tel" placeholder="例如：050 123 4567"></label>
        <label><span>城市</span><input name="city" autocomplete="address-level2" placeholder="例如：Riyadh"></label>
        <label><span>备注</span><textarea name="notes" rows="3" placeholder="颜色、配送或其他要求"></textarea></label>
        <button class="auth-primary" type="submit">确认提交采购申请</button>
        <em data-request-message></em>
      </form>
    </section>`;
}

function closeProcurementModal() {
  const modal = document.querySelector("#procurementModal");
  if (modal) modal.hidden = true;
}

async function submitProcurementRequest(form, modal) {
  const submit = form.querySelector('[type="submit"]');
  const message = form.querySelector("[data-request-message]");
  const formData = new FormData(form);
  const request = {
    request_number: requestNumber(),
    user_id: currentUser.id,
    customer_name: String(formData.get("customer_name") || "").trim(),
    whatsapp: String(formData.get("whatsapp") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
    items: cartItems.map(({ itemId, title, image, model, sku, quantity, price, currency }) => ({ itemId, title, image, model, sku, quantity, price, currency })),
    reference_total: Number(cartTotal().toFixed(2)),
    currency: "SAR",
    status: "pending",
    created_at: new Date().toISOString()
  };
  submit.disabled = true;
  message.textContent = "正在提交…";
  let cloudSaved = false;
  try {
    const response = await fetch(restEndpoint("procurement_requests"), {
      method: "POST",
      headers: { ...authHeaders(authToken), Prefer: "return=representation" },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error((await response.json()).message || "云端申请表尚未配置");
    cloudSaved = true;
  } catch (error) {
    console.warn("采购申请暂存于本地：", error.message);
  }
  procurementRequests.unshift({ ...request, cloud_saved: cloudSaved });
  saveProcurementRequests();
  cartItems = [];
  saveCart();
  const notifyText = encodeURIComponent(`你好，我已在 Trivvo 提交采购申请：${request.request_number}。请帮我确认库存和最终报价。`);
  modal.innerHTML = `
    <section class="procurement-panel request-success" role="dialog" aria-modal="true">
      <button class="procurement-close" type="button" data-close-procurement aria-label="关闭">×</button>
      <span class="request-success-mark">✓</span>
      <h2>采购申请已提交</h2>
      <strong>${request.request_number}</strong>
      <p>状态：待确认。我们会通过 WhatsApp 联系您确认库存和最终报价。</p>
      <a class="request-whatsapp" href="https://wa.me/${whatsappNumber}?text=${notifyText}" target="_blank" rel="noreferrer">WhatsApp 通知 Trivvo</a>
      <button class="auth-primary" type="button" data-close-procurement>继续浏览</button>
    </section>`;
}

function sendCartWhatsapp() {
  if (!requireMember()) return;
  if (!cartItems.length) return;
  const lines = [
    "您好，我想询价以下商品：",
    "",
    ...cartItems.map((item, index) => `${index + 1}. ${item.title}\n型号：${item.sku}\n数量：${item.quantity}\n最低订购量：${item.minimumOrderQuantity || 10} 件\n库存：${item.stockStatus || "需确认"}\n预计发货：${item.leadTime || "2–5 个工作日"}\n参考价：${formatPrice(item.price)} ${item.currency}`),
    "",
    `参考总价：${formatPrice(cartTotal())} SAR`,
    "请确认库存和最终报价，谢谢。"
  ];
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
}

function openOwnDetail(item) {
  activeDetailItem = item;
  const modal = ensureOwnDetailModal();
  const images = ownDetailImages(item);
  const title = publicTitle(item);
  const hasGallery = images.length > 1;
  modal.innerHTML = `
    <div class="own-detail-panel" role="dialog" aria-modal="true" aria-label="${title}" data-gallery-active="0">
      <button class="detail-close" type="button" data-close-detail aria-label="关闭">×</button>
      ${favoriteButton(item, "detail-favorite-button")}
      <div class="detail-gallery">
        <div class="detail-main-frame">
          ${hasGallery ? `<button class="gallery-arrow gallery-prev" type="button" data-gallery-step="-1" aria-label="上一张">‹</button>` : ""}
          <img class="detail-main-image" src="${images[0]}" alt="${title}" data-zoom-image="${images[0]}" referrerpolicy="no-referrer">
          ${hasGallery ? `<button class="gallery-arrow gallery-next" type="button" data-gallery-step="1" aria-label="下一张">›</button>` : ""}
          ${hasGallery ? `<span class="gallery-count">1 / ${images.length}</span>` : ""}
        </div>
        ${hasGallery ? `
          <div class="detail-strip">
            ${images.map((image, index) => `
              <button class="${index === 0 ? "active" : ""}" type="button" data-gallery-index="${index}" aria-label="查看第 ${index + 1} 张图">
                <img src="${image}" alt="${title} 图片 ${index + 1}" data-zoom-image="${image}" referrerpolicy="no-referrer">
              </button>
            `).join("")}
          </div>
        ` : ""}
        <div class="detail-gallery-stats">
          <span>浏览量：${sourceInfo(item).clickCount ?? "-"}</span>
          <span>收藏数：${sourceInfo(item).collectCount ?? "-"}</span>
          <span>图片：${images.length}</span>
        </div>
      </div>
      <div class="detail-info detail-procurement">
        <h2>${title}</h2>
        <p class="detail-note">${t("productDetails")}</p>
        <div class="detail-meta-grid">${renderSourceMeta(item)}</div>
        <div class="detail-line detail-service">
          <strong>${t("service")}</strong>
          <span>${t("dropshipping")}</span>
          <span>${t("qualityCheck")}</span>
          <span>${t("realPhotos")}</span>
        </div>
        <div class="detail-procurement-price">
          <strong>${customerPrice(item)}</strong>
          <span>${t("ourPrice")}</span>
        </div>
        <div class="detail-section">
          <h3>${t("color")}</h3>
          <div class="color-options">${renderColorOptions(item)}</div>
        </div>
        <div class="detail-section">
          <h3>${t("sizeModel")}</h3>
          <div class="sku-table">${renderSkuRows(item)}</div>
        </div>
      </div>
      <aside class="detail-supplier">
        <div class="detail-highlights">
          <h3>${t("productHighlights")}</h3>
          <p><strong>${t("realPhotos")}</strong><span>${ownDetailImages(item).length} ${t("images")}</span></p>
          <p><strong>库存状态</strong><span>${orderInfo(item).stock}</span></p>
          <p><strong>最低订购量</strong><span>${orderInfo(item).moq}</span></p>
          <p><strong>预计发货</strong><span>${orderInfo(item).leadTime}</span></p>
          <p><strong>${t("multiAngle")}</strong><span>${t("verified")}</span></p>
          <p><strong>${t("quickReply")}</strong><span>${customerPrice(item)}</span></p>
        </div>
        <div class="supplier-actions">
          <button class="detail-cart-add" type="button" data-add-selected-cart>加入购物车</button>
          <button class="primary whatsapp-send" type="button" data-send-whatsapp>获取报价</button>
        </div>
        <div class="product-reviews">
          <div class="review-head">
            <h3>${t("reviews")}</h3>
            <strong>4.8</strong>
          </div>
          <div class="review-tags">
            <span>${t("imageAuthentic")}</span>
            <span>${t("newStyle")}</span>
            <span>${t("goodPrice")}</span>
          </div>
          <div class="review-list">
            <p><strong>${t("customerFeedback")}</strong><span>${t("customerFeedbackText")}</span></p>
            <p><strong>${t("purchaseFeedback")}</strong><span>${t("purchaseFeedbackText")}</span></p>
          </div>
        </div>
      </aside>
    </div>
  `;
  modal.hidden = false;
  document.body.classList.add("detail-open");
}

function setDetailImage(modal, index) {
  const panel = modal.querySelector(".own-detail-panel");
  const images = [...modal.querySelectorAll(".detail-strip [data-gallery-index] img")].map((image) => image.src);
  if (!panel || !images.length) return;

  const activeIndex = (index + images.length) % images.length;
  const count = modal.querySelector(".gallery-count");
  setDetailMainImage(modal, images[activeIndex]);
  if (count) count.textContent = `${activeIndex + 1} / ${images.length}`;
  panel.dataset.galleryActive = String(activeIndex);
  modal.querySelectorAll(".detail-strip [data-gallery-index]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.galleryIndex) === activeIndex);
  });
}

function setDetailMainImage(modal, imageUrl) {
  const mainImage = modal.querySelector(".detail-main-image");
  if (!mainImage || !imageUrl) return;
  mainImage.src = imageUrl;
  mainImage.dataset.zoomImage = imageUrl;
}

function moveDetailImage(modal, step) {
  const panel = modal.querySelector(".own-detail-panel");
  if (!panel) return;
  setDetailImage(modal, Number(panel.dataset.galleryActive || "0") + step);
}

function closeOwnDetail() {
  const modal = document.querySelector("#ownDetailModal");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("detail-open");
}

function ensureImageZoomModal() {
  let modal = document.querySelector("#imageZoomModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "imageZoomModal";
  modal.className = "image-zoom-modal";
  modal.hidden = true;
  document.body.append(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-zoom]")) {
      closeImageZoom();
      return;
    }
    const image = event.target.closest(".zoom-image");
    if (image) image.classList.toggle("zoomed");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeImageZoom();
  });
  return modal;
}

function openImageZoom(src, alt) {
  const modal = ensureImageZoomModal();
  modal.innerHTML = `
    <button class="zoom-close" type="button" data-close-zoom aria-label="关闭">×</button>
    <div class="zoom-stage">
      <img class="zoom-image" src="${src}" alt="${alt}" referrerpolicy="no-referrer">
      <span>点击图片放大 / 还原</span>
    </div>
  `;
  modal.hidden = false;
}

function closeImageZoom() {
  const modal = document.querySelector("#imageZoomModal");
  if (!modal) return;
  modal.hidden = true;
}

function renderResults(query, items) {
  app.classList.remove("home");
  app.classList.add("has-results");
  results.hidden = false;
  currentQuery = query;
  currentItems = items;
  activeSiteFilter = "all";
  sitePages.clear();
  updateGuestPricePreviews(items);
  resultTitle.textContent = t("searchResultTitle", { query });
  resultMeta.textContent = t("resultsCount", { count: items.length });

  if (!items.length) {
    priceInsights.innerHTML = "";
    dataTrust.innerHTML = "";
    matchCompare.innerHTML = "";
    filterTabs.innerHTML = "";
    siteResults.innerHTML = `<div class="empty">${t("noResults")}</div>`;
    return;
  }

  renderInsights(items);
  renderDataTrust(items);
  renderMatchCompare(items);
  renderFilters(items);
  renderResultsView();
  requestAnimationFrame(() => results.scrollIntoView({ block: "start" }));
}

function renderResultsView() {
  const visibleItems = sortedItems(filteredItems(currentItems));
  ownDetailItems.clear();

  if (!visibleItems.length) {
    siteResults.innerHTML = `<div class="empty">${t("noPlatformResults")}</div>`;
    return;
  }

  siteResults.innerHTML = groupedBySite(visibleItems).map((group) => {
    const perPage = resultsPerPageForSite(group.site);
    const pageCount = Math.ceil(group.items.length / perPage);
    const currentPage = Math.min(sitePages.get(group.site) || 1, pageCount);
    sitePages.set(group.site, currentPage);
    const start = (currentPage - 1) * perPage;
    const pageItems = group.items.slice(start, start + perPage);
    return `
    <section class="site-block${group.site === "Trivvo" ? " site-block-own" : ""}">
      <div class="site-head">
        <div class="site-title">
          <span class="site-dot ${group.items[0].siteClass}"></span>
          <h2>${publicSiteName(group.site)}</h2>
        </div>
        <div class="site-summary-wrap">
          <p class="site-summary">${group.items.length} 个结果 · 价格 ${priceSummary(group.items)}</p>
          ${group.site === "Trivvo" && !isMember() ? `<button class="view-all-prices" type="button" data-view-all-prices>查看全部价格</button>` : ""}
        </div>
      </div>
      <div class="result-list">${pageItems.map(renderItem).join("")}</div>
      ${renderPagination(group.site, group.items.length)}
    </section>
  `;
  }).join("");
}

function submitSearch(query) {
  const cleaned = query.trim();
  if (!cleaned) return;
  searchInput.value = cleaned;
  const url = new URL(window.location.href);
  url.searchParams.set("q", cleaned);
  window.history.replaceState({}, "", url);
  renderResults(cleaned, searchCases(cleaned));
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
          <span>${t("open")}</span>
        </div>
        <p>${t(platform.descKey)}</p>
        <div class="platform-url">${platform.displayUrl}</div>
      </div>
    </a>
  `).join("");
}

function latestShortTitle(item) {
  if (item.title && item.title.length <= 18 && !/手机壳材质|保护壳$/.test(item.title)) {
    return item.title;
  }
  const text = `${item.title || ""} ${item.tags || ""}`;
  const styles = [
    [/凯夫拉.*支架|支架.*凯夫拉/, "凯夫拉旋转支架壳"],
    [/磁吸.*支架|支架.*磁吸/, "磁吸支架保护壳"],
    [/液态硅胶/, "液态硅胶保护壳"],
    [/花朵|碎花|小花/, "花朵手机壳"],
    [/美乐蒂|卡通/, "卡通手机壳"],
    [/皮革|皮质|插卡/, "皮革插卡手机壳"],
    [/透明|clear/i, "透明防摔手机壳"],
    [/磁吸|magsafe/i, "MagSafe 磁吸壳"],
    [/磨砂|哑光/, "磨砂防摔手机壳"],
    [/防摔/, "防摔保护壳"]
  ];
  return styles.find(([pattern]) => pattern.test(text))?.[1] || productMaterial(item);
}

function renderLatestTicker() {
  if (!latestTrack) return;
  latestDetailItems.clear();
  const latestItems = [...productDatabase]
    .filter((item) => item.site === "Trivvo")
    .sort((a, b) => (parseDate(b.updatedAt)?.getTime() || 0) - (parseDate(a.updatedAt)?.getTime() || 0))
    .slice(0, 8);

  const items = latestItems.length ? latestItems : productDatabase.slice(0, 8);
  if (!items.length) {
    latestTrack.innerHTML = `<p><strong>暂无数据</strong><span>手机壳资料加载后会在这里滚动显示。</span></p>`;
    return;
  }

  const rows = items.map((item) => {
    const detailKey = `${item.site}-${item.id}`;
    latestDetailItems.set(detailKey, item);
    const content = `
      <img src="${item.imageUrl}" alt="${publicTitle(item)}" loading="lazy" referrerpolicy="no-referrer">
      <span>
        <strong>${item.model || "手机壳"} · ${memberPrice(item)}</strong>
        <em>${latestShortTitle(item)}</em>
      </span>
    `;
    if (item.site === "Trivvo") {
      return `<button class="latest-item" type="button" data-latest-key="${detailKey}">${content}</button>`;
    }
    return `<a class="latest-item" href="${item.url}" target="_blank" rel="noreferrer">${content}</a>`;
  }).join("");
  latestTrack.innerHTML = rows + rows;
}

function homeGalleryCandidates() {
  return [...productDatabase]
    .filter((item) => item.site === "Trivvo" && item.imageUrl)
    .sort((a, b) => {
      const imageDiff = ownDetailImages(b).length - ownDetailImages(a).length;
      if (imageDiff) return imageDiff;
      return (parseDate(b.updatedAt)?.getTime() || 0) - (parseDate(a.updatedAt)?.getTime() || 0);
    })
    .slice(0, 5);
}

function storeFilterMatches(item, filter) {
  const text = normalize(`${item.title} ${item.tags.join(" ")} ${productMaterial(item)}`);
  if (filter === "magsafe") return /magsafe|磁吸/.test(text);
  if (filter === "clear") return /透明|clear|亚克力/.test(text);
  if (filter === "protective") return /防摔|protective|armor|全包/.test(text);
  if (filter === "fun") return /卡通|花|可爱|链|图案|fun/.test(text);
  return true;
}

function renderStoreProducts() {
  if (!storeProductGrid) return;
  [...storeProductItems.keys()].filter((key) => key.startsWith("store-")).forEach((key) => storeProductItems.delete(key));
  const items = [...productDatabase]
    .filter((item) => item.site === "Trivvo" && item.imageUrl && storeFilterMatches(item, activeStoreFilter))
    .sort((a, b) => (parseDate(b.updatedAt)?.getTime() || 0) - (parseDate(a.updatedAt)?.getTime() || 0))
    .slice(0, storeProductLimit);
  storeProductGrid.innerHTML = items.map((item) => {
    const key = `store-${item.id}`;
    storeProductItems.set(key, item);
    return `
      <article class="store-product-card">
        <div class="store-product-image">
          <button class="store-product-open" type="button" data-store-detail="${key}" aria-label="打开 ${publicTitle(item)}">
            <img src="${item.imageUrl}" alt="${publicTitle(item)}" loading="lazy" referrerpolicy="no-referrer">
          </button>
          ${favoriteButton(item, "store-favorite-button")}
        </div>
        <button class="store-product-title" type="button" data-store-detail="${key}">${latestShortTitle(item)}</button>
        <span>${item.model}</span>
        <em class="store-product-price">Request quote</em>
      </article>`;
  }).join("");
}

function renderHomeCollections() {
  if (!homeCollections) return;
  const items = [...productDatabase]
    .filter((item) => item.site === "Trivvo" && item.imageUrl)
    .sort((a, b) => ownDetailImages(b).length - ownDetailImages(a).length)
    .slice(0, 10);
  homeCollections.innerHTML = items.map((item, index) => {
    const key = `collection-${item.id}`;
    homeGalleryItems.set(key, item);
    return `
      <button class="cb-collection-card" type="button" data-home-detail-key="${key}">
        <img src="${item.imageUrl}" alt="${publicTitle(item)}" loading="lazy" referrerpolicy="no-referrer">
        <span><small>${index + 1} / 10</small><strong>${latestShortTitle(item)} Series</strong></span>
      </button>`;
  }).join("");
}

function renderStoryProducts() {
  if (!cbStoryGrid) return;
  const items = [...productDatabase]
    .filter((item) => item.site === "Trivvo" && item.imageUrl)
    .sort((a, b) => (parseDate(b.updatedAt)?.getTime() || 0) - (parseDate(a.updatedAt)?.getTime() || 0))
    .slice(4, 8);
  cbStoryGrid.innerHTML = items.map((item) => {
    const key = `story-${item.id}`;
    storeProductItems.set(key, item);
    return `<button type="button" data-store-detail="${key}" aria-label="打开 ${publicTitle(item)}"><img src="${item.imageUrl}" alt="${publicTitle(item)}" loading="lazy" referrerpolicy="no-referrer"></button>`;
  }).join("");
}

function renderSeriesRow(target, filter, offset = 0) {
  if (!target) return;
  const items = [...productDatabase]
    .filter((item) => item.site === "Trivvo" && item.imageUrl && storeFilterMatches(item, filter))
    .sort((a, b) => (parseDate(b.updatedAt)?.getTime() || 0) - (parseDate(a.updatedAt)?.getTime() || 0))
    .slice(offset, offset + 6);
  target.innerHTML = items.map((item) => {
    const key = `series-${target.id}-${item.id}`;
    storeProductItems.set(key, item);
    return `
      <button class="cb-series-product" type="button" data-store-detail="${key}">
        <img src="${item.imageUrl}" alt="${publicTitle(item)}" loading="lazy" referrerpolicy="no-referrer">
        <span>
          <strong>${latestShortTitle(item)}</strong>
          <em>${item.model}</em>
        </span>
      </button>`;
  }).join("");
}

function renderSeriesSections() {
  renderSeriesRow(cbSeriesRowOne, "clear", 0);
  renderSeriesRow(cbSeriesRowTwo, "magsafe", 2);
}

function setHomeGalleryActiveImage(index) {
  if (!homeGallery || !homeGalleryActiveImages.length) return;
  const featured = homeGallery.querySelector(".featured-case");
  if (!featured) return;

  const activeIndex = (index + homeGalleryActiveImages.length) % homeGalleryActiveImages.length;
  const image = homeGalleryActiveImages[activeIndex];
  homeGalleryActiveIndex = activeIndex;
  featured.classList.remove("is-switching");
  void featured.offsetWidth;
  featured.src = image;
  featured.classList.add("is-switching");
  homeGallery.querySelectorAll("[data-home-image-index]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.homeImageIndex) === activeIndex);
  });
}

function stopHomeGalleryAutoplay() {
  window.clearInterval(homeGalleryTimer);
  homeGalleryTimer = null;
}

function startHomeGalleryAutoplay() {
  stopHomeGalleryAutoplay();
  if (homeGalleryActiveImages.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  homeGalleryTimer = window.setInterval(() => {
    setHomeGalleryActiveImage(homeGalleryActiveIndex + 1);
  }, 4200);
}

function scrollHomeCollections(direction) {
  if (!homeCollections) return;
  homeCollections.scrollBy({
    left: direction * Math.max(homeCollections.clientWidth * 0.72, 260),
    behavior: "smooth"
  });
}

function renderHomeGallery() {
  if (!homeGallery) return;
  const items = homeGalleryCandidates();
  if (!items.length) return;
  const item = items[0];
  const images = items.map((candidate) => candidate.imageUrl).filter(Boolean).slice(0, 5);
  if (!images.length) return;

  homeGalleryItems.clear();
  homeGalleryActiveImages = images;
  homeGalleryActiveIndex = 0;
  const activeKey = `home-${item.id}`;
  homeGalleryItems.set(activeKey, item);

  homeGallery.innerHTML = `
    <button class="cb-hero-arrow cb-hero-prev" type="button" data-home-slide="-1" aria-label="上一张主图">‹</button>
    <button class="home-featured-button" type="button" data-home-featured data-home-detail-key="${activeKey}" aria-label="打开商品详情">
      <span class="cb-hero-copy">
        <small>NEW &amp; FEATURED</small>
        <strong>Snap Your<br>Daily Style.</strong>
        <em>Fresh phone case drops selected for Saudi trend lovers.</em>
        <b>SHOP NEW CASES</b>
      </span>
      <span class="cb-hero-visual">
        <img class="featured-case" src="${images[0]}" alt="${publicTitle(item)}" referrerpolicy="no-referrer">
        <i>TRIVVO</i>
      </span>
    </button>
    <button class="cb-hero-arrow cb-hero-next" type="button" data-home-slide="1" aria-label="下一张主图">›</button>
    <div class="home-thumbs">
      ${images.slice(1, 5).map((image, index) => {
        const imageIndex = index + 1;
        return `
          <button type="button" data-home-image-index="${imageIndex}" aria-label="${publicTitle(item)} 图片 ${imageIndex + 1}">
            <img src="${image}" alt="${publicTitle(item)} 图片 ${imageIndex + 1}" referrerpolicy="no-referrer">
          </button>
        `;
      }).join("")}
    </div>
  `;
  startHomeGalleryAutoplay();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitSearch(searchInput.value);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const filenameHint = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .match(/(?:iphone|samsung|galaxy|pixel|huawei|xiaomi|oppo|honor)[a-z0-9+\s-]*/i)?.[0]
    ?.trim() || "";
  const keyword = prompt(t("imageKeywordPrompt"), filenameHint);
  imageInput.value = "";
  if (keyword?.trim()) {
    submitSearch(keyword.trim());
    return;
  }
  if (keyword !== null) alert(t("imageKeywordRequired"));
});

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value;
  sitePages.clear();
  renderResultsView();
});

languagePicker?.addEventListener("change", () => {
  currentLanguage = languagePicker.value;
  localStorage.setItem("trivvo-language", currentLanguage);
  applyLanguage();
});

siteResults.addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite-key]");
  if (favorite) {
    const item = ownDetailItems.get([...ownDetailItems.keys()].find((key) => key.endsWith(`-${favorite.dataset.favoriteKey}`)));
    if (item) toggleFavorite(item);
    return;
  }
  if (event.target.closest("[data-view-all-prices]")) {
    openAuthModal("signup");
    return;
  }
  const pageButton = event.target.closest("[data-page-site][data-page]");
  if (pageButton && !pageButton.disabled) {
    const site = pageButton.dataset.pageSite;
    sitePages.set(site, Number(pageButton.dataset.page));
    renderResultsView();
    requestAnimationFrame(() => {
      const group = [...siteResults.querySelectorAll(".site-block")]
        .find((block) => block.querySelector(".site-title h2")?.textContent === publicSiteName(site));
      group?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return;
  }
  const cartButton = event.target.closest("[data-cart-key]");
  if (cartButton) {
    const item = ownDetailItems.get(cartButton.dataset.cartKey);
    if (item) quickAddToCart(item);
    return;
  }
  const trigger = event.target.closest(".own-detail-trigger");
  if (!trigger) return;
  const item = ownDetailItems.get(trigger.dataset.detailKey);
  if (item) openOwnDetail(item);
});

latestTrack?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-latest-key]");
  if (!trigger) return;
  const item = latestDetailItems.get(trigger.dataset.latestKey);
  if (item) openOwnDetail(item);
});

document.querySelector(".device-browser")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-device-query]");
  if (button) submitSearch(button.dataset.deviceQuery);
});

document.querySelector(".brand-category-nav")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-category]");
  if (!button) return;
  activeStoreFilter = button.dataset.storeCategory;
  storeProductLimit = 6;
  renderStoreProducts();
  storeFavorites?.scrollIntoView({ behavior: "smooth", block: "start" });
});

storeCategoryPills?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-filter]");
  if (!button) return;
  activeStoreFilter = button.dataset.storeFilter;
  storeProductLimit = 6;
  storeCategoryPills.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  renderStoreProducts();
});

storeProductGrid?.addEventListener("click", (event) => {
  const favorite = event.target.closest("[data-favorite-key]");
  if (favorite) {
    const item = [...storeProductItems.values()].find((product) => favoriteKey(product) === favorite.dataset.favoriteKey);
    if (item) toggleFavorite(item);
    return;
  }
  const trigger = event.target.closest("[data-store-detail]");
  const item = trigger ? storeProductItems.get(trigger.dataset.storeDetail) : null;
  if (item) openOwnDetail(item);
});

homeCollections?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-home-detail-key]");
  const item = trigger ? homeGalleryItems.get(trigger.dataset.homeDetailKey) : null;
  if (item) openOwnDetail(item);
});

document.querySelector(".cb-track-prev")?.addEventListener("click", () => scrollHomeCollections(-1));
document.querySelector(".cb-track-next")?.addEventListener("click", () => scrollHomeCollections(1));

document.querySelector("#cbStory")?.addEventListener("click", (event) => {
  const category = event.target.closest("[data-store-category]");
  if (category) {
    activeStoreFilter = category.dataset.storeCategory;
    renderStoreProducts();
    storeFavorites?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const trigger = event.target.closest("[data-store-detail]");
  const item = trigger ? storeProductItems.get(trigger.dataset.storeDetail) : null;
  if (item) openOwnDetail(item);
});

document.querySelectorAll(".cb-series").forEach((section) => {
  section.addEventListener("click", (event) => {
    const category = event.target.closest("[data-store-category]");
    if (category) {
      activeStoreFilter = category.dataset.storeCategory;
      renderStoreProducts();
      storeFavorites?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const trigger = event.target.closest("[data-store-detail]");
    const item = trigger ? storeProductItems.get(trigger.dataset.storeDetail) : null;
    if (item) openOwnDetail(item);
  });
});

document.querySelector(".cb-view-more")?.addEventListener("click", () => {
  storeProductLimit += 6;
  renderStoreProducts();
});

document.querySelector("#memberTriggerTop")?.addEventListener("click", () => openAuthModal(isMember() ? "member" : "signup"));
document.querySelector("#cartTriggerTop")?.addEventListener("click", openCart);
document.querySelector(".store-menu")?.addEventListener("click", () => {
  document.querySelector(".brand-category-nav")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

homeGallery?.addEventListener("click", (event) => {
  const slide = event.target.closest("[data-home-slide]");
  if (slide) {
    setHomeGalleryActiveImage(homeGalleryActiveIndex + Number(slide.dataset.homeSlide));
    startHomeGalleryAutoplay();
    return;
  }
  const thumb = event.target.closest("[data-home-image-index]");
  if (thumb) {
    setHomeGalleryActiveImage(Number(thumb.dataset.homeImageIndex));
    startHomeGalleryAutoplay();
    return;
  }

  const featured = event.target.closest("[data-home-detail-key]");
  if (!featured) return;
  const item = homeGalleryItems.get(featured.dataset.homeDetailKey);
  if (item) openOwnDetail(item);
});

homeGallery?.addEventListener("mouseenter", stopHomeGalleryAutoplay);
homeGallery?.addEventListener("mouseleave", startHomeGalleryAutoplay);
homeGallery?.addEventListener("focusin", stopHomeGalleryAutoplay);
homeGallery?.addEventListener("focusout", startHomeGalleryAutoplay);

document.querySelector("#cartTrigger")?.addEventListener("click", openCart);
document.querySelector("#memberTrigger")?.addEventListener("click", () => openAuthModal(isMember() ? "member" : "signup"));

document.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0 || document.body.classList.contains("detail-open")) return;
  if (event.target.closest("input, select, textarea")) return;
  pageDrag = {
    x: event.clientX,
    y: event.clientY,
    scrollY: window.scrollY,
    trackLeft: homeCollections?.scrollLeft || 0,
    track: Boolean(event.target.closest("#homeCollections")),
    axis: null,
    moved: false
  };
});

document.addEventListener("pointermove", (event) => {
  if (!pageDrag) return;
  const dx = event.clientX - pageDrag.x;
  const dy = event.clientY - pageDrag.y;
  if (!pageDrag.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 7) {
    pageDrag.axis = pageDrag.track && Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }
  if (!pageDrag.axis) return;
  pageDrag.moved = true;
  event.preventDefault();
  if (pageDrag.axis === "x" && homeCollections) {
    homeCollections.scrollLeft = pageDrag.trackLeft - dx;
    return;
  }
  window.scrollTo({ top: pageDrag.scrollY - dy, behavior: "auto" });
}, { passive: false });

function endPageDrag() {
  if (!pageDrag) return;
  suppressDragClick = pageDrag.moved;
  pageDrag = null;
}

document.addEventListener("pointerup", endPageDrag);
document.addEventListener("pointercancel", endPageDrag);
document.addEventListener("click", (event) => {
  if (!suppressDragClick) return;
  suppressDragClick = false;
  event.preventDefault();
  event.stopPropagation();
}, true);

async function init() {
  applyLanguage();
  await restoreMemberSession();
  refreshMemberView();
  renderCartCount();
  await loadProducts();
  await loadMemberPrices().catch((error) => console.warn(error.message));
  refreshMemberView();
  renderLatestTicker();
  renderHomeGallery();
  renderHomeCollections();
  renderStoreProducts();
  renderStoryProducts();
  renderSeriesSections();
  if (platformCount) platformCount.textContent = String(procurementPlatforms.length);
}

init();
