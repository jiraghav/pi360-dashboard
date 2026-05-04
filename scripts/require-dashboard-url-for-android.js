/**
 * Ensures CAPACITOR_SERVER_URL is set (env or .env / .env.local) before `cap sync`,
 * so the Android WebView loads the hosted dashboard instead of www/index.html.
 */
const fs = require("fs");
const { resolve } = require("path");
const config = require("../capacitor.config.js");

if (process.env.SKIP_CAPACITOR_URL_CHECK === "1") {
  process.exit(0);
}

if (!config.server?.url) {
  console.error(`
Missing CAPACITOR_SERVER_URL — the Android app will only show the placeholder page.

Fix:
  1. In the project root, create or edit .env.local and add one line (your real URL, HTTPS in production):
     CAPACITOR_SERVER_URL=https://your-dashboard.example.com

  2. For a phone to hit Next.js on your PC during dev, use your PC LAN IP and the same port, e.g.:
     CAPACITOR_SERVER_URL=http://192.168.1.50:3000
     (Android cannot use http://localhost to reach your computer.)

  3. Run: npm run android:sync
  4. Rebuild the APK: cd android && ./gradlew assembleDebug

To sync without this check (not recommended): SKIP_CAPACITOR_URL_CHECK=1 npm run android:sync
`);
  process.exit(1);
}

const dashboardUrl = config.server.url;
console.log("Capacitor server.url →", dashboardUrl);

// Tiny script for www/offline.html "Try again" (not served from public/ by the WebView).
const injectPath = resolve(__dirname, "../www/_dashboard_url.js");
fs.writeFileSync(
  injectPath,
  `window.__CIC_OFFLINE_DASHBOARD_URL=${JSON.stringify(dashboardUrl)};\n`,
  "utf8"
);
