import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const publicDir = path.join(root, 'public');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function emptyDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(s, d);
    } else if (entry.isFile()) {
      await fs.copyFile(s, d);
    }
  }
}

async function copyIfDir(name) {
  const src = path.join(root, name);
  if (await exists(src)) {
    await copyDir(src, path.join(publicDir, name));
  }
}

async function copyRootFiles() {
  const exts = new Set(['.html', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', '.js']);
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        await fs.copyFile(path.join(root, entry.name), path.join(publicDir, entry.name));
      }
    }
  }
}

async function main() {
  await emptyDir(publicDir);
  for (const dir of ['admin', 'client', 'shared']) {
    await copyIfDir(dir);
  }
  await copyRootFiles();
  console.log('Static assets prepared in public/');
}

main().catch(err => { console.error(err); process.exit(1); });

