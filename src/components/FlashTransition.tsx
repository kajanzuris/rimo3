import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { SubSegment } from "../types";

interface Props {
  segments: SubSegment[];
}

export const FlashTransition: React.FC<Props> = ({ segments }) => {
  const frame = useCurrentFrame();

  // Cari apakah frame saat ini berada tepat di awal segmen baru (selain frame 0)
  const flashSeg = segments.find(
    (s) => s.startFrame > 5 && frame >= s.startFrame && frame < s.startFrame + 5
  );

  if (!flashSeg) return null;

  const local = frame - flashSeg.startFrame;
  const opacity = interpolate(local, [0, 4], [0.35, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#FFFFFF",
        opacity,
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
};
