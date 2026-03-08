const fs = require("fs");
const path = require("path");

const webPkgPath = path.join(process.cwd(), "apps", "web", "package.json");
const pkg = JSON.parse(fs.readFileSync(webPkgPath, "utf8"));

pkg.scripts = pkg.scripts || {};
pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

pkg.scripts.dev = "next dev";
pkg.scripts.build = "prisma generate --schema=../../packages/database/prisma/schema.prisma && next build";
pkg.scripts.start = "next start";
pkg.scripts.lint = "eslint .";

pkg.dependencies["@prisma/client"] = "5.22.0";
pkg.dependencies["client-only"] = "0.0.1";
pkg.devDependencies["prisma"] = "5.22.0";

fs.writeFileSync(webPkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("Patched apps/web/package.json");
