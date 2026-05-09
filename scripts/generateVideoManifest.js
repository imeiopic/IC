// scripts/generateVideoManifest.js
// Scans public/videos and writes a videoManifest.json for dynamic discovery
const fs = require("fs");
const path = require("path");

const videosDir = path.join(__dirname, "..", "public", "videos");
const manifestPath = path.join(
  __dirname,
  "..",
  "public",
  "videos",
  "videoManifest.json",
);

fs.readdir(videosDir, (err, files) => {
  if (err) throw err;
  const mp4s = files.filter((f) => f.endsWith(".mp4"));
  fs.writeFileSync(manifestPath, JSON.stringify(mp4s, null, 2), "utf-8");
  console.log(`Video manifest generated with ${mp4s.length} videos.`);
});
