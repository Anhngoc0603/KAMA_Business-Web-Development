/**
 * Lightweight Recommendation & Insights API Server
 * - Matches Quiz/Beauty Profile selections against product keywords
 * - Surfaces slow-selling products using admin/orders.json & refunds.json
 *
 * Endpoints:
 *   POST /api/recommend { source: 'quiz'|'beauty_profile', selections: string[], mode?: 'promo'|'normal' }
 *   GET  /api/recommend?selections=a,b,c&mode=promo
 *   GET  /api/insights/slow-sellers?range=90d
 *   POST /api/track/interactions { source, selections }
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ---- Helpers: text normalization & tokenization ----
function normalizeText(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (works for Vietnamese accents)
    .toLowerCase();
}
function tokenize(str) {
  return normalizeText(str)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}
function uniq(arr) { return Array.from(new Set(arr)); }

// ---- VN-EN keyword mapping & expansion ----
const VN_EN_MAP = {
  // Skin types
  'da dau': ['oily'],
  'da kho': ['dry'],
  'da hon hop': ['combination'],
  'da nhay cam': ['sensitive'],
  'nhay cam': ['sensitive'],
  'thuong': ['normal'],
  // Skin concerns
  'muon': ['acne','blemish'],
  'mun': ['acne','blemish'],
  'nhan': ['fine lines','wrinkle'],
  'lo chan long': ['pores','visible pores'],
  'mo lo chan long': ['pores','minimise pores'],
  'tham': ['dark spots','pigmentation'],
  'tham nam': ['dark spots','pigmentation'],
  'tham mun': ['dark spots','post-acne marks'],
  'do': ['redness'],
  'xam': ['dullness'],
  'duong am': ['moisturising','hydrating'],
  'cap am': ['moisturising','hydrating'],
  'lam sang': ['brightening'],
  'chong lao hoa': ['anti-aging','well-aging'],
  'chong nang': ['sun care','spf'],
  // Finish & makeup
  'min li': ['matte'],
  'bong': ['dewy','glow'],
  'do che phu cao': ['full coverage'],
  'che phu': ['coverage'],
  // Hair concerns
  'gau': ['anti-dandruff'],
  'xo roi': ['hair loss','thinning'],
  'khong deu mau': ['color care'],
  'cham soc da dau': ['scalp treatment'],
  'bong muot': ['shine'],
  'phuc hoi hu ton': ['damage repair'],
  'duong am toc': ['hydrating']
};
function expandSelections(list) {
  const baseTokens = uniq(list.flatMap(tokenize));
  const expanded = new Set(baseTokens);
  for (const t of baseTokens) {
    const vnSyn = VN_EN_MAP[t];
    if (vnSyn && vnSyn.length) {
      for (const s of vnSyn) expanded.add(normalizeText(s));
    }
  }
  return Array.from(expanded);
}

// ---- Load product datasets ----
function loadJsonSafe(p, def) {
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const data = JSON.parse(raw);
    return data;
  } catch (e) {
    return def;
  }
}
function normalizeProducts(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

const root = path.resolve(__dirname, '..');
const sources = [
  path.join(root, 'categories', 'full.json'),
  path.join(root, 'Best_Sellers', 'full.json'),
  path.join(root, 'Sale', 'products.json'),
  path.join(root, 'new', 'products.json'),
  path.join(root, '1.homepage', 'products.json')
];

function loadAllProducts() {
  const merged = [];
  const seen = new Set();
  for (const p of sources) {
    const raw = loadJsonSafe(p, { products: [] });
    const prods = normalizeProducts(raw);
    for (const prod of prods) {
      const key = prod.id ?? `${prod.brand}-${prod.name}`;
      const k = String(key);
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(prod);
    }
  }
  return merged;
}

// ---- Load orders & refunds to compute slow sellers ----
const ordersPath = path.join(root, 'admin', 'orders.json');
const refundsPath = path.join(root, 'admin', 'refunds.json');

function loadOrders() { return loadJsonSafe(ordersPath, []); }
function loadRefunds() { return loadJsonSafe(refundsPath, []); }

// ---- Build keyword index for products ----
function buildProductIndex(products) {
  return products.map(p => {
    const fields = [
      p.name,
      p.brand,
      p.category,
      p.subtype,
      p.description,
      p.detailedDescription,
      p.ingredients,
      ...(Array.isArray(p.benefits) ? p.benefits : []),
      ...(Array.isArray(p.shades) ? p.shades.map(s => `${s.value} ${s.label}`) : [])
    ].filter(Boolean).join(' ');
    const tokens = uniq(tokenize(fields));
    return {
      id: p.id,
      brand: p.brand,
      name: p.name,
      category: p.category,
      subtype: p.subtype,
      price: p.price,
      isSale: Boolean(p.isSale || (p.originalPrice && Number(p.originalPrice) > Number(p.price || 0))),
      tokens,
      raw: p
    };
  });
}

// ---- Scoring function ----
function scoreProduct(prod, selectionTokens, boosts) {
  let score = 0;
  const reasons = [];
  const set = new Set(prod.tokens);

  // Exact matches in structured fields
  for (const t of selectionTokens) {
    if (!t) continue;
    if (normalizeText(prod.category || '') === t) { score += 3; reasons.push(`category:${t}`); }
    if (normalizeText(prod.subtype || '') === t) { score += 2; reasons.push(`subtype:${t}`); }
    if (normalizeText(prod.brand || '') === t) { score += 1; reasons.push(`brand:${t}`); }
    if (set.has(t)) { score += 1; reasons.push(`keyword:${t}`); }
  }

  // Weighting from interactions per matched token
  if (boosts && boosts.interaction) {
    for (const t of selectionTokens) {
      const w = boosts.interaction[t];
      if (w) { score += w; reasons.push(`boost:interaction:${t}:${w.toFixed(2)}`); }
    }
  }

  // Sale boost
  if (prod.isSale) { score += boosts.sale; reasons.push('boost:sale'); }

  // Promotion mode: slow-seller boost
  if (boosts && boosts.slowSellerIds && boosts.slowSellerIds.has(String(prod.id))) {
    score += boosts.promoSlow;
    reasons.push('boost:promo:slow');
  }

  return { score, reasons };
}

// ---- Slow sellers calculation ----
function parseDate(d) { const s = String(d||'').trim(); return s ? new Date(s) : null; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

function computeSalesCounts(orders, rangeDays = 90) {
  const since = daysAgo(rangeDays);
  const counts = new Map();
  for (const o of orders) {
    const created = parseDate(o.createdAt);
    if (created && created < since) continue;
    const items = Array.isArray(o.items) ? o.items : [];
    for (const it of items) {
      const pid = it.productId != null ? String(it.productId) : null;
      if (!pid) continue;
      const qty = Number(it.qty || it.quantity || 1) || 1;
      counts.set(pid, (counts.get(pid) || 0) + qty);
    }
  }
  return counts;
}

function detectSlowSellers(productsIndex, orders, refunds, rangeDays = 90) {
  const counts = computeSalesCounts(orders, rangeDays);
  const refundedIds = new Set(refunds.map(r => String(r.productId || '').trim()).filter(Boolean));
  const annotated = productsIndex.map(p => {
    const pid = String(p.id);
    const sold = counts.get(pid) || 0;
    const refundFlag = refundedIds.has(pid);
    return { prod: p, sold, refundFlag };
  });
  // Bottom quartile by sold count considered slow-seller
  const soldVals = annotated.map(a => a.sold).sort((a,b)=>a-b);
  const q1Index = Math.floor(soldVals.length * 0.25);
  const q1 = soldVals[q1Index] ?? 0;
  return annotated
    .filter(a => a.sold <= q1)
    .map(a => ({ id: a.prod.id, name: a.prod.name, brand: a.prod.brand, sold: a.sold }));
}

// ---- Data bootstrap ----
let PRODUCTS = loadAllProducts();
let INDEX = buildProductIndex(PRODUCTS);
let ORDERS = loadOrders();
let REFUNDS = loadRefunds();

function refreshData() {
  PRODUCTS = loadAllProducts();
  INDEX = buildProductIndex(PRODUCTS);
  ORDERS = loadOrders();
  REFUNDS = loadRefunds();
}

// ---- API: Recommend ----
// ---- API: Track interactions ----
const interactionsPath = path.join(root, 'tools', 'data', 'interactions.json');
function ensureInteractionsFile() {
  try {
    const dir = path.dirname(interactionsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(interactionsPath)) fs.writeFileSync(interactionsPath, '[]', 'utf-8');
  } catch {}
}
ensureInteractionsFile();

function getInteractionBoosts() {
  try {
    const raw = fs.readFileSync(interactionsPath, 'utf-8');
    const arr = JSON.parse(raw || '[]');
    const counts = new Map();
    let total = 0;
    for (const r of arr) {
      const sels = Array.isArray(r.selections) ? r.selections : [];
      const toks = uniq(sels.flatMap(tokenize));
      for (const t of toks) { counts.set(t, (counts.get(t)||0)+1); total++; }
    }
    const boosts = {};
    // Normalize to 0.0~0.75 range so it’s additive but not dominant
    const denom = Math.max(total, 1);
    for (const [t,c] of counts.entries()) {
      boosts[t] = Math.min(0.75, (c/denom) * 1.5);
    }
    return boosts;
  } catch {
    return {};
  }
}

function recommend(selectionTokens, mode) {
  const tokens = expandSelections(selectionTokens);
  const interaction = getInteractionBoosts();
  const isPromo = mode === 'promo';
  const slowList = detectSlowSellers(INDEX, ORDERS, REFUNDS, 90);
  const slowIds = new Set(slowList.map(i => String(i.id)));
  const boosts = {
    sale: isPromo ? 1.0 : 0.5,
    promoSlow: isPromo ? 1.25 : 0.0,
    interaction,
    slowSellerIds: isPromo ? slowIds : null
  };
  const results = INDEX.map(p => {
    const { score, reasons } = scoreProduct(p, tokens, boosts);
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      score,
      reasons,
      isSale: p.isSale,
      category: p.category,
      subtype: p.subtype,
      // Enrich with image fields for UI consumers (Quiz, Account)
      images: Array.isArray(p.raw?.images) ? p.raw.images : undefined,
      brandImage: p.raw?.brandImage
    };
  })
  .filter(r => r.score > 0)
  .sort((a,b) => b.score - a.score)
  .slice(0, 24);
  return { tokens, results, promo: { slowSellers: slowList } };
}

// ---- Minimal HTTP router ----
function sendJson(res, code, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}
function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const str = Buffer.concat(chunks).toString('utf-8');
      try { resolve(JSON.parse(str || '{}')); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '/';
  // Health
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, { ok: true });
  }
  // Insights slow-sellers
  if (req.method === 'GET' && pathname === '/api/insights/slow-sellers') {
    try {
      const range = String(parsed.query.range || '90d').trim();
      const m = range.match(/(\d+)d/); const days = m ? Number(m[1]) : 90;
      const slowSellers = detectSlowSellers(INDEX, ORDERS, REFUNDS, days);
      return sendJson(res, 200, { rangeDays: days, count: slowSellers.length, items: slowSellers });
    } catch (e) {
      return sendJson(res, 500, { error: 'slow_sellers_failed', message: e.message });
    }
  }
  // Recommend (POST)
  if (req.method === 'POST' && pathname === '/api/recommend') {
    try {
      const body = await parseBody(req);
      const { source, selections, mode } = body || {};
      const list = Array.isArray(selections) ? selections : Object.values(selections || {});
      const { tokens, results, promo } = recommend(list, mode);
      return sendJson(res, 200, { source: source || 'unknown', selections: tokens, count: results.length, results, promo });
    } catch (e) {
      return sendJson(res, 500, { error: 'recommend_failed', message: e.message });
    }
  }
  // Recommend (GET)
  if (req.method === 'GET' && pathname === '/api/recommend') {
    try {
      const qsSel = String(parsed.query.selections || '').trim();
      const mode = String(parsed.query.mode || 'normal').trim();
      const list = qsSel ? qsSel.split(',') : [];
      const { tokens, results, promo } = recommend(list, mode);
      return sendJson(res, 200, { source: 'query', selections: tokens, count: results.length, results, promo, mode });
    } catch (e) {
      return sendJson(res, 500, { error: 'recommend_failed', message: e.message });
    }
  }
  // Track interactions
  if (req.method === 'POST' && pathname === '/api/track/interactions') {
    try {
      const body = await parseBody(req);
      ensureInteractionsFile();
      const record = {
        id: `I-${Date.now()}`,
        ts: new Date().toISOString(),
        source: body.source || 'unknown',
        selections: Array.isArray(body.selections) ? body.selections : Object.values(body.selections || {}),
        meta: body.meta || null
      };
      const raw = fs.readFileSync(interactionsPath, 'utf-8');
      const arr = JSON.parse(raw);
      arr.push(record);
      fs.writeFileSync(interactionsPath, JSON.stringify(arr, null, 2), 'utf-8');
      return sendJson(res, 200, { ok: true, record });
    } catch (e) {
      return sendJson(res, 500, { error: 'track_failed', message: e.message });
    }
  }
  // Admin refresh
  if (req.method === 'POST' && pathname === '/api/admin/refresh') {
    try { refreshData(); return sendJson(res, 200, { ok: true }); } catch (e) { return sendJson(res, 500, { error: 'refresh_failed', message: e.message }); }
  }
  // Static file serving (fallback)
  if (req.method === 'GET') {
    try {
      let relPath = pathname;
      if (relPath === '/' || relPath === '') relPath = '/index.html';
      const safeRel = relPath.replace(/\.+/g, '.').replace(/\\/g, '/');
      const filePath = path.join(root, safeRel);
      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { error: 'not_found' });
      }
      const stat = fs.statSync(filePath);
      let serveFile = filePath;
      if (stat.isDirectory()) {
        serveFile = path.join(filePath, 'index.html');
      }
      const ext = path.extname(serveFile).toLowerCase();
      const mimes = {
        '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
        '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'
      };
      const content = fs.readFileSync(serveFile);
      res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
      return res.end(content);
    } catch {
      return sendJson(res, 500, { error: 'static_failed' });
    }
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[api-server] Recommendation API listening on http://localhost:${PORT}`);
});
