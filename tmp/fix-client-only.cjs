const fs = require("fs");
const path = require("path");

const webPkgPath = path.join(process.cwd(), "apps", "web", "package.json");
const pkg = JSON.parse(fs.readFileSync(webPkgPath, "utf8"));

pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

if (pkg.devDependencies["client-only"]) {
  delete pkg.devDependencies["client-only"];
}
pkg.dependencies["client-only"] = "^0.0.1";

fs.writeFileSync(webPkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("Moved client-only into dependencies for apps/web");
