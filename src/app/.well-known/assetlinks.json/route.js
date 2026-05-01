/**
 * Digital Asset Links for Trusted Web Activity (TWA) → Google Play.
 * After you create the Android wrapper with Bubblewrap, set the env vars on your
 * production host so Chrome can verify the app ↔ website association.
 *
 * @see https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/
 */

export const dynamic = "force-dynamic";

function normalizeFingerprint(fp) {
  const s = fp.trim().replace(/\s/g, "").toUpperCase();
  if (!s) return "";
  // Accept "AA:BB:..." or "AABBCC..." (insert colons)
  if (s.includes(":")) return s;
  if (s.length % 2 !== 0) return s;
  return s.match(/.{1,2}/g).join(":");
}

export async function GET() {
  const packageName = process.env.ANDROID_PACKAGE_NAME;
  const rawFps = process.env.ANDROID_SHA256_CERT_FINGERPRINTS;

  if (!packageName || !rawFps) {
    return Response.json([], {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  const sha256_cert_fingerprints = rawFps
    .split(",")
    .map(normalizeFingerprint)
    .filter(Boolean);

  if (sha256_cert_fingerprints.length === 0) {
    return Response.json([], {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints,
      },
    },
  ];

  return Response.json(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
