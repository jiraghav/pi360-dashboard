const { existsSync, readFileSync } = require("fs");
const { resolve } = require("path");

function loadCapacitorServerUrlFromEnvFiles() {
  if (process.env.CAPACITOR_SERVER_URL) {
    return;
  }
  const root = __dirname;
  for (const name of [".env.local", ".env"]) {
    const p = resolve(root, name);
    if (!existsSync(p)) {
      continue;
    }
    const text = readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const m = trimmed.match(/^CAPACITOR_SERVER_URL\s*=\s*(.*)$/);
      if (!m) {
        continue;
      }
      let v = m[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env.CAPACITOR_SERVER_URL = v;
      return;
    }
  }
}

loadCapacitorServerUrlFromEnvFiles();

const serverUrl = (process.env.CAPACITOR_SERVER_URL || "").trim();

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: "com.pi360.dashboard",
  appName: "CIC Dashboard",
  webDir: "www",
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: "#ffffff",
    },
    StatusBar: {
      // Default true draws the WebView under the status bar; false keeps content below it.
      overlaysWebView: false,
      backgroundColor: "#0b0f16",
      style: "DARK",
    },
  },
};

if (serverUrl) {
  config.server = {
    url: serverUrl.replace(/\/$/, ""),
    cleartext: serverUrl.startsWith("http:"),
    // Bundled page when the main frame can’t load (no network, DNS, etc.)
    errorPath: "offline.html",
  };
}

module.exports = config;
