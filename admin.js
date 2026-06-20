const config = window.SUPABASE_CONFIG || {};
let token = sessionStorage.getItem("trivvo-admin-token") || "";
let adminUser = null;
let requests = [];
let activeStatus = "all";
let activeRequestNumber = "";

const loginView = document.querySelector("#loginView");
const adminView = document.querySelector("#adminView");
const loginForm = document.querySelector("#adminLoginForm");
const loginMessage = document.querySelector("#loginMessage");
const identity = document.querySelector("#adminIdentity");
const refreshButton = document.querySelector("#refreshButton");
const exportButton = document.querySelector("#exportButton");
const autoRefresh = document.querySelector("#autoRefresh");
const autoRefreshLabel = document.querySelector("#autoRefreshLabel");
const signOutButton = document.querySelector("#signOutButton");
const metrics = document.querySelector("#metrics");
const statusFilters = document.querySelector("#statusFilters");
const requestList = document.querySelector("#requestList");
const requestDetail = document.querySelector("#requestDetail");
const requestSearch = document.querySelector("#requestSearch");
let refreshTimer = null;

const statuses = {
  pending: "待确认", confirmed: "可以采购", quoted: "已报价", noon_ready: "Noon 链接已生成",
  noon_ordered: "顾客已在 Noon 下单", sourcing: "采购中", shipped: "已发货", completed: "已完成",
  unavailable: "无法采购", cancelled: "已取消"
};

function headers(auth = token) {
  return { apikey: config.anonKey, "Content-Type": "application/json", ...(auth ? { Authorization: `Bearer ${auth}` } : {}) };
}

