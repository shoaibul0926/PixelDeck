// Copies the static site into www/ so Capacitor can bundle it into the APK.
// The site itself stays at the repo root so GitHub Pages keeps working.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "www");
const include = ["index.html", "play.html", "css", "js", "assets"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const name of include) {
  fs.cpSync(path.join(root, name), path.join(out, name), { recursive: true });
}
console.log("www/ ready:", include.join(", "));
