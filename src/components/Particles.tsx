import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../config";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  opacity: number;
}

// Deterministic particles (no Math.random — safe for Remotion)
function makeParticles(count: number, seed: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const s1 = Math.abs(Math.sin((i + seed) * 9301 + 49297) % 1);
    const s2 = Math.abs(Math.sin((i + seed * 3) * 1234 + 56789) % 1);
    particles.push({
      x: s1 * 100,
      y: s2 * 100,
      size: 2 + (s1 * 7) % 4,
      speed: 0.3 + (s2 * 5) % 1,
      delay: (i * 7) % 60,
      opacity: 0.3 + (s1 * 3) % 0.5,
    });
  }
  return particles;
}

interface Props {
  seed?: number;
}

export const Particles: React.FC<Props> = ({ seed = 1 }) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () => makeParticles(16 + (seed % 3) * 4, seed), // 16, 20, atau 24 partikel
    [seed]
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p, i) => {
        const f = Math.max(0, frame - p.delay);
        const y = p.y - f * p.speed * 0.5;
        const drift = Math.sin(f * 0.08 + i) * 15;
        const wrappedY = ((y % 110) + 110) % 110;
        const opacity = interpolate(
          wrappedY,
          [-10, 10, 90, 100],
          [0, p.opacity, p.opacity, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x + drift * 0.3}%`,
              top: `${wrappedY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: THEME.particle,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${THEME.particle}60`,
            }}
          />
        );
      })}
    </div>
  );
};