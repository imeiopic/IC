// scripts/generateThumbnails.js
// Extracts a thumbnail from each .mp4 in public/videos and saves as .jpg in public/videos/thumbs
// Requires: npm install fluent-ffmpeg

const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const videosDir = path.join(__dirname, "..", "public", "videos");
const thumbsDir = path.join(videosDir, "thumbs");

if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir);
}

fs.readdir(videosDir, (err, files) => {
  if (err) throw err;
  const mp4s = files.filter((f) => f.endsWith(".mp4"));
  let processed = 0;
  mp4s.forEach((filename) => {
    const videoPath = path.join(videosDir, filename);
    const thumbPath = path.join(thumbsDir, filename.replace(/\.mp4$/, ".jpg"));
    ffmpeg(videoPath)
      .on("end", () => {
        processed++;
        console.log(`Generated thumbnail for ${filename}`);
        if (processed === mp4s.length) {
          console.log("All thumbnails generated.");
        }
      })
      .on("error", (err) => {
        processed++;
        console.error(
          `Error generating thumbnail for ${filename}:`,
          err.message,
        );
      })
      .screenshots({
        count: 1,
        timemarks: ["1"], // 1 second into the video
        filename: path.basename(thumbPath),
        folder: thumbsDir,
      });
  });
});
