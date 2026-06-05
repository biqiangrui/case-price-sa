import { mkdir, writeFile } from "node:fs/promises";
import { createHash, randomBytes, webcrypto } from "node:crypto";
import path from "node:path";

const subtle = webcrypto.subtle;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const config = {
  supabaseUrl: env("SUPABASE_URL", "https://rqqenomefezlslxfdbrn.supabase.co"),
  supabaseServiceRoleKey: env("SUPABASE_SERVICE_ROLE_KEY"),
  hqbToken: env("HQB_TOKEN"),
  hqbKeyword: env("HQB_KEYWORD", "IPHONE 17"),
  hqbLimit: Number(env("HQB_LIMIT", "100")),
  hqbSite: env("HQB_SITE", "hqb"),
  cnyToSar: Number(env("CNY_TO_SAR", "0.52")),
  outDir: env("OUT_DIR", "work/52hqb-sync"),
  dryRun: env("DRY_RUN", "0") === "1",
  featuredImageOverrides: parseFeaturedImageOverrides(env("HQB_FEATURED_IMAGE_OVERRIDES", ""))
};

const apiBase = "https://api.52dsy.com";
const hqbBase = "https://52hqb.com";
const publicImageBase = "https://img.ios.goooy.cn";
const encryptedResponseKey = "LXYSY3lqVyoa+8qskOZaUxgQZbLjhWY1q819ljLcIY4=";
const rsaPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgcL7TNHwjZ05dif0bcdaxi/PfIwq5UWl8GC3nU37aMqD+B6FedsjjBFVMvZrN/ATbl9/ofxAfyin58IcKSrIHdi7yqPiXainTB1bwbrkweWXE2zchYDMyS3bia7uUXFajpw8Dj9URPnYr63//jOJqoRPRrqqtNgJiqUeHYZB5ADZA6H++VzwULEUc8SCBroLrIvpgWQB0Ji3LLvwW5uBo87JXZGiZEvyTC11QRYjxUCgjDNskoUrfVmIMUQgelG96+yvMd6Co0/ohjQM/nO43Fp08xygNcB/4x7+nZvmQYc8j8MF3Xvk2rApRlIIhrz7lamcoB8f2mnL2JiD1AQ3kQIDAQAB";
const hmacSecret = "your-hmac-secret-key-keep-safe";

if (!config.hqbToken) {
  throw new Error("Missing HQB_TOKEN. Log in to 52hqb, then provide the API token.");
}

if (!config.supabaseServiceRoleKey && !config.dryRun) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Use DRY_RUN=1 to only export local JSON.");
}

await mkdir(config.outDir, { recursive: true });

const list = await fetchHqbList(config.hqbKeyword, config.hqbLimit);
console.log(`Found ${list.length} 52hqb products for "${config.hqbKeyword}".`);

const products = [];
for (const [index, item] of list.entries()) {
  const goodsId = String(item.goodsId ?? item.id);
  console.log(`[${index + 1}/${list.length}] ${goodsId} ${item.title ?? ""}`);
  try {
    const info = await fetchHqbJson("/newapi/goods/goods/getGoodsInfo", { goodsId });
    const detail = await fetchHqbEncrypted("/newapi/goods/goods/getGoodsDetailImage", { id: goodsId });
    products.push(normalizeProduct(item, info.data, detail.data));
  } catch (error) {
    console.warn(`[skip] ${goodsId}: ${error.message}`);
  }
  await sleep(180);
}

await writeFile(path.join(config.outDir, "52hqb-products-raw.json"), JSON.stringify(products, null, 2));

if (config.dryRun) {
  console.log(`DRY_RUN=1, saved local export only: ${path.join(config.outDir, "52hqb-products-raw.json")}`);
  process.exit(0);
}

const uploaded = [];
for (const [index, product] of products.entries()) {
  console.log(`[upload ${index + 1}/${products.length}] ${product.source_id}`);
  const imageUrl = await mirrorImage(product.main_image_url, `${product.source_id}/main`);
  const detailImageUrls = [];
  for (const [imgIndex, image] of product.detail_images.entries()) {
    const mirrored = await mirrorImage(image, `${product.source_id}/detail-${imgIndex + 1}`);
    if (mirrored) detailImageUrls.push(mirrored);
    await sleep(80);
  }
  uploaded.push({ ...product, image_url: imageUrl || product.main_image_url, detail_image_urls: detailImageUrls });
}

await writeFile(path.join(config.outDir, "52hqb-products-uploaded.json"), JSON.stringify(uploaded, null, 2));

const rows = uploaded.map(toSupabaseRow);
await upsertProducts(rows);

console.log(`Done. Synced ${rows.length} products to Supabase.`);

async function fetchHqbList(keyword, limit) {
  const rows = [];
  for (let page = 1; rows.length < limit; page++) {
    const body = { key: keyword, page, goodsModule: 3 };
    const json = await fetchHqbJson("/newapi/goods/goods/getGoodsList", body);
    const data = json.data?.data ?? [];
    if (!Array.isArray(data) || data.length === 0) break;
    rows.push(...data);
    if (rows.length >= (json.data?.total ?? limit)) break;
  }
  return rows.slice(0, limit);
}

