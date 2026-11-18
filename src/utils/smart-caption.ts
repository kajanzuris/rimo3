import { SubSegment } from "./types";
import { KEYWORDS } from "./config";

// Kata-kata penghubung / pengisi (filler/stopwords) yang tidak perlu dijadikan stiker raksasa
const FILLER_WORDS = new Set([
  "ada", "hal", "yang", "dan", "aku", "kamu", "dia", "ini", "itu",
  "cuma", "buat", "di", "ke", "dari", "pada", "untuk", "dengan",
  "karena", "kalau", "tapi", "bisa", "sudah", "lagi", "terus"
]);

const cleanWord = (w: string) => w.replace(/[^\w]/g, "").toLowerCase();

export interface CorePhrase {
  originalText: string;
  coreWords: string[];
  fullWords: string[];
}

/**
 * Mengekstrak KATA INTI dari kalimat SRT agar tampilan teks di layar
 * fokus pada pesan utama (seperti DAPUR SEMPIT / PIRING NUMPUK)
 */
export function extractCoreWords(text: string): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 3) return words;

  // Filter kata penting: kata yang bukan filler ATAU merupakan keyword
  const important = words.filter((w) => {
    const cleaned = cleanWord(w);
    return !FILLER_WORDS.has(cleaned) || Object.keys(KEYWORDS).includes(cleaned);
  });

  // Jika setelah difilter terlalu sedikit, ambil 3-4 kata paling bermakna di akhir kalimat
  if (important.length === 0) return words.slice(-3);
  if (important.length > 4) return important.slice(0, 4);

  return important;
}

/**
 * Menghitung index kata aktif berdasarkan bobot karakter (speech-weighted timing)
 * bukan sekadar linear interpolation yang membuat kata meleset dari ucapan
 */
export function getActiveWordIndex(
  words: string[],
  localFrame: number,
  totalDur: number
): number {
  if (words.length === 0) return 0;
  if (localFrame >= totalDur) return words.length - 1;

  const weights = words.map((w) => Math.max(2, cleanWord(w).length));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const currentProgress = Math.min(
    totalWeight,
    (localFrame / Math.max(1, totalDur * 0.92)) * totalWeight
  );

  let acc = 0;
  for (let i = 0; i < words.length; i++) {
    acc += weights[i];
    if (currentProgress <= acc) {
      return i;
    }
  }

  return words.length - 1;
}
