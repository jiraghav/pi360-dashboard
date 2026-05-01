/**
 * Next dev (Turbopack) can keep scanning a cached root ./app path after the Android
 * module is moved to android/app/. That yields ENOENT + 500 on every route until .next
 * is removed. We clear .next once (tracked by .next-use-src-app) when root ./app is absent.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const legacyApp = path.join(root, "app");
const nextDir = path.join(root, ".next");
const sentinel = path.join(root, ".next-use-src-app");

if (fs.existsSync(legacyApp)) {
  if (fs.existsSync(sentinel)) {
    fs.unlinkSync(sentinel);
  }
  return;
}

if (!fs.existsSync(nextDir)) {
  return;
}

if (fs.existsSync(sentinel)) {
  return;
}

fs.rmSync(nextDir, { recursive: true, force: true });
fs.writeFileSync(
  sentinel,
  `cleared-at=${new Date().toISOString()}\nreason=root-app-missing-next-uses-src-app\n`
);
// eslint-disable-next-line no-console -- intentional CLI feedback
console.log(
  "[pi360-dashboard] Removed stale .next (Turbopack had cached root ./app). Next runs skip this unless you delete .next-use-src-app."
);
