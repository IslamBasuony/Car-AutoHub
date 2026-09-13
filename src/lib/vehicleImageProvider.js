/**
 * Vehicle photo provider — server-side only.
 *
 * Fetches REAL car photographs from Wikimedia Commons (primary) and,
 * when Commons has no good match, from a vehicle's Wikipedia article
 * lead image (secondary). Both sources are free, stable, need NO API
 * key, and return full licensing / author metadata so every photo is
 * attributed correctly. Final fallback (used in the route) is the app's
 * own local placeholder, which is always labelled as a placeholder.
 *
 * This module is imported only by the same-origin proxy route
 * (src/app/api/car-image/route.js) — the browser never talks to
 * Wikimedia directly. All upstream traffic is server-to-server.
 *
 * Env overrides (optional, see .env.example):
 *   CAR_IMAGE_WIKIMEDIA_API — Commons API endpoint (defaults to commons.wikimedia.org)
 *   CAR_IMAGE_WIKIPEDIA_API — English Wikipedia API endpoint (defaults to en.wikipedia.org)
 */

import process from "node:process";

const COMMONS_API = (process.env.CAR_IMAGE_WIKIMEDIA_API || "https://commons.wikimedia.org/w/api.php").replace(/\/+$/, "");
const WIKIPEDIA_API = (process.env.CAR_IMAGE_WIKIPEDIA_API || "https://en.wikipedia.org/w/api.php").replace(/\/+$/, "");

const USER_AGENT =
  "AutoHubClient/1.0 (Next.js portfolio project; Wikimedia Commons photo provider for car listings)";

const SEARCH_TIMEOUT_MS = 8000;
const IMAGE_TIMEOUT_MS = 12000;

const MAX_CONCURRENT_META = 1; // metadata lookups run strictly serial — Wikimedia
const MAX_CONCURRENT_BYTES = 2; // image downloads may run a little in parallel
const RATE_PER_SECOND = 5; // self-imposed cap — Wikimedia throttles bursts
const THUMB_WIDTH = 1200; // iiurlwidth — good balance of card/dialog quality

// Result caching: found photos refresh after 6h, misses after 24h, errors
// "cool down" for 60s so we never hammer a failing upstream.
const TTL_FOUND = 6 * 60 * 60 * 1000;
const TTL_NOT_FOUND = 24 * 60 * 60 * 1000;
const TTL_ERROR = 60 * 1000;
const IMAGE_FAILURE_TTL = 5 * 60 * 1000;

const metaCache = new Map(); // key -> { at, data }
const inflight = new Map(); // key -> Promise (dedupe concurrent identical lookups)
const imageFailureCache = new Map(); // key -> timestamp of last byte-fetch failure

// Concurrency limiters — Wikimedia appreciates gentle burst behaviour.
function makeLimiter(max) {
  let active = 0;
  const waiters = [];
  async function run(fn) {
    if (active >= max) {
      await new Promise((resolve) => waiters.push(resolve));
    }
    active += 1;
    try {
      return await fn();
    } finally {
      active -= 1;
      const next = waiters.shift();
      if (next) next();
    }
  }
  return { run };
}

const metaLimiter = makeLimiter(MAX_CONCURRENT_META);
const bytesLimiter = makeLimiter(MAX_CONCURRENT_BYTES);

// When Wikimedia throttles us (slow/stalled responses), back off for a short
// breathing window after every failed metadata request before starting the
// next one. This keeps multi-card cold starts from compounding failures.
const COOLDOWN_AFTER_META_FAILURE_MS = 1500;
let lastMetaFailureAt = 0;

async function respectMetaCooldown(limiter) {
  if (limiter !== metaLimiter) return;
  const wait = lastMetaFailureAt + COOLDOWN_AFTER_META_FAILURE_MS - Date.now();
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

// Sliding token bucket (RATE_PER_SECOND req/s) so bursts of car lookups
// cannot trip Wikimedia's anonymous-client throttling.
let tokens = RATE_PER_SECOND;
let lastRefill = Date.now();
async function takeToken() {
  for (;;) {
    const now = Date.now();
    tokens = Math.min(
      RATE_PER_SECOND,
      tokens + ((now - lastRefill) / 1000) * RATE_PER_SECOND
    );
    lastRefill = now;
    if (tokens >= 1) {
      tokens -= 1;
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/** Abstain briefly when the upstream asks us to (429 / 503 with Retry-After). */
function retryDelayFor(res, attempt) {
  const retryAfter = Number(res && res.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 5000);
  }
  return 250 * (attempt + 1);
}

async function limitedFetch(url, { ms, headers, limiter = metaLimiter } = {}) {
  return limiter.run(async () => {
    await respectMetaCooldown(limiter);
    await takeToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms || SEARCH_TIMEOUT_MS);
    try {
      return await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json, image/*;q=0.9, */*;q=0.5",
          ...headers,
        },
      });
    } finally {
      clearTimeout(timer);
    }
  });
}