async function fetchHqbJson(endpoint, body) {
  return withRetry(endpoint, async () => {
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: hqbHeaders(),
      body: JSON.stringify(body)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${endpoint} failed ${res.status}: ${text.slice(0, 300)}`);
    const json = JSON.parse(text);
    if (json.code === -1 || json.status === 0) throw new Error(`${endpoint}: ${json.msg || "not authorized"}`);
    return json;
  });
}

async function fetchHqbEncrypted(endpoint, body) {
  return withRetry(endpoint, async () => {
    const encryptedBody = await encryptFrontendBody(body);
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: hqbHeaders(),
      body: JSON.stringify(encryptedBody)
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${endpoint} failed ${res.status}: ${text.slice(0, 300)}`);
    const json = JSON.parse(text);
    if (json.code === -1 || json.status === 0) throw new Error(`${endpoint}: ${json.msg || "not authorized"}`);
    if (json.status === 1 && json.data?.encryptedData) {
      json.data = JSON.parse(await aesGcmDecrypt(json.data.encryptedData, encryptedResponseKey));
    }
    return json;
  });
}

async function withRetry(label, run, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delay = 500 * attempt;
      console.warn(`[retry ${attempt}/${attempts - 1}] ${label}: ${error.message}`);
      await sleep(delay);
    }
  }
  throw lastError;
}

function hqbHeaders() {
  return {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    origin: hqbBase,
    referer: `${hqbBase}/list/new?key=${encodeURIComponent(config.hqbKeyword)}`,
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    site: config.hqbSite,
    token: config.hqbToken,
    "app-version": "0.1",
    "app-type": "dsy-home",
    t: String(Date.now())
  };
}

function normalizeProduct(listItem, info = {}, detail = {}) {
  const goodsId = String(info.id ?? listItem.goodsId ?? listItem.id);
  const title = info.title || listItem.title || `52hqb product ${goodsId}`;
  const sourcePrice = Number(info.price || listItem.price || firstNumber(listItem.priceRange) || 0);
  const priceSar = roundMoney(sourcePrice * config.cnyToSar);
  const mainImages = (info.goodsImageList || []).map((item) => absoluteImageUrl(item.url || item.thumbUrl)).filter(Boolean);
  const descImages = (detail.goodsDescImages || info.goodsDescImages || []).map((item) => absoluteImageUrl(item.url || item.thumbUrl)).filter(Boolean);
  const specsImages = Object.values(info.specsList || {})
    .flatMap((spec) => spec.items || [])
    .map((item) => absoluteImageUrl(item.imgSrc || item.thumbUrl))
    .filter(Boolean);
  const orderedImages = chooseDisplayImages(goodsId, unique([...mainImages, ...descImages, ...specsImages, absoluteImageUrl(listItem.thumbUrl)]));

  return {
    source_platform: "52hqb",
    source_id: goodsId,
    title,
    model: inferModel(title),
    price: priceSar,
    currency: "SAR",
    source_price: sourcePrice,
    source_currency: "CNY",
    main_image_url: orderedImages[0] || absoluteImageUrl(listItem.thumbUrl),
    detail_images: orderedImages.slice(1, 21),
    product_url: `${hqbBase}/good/${goodsId}`,
    display_url: "自有渠道报价",
    tags: buildTags(title, info, listItem),
    updated_at: today(),
    source_payload: { listItem, info, detail }
  };
}

function toSupabaseRow(product) {
  return {
    title: product.title,
    model: product.model,
    platform: "52hqb",
    price: product.price,
    currency: product.currency,
    image_url: product.image_url,
    product_url: product.product_url,
    display_url: product.display_url,
    tags: product.tags,
    updated_at: product.updated_at,
    source_platform: product.source_platform,
    source_id: product.source_id,
    source_price: product.source_price,
    source_currency: product.source_currency,
    detail_image_urls: product.detail_image_urls,
    source_payload: product.source_payload
  };
}

async function mirrorImage(url, keyPrefix) {
  if (!url) return "";
  const res = await fetch(url, { headers: { "user-agent": hqbHeaders()["user-agent"], referer: hqbBase } });
  if (!res.ok) {
    console.warn(`Image failed ${res.status}: ${url}`);
    return "";
  }
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = extensionFor(contentType, url);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const digest = createHash("sha1").update(bytes).digest("hex").slice(0, 10);
  const objectPath = `52hqb/${safePath(keyPrefix)}-${digest}${ext}`;
  const upload = await fetch(`${config.supabaseUrl}/storage/v1/object/product-images/${objectPath}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      apikey: config.supabaseServiceRoleKey,
      "content-type": contentType,
      "x-upsert": "true"
    },
    body: bytes
  });
  const text = await upload.text();
  if (!upload.ok) throw new Error(`Supabase storage upload failed ${upload.status}: ${text}`);
  return `${config.supabaseUrl}/storage/v1/object/public/product-images/${objectPath}`;
}

async function upsertProducts(rows) {
  const res = await fetch(`${config.supabaseUrl}/rest/v1/products?on_conflict=source_platform,source_id`, {
    method: "POST",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(rows)
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase products upsert failed ${res.status}: ${text}`);
}

