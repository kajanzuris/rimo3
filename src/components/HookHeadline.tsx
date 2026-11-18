import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { SubSegment } from "../types";
import { THEME, KEYWORDS, FONT } from "../config";
import { extractCoreWords, getActiveWordIndex } from "../utils/smart-caption";

interface Props {
  segment?: SubSegment;
}

const cleanWord = (w: string) => w.replace(/[^\w]/g, "").toLowerCase();

export const HookHeadline: React.FC<Props> = ({ segment }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!segment) return null;
  if (frame < segment.startFrame || frame > segment.endFrame) return null;

  const localFrame = frame - segment.startFrame;
  const totalDur = Math.max(1, segment.endFrame - segment.startFrame);

  // Animasi keluar di akhir hook
  const exitOpacity = interpolate(
    localFrame,
    [totalDur - 6, totalDur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = interpolate(
    localFrame,
    [totalDur - 6, totalDur],
    [1, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Ambil KATA INTI (bukan semua kata filler yang bikin layar penuh)
  const coreWords = extractCoreWords(segment.text);
  
  // Sinkronisasi kata aktif menggunakan bobot panjang kata (speech-weighted timing)
  const activeWordIdx = getActiveWordIndex(segment.words, localFrame, totalDur);

  return (
    <div
      style={{
        position: "absolute",
        top: "24%",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        zIndex: 20,
        pointerEvents: "none",
        padding: "0 24px",
      }}
    >
      {coreWords.map((word, i) => {
        // Kata inti muncul bertahap seiring berjalannya kalimat
        const delayFraction = (i / Math.max(1, coreWords.length)) * totalDur * 0.7;
        const isShown = localFrame >= delayFraction;
        if (!isShown) return null;

        const popSpring = spring({
          frame: Math.max(0, localFrame - delayFraction),
          fps,
          config: { damping: 9, stiffness: 220 },
        });

        const cleaned = cleanWord(word);
        const isKeyword = Object.keys(KEYWORDS).includes(cleaned);

        // Desain balok stiker kontras tinggi persis video referensi
        let bg = THEME.whiteSticker;
        let textColor = "#000000";
        let rotation = 0;
        let padding = "6px 22px";

        if (i === 0) {
          // Baris 1: Teks putih raksasa dengan bayangan tebal
          bg = "transparent";
          textColor = "#FFFFFF";
          rotation = 0;
          padding = "0 10px";
        } else if (isKeyword || i % 2 === 1) {
          // Baris 2 / Kata Masalah: Balok Merah Neon miring
          bg = THEME.redSticker;
          textColor = "#FFFFFF";
          rotation = -2.5;
        } else {
          // Baris 3: Balok Kuning tebal
          bg = THEME.yellowSticker;
          textColor = "#000000";
          rotation = 2;
        }

        return (
          <div
            key={i}
            style={{
              display: "inline-block",
              background: bg,
              borderRadius: bg !== "transparent" ? 10 : 0,
              padding,
              transform: `scale(${popSpring}) rotate(${rotation}deg)`,
              boxShadow:
                bg !== "transparent"
                  ? "0 8px 26px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4)"
                  : "none",
              border: bg !== "transparent" ? "3px solid #000000" : "none",
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: FONT.heading,
                fontSize: 54,
                fontWeight: 900,
                color: textColor,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                lineHeight: 1.1,
                textAlign: "center",
                textShadow:
                  bg === "transparent"
                    ? "0 4px 14px rgba(0,0,0,0.95), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000"
                    : "none",
              }}
            >
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
};
