/**
 * Run Prisma generate using a temp npm install so @prisma/client resolves (pnpm workspace fix).
 * Call from repo root: node scripts/generate-prisma.cjs
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const databasePkg = path.join(root, 'packages', 'database');
const schemaPath = path.join(databasePkg, 'prisma', 'schema.prisma');
const outDir = path.join(databasePkg, 'src', 'generated', 'client');
// Outside repo so Prisma does not detect pnpm workspace and run "pnpm add"
const tmpDir = path.join(os.tmpdir(), 'brokerbox-prisma-generate-' + Date.now());

if (!fs.existsSync(path.join(databasePkg, 'prisma', 'schema.prisma'))) {
  console.error('Schema not found:', schemaPath);
  process.exit(1);
}

// Temp dir with npm so generate resolves @prisma/client
fs.mkdirSync(tmpDir, { recursive: true });
const pkgJson = {
  name: 'prisma-generate-tmp',
  private: true,
  dependencies: { prisma: '5.22.0', '@prisma/client': '5.22.0' },
};
fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

execSync('npm install --silent', { cwd: tmpDir, stdio: 'inherit' });

// Use the Prisma we just installed in tmpDir (not workspace npx)
// Prisma generate requires DATABASE_URL in schema; use placeholder if unset (e.g. Vercel build before env is set)
const env = { ...process.env };
if (!env.DATABASE_URL) env.DATABASE_URL = 'postgresql://build:build@localhost:5432/build';
const prismaCli = path.join(tmpDir, 'node_modules', 'prisma', 'build', 'index.js');
execSync(`node "${prismaCli}" generate --schema="${schemaPath}"`, {
  cwd: tmpDir,
  env,
  stdio: 'inherit',
});

// Cleanup
try {
  fs.rmSync(tmpDir, { recursive: true });
} catch (_) {}

console.log('Prisma client generated at', outDir);
