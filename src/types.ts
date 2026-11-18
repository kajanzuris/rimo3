export interface SubSegment {
  id: number;
  startFrame: number;
  endFrame: number;
  startSec: number;
  endSec: number;
  text: string;
  words: string[];
  /** Keyword to highlight (optional) */
  keyword?: string;
}

export interface VideoConfig {
  fps: number;
  width: number;
  height: number;
  durationSec: number;
  durationFrames: number;
  bgmVolume: number;
  voVolume: number;
}

export interface MainProps {
  video: string;
  audio: string;
  audioMode: "video" | "mp3" | "both" | "mute";
  durationSec: number;
  seed: number;
  /** Raw SRT file content */
  srtContent: string;
  /** Whether to show CTA button at the end of the video */
  showCta?: boolean;
  /** Custom CTA button text */
  ctaText?: string;
}

