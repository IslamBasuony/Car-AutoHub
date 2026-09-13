/**
 * Vehicle photo client layer.
 *
 * Real vehicle photographs are resolved server-side through the same-origin
 * proxy route (src/app/api/car-image/route.js), which pulls from Wikimedia
 * Commons (primary) / Wikipedia (secondary) with full licensing metadata —
 * all server-to-server, no API key required.
 *
 * The browser NEVER talks to any external photo host directly. Everything
 * goes through /api/car-image so there is no CORS dependency and photos are
 * served from a stable same-origin URL that works with next/image without
 * extra remote configuration.
 */

export const CARAPI_PROXY_ROUTE = "/api/car-image";

/** Same-origin photo URL used by next/image and the Add Car preview. */
export function buildCarImageUrl(make, model, year) {
  const params = new URLSearchParams({ make, model, mode: "image" });
  if (year) params.set("year", String(year));
  return `${CARAPI_PROXY_ROUTE}?${params.toString()}`;
}

// --- client-side helpers (used by the Add Car form) ---

const metaCache = new Map();
const META_CACHE_TTL = 60 * 60 * 1000; // 1 hour in-memory reuse

export async function getVehiclePhoto({ make, model, year }, { fresh = false } = {}) {
  const key = `${make.toLowerCase()}|${model.toLowerCase()}|${year || ""}`;
  if (!fresh) {
    const cached = metaCache.get(key);
    if (cached && Date.now() - cached.at < META_CACHE_TTL) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({ make, model, mode: "json" });
  if (year) params.set("year", String(year));

  let data;
  try {
    const res = await fetchWithTimeout(`${CARAPI_PROXY_ROUTE}?${params.toString()}`, 10000, 1);
    if (res.status === 200) {
      const body = await res.json();
      data = {
        ok: true,
        found: Boolean(body.found),
        make: body.make || make,
        model: body.model || model,
        year: body.year ?? year ?? null,
        imageUrl: body.imageUrl,
        imageAuthor: body.author,
        imageLicense: body.license,
        imageAttribution: body.attribution,
        imageReference: body.reference,
        imageSource: body.source,
      };
    } else if (res.status === 404) {
      data = { ok: true, found: false };
    } else {
      data = { ok: false, reason: res.status >= 500 ? "unavailable" : "invalid" };
    }
  } catch {
    data = { ok: false, reason: "unavailable" };
  }

  if (!fresh) {
    metaCache.set(key, { at: Date.now(), data });
  }
  return data;
}

async function fetchWithTimeout(url, ms, retries = 1) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { signal: controller.signal, cache: "no-store" });
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

// Probe whether the vehicle photo service is reachable. Reuses the same
// cached metadata flow: any JSON answer (found OR not-found) means the
// service is up; only 5xx/timeouts mean it is genuinely unavailable. Used
// by the New Cars page to surface an outage honestly instead of hiding it
// behind placeholder images.
export async function checkPhotoServiceStatus(
  probe = { make: "Toyota", model: "RAV4", year: 2026 }
) {
  // fresh=true: do not reuse the 1h metadata cache, so "Check again" works.
  const result = await getVehiclePhoto(probe, { fresh: true });
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true };
}