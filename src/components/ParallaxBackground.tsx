import React from "react";
import { Video, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { SubSegment } from "../types";

interface Props {
  src: string;
  muted?: boolean;
  seed?: number;
  segments?: SubSegment[];
}

export const ParallaxBackground: React.FC<Props> = ({
  src,
  muted = true,
  seed = 1,
  segments = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Tentukan akhir segmen Hook (segmen 0)
  const hookEndFrame = segments.length > 0 ? segments[0].endFrame : Math.round(fps * 3);

  // 1. EFEK PENCAHAYAAN DINAMIS: GELAP LALU TERANG
  // Pada fase Hook (detik 0 s/d akhir segmen 0), video dibuat gelap & misterius (fokus masalah).
  // Setelah Hook selesai, video otomatis bertransisi menjadi TERANG & CERAH (solusi produk).
  const isHookPhase = frame < hookEndFrame;

  const brightness = interpolate(
    frame,
    [hookEndFrame - 5, hookEndFrame + 18],
    [0.65, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const saturation = interpolate(
    frame,
    [hookEndFrame - 5, hookEndFrame + 18],
    [0.85, 1.15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const contrast = interpolate(
    frame,
    [hookEndFrame - 5, hookEndFrame + 18],
    [1.25, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const vignetteDarkness = interpolate(
    frame,
    [hookEndFrame - 5, hookEndFrame + 18],
    [0.85, 0.50],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 2. Slow Cinematic Drift (zoom & pan perlahan)
  const strength = 1.05 + (seed % 5) * 0.015;
  const zoomRange: [number, number] =
    seed % 2 === 0 ? [1.02, strength] : [strength, 1.02];

  const baseScale = interpolate(frame, [0, durationInFrames], zoomRange, {
    extrapolateRight: "clamp",
  });

  const panDir = seed % 2 === 0 ? 1 : -1;
  const baseTranslateY = interpolate(
    frame,
    [0, durationInFrames],
    [-2 * panDir, 2 * panDir],
    { extrapolateRight: "clamp" }
  );

  // 3. Hook Punch Zoom (Detik 0 - 1)
  const hookSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const hookZoom = interpolate(hookSpring, [0, 1], [0.12, 0]);

  // 4. Segment Beat Zoom (Hentakan mikro saat kalimat baru dimulai)
  let beatZoom = 0;
  for (const seg of segments) {
    if (seg.startFrame > 0 && frame >= seg.startFrame && frame < seg.startFrame + 16) {
      const beatSpring = spring({
        frame: frame - seg.startFrame,
        fps,
        config: { damping: 10, stiffness: 180 },
      });
      const pulse = interpolate(beatSpring, [0, 0.4, 1], [0, 0.045, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      beatZoom = Math.max(beatZoom, pulse);
    }
  }

  // 5. Screen Shake (Getaran kamera saat ada kata kunci penting)
  let shakeX = 0;
  let shakeY = 0;
  const activeSeg = segments.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );

  if (activeSeg && activeSeg.keyword) {
    const localF = frame - activeSeg.startFrame;
    if (localF >= 0 && localF <= 14) {
      const damp = interpolate(localF, [0, 14], [1, 0], {
        extrapolateRight: "clamp",
      });
      shakeX = Math.sin(localF * 2.2) * 8 * damp;
      shakeY = Math.cos(localF * 1.8) * 6 * damp;
    }
  }

  const finalScale = baseScale + hookZoom + beatZoom;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Video
        src={src}
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${finalScale}) translate(${shakeX}px, calc(${baseTranslateY}% + ${shakeY}px))`,
          filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`,
          transition: "filter 0.2s ease",
        }}
      />
      {/* Dynamic Vignette (gelap pekat di hook, lalu cerah & fokus di solusi) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${vignetteDarkness}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
