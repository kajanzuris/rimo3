import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { THEME } from "../config";

interface Props {
  enterFrame: number;
  exitFrame: number;
  children: React.ReactNode;
  position?: "top" | "center" | "bottom";
  width?: string;
}

export const GlassPanel: React.FC<Props> = ({
  enterFrame,
  exitFrame,
  children,
  position = "center",
  width = "88%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame || frame > exitFrame) return null;

  const localFrame = frame - enterFrame;
  const exitLocalFrame = exitFrame - enterFrame;

  // Spring in
  const scaleIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Fade out
  const opacity = interpolate(
    localFrame,
    [exitLocalFrame - 8, exitLocalFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Slide direction
  const slideY = interpolate(scaleIn, [0, 1], [40, 0]);

  const posStyle: React.CSSProperties =
    position === "top"
      ? { top: 180 }
      : position === "bottom"
      ? { bottom: 200 }
      : { top: "50%", marginTop: -80 };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: `translateX(-50%) translateY(${slideY}px)`,
        width,
        opacity,
        ...posStyle,
      }}
    >
      <div
        style={{
          background: THEME.glass,
          backdropFilter: `blur(${THEME.glassBlur}px)`,
          WebkitBackdropFilter: `blur(${THEME.glassBlur}px)`,
          border: `1px solid ${THEME.glassBorder}`,
          borderRadius: 20,
          padding: "24px 28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {children}
      </div>
    </div>
  );
};
