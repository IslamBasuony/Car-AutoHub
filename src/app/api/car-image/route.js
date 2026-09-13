import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildCarImageUrl } from "@/lib/carApi";
import { resolveVehiclePhoto, fetchVehicleImage } from "@/lib/vehicleImageProvider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ASCII_HEADER_RE = /^[\x20-\x7e]+$/;

function asciiSafeHeader(value) {
  if (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 256 &&
    ASCII_HEADER_RE.test(value)
  ) {
    return value;
  }
  return null;
}

function validateVehicleParams(make, model, year) {
  if (!make || make.length > 60 || !/^[\p{L}\d .'-]+$/u.test(make)) {
    return "make";
  }
  if (!model || model.length > 80 || !/^[\p{L}\d .'-]+$/u.test(model)) {
    return "model";
  }
  if (year && !/^\d{4}$/.test(year)) {
    return "year";
  }
  return null;
}

async function getSplashImage() {
  if (!splashBuffer) {
    splashBuffer = await readFile(
      path.join(process.cwd(), "public", "imges", "logos", "card_logo", "splash.png")
    );
  }
  return splashBuffer;
}

let splashBuffer = null;

/**
 * Vehicle photo proxy (server-side only).
 *
 * The browser NEVER talks to Wikimedia directly — every request goes through
 * this same-origin route:
 *   - ?mode=json  -> resolves a real photograph (Wikimedia Commons primary,
 *                    Wikipedia article lead image secondary) and returns the
 *                    full licensing / attribution metadata for the UI.
 *   - ?mode=image -> streams the actual photo bytes, or serves the app's own
 *                    placeholder when no real photo can be obtained.
 *
 * Responses are honest: real photos carry X-Image-Source (wikimedia /
 * wikipedia) + X-Image-Fallback: false, placeholders carry
 * X-Image-Fallback: true and are never labelled as real Wikimedia photos.
 *
 * Metadata lookups are cached server-side for 6h (found) / 24h (misses) /
 * 60s (errors) in src/lib/vehicleImageProvider.js, so the page does not
 * re-query Wikimedia on every render.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const make = (searchParams.get("make") || "").trim();
  const model = (searchParams.get("model") || "").trim();
  const year = (searchParams.get("year") || "").trim();
  const mode = searchParams.get("mode") === "image" ? "image" : "json";

  const badParam = validateVehicleParams(make, model, year);
  if (badParam) {
    return NextResponse.json(
      { ok: false, reason: "invalid", message: `Missing or invalid "${badParam}" parameter.` },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // --- image mode: proxy the photo bytes (or a local placeholder) ----------
  if (mode === "image") {
    const photo = await fetchVehicleImage({ make, model, year });
    if (photo) {
      const headers = {
        "Content-Type": photo.contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Image-Source": photo.source,
        "X-Image-Fallback": "false",
      };
      // Attribution often contains non-Latin-1 characters (em dashes, ©)
      // that are illegal in HTTP header values; attach only ASCII-safe
      // values. The full attribution is always available in JSON metadata
      // and rendered in the details dialog.
      const meta = await resolveVehiclePhoto({ make, model, year }).catch(() => null);
      if (meta && meta.status === "found") {
        const license = asciiSafeHeader(meta.license);
        const attribution = asciiSafeHeader(meta.attribution);
        if (license) headers["X-Image-License"] = license;
        if (attribution) headers["X-Image-Attribution"] = attribution;
      }
      return new NextResponse(photo.bytes, { status: 200, headers });
    }
    // No real photo (5xx/timeout, no licensing info, or genuinely no image
    // on Wikimedia): serve the app's own placeholder so cards and the
    // details popup never render a broken <img>. The headers stay honest.
    const splash = await getSplashImage();
    return new NextResponse(splash, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
        "X-Image-Source": "local-placeholder",
        "X-Image-Fallback": "true",
      },
    });
  }

  // --- json mode: photo metadata + attribution for the add-car flow -------
  const meta = await resolveVehiclePhoto({ make, model, year });

  if (meta.status === "found") {
    return NextResponse.json(
      {
        ok: true,
        found: true,
        status: meta.status,
        make: meta.make,
        model: meta.model,
        year: meta.year,
        imageUrl: buildCarImageUrl(make, model, year),
        source: meta.source,
        reference: meta.reference,
        author: meta.author,
        license: meta.license,
        attribution: meta.attribution,
        width: meta.width,
        height: meta.height,
      },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }
  if (meta.status === "not-found") {
    return NextResponse.json(
      { ok: true, found: false },
      { status: 404, headers: { "Cache-Control": "public, max-age=3600" } }
    );
  }
  return NextResponse.json(
    { ok: false, reason: "unavailable", message: "Vehicle photo service is unreachable." },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
}