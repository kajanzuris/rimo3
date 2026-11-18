import type { VideoConfig } from "./types";

/** ========== KONFIGURASI VIDEO ========== */

export const VIDEO: VideoConfig = {
  fps: 30,
  width: 720,
  height: 1280,
  durationSec: 18,
  durationFrames: 540,
  bgmVolume: 0.15,
  voVolume: 1.0,
};

/** Warna tema stiker kontras tinggi (Gaya Viral TikTok / Reels) */
export const THEME = {
  // Stiker & Aksen
  yellowSticker: "#FFD700", // kuning stabilo viral
  redSticker: "#FF2A4D",    // merah neon (hook / masalah)
  whiteSticker: "#FFFFFF",  // putih kontras
  blackText: "#000000",
  whiteText: "#FFFFFF",
  
  // Aksen dinamis
  primary: "#FFD700",
  accent: "#FF2A4D",
  text: "#FFFFFF",
  
  // Progress & Partikel
  progressBar: "#FFD700",
  progressBg: "rgba(255, 255, 255, 0.25)",
  particle: "#FFD700",
};

/** Palet warna dinamis per seed */
export const PALETTES = [
  { primary: "#FFD700", accent: "#FF2A4D", progressBar: "#FFD700", particle: "#FFD700" }, // Kuning & Merah (Klasik Viral)
  { primary: "#00E5FF", accent: "#FF2A4D", progressBar: "#00E5FF", particle: "#00E5FF" }, // Cyan & Merah
  { primary: "#00FF88", accent: "#FFD700", progressBar: "#00FF88", particle: "#00FF88" }, // Mint & Kuning
  { primary: "#FF9F1C", accent: "#FF2A4D", progressBar: "#FF9F1C", particle: "#FF9F1C" }, // Orange & Merah
];

/** Kata kunci auto-highlight untuk berbagai kategori video */
export const KEYWORDS: Record<string, string> = {
  // Masalah / Attention Grabbers (Stiker Merah)
  mampet: "#FF2A4D",
  bau: "#FF2A4D",
  kotor: "#FF2A4D",
  rusak: "#FF2A4D",
  sempit: "#FF2A4D",
  numpuk: "#FFD700",
  capek: "#FF2A4D",
  ribet: "#FF2A4D",
  mahal: "#FF2A4D",
  bahaya: "#FF2A4D",
  susah: "#FF2A4D",

  // Solusi & Keunggulan (Stiker Kuning / Hijau / Cyan)
  bersih: "#00FF88",
  hemat: "#00FF88",
  gratis: "#00FF88",
  praktis: "#00FF88",
  rapi: "#00FF88",
  mudah: "#00FF88",
  pasang: "#00E5FF",
  estetik: "#00E5FF",
  viral: "#00E5FF",
  rekomendasi: "#00E5FF",
  wajib: "#FFD700",

  // Call-To-Action & Promo
  diskon: "#FFD700",
  promo: "#FFD700",
  checkout: "#FFD700",
  beli: "#FFD700",
  sekarang: "#FF2A4D",
  murah: "#FFD700",
};

/** Tipografi: Impact / Arial Black tebal padat ala CapCut/TikTok */
export const FONT = {
  heading: "Impact, 'Arial Black', sans-serif",
  body: "Impact, 'Arial Black', sans-serif",
};