async function fetchJson(url, { retries = 2, ms = SEARCH_TIMEOUT_MS } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await limitedFetch(url, { ms });
      if (!res.ok) {
        await res.text().catch(() => null); // drain the body so the socket recycles
        const err = new Error(`upstream ${res.status}`);
        err.retryAfter = retryDelayFor(res, attempt);
        throw err;
      }
      const body = await res.json();
      if (body && body.error) throw new Error(`mediawiki error: ${body.error.info || body.error.code}`);
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay =
          (error && error.retryAfter) ||
          250 * (attempt + 1) +
            Math.floor(Math.random() * 150) + // jitter spreads simultaneous retries
            (attempt === 0 ? 100 : 0);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        lastMetaFailureAt = Date.now();
      }
    }
  }
  throw lastError;
}

/** Wikimedia appends analytics query params to URLs — strip them for caching/CDN URLs. */
function stripTracking(url) {
  if (!url) return null;
  return url.split(/[?#]/)[0];
}

/** Crude HTML->text for extmetadata values (they contain <a> tags). */
function htmlToText(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;|&#8211;/g, "–")
    .replace(/&mdash;|&#8212;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strict token match: every numeric/short token must stand alone (so "3"
 *  doesn't match inside "2003", and "x5" doesn't match inside "x509"). */
function titleContainsToken(title, token) {
  const t = String(token).toLowerCase();
  if (!t) return true;
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(t)}([^\\p{L}\\p{N}]|$)`, "u");
  return re.test(title);
}

function allTokensMatch(title, tokens) {
  return tokens.every((t) => titleContainsToken(title, t));
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

const HARD_BLOCK_RE =
  /logo|emblem|badge|map|diagram|schematic|cutaway|drawing|illustration|infographic|3d render|computer render|render of|\bconcept\b|prototype|concept car|concept study|preview model/i;
const SOFT_PENALTY_RE =
  /interior|dashboard|dashboard|cabin|instrument|rear seats|front seats|wheel|rim|tyre|tire|engine bay|under the hood|battery|charging port|pace car|nascar|grand marshal|auto show stage|show car|racing car|livery/i;
const REAR_RE = /\brear\b|\bback\b/;
const FRONT_RE = /\bfront\b/;
const SIDE_RE = /\bside\b/;

function scoreCandidate(candidate, makeTokens, modelTokens, year) {
  const title = String(candidate.title || "").replace(/^file:/i, "").toLowerCase();
  if (HARD_BLOCK_RE.test(title)) return -Infinity;
  if (!allTokensMatch(title, makeTokens) || !allTokensMatch(title, modelTokens)) return -Infinity;

  let score = 0;

  // Year precision: bonus for a near-exact model year in the filename,
  // penalty for an obviously different generation, neutral if absent.
  const years = title.match(/\b(19|20)\d{2}\b/g) || [];
  if (year && years.length > 0) {
    let hitClose = false;
    let minGap = Infinity;
    for (const y of years) {
      const gap = Math.abs(Number(y) - year);
      if (gap <= 2) hitClose = true;
      else minGap = Math.min(minGap, gap);
    }
    if (hitClose) score += 130;
    else score -= Math.min(90, minGap * 6);
  } else if (year && /\b(19|20)\d{2}\b/.test(title)) {
    score -= 40;
  }

  if (FRONT_RE.test(title)) score += 25;
  else if (SIDE_RE.test(title)) score += 12;
  if (REAR_RE.test(title)) score -= 14;
  if (SOFT_PENALTY_RE.test(title)) score -= 80;

  const info = candidate.imageinfo && candidate.imageinfo[0];
  const mime = (info && info.mime) || "";
  if (mime.includes("jpeg")) score += 8;
  else if (mime.includes("png")) score -= 4;
  else if (mime && !mime.startsWith("image/")) return -Infinity;

  const width = (info && info.width) || 0;
  const height = (info && info.height) || 0;
  if (width >= 1200) score += 10;
  else if (width >= 800) score += 5;
  else if (width >= 400) score += 0;
  else score -= 50;
  if (width > 0 && height > 0) {
    const ratio = width / height;
    if (ratio > 2.6) score -= 15; // too panoramic for a card
    if (ratio < 0.8) score -= 8;
  }

  // Relevance rank from MediaWiki search (low index = more relevant).
  score += Math.max(0, 12 - (candidate.index || 12));

  return score;
}

function metaFromImageInfo(make, model, year, info, source, fileTitle) {
  const author = htmlToText(info.extmetadata && info.extmetadata.Artist && info.extmetadata.Artist.value);
  const license = (info.extmetadata && info.extmetadata.LicenseShortName && info.extmetadata.LicenseShortName.value) || null;
  const customAttribution = htmlToText(info.extmetadata && info.extmetadata.Attribution && info.extmetadata.Attribution.value);

  let attribution = customAttribution;
  if (!attribution) {
    attribution = author
      ? `${author}${license ? ` (${license})` : ""}`
      : `${license ? `${license} licensed` : "Wikimedia Commons"} photo, via Wikimedia Commons`;
  }

  return {
    status: "found",
    make,
    model,
    year,
    upstreamUrl: stripTracking(info.thumburl || info.url),
    width: info.thumbwidth || info.width || null,
    height: info.thumbheight || info.height || null,
    mime: (info.mime || "").split("/").pop() || null,
    source,
    reference: info.descriptionurl || null,
    fileTitle: fileTitle || null,
    author: author || null,
    license,
    attribution,
  };
}

function buildSearchUrl(base, gsrsearch, gsrlimit) {
  const url = new URL(base);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", gsrsearch);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", String(gsrlimit));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", String(THUMB_WIDTH));
  url.searchParams.set("iiextmetadatafilter", "Artist|LicenseShortName|AttributionRequired|UsageTerms|Attribution");
  return url.toString();
}

async function runCommonsSearch(gsrsearch, limit) {
  const data = await fetchJson(buildSearchUrl(COMMONS_API, gsrsearch, limit));
  const pages = (data.query && data.query.pages) || [];
  return pages
    .filter((p) => p.ns === 6)
    .map((p) => ({ title: p.title, index: p.index, imageinfo: p.imageinfo }));
}

async function searchWikimedia(make, model, year) {
  const phrase = `"${make} ${model}"`;
  const yearTerm = year ? `${year} ` : "";
  const candidates = [];
  const seen = new Set();

  const merge = (list) => {
    for (const c of list) {
      if (!seen.has(c.title)) {
        seen.add(c.title);
        candidates.push(c);
      }
    }
  };

  // Stage 1 — strict make+model phrase.
  const stage1 = await runCommonsSearch(`filetype:bitmap intitle:${phrase}`, 12);
  merge(stage1);

  // Stage 2 — year-strict search so recent model years win when available.
  if (year) {
    merge(await runCommonsSearch(`filetype:bitmap intitle:"${year}" intitle:${phrase}`, 8));
  }

  // Stage 3 — relaxed make+model words (punctuation/space variants), only
  // worth running when the strict phrase search was thin.
  if (stage1.length < 4) {
    merge(
      await runCommonsSearch(`filetype:bitmap intitle:"${make}" intitle:"${model}"`, 8)
    );
  }

  const makeTokens = tokenize(make);
  const modelTokens = tokenize(model);

  let best = null;
  let bestScore = -Infinity;
  for (const candidate of candidates) {
    const s = scoreCandidate(candidate, makeTokens, modelTokens, year);
    if (s > bestScore) {
      best = candidate;
      bestScore = s;
    }
  }
  if (!best || Number.isNaN(bestScore) || bestScore < 5) return null;

  const info = best.imageinfo && best.imageinfo[0];
  if (!info || !info.thumburl) return null;
  return metaFromImageInfo(make, model, year, info, "wikimedia", best.title);
}

// --- Wikipedia lead-image secondary source ---------------------------------

function buildImageInfoUrl(base, fileTitle) {
  const url = new URL(base);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("formatversion", "2");
  url.searchParams.set("titles", `File:${fileTitle}`);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", String(THUMB_WIDTH));
  url.searchParams.set("iiextmetadatafilter", "Artist|LicenseShortName|AttributionRequired|UsageTerms|Attribution");
  return url.toString();
}

async function fetchFileInfo(base, fileTitle) {
  const data = await fetchJson(buildImageInfoUrl(base, fileTitle));
  const page = (data.query && data.query.pages && data.query.pages[0]) || null;
  if (!page || page.missing || !page.imageinfo) return null;
  return page.imageinfo[0];
}

async function getWikipediaPhoto(make, model, year) {
  const searchUrl = new URL(WIKIPEDIA_API);
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("formatversion", "2");
  searchUrl.searchParams.set("list", "search");
  searchUrl.searchParams.set("srsearch", `"${make} ${model}"`);
  searchUrl.searchParams.set("srnamespace", "0");
  searchUrl.searchParams.set("srlimit", "6");

  const data = await fetchJson(searchUrl.toString());
  const hits = (data.query && data.query.search) || [];
  for (const hit of hits) {
    if (/disambiguation/i.test(hit.title)) continue;

    const piUrl = new URL(WIKIPEDIA_API);
    piUrl.searchParams.set("action", "query");
    piUrl.searchParams.set("format", "json");
    piUrl.searchParams.set("formatversion", "2");
    piUrl.searchParams.set("titles", hit.title);
    piUrl.searchParams.set("prop", "pageimages");
    piUrl.searchParams.set("piprop", "name|thumbnail");
    piUrl.searchParams.set("pithumbsize", String(THUMB_WIDTH));
    const pi = await fetchJson(piUrl.toString());
    const page = (pi.query && pi.query.pages && pi.query.pages[0]) || null;
    const pageimage = page && page.pageimage;
    if (!pageimage) continue;

    // The lead image almost always lives on Commons; ask Wikipedia first,
    // then fall back to the exact same lookup on Commons itself.
    let info = null;
    try {
      info = await fetchFileInfo(WIKIPEDIA_API, pageimage);
    } catch {
      info = null;
    }
    if (!info) {
      try {
        info = await fetchFileInfo(COMMONS_API, pageimage);
      } catch {
        info = null;
      }
    }
    if (!info) continue;

    const meta = metaFromImageInfo(make, model, year, info, "wikipedia", `File:${pageimage}`);
    meta.reference = meta.reference || `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`;
    return meta;
  }
  return null;
}

// --- Public resolver with cache + dedupe -----------------------------------

function ttlFor(status) {
  if (status === "found") return TTL_FOUND;
  if (status === "not-found") return TTL_NOT_FOUND;
  return TTL_ERROR;
}

/**
 * Resolve the best real photo for a vehicle. Returns:
 *   { status: "found", make, model, year, upstreamUrl, width, height, mime,
 *     source, reference, author, license, attribution }
 *   { status: "not-found", make, model, year }
 *   { status: "error", make, model, year }
 */
export async function resolveVehiclePhoto({ make, model, year }) {
  const key = `${make.toLowerCase()}|${model.toLowerCase()}|${year || ""}`;

  const cached = metaCache.get(key);
  if (cached && Date.now() - cached.at < ttlFor(cached.data.status)) {
    return cached.data;
  }

  let promise = inflight.get(key);
  if (!promise) {
    promise = (async () => {
      try {
        const commons = await searchWikimedia(make, model, year);
        if (commons && commons.upstreamUrl) return commons;
        const wikipedia = await getWikipediaPhoto(make, model, year);
        if (wikipedia && wikipedia.upstreamUrl) return wikipedia;
        return { status: "not-found", make, model, year };
      } catch {
        return { status: "error", make, model, year };
      }
    })();
    inflight.set(key, promise);
  }

  try {
    const data = await promise;
    metaCache.set(key, { at: Date.now(), data });
    return data;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Fetch the actual photo bytes for a vehicle, or null when unavailable.
 * Uses the cached metadata (so ==0 extra metadata requests after the first
 * lookups) and short-circuits to null for a few minutes after a download
 * failure to avoid hammering a broken URL.
 */
export async function fetchVehicleImage({ make, model, year }) {
  const key = `${make.toLowerCase()}|${model.toLowerCase()}|${year || ""}`;

  const failedAt = imageFailureCache.get(key);
  if (failedAt && Date.now() - failedAt < IMAGE_FAILURE_TTL) return null;

  const meta = await resolveVehiclePhoto({ make, model, year });
  if (meta.status !== "found" || !meta.upstreamUrl) return null;

  try {
    const res = await limitedFetch(stripTracking(meta.upstreamUrl), {
      ms: IMAGE_TIMEOUT_MS,
      limiter: bytesLimiter,
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok || !contentType.startsWith("image/")) {
      throw new Error(`non-image upstream response ${res.status} ${contentType}`);
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0) throw new Error("empty image body");
    imageFailureCache.delete(key);
    return { bytes, contentType, source: meta.source };
  } catch {
    imageFailureCache.set(key, Date.now());
    return null;
  }
}