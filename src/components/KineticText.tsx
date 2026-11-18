import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { THEME, KEYWORDS, FONT } from "../config";

interface Props {
  text: string;
  enterFrame: number;
  exitFrame: number;
  fontSize?: number;
  style?: "bounce" | "typewriter" | "wave" | "scale";
}

export const KineticText: React.FC<Props> = ({
  text,
  enterFrame,
  exitFrame,
  fontSize = 42,
  style = "bounce",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame || frame > exitFrame) return null;

  const localFrame = frame - enterFrame;
  const words = text.split(/\s+/);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {words.map((word, i) => {
        const delay = i * 3; // 3-frame stagger
        const wordFrame = Math.max(0, localFrame - delay);

        let transform = "";
        let wordOpacity = 1;

        if (style === "bounce") {
          const s = spring({ frame: wordFrame, fps, config: { damping: 10, stiffness: 150 } });
          const y = interpolate(s, [0, 1], [30, 0]);
          wordOpacity = s;
          transform = `translateY(${y}px)`;
        } else if (style === "scale") {
          const s = spring({ frame: wordFrame, fps, config: { damping: 12 } });
          wordOpacity = s;
          transform = `scale(${s})`;
        } else if (style === "wave") {
          const s = spring({ frame: wordFrame, fps, config: { damping: 8, stiffness: 100 } });
          const y = Math.sin(wordFrame * 0.3) * 5 * (1 - Math.min(1, wordFrame / 20));
          wordOpacity = s;
          transform = `translateY(${y}px)`;
        } else {
          // typewriter
          wordOpacity = wordFrame > 0 ? 1 : 0;
        }

        // Fade out at exit
        const exitLocal = exitFrame - enterFrame;
        const fadeOut = interpolate(
          localFrame,
          [exitLocal - 10, exitLocal],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const isKeyword = Object.keys(KEYWORDS).includes(word.toLowerCase());
        const color = isKeyword ? KEYWORDS[word.toLowerCase()] : THEME.text;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              fontWeight: isKeyword ? 900 : 700,
              fontFamily: FONT.heading,
              color,
              textShadow: THEME.textShadow,
              opacity: wordOpacity * fadeOut,
              transform,
              ...(isKeyword && {
                filter: `drop-shadow(0 0 8px ${color}80)`,
              }),
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
