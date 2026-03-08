const fs = require("fs");
const path = require("path");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

const rootPkgPath = path.join(process.cwd(), "package.json");
const webPkgPath = path.join(process.cwd(), "apps", "web", "package.json");
const dbPkgPath = path.join(process.cwd(), "packages", "database", "package.json");
const gitignorePath = path.join(process.cwd(), ".gitignore");
const rootVercelPath = path.join(process.cwd(), "vercel.json");

const rootPkg = readJson(rootPkgPath);
rootPkg.scripts = rootPkg.scripts || {};
rootPkg.scripts["db:generate"] = "pnpm --dir apps/web exec prisma generate --schema=../../packages/database/prisma/schema.prisma";
writeJson(rootPkgPath, rootPkg);

const webPkg = readJson(webPkgPath);
webPkg.scripts = webPkg.scripts || {};
webPkg.dependencies = webPkg.dependencies || {};
webPkg.devDependencies = webPkg.devDependencies || {};

webPkg.scripts.dev = "next dev";
webPkg.scripts.build = "prisma generate --schema=../../packages/database/prisma/schema.prisma && next build";
webPkg.scripts.start = "next start";
webPkg.scripts.lint = "eslint .";

webPkg.dependencies["@prisma/client"] = "^5.22.0";
webPkg.devDependencies["prisma"] = "^5.22.0";

writeJson(webPkgPath, webPkg);

const dbPkg = readJson(dbPkgPath);
dbPkg.scripts = dbPkg.scripts || {};
dbPkg.dependencies = dbPkg.dependencies || {};
dbPkg.devDependencies = dbPkg.devDependencies || {};

dbPkg.scripts["db:generate"] = "prisma generate --schema=./prisma/schema.prisma";
dbPkg.dependencies["@prisma/client"] = "^5.22.0";
dbPkg.devDependencies["prisma"] = "^5.22.0";

writeJson(dbPkgPath, dbPkg);

const ignoreLines = [
  ".next/",
  "**/.next/",
  ".turbo/",
  "**/.turbo/",
  "web_build_log*.txt",
  "web_build_error.txt",
  "pnpm_install_log*.txt",
  "vercel_prod_log*.txt"
];

let gi = "";
if (fs.existsSync(gitignorePath)) {
  gi = fs.readFileSync(gitignorePath, "utf8");
}
for (const line of ignoreLines) {
  if (!gi.includes(line)) gi += (gi.endsWith("\n") || gi.length === 0 ? "" : "\n") + line + "\n";
}
fs.writeFileSync(gitignorePath, gi);

fs.writeFileSync(rootVercelPath, JSON.stringify({ framework: "nextjs" }, null, 2) + "\n");

console.log("Patched package.json files, .gitignore, and vercel.json");
