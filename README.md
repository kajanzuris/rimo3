# 🎬 Remotion UGC Video Template

Template Remotion untuk membuat video UGC affiliate (TikTok / Reels / Shorts) dengan efek visual maksimal, **100% CPU** — cocok untuk render di GitHub Actions gratis.

## ✨ Fitur Visual

| Efek | Deskripsi |
|---|---|
| 🎥 Parallax Background | Video latar dengan zoom-in & pan lambat + vignette |
| 🧊 Glassmorphism Panel | Panel kaca buram estetik untuk teks |
| ✍️ Kinetic Text | Teks animasi bounce / scale / wave / typewriter per adegan |
| 📝 Subtitles | Word-by-word highlight dari file SRT |
| ✨ Particles | Partikel emas mengambang dekoratif |
| 🛒 Call-to-Action | Tombol CTA gradient berkedip di akhir video |
| 📊 Progress Bar | Indikator kemajuan video di bawah |
| 🎯 Keyword Highlight | Kata kunci otomatis glow (diskon, gratis, checkout, dll) |

## 📁 Struktur

```
public/
├── video.mp4     ← Video mentah (bisa Git LFS)
├── audio.mp3     ← Voiceover / musik
└── subs.srt      ← Subtitle bahasa Indonesia
src/
├── config.ts     ← Warna, font, timing (edit di sini)
├── types.ts      ← TypeScript types
├── Composition.tsx
├── Root.tsx
├── components/
│   ├── ParallaxBackground.tsx
│   ├── GlassPanel.tsx
│   ├── KineticText.tsx
│   ├── Subtitles.tsx
│   ├── Particles.tsx
│   ├── CallToAction.tsx
│   └── ProgressBar.tsx
└── utils/
    ├── parse-srt.ts
    └── easing.ts
scripts/
├── generate-vo.mjs  ← Generate VO Indonesia dari SRT (edge-tts)
└── prepare.mjs      ← Validasi aset sebelum render
```

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Taruh bahan di public/
#    - video.mp4 (video mentah)
#    - audio.mp3 (voiceover)
#    - subs.srt  (subtitle)

# 3. Preview di browser
npm run dev

# 4. Render final
npm run build
# Output: out/final.mp4
```

## 🎙️ Generate Voiceover dari SRT

Kalau belum punya audio.mp3, bisa generate otomatis dari teks SRT:

```bash
npm run generate-vo
# Output: public/audio.mp3 (suara AI cewek Indonesia)
```

## ⚙️ Kustomisasi

Edit `src/config.ts`:

| Setting | Fungsi |
|---|---|
| `VIDEO.fps` | Frame per detik (default 30) |
| `VIDEO.durationSec` | Durasi total video |
| `VIDEO.width/height` | Resolusi (default 720x1280 / 9:16) |
| `THEME.*` | Warna panel, teks, progress bar, partikel |
| `KEYWORDS` | Kata kunci + warna highlight otomatis |
| `FONT` | Font heading & body |

## 🤖 GitHub Actions (CI/CD)

Push ke GitHub → otomatis render → download dari Artifacts tab.

Untuk file > 100 MB, gunakan Git LFS:
```bash
git lfs install
git lfs track "*.mp4" "*.mp3"
git add .gitattributes
```

Atau download aset dari URL saat CI (tambah step di workflow):
```yaml
- name: Download assets
  run: |
    curl -L -o public/video.mp4 "${{ secrets.VIDEO_URL }}"
    curl -L -o public/audio.mp3 "${{ secrets.AUDIO_URL }}"
```

## 📐 Spesifikasi Default

- **Resolusi**: 720 × 1280 (9:16 vertical)
- **FPS**: 30
- **Codec**: H.264 (libx264) — CPU only, tanpa GPU
- **Render time**: ~2-5 menit (GitHub Actions) / ~30 detik (lokal)