function authUrl(path) { return `${config.url}/auth/v1/${path}`; }
function restUrl(path) { return `${config.url}/rest/v1/${path}`; }
function isAdmin(user) { return user?.app_metadata?.role === "admin"; }
function money(value) { return Number.isFinite(Number(value)) ? Number(value).toFixed(2).replace(".00", "") : "-"; }
function dateTime(value) { return value ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-"; }
function escapeHtml(value = "") { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }

function showLogin(message = "") {
  loginView.hidden = false;
  adminView.hidden = true;
  refreshButton.hidden = true;
  exportButton.hidden = true;
  autoRefreshLabel.hidden = true;
  signOutButton.hidden = true;
  identity.textContent = adminUser?.email || "尚未登录";
  loginMessage.textContent = message;
}

function showAdmin() {
  loginView.hidden = true;
  adminView.hidden = false;
  refreshButton.hidden = false;
  exportButton.hidden = false;
  autoRefreshLabel.hidden = false;
  signOutButton.hidden = false;
  identity.textContent = adminUser.email || "Trivvo 管理员";
}

async function authenticate(email, password) {
  const response = await fetch(authUrl("token?grant_type=password"), { method: "POST", headers: headers(""), body: JSON.stringify({ email, password }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.message || "登录失败");
  if (!isAdmin(data.user)) throw new Error("该账号不是管理员，请先在 Supabase 中授予 admin 权限。");
  token = data.access_token;
  adminUser = data.user;
  sessionStorage.setItem("trivvo-admin-token", token);
}

async function restore() {
  if (!token) return false;
  const response = await fetch(authUrl("user"), { headers: headers() });
  if (!response.ok) return false;
  adminUser = await response.json();
  return isAdmin(adminUser);
}

async function loadRequests() {
  requestList.innerHTML = `<div class="detail-empty"><span>正在读取采购申请…</span></div>`;
  const response = await fetch(`${restUrl("procurement_requests")}?select=*&order=created_at.desc`, { headers: headers() });
  if (!response.ok) throw new Error((await response.json()).message || "无法读取采购申请");
  requests = await response.json();
  renderAll();
}

function startAutoRefresh() {
  clearInterval(refreshTimer);
  if (!autoRefresh.checked || !adminUser) return;
  refreshTimer = setInterval(() => loadRequests().catch(console.warn), 30000);
}

function filteredRequests() {
  const query = requestSearch.value.trim().toLowerCase();
  return requests.filter((request) => {
    const statusMatch = activeStatus === "all" || request.status === activeStatus;
    const searchMatch = !query || `${request.request_number} ${request.customer_name} ${request.whatsapp} ${request.city}`.toLowerCase().includes(query);
    return statusMatch && searchMatch;
  });
}

function renderMetrics() {
  const pending = requests.filter((item) => item.status === "pending").length;
  const processing = requests.filter((item) => ["confirmed", "quoted", "noon_ready", "noon_ordered", "sourcing"].includes(item.status)).length;
  const completed = requests.filter((item) => item.status === "completed").length;
  const total = requests.reduce((sum, item) => sum + Number(item.final_total || 0), 0);
  metrics.innerHTML = [
    ["待确认申请", pending], ["处理中", processing], ["已完成", completed], ["最终报价合计", `${money(total)} SAR`]
  ].map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`).join("");
  document.title = pending ? `(${pending}) Trivvo 采购申请管理` : "Trivvo 采购申请管理";
}

function renderFilters() {
  statusFilters.innerHTML = [["all", "全部"], ...Object.entries(statuses)].map(([key, label]) => {
    const count = key === "all" ? requests.length : requests.filter((request) => request.status === key).length;
    return `<button class="${activeStatus === key ? "active" : ""}" type="button" data-status="${key}"><span>${label}</span><b>${count}</b></button>`;
  }).join("");
  document.querySelector("#requestCount").textContent = requests.length;
}

function renderList() {
  const visible = filteredRequests();
  requestList.innerHTML = visible.length ? visible.map((request) => `
    <button class="request-row${activeRequestNumber === request.request_number ? " active" : ""}${request.status === "pending" ? " is-new" : ""}" type="button" data-request="${request.request_number}">
      <div><strong>${escapeHtml(request.request_number)}</strong><em>${statuses[request.status] || request.status}</em></div>
      <span>${escapeHtml(request.customer_name)} · ${escapeHtml(request.city || "未填写城市")}</span>
      <small>${request.items?.length || 0} 种商品 · ${dateTime(request.created_at)}</small>
    </button>`).join("") : `<div class="detail-empty"><strong>没有匹配申请</strong><span>新申请会显示在这里。</span></div>`;
}

function renderDetail() {
  const request = requests.find((item) => item.request_number === activeRequestNumber);
  if (!request) {
    requestDetail.innerHTML = `<div class="detail-empty"><strong>选择一个采购申请</strong><span>在这里查看商品并更新处理状态。</span></div>`;
    return;
  }
  const message = encodeURIComponent(`你好，关于您的 Trivvo 采购申请 ${request.request_number}，我们正在确认库存和报价。`);
  requestDetail.innerHTML = `
    <div class="detail-head">
      <div><h2>${escapeHtml(request.request_number)}</h2><p>${dateTime(request.created_at)} · ${statuses[request.status] || request.status}</p></div>
      <div class="detail-actions">
        <button type="button" data-copy-request="${escapeHtml(request.request_number)}">复制申请编号</button>
        <a href="https://wa.me/${String(request.whatsapp).replace(/\D/g, "")}?text=${message}" target="_blank" rel="noreferrer">联系顾客</a>
        ${request.final_total ? `<a href="${quoteWhatsappUrl(request)}" target="_blank" rel="noreferrer">发送报价</a>` : ""}
      </div>
    </div>
    <div class="customer-info">
      <div><span>顾客姓名</span><strong>${escapeHtml(request.customer_name)}</strong></div>
      <div><span>WhatsApp</span><strong>${escapeHtml(request.whatsapp)}</strong></div>
      <div><span>城市</span><strong>${escapeHtml(request.city || "-")}</strong></div>
      <div><span>参考金额</span><strong>${money(request.reference_total)} ${request.currency || "SAR"}</strong></div>
      <div><span>顾客备注</span><strong>${escapeHtml(request.notes || "-")}</strong></div>
    </div>
    <div class="admin-items">${(request.items || []).map((item) => `
      <article class="admin-item">
        <img src="${escapeHtml(item.image)}" alt="" referrerpolicy="no-referrer">
        <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.sku || item.model || "-")}</span><small>数量：${item.quantity}</small></div>
        <b>${money(item.price)} ${item.currency || "SAR"}</b>
      </article>`).join("")}</div>
    <form class="manage-form" id="manageForm">
      <div class="quick-status">
        <button type="button" data-quick-status="confirmed">确认可采购</button>
        <button type="button" data-quick-status="quoted">标记已报价</button>
        <button type="button" data-quick-status="noon_ready">Noon 链接已生成</button>
        <button type="button" data-quick-status="noon_ordered">顾客已在 Noon 下单</button>
        <button type="button" data-quick-status="shipped">标记已发货</button>
        <button type="button" data-quick-status="completed">完成申请</button>
      </div>
      <label>处理状态<select name="status">${Object.entries(statuses).map(([key, label]) => `<option value="${key}" ${request.status === key ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <label>最终报价（SAR）<input name="final_total" type="number" min="0" step="0.01" value="${request.final_total ?? ""}" placeholder="确认后填写"></label>
      <label class="wide">对应 Noon 商品链接<input name="noon_url" type="url" value="${escapeHtml(request.noon_url || "")}" placeholder="创建与实际款式一致的 Noon 商品后填写"></label>
      <label class="wide">物流单号<input name="tracking_number" value="${escapeHtml(request.tracking_number || "")}" placeholder="发货后填写"></label>
      <button type="submit">保存申请处理结果</button>
      <em id="manageMessage"></em>
    </form>`;
}

function renderAll() { renderMetrics(); renderFilters(); renderList(); renderDetail(); }

function quoteWhatsappUrl(request) {
  const lines = [
    `你好，您的 Trivvo 采购申请 ${request.request_number} 已确认。`,
    `最终报价：${money(request.final_total)} ${request.currency || "SAR"}`,
    request.noon_url ? `Noon 下单链接：${request.noon_url}` : "",
    "如有问题请直接回复此消息。"
  ].filter(Boolean);
  return `https://wa.me/${String(request.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
}

function exportCsv() {
  const rows = [["申请编号", "状态", "顾客姓名", "WhatsApp", "城市", "商品种类", "参考金额", "最终报价", "创建时间"]];
  filteredRequests().forEach((request) => rows.push([
    request.request_number, statuses[request.status] || request.status, request.customer_name, request.whatsapp,
    request.city, request.items?.length || 0, request.reference_total, request.final_total, request.created_at
  ]));
  const blob = new Blob([`\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\n")}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `trivvo-procurement-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function updateRequest(form) {
  const message = document.querySelector("#manageMessage");
  const submit = form.querySelector("button");
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    status: data.status,
    final_total: data.final_total ? Number(data.final_total) : null,
    noon_url: data.noon_url || null,
    tracking_number: data.tracking_number || null,
    updated_at: new Date().toISOString()
  };
  submit.disabled = true;
  message.textContent = "正在保存…";
  const response = await fetch(`${restUrl("procurement_requests")}?request_number=eq.${encodeURIComponent(activeRequestNumber)}`, {
    method: "PATCH", headers: { ...headers(), Prefer: "return=representation" }, body: JSON.stringify(payload)
  });
  if (!response.ok) {
    message.textContent = (await response.json()).message || "保存失败";
    submit.disabled = false;
    return;
  }
  message.textContent = "已保存";
  await loadRequests();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "正在验证管理员权限…";
  try {
    await authenticate(loginForm.elements.email.value.trim(), loginForm.elements.password.value);
    showAdmin();
    await loadRequests();
    startAutoRefresh();
  } catch (error) {
    showLogin(error.message);
  }
});

statusFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-status]");
  if (!button) return;
  activeStatus = button.dataset.status;
  renderFilters();
  renderList();
});

requestList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-request]");
  if (!row) return;
  activeRequestNumber = row.dataset.request;
  renderList();
  renderDetail();
});

requestDetail.addEventListener("submit", (event) => {
  if (!event.target.closest("#manageForm")) return;
  event.preventDefault();
  updateRequest(event.target);
});

requestDetail.addEventListener("click", async (event) => {
  const copy = event.target.closest("[data-copy-request]");
  if (copy) {
    await copyText(copy.dataset.copyRequest);
    copy.textContent = "已复制";
    return;
  }
  const quick = event.target.closest("[data-quick-status]");
  if (quick) {
    const form = document.querySelector("#manageForm");
    const select = form?.querySelector('[name="status"]');
    if (select && form) {
      select.value = quick.dataset.quickStatus;
      await updateRequest(form);
    }
  }
});

requestSearch.addEventListener("input", renderList);
refreshButton.addEventListener("click", loadRequests);
exportButton.addEventListener("click", exportCsv);
autoRefresh.addEventListener("change", startAutoRefresh);
signOutButton.addEventListener("click", () => {
  token = "";
  adminUser = null;
  sessionStorage.removeItem("trivvo-admin-token");
  clearInterval(refreshTimer);
  showLogin();
});

(async () => {
  if (await restore()) {
    showAdmin();
    loadRequests().then(startAutoRefresh).catch((error) => showLogin(error.message));
  } else {
    token = "";
    sessionStorage.removeItem("trivvo-admin-token");
    showLogin();
  }
})();
