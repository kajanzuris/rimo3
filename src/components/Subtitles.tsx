import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { SubSegment } from "../types";
import { THEME, KEYWORDS, FONT } from "../config";
import { getActiveWordIndex } from "../utils/smart-caption";

interface Props {
  segments: SubSegment[];
  seed?: number;
}

const cleanWord = (w: string) => w.replace(/[^\w]/g, "").toLowerCase();

export const Subtitles: React.FC<Props> = ({ segments, seed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cari segmen aktif
  const activeIndex = segments.findIndex(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );
  if (activeIndex === -1) return null;

  // Segmen 0 khusus ditangani oleh HookHeadline di tengah layar
  if (activeIndex === 0) return null;

  const active = segments[activeIndex];
  const localFrame = frame - active.startFrame;
  const totalDur = Math.max(1, active.endFrame - active.startFrame);

  // Animasi masuk kontainer (pop spring)
  const panelScale = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  // Animasi fade out di ujung segmen
  const panelOpacity = interpolate(
    localFrame,
    [totalDur - 5, totalDur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Sinkronisasi kata aktif menggunakan bobot panjang kata (speech-weighted timing)
  const activeWordIdx = getActiveWordIndex(active.words, localFrame, totalDur);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: panelOpacity,
        transform: `scale(${panelScale})`,
        pointerEvents: "none",
        zIndex: 15,
        padding: "0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px 12px",
          maxWidth: "92%",
        }}
      >
        {active.words.map((word, i) => {
          const isCurrentlySpeaking = i === activeWordIdx;
          const cleaned = cleanWord(word);
          const isKeyword = Object.keys(KEYWORDS).includes(cleaned);

          // Kata yang sedang dibaca: Berubah menjadi STIKER BALOK KUNING / MERAH teks hitam
          let badgeBg = "transparent";
          let badgeColor = "#FFFFFF";
          let wordScale = 1;
          let rotation = 0;

          if (isCurrentlySpeaking) {
            const wordF = Math.max(
              0,
              localFrame - (i / Math.max(1, active.words.length)) * totalDur * 0.9
            );
            const wSpring = spring({
              frame: wordF,
              fps,
              config: { damping: 8, stiffness: 220 },
            });
            wordScale = interpolate(wSpring, [0, 1], [0.95, 1.16]);

            if (isKeyword) {
              badgeBg = THEME.redSticker;
              badgeColor = "#FFFFFF";
              rotation = -2;
            } else {
              badgeBg = THEME.yellowSticker;
              badgeColor = "#000000";
              rotation = 1.5;
            }
          }

          return (
            <div
              key={i}
              style={{
                display: "inline-block",
                background: badgeBg,
                borderRadius: badgeBg !== "transparent" ? 8 : 0,
                padding: badgeBg !== "transparent" ? "4px 14px" : "0 4px",
                border: badgeBg !== "transparent" ? "2.5px solid #000000" : "none",
                transform: `scale(${wordScale}) rotate(${rotation}deg)`,
                boxShadow:
                  badgeBg !== "transparent"
                    ? "0 4px 16px rgba(0,0,0,0.7)"
                    : "none",
                transition: "transform 0.08s ease",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontFamily: FONT.heading,
                  fontSize: 40,
                  fontWeight: 900,
                  color: badgeColor,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  lineHeight: 1.15,
                  textShadow:
                    badgeBg === "transparent"
                      ? "3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 6px 16px rgba(0,0,0,0.95)"
                      : "none",
                }}
              >
                {word}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