async function encryptFrontendBody(body) {
  const aesKey = randomBytes(16);
  const encryptedAesKeyFromFrontend = await rsaEncrypt(aesKey);
  const encryptedParamsFromFrontend = await aesCbcEncrypt(JSON.stringify(body), aesKey);
  const timestampFromFrontend = Date.now();
  const signatureFromFrontend = await hmacSha256Base64(encryptedParamsFromFrontend + timestampFromFrontend);
  return { encryptedAesKeyFromFrontend, encryptedParamsFromFrontend, signatureFromFrontend, timestampFromFrontend };
}

async function rsaEncrypt(bytes) {
  const key = await subtle.importKey("spki", base64ToArrayBuffer(rsaPublicKey), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const encrypted = await subtle.encrypt({ name: "RSA-OAEP" }, key, bytes);
  return arrayBufferToBase64(encrypted);
}

async function aesCbcEncrypt(text, keyBytes) {
  const iv = randomBytes(16);
  const key = await subtle.importKey("raw", keyBytes, { name: "AES-CBC" }, false, ["encrypt"]);
  const encrypted = await subtle.encrypt({ name: "AES-CBC", iv }, key, textEncoder.encode(text));
  return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(encrypted)}`;
}

async function aesGcmDecrypt(payload, keyBase64) {
  const [iv64, data64] = payload.split(":", 2);
  const keyBytes = base64ToUint8Array(keyBase64);
  const key = await subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await subtle.decrypt({ name: "AES-GCM", iv: base64ToUint8Array(iv64), tagLength: 128 }, key, base64ToUint8Array(data64));
  return textDecoder.decode(decrypted);
}

async function hmacSha256Base64(value) {
  const key = await subtle.importKey("raw", textEncoder.encode(hmacSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return arrayBufferToBase64(await subtle.sign("HMAC", key, textEncoder.encode(value)));
}

function env(name, fallback = "") {
  return process.env[name] || fallback;
}

function absoluteImageUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${publicImageBase}${value}`;
  return `${publicImageBase}/${value}`;
}

function inferModel(title) {
  const text = title.toLowerCase();
  const patterns = [
    [/(?:iphone|苹果)\s*17\s*pro\s*max/i, "iPhone 17 Pro Max"],
    [/(?:iphone|苹果)\s*17\s*pro/i, "iPhone 17 Pro"],
    [/(?:iphone|苹果)\s*17\s*plus/i, "iPhone 17 Plus"],
    [/(?:iphone|苹果)\s*17/i, "iPhone 17"],
    [/iphone\s*16\s*pro\s*max/i, "iPhone 16 Pro Max"],
    [/iphone\s*16\s*pro/i, "iPhone 16 Pro"],
    [/iphone\s*16/i, "iPhone 16"],
    [/iphone\s*15\s*pro\s*max/i, "iPhone 15 Pro Max"],
    [/iphone\s*15\s*pro/i, "iPhone 15 Pro"],
    [/iphone\s*15/i, "iPhone 15"],
    [/samsung\s*s25\s*ultra/i, "Samsung S25 Ultra"],
    [/samsung\s*s25/i, "Samsung S25"],
    [/samsung\s*a56/i, "Samsung A56"]
  ];
  return patterns.find(([pattern]) => pattern.test(text))?.[1] || "Phone Case";
}

function chooseDisplayImages(goodsId, images) {
  const list = unique(images).slice(0, 24);
  const preferredIndex = config.featuredImageOverrides[goodsId];
  if (Number.isInteger(preferredIndex) && list[preferredIndex]) {
    const [preferred] = list.splice(preferredIndex, 1);
    list.unshift(preferred);
  }
  return list;
}

function parseFeaturedImageOverrides(value) {
  if (!value.trim()) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`HQB_FEATURED_IMAGE_OVERRIDES must be JSON, for example {"12838421":1}: ${error.message}`);
  }
}

function buildTags(title, info, listItem) {
  const parts = [title, info.goodsSn, listItem.goodsSn, info.shopInfo?.shopName, "source wholesale 52hqb"];
  return unique(parts.filter(Boolean).map(String)).join(" ");
}

function firstNumber(value) {
  const match = String(value || "").match(/\\d+(?:\\.\\d+)?/);
  return match ? match[0] : "0";
}

function extensionFor(contentType, url) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  const urlExt = new URL(url).pathname.match(/\\.(jpg|jpeg|png|webp|gif)$/i)?.[0];
  return urlExt || ".jpg";
}

function safePath(value) {
  return String(value).replace(/[^a-zA-Z0-9/_-]+/g, "-").replace(/-+/g, "-");
}

function titleCase(value) {
  return value.replace(/\\b\\w/g, (char) => char.toUpperCase());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function base64ToArrayBuffer(value) {
  return Buffer.from(value, "base64");
}

function base64ToUint8Array(value) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function arrayBufferToBase64(value) {
  return Buffer.from(value).toString("base64");
}
