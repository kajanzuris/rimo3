import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Headless shell mode — lebih stabil di CI/GitHub Actions
Config.setChromiumHeadlessMode("shell");
