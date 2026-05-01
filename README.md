This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Repository layout (Next.js + Android TWA)

Next.js resolves the App Router as **`./app` first**, then **`./src/app`**. A **Gradle module named `app` at the repo root** therefore hijacks Next: you get **404 on every route** and no `/manifest.webmanifest`. The Android Bubblewrap project lives under **`android/app/`** instead, and **`settings.gradle`** sets `project(':app').projectDir = file('android/app')` so Gradle is unchanged from a module named `:app`.

If you previously had a root `app/` folder and dev shows **500** with `scandir '...\\app'` in the terminal, **`npm run dev`** runs `scripts/clear-stale-next-once.cjs` once to remove a stale **`.next`** (see **`.next-use-src-app`** in the repo root, gitignored). To force another wipe, delete **`.next`** and **`.next-use-src-app`**, then run **`npm run dev`** again.

## PWA (installable app)

This app uses the **App Router** (`src/app/`) and is configured as a **Progressive Web App** for Android Chrome and iOS Safari (“Add to Home Screen”).

### What is included

- **`src/app/manifest.js`** — Web app manifest (`/manifest.webmanifest`) with name, theme, `standalone` display, and icons.
- **`public/icons/`** — Placeholder PNGs (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`). Replace with branded assets; keep the same filenames or update `manifest.js` and `src/app/layout.js` metadata.
- **`public/sw.js`** — Minimal service worker: precaches the offline page and icons; **navigation requests** use network-first, then the offline fallback when there is no connection.
- **`public/offline.html`** — Static offline UI (cached by the service worker).
- **`src/app/components/PwaRegister.js`** — Registers the service worker in **production** only (avoids breaking dev HMR). To test the SW in development, set `NEXT_PUBLIC_ENABLE_PWA_DEV=1` in `.env.local` and reload.

### Commands

```bash
npm install
npm run dev          # PWA install / SW disabled by default
npm run build
npm start            # Use this to test install + service worker locally
npm run lint
```

### How to test on Android (Chrome)

1. Run a **production** build: `npm run build && npm start`, or deploy over **HTTPS** (required for install on real devices outside `localhost`).
2. Open the site in Chrome. Use the browser menu → **Install app** / **Add to Home screen** when offered, or the install banner if shown.
3. Open the installed app; confirm the **splash** and **standalone** window (no browser URL bar).
4. Turn on **Airplane mode** and navigate to a new route — you should see the **offline** page; restore network and use **Retry**.

### How to test on iOS (Safari)

1. Serve over **HTTPS** (or `localhost` on your machine).
2. In Safari, tap **Share** → **Add to Home Screen**.
3. Launch from the home screen icon; the status bar uses **`black-translucent`** (see `layout.js` metadata).
4. Safe areas (notch / home indicator) use `viewport-fit=cover` and CSS `env(safe-area-inset-*)` on the shell, navbar, sidebar, and main content.

### Limitations

- **Offline** does not cache the full dashboard or API data; only the offline shell and a few static assets are precached. Authenticated pages still need the network when not already in the browser cache.
- **iOS** does not support every PWA feature that Android does (e.g. install prompts and background sync differ). Push via service worker is limited compared to Android.
- **Development** (`npm run dev`) intentionally skips service worker registration unless `NEXT_PUBLIC_ENABLE_PWA_DEV=1`.
- **`next-pwa` was not added** — a small hand-written `public/sw.js` avoids version coupling with Next.js 16 and keeps behavior easy to audit. You can migrate to `@ducanh2912/next-pwa` or Serwist later if you need richer caching strategies.

### Google Play Store (Trusted Web Activity)

Google Play does **not** upload your Next.js source as an “APK of the repo.” You ship a **small Android wrapper** that opens your **HTTPS** site in **Trusted Web Activity** (fullscreen Chrome, same as your PWA). Your Next app stays the real product; the Play listing is the distribution channel.

**What this repo already provides for TWA**

- Valid **Web App Manifest** at `/manifest.webmanifest` (`src/app/manifest.js`).
- **Service worker** at `/sw.js` (recommended for installability and offline shell).
- **Digital Asset Links** endpoint: `/.well-known/assetlinks.json` (`src/app/.well-known/assetlinks.json/route.js`). Until you set env vars, it returns an empty JSON array `[]` (valid file; association is inactive).

**Production environment variables** (set on the host that serves your **live** site, same origin as the manifest URL)

| Variable | Example | Purpose |
|----------|---------|---------|
| `ANDROID_PACKAGE_NAME` | `com.yourcompany.pi360` | Must match the Android app id from Bubblewrap / Play Console |
| `ANDROID_SHA256_CERT_FINGERPRINTS` | `14:6D:E9:...` (comma-separated if several) | **SHA-256** of the signing certificate Google uses to sign your Play build (use **Play App Signing** certificate from Play Console → App integrity; add your **upload key** too if you sign locally before upload) |

After deployment, verify in a browser: `https://YOUR_DOMAIN/.well-known/assetlinks.json` returns a **non-empty** JSON array with your package name and fingerprints.

**Typical flow (Bubblewrap)**

1. Deploy this Next app to a **stable HTTPS** URL (same URL you will put in the store listing).
2. Install [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap): `npm i -g @bubblewrap/cli` (or use `npx @bubblewrap/cli`).
3. Run `bubblewrap init` and point it at `https://YOUR_DOMAIN/manifest.webmanifest`.
4. Complete the wizard (package name, launcher icons, etc.), then `bubblewrap build` to produce an **AAB** (or APK for testing).
5. Set `ANDROID_PACKAGE_NAME` and `ANDROID_SHA256_CERT_FINGERPRINTS` on production, redeploy, then use [Statement List Generator](https://developers.google.com/digital-asset-links/tools/generator) or Chrome’s TWA troubleshooting to confirm **Digital Asset Links** verify.
6. Upload the **AAB** in [Google Play Console](https://play.google.com/console), add store listing, privacy policy URL, content rating, and **Data safety** as required.

**Important**

- Play requires a **privacy policy** URL and other disclosures; that is configured in Play Console, not only in code.
- **iOS App Store** does not use TWA; this path is **Android / Google Play** specific.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
