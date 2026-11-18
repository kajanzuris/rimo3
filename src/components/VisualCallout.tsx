import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { SubSegment } from "../types";

interface Props {
  segments: SubSegment[];
}

const cleanWord = (w: string) => w.replace(/[^\w]/g, "").toLowerCase();

export const VisualCallout: React.FC<Props> = ({ segments }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cari segmen yang sedang aktif di frame saat ini
  const active = segments.find(
    (s) => frame >= s.startFrame && frame <= s.endFrame
  );
  if (!active) return null;

  const localFrame = frame - active.startFrame;
  const totalDur = Math.max(1, active.endFrame - active.startFrame);

  // Periksa kata-kata yang diucapkan di segmen ini
  const words = active.words.map(cleanWord);
  const textJoined = words.join(" ");

  // Kategori Objek Visual
  const isWater = ["netes", "air", "kuah", "basah", "tetes", "cair", "bocor"].some((w) =>
    textJoined.includes(w)
  );
  const isArrow = ["pasang", "sudut", "rak", "wastafel", "sini", "lipat", "alat", "taruh", "simpan"].some((w) =>
    textJoined.includes(w)
  );
  const isWarning = ["mampet", "bau", "kotor", "rusak", "sempit", "numpuk", "ribet", "masalah"].some((w) =>
    textJoined.includes(w)
  );
  const isCheck = ["bersih", "rapi", "hemat", "praktis", "mudah", "lolos", "estetik", "aman"].some((w) =>
    textJoined.includes(w)
  );

  // Jika tidak ada kata visual yang cocok, return null
  if (!isWater && !isArrow && !isWarning && !isCheck) return null;

  // Animasi Pop-in (Spring bouncy)
  const scaleIn = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 200 },
  });

  // Animasi Fade-out
  const opacity = interpolate(
    localFrame,
    [totalDur - 6, totalDur],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Efek denyut / gerakan mengambang
  const pulse = 1 + Math.sin(localFrame * 0.3) * 0.05;
  const floatY = Math.sin(localFrame * 0.25) * 6;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 18,
        opacity,
      }}
    >
      {/* 1. OBJEK AIR / TETESAN (💧) */}
      {isWater && (
        <div
          style={{
            position: "absolute",
            top: 480,
            right: 70,
            transform: `scale(${scaleIn * pulse}) translateY(${floatY}px)`,
            filter: "drop-shadow(0 8px 24px rgba(0, 195, 255, 0.75))",
          }}
        >
          <svg width="120" height="140" viewBox="0 0 100 120" fill="none">
            {/* Tetesan Air 3D */}
            <path
              d="M50 5 C50 5 15 55 15 80 A35 35 0 0 0 85 80 C85 55 50 5 50 5 Z"
              fill="url(#waterGrad)"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            {/* Kilauan Cahaya (Highlight) */}
            <ellipse cx="38" cy="70" rx="10" ry="18" transform="rotate(-20 38 70)" fill="rgba(255,255,255,0.7)" />
            {/* Riak Air Bawah */}
            <ellipse cx="50" cy="110" rx="35" ry="8" fill="none" stroke="#00E5FF" strokeWidth="3" opacity={pulse - 0.2} />
            <defs>
              <linearGradient id="waterGrad" x1="20" y1="20" x2="80" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6EE7FF" />
                <stop offset="0.6" stopColor="#00B4D8" />
                <stop offset="1" stopColor="#0077B6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 2. PANAH PENUNJUK MELENGKUNG NEON (⤵️) */}
      {isArrow && !isWater && (
        <div
          style={{
            position: "absolute",
            top: 500,
            right: 80,
            transform: `scale(${scaleIn * pulse}) translate(${floatY}px, ${-floatY}px)`,
            filter: "drop-shadow(0 6px 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 4px #000)",
          }}
        >
          <svg width="140" height="140" viewBox="0 0 120 120" fill="none">
            {/* Badan Panah Melengkung */}
            <path
              d="M20 25 C65 20, 95 45, 85 90"
              stroke="#FFD700"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Kepala Panah */}
            <polygon points="65,95 88,110 105,82" fill="#FFD700" stroke="#000" strokeWidth="2" />
            {/* Outline Hitam Dalam */}
            <path
              d="M20 25 C65 20, 95 45, 85 90"
              stroke="#000000"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* 3. IKON BAHAYA / PERINGATAN (⚠️) */}
      {isWarning && !isWater && !isArrow && (
        <div
          style={{
            position: "absolute",
            top: 480,
            right: 70,
            transform: `scale(${scaleIn * pulse})`,
            filter: "drop-shadow(0 8px 24px rgba(255, 42, 77, 0.8))",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            {/* Segitiga Bahaya */}
            <polygon points="50,10 92,85 8,85" fill="#FF2A4D" stroke="#000" strokeWidth="4" />
            <polygon points="50,18 84,80 16,80" fill="#FFD700" />
            {/* Tanda Seru */}
            <rect x="46" y="34" width="8" height="26" rx="4" fill="#000" />
            <circle cx="50" cy="70" r="5" fill="#000" />
          </svg>
        </div>
      )}

      {/* 4. CENTANG HIJAU BERSIH (✅) */}
      {isCheck && !isWater && !isArrow && !isWarning && (
        <div
          style={{
            position: "absolute",
            top: 480,
            right: 70,
            transform: `scale(${scaleIn * pulse})`,
            filter: "drop-shadow(0 8px 24px rgba(0, 255, 136, 0.8))",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" fill="#00FF88" stroke="#000" strokeWidth="4" />
            <path
              d="M28 52 L44 68 L74 34"
              stroke="#000000"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
