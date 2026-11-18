import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const [
  folder = "video1",
  audioMode = "auto",
  seedArg = "",
  showCtaArg = "false",
  ctaTextArg = "",
] = process.argv.slice(2);

const dir = path.join("public", folder);
if (!fs.existsSync(dir)) throw new Error(`Folder tidak ada: ${dir}`);

const files = fs.readdirSync(dir).sort();
const pick = (exts) =>
  files.find((f) => exts.includes(path.extname(f).toLowerCase()));

const video = pick([".mp4", ".mov", ".webm", ".mkv"]);
const audio = pick([".mp3", ".wav", ".m4a", ".aac"]);
const srt = pick([".srt"]);

if (!video) throw new Error(`Tidak ada file video di ${dir}`);

// auto: pakai mp3 kalau ada, kalau tidak pakai suara video
const mode = audioMode === "auto" ? (audio ? "mp3" : "video") : audioMode;

if ((mode === "mp3" || mode === "both") && !audio)
  throw new Error(`Mode "${mode}" tapi tidak ada file audio di ${dir}`);

// srt: baca isinya langsung ke job.json (Composition tidak perlu baca filesystem)
const srtContent = srt ? fs.readFileSync(path.join(dir, srt), "utf-8") : "";

let durationSec = 18;
try {
  durationSec = parseFloat(
    execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${path.join(dir, video)}"`
    )
      .toString()
      .trim()
  );
} catch (e) {
  console.warn("Peringatan: ffprobe gagal atau tidak ditemukan di PATH, memakai estimasi default (18 detik).");
}

// seed: manual kalau diisi, otomatis dari nama folder kalau kosong
const autoSeed = [...folder].reduce(
  (a, c) => (a * 31 + c.charCodeAt(0)) % 100000,
  7
);
const seed = seedArg !== "" && !isNaN(Number(seedArg)) ? Number(seedArg) : autoSeed;

// Kontrol CTA
const showCta = showCtaArg === "true" || showCtaArg === "1";
const ctaText = ctaTextArg.trim() || "🛒 CHECKOUT SEKARANG!";

const job = {
  video: `${folder}/${video}`,
  audio: audio ? `${folder}/${audio}` : "",
  audioMode: mode, // video | mp3 | both | mute
  durationSec,
  seed,
  srtContent,
  showCta,
  ctaText,
};

fs.writeFileSync("job.json", JSON.stringify(job, null, 2));
console.log("Job siap:", job);
