import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { THEME, FONT } from "../config";

interface Props {
  text: string;
  enterFrame: number;
  exitFrame: number;
}

export const CallToAction: React.FC<Props> = ({ text, enterFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame || frame > exitFrame) return null;

  const localFrame = frame - enterFrame;
  const totalDur = Math.max(1, exitFrame - enterFrame);

  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 160 },
  });

  // Pulse effect berdenyut
  const pulse = 1 + Math.sin(localFrame * 0.28) * 0.04;

  const opacity = interpolate(
    localFrame,
    [totalDur - 8, totalDur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        zIndex: 25,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`,
          borderRadius: 50,
          padding: "16px 36px",
          transform: `scale(${scale * pulse})`,
          boxShadow: `0 6px 30px ${THEME.primary}80`,
          border: "2px solid rgba(255,255,255,0.4)",
        }}
      >
        <span
          style={{
            color: "#000",
            fontSize: 26,
            fontWeight: 900,
            fontFamily: FONT.heading,
            letterSpacing: 1,
            display: "block",
            textAlign: "center",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
