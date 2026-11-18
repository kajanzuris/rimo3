#!/usr/bin/env node
/**
 * Validate that all required assets exist before render.
 * Usage: node scripts/prepare.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const required = ["video.mp4", "audio.mp3", "subs.srt"];
let ok = true;

console.log("🔍 Checking assets...\n");

for (const file of required) {
  const full = path.join(PUBLIC, file);
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    const mb = (stat.size / 1024 / 1024).toFixed(1);
    console.log(`  ✅ ${file} (${mb} MB)`);
  } else {
    console.log(`  ❌ ${file} — MISSING!`);
    ok = false;
  }
}

if (!ok) {
  console.log("\n⚠️  Some files missing. Place them in public/ before rendering.");
  process.exit(1);
} else {
  console.log("\n🎬 All assets ready. Run: npm run build");
}
