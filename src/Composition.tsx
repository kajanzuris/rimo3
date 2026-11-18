import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ParallaxBackground } from "./components/ParallaxBackground";
import { FlashTransition } from "./components/FlashTransition";
import { HookHeadline } from "./components/HookHeadline";
import { Subtitles } from "./components/Subtitles";
import { CallToAction } from "./components/CallToAction";
import { ProgressBar } from "./components/ProgressBar";
import { Particles } from "./components/Particles";
import { parseSrt } from "./utils/parse-srt";
import { VIDEO, THEME, PALETTES } from "./config";
import type { MainProps } from "./types";

export type { MainProps };

export const MainComposition: React.FC<MainProps> = ({
  video,
  audio,
  audioMode,
  seed = 1,
  srtContent,
  showCta = false,
  ctaText = "🛒 CHECKOUT SEKARANG!",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Parse SRT dari props string
  const segments = parseSrt(srtContent ?? "", fps);

  // Variasi warna tema per seed
  Object.assign(THEME, PALETTES[seed % PALETTES.length]);

  // Pengaturan audio & mute
  const videoMuted = audioMode === "mp3" || audioMode === "mute";
  const playMp3 = (audioMode === "mp3" || audioMode === "both") && !!audio;

  // Timing CTA (hanya aktif di 2.5 detik terakhir JIKA showCta diaktifkan)
  const ctaDuration = Math.round(fps * 2.5);
  const ctaEnterFrame = Math.max(0, durationInFrames - ctaDuration);
  const isCtaActive = showCta && frame >= ctaEnterFrame;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Layer 1: Video background dengan Dynamic Lighting (Gelap di Hook -> Terang di Solusi) + Punch Zoom & Shake */}
      <ParallaxBackground
        src={staticFile(video)}
        muted={videoMuted}
        seed={seed}
        segments={segments}
      />

      {/* Layer 2: White Flash Transitions antar segmen */}
      <FlashTransition segments={segments} />

      {/* Layer 3: Partikel ambient */}
      <Particles seed={seed} />

      {/* Layer 4: GIANT HOOK HEADLINE (Detik 0-3 / Segmen 0) - Stiker Merah, Kuning, Putih bertumpuk di tengah */}
      <HookHeadline segment={segments[0]} />

      {/* Layer 5: STIKER KARAOKE SUBTITLES (Segmen 1+) - Kata aktif dibungkus stiker kuning dengan teks hitam */}
      {!isCtaActive && <Subtitles segments={segments} seed={seed} />}

      {/* Layer 6: Call To Action button (Hanya jika showCta diaktifkan di akhir video) */}
      {showCta && (
        <CallToAction
          text={ctaText}
          enterFrame={ctaEnterFrame}
          exitFrame={durationInFrames}
        />
      )}

      {/* Layer 7: Voiceover Audio */}
      {playMp3 && <Audio src={staticFile(audio)} volume={VIDEO.voVolume} />}

      {/* Layer 8: Progress bar durasi */}
      <ProgressBar />
    </AbsoluteFill>
  );
};
