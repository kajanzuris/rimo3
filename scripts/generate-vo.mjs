#!/usr/bin/env node
/**
 * Generate Indonesian voiceover from SRT file using edge-tts.
 *
 * Usage: node scripts/generate-vo.mjs [--srt public/subs.srt] [--out public/audio.mp3]
 *
 * Concatenates all SRT segments into one MP3 with proper timing gaps.
 */
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Parse args
const args = process.argv.slice(2);
const srtPath = args.includes("--srt")
  ? args[args.indexOf("--srt") + 1]
  : path.join(ROOT, "public", "subs.srt");
const outPath = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : path.join(ROOT, "public", "audio.mp3");

function timeToSec(t) {
  const [h, m, rest] = t.split(":");
  const [s, ms] = rest.split(",");
  return +h * 3600 + +m * 60 + +s + +ms / 1000;
}

function parseSrt(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      const [startStr, endStr] = lines[1].split(" --> ");
      return {
        text: lines.slice(2).join(" "),
        startSec: timeToSec(startStr),
        endSec: timeToSec(endStr),
      };
    });
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}

async function main() {
  const segments = parseSrt(srtPath);
  const tmpDir = path.join(ROOT, ".tmp-vo");
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`📝 Found ${segments.length} SRT segments`);
  console.log(`🎙️  Voice: id-ID-GadisNeural (Indonesian female)\n`);

  // Generate each segment
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const outFile = path.join(tmpDir, `seg_${i}.mp3`);
    console.log(`  [${i + 1}/${segments.length}] "${seg.text}"`);

    const escapedText = seg.text.replace(/"/g, '\\"');
    await run(
      `npx edge-tts --voice "id-ID-GadisNeural" --text "${escapedText}" --write-media "${outFile}"`
    );

    const targetDur = seg.endSec - seg.startSec;
    console.log(`         Target: ${targetDur.toFixed(2)}s`);
  }

  // Build concat list with silence gaps
  const listFile = path.join(tmpDir, "concat.txt");
  let listContent = "";

  // Leading silence if first segment starts after 0
  if (segments[0].startSec > 0.1) {
    const leadSilence = path.join(tmpDir, "silence_lead.mp3");
    await run(
      `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${segments[0].startSec.toFixed(3)} "${leadSilence}"`
    );
    listContent += `file '${leadSilence.replace(/\\/g, "/")}'\n`;
  }

  for (let i = 0; i < segments.length; i++) {
    // Add silence gap between segments
    if (i > 0) {
      const gap = segments[i].startSec - segments[i - 1].endSec;
      if (gap > 0.1) {
        const silenceFile = path.join(tmpDir, `silence_${i}.mp3`);
        await run(
          `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${gap.toFixed(3)} "${silenceFile}"`
        );
        listContent += `file '${silenceFile.replace(/\\/g, "/")}'\n`;
      }
    }
    listContent += `file '${path.join(tmpDir, `seg_${i}.mp3`).replace(/\\/g, "/")}'\n`;
  }

  fs.writeFileSync(listFile, listContent);

  // Concatenate all into final audio
  await run(
    `ffmpeg -y -f concat -safe 0 -i "${listFile}" -acodec libmp3lame -q:a 2 "${outPath}"`
  );

  console.log(`\n✅ Voiceover saved to: ${outPath}`);

  // Cleanup tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
