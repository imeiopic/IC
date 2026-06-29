// IopicBatchThumbGenerator.js
// Batch-generate thumbnails for all videos in /public/videos using browser hardware

export async function batchGenerateThumbnails(videoFiles, onProgress) {
  const results = [];
  for (let i = 0; i < videoFiles.length; i++) {
    const file = videoFiles[i];
    try {
      const thumb = await getThumbnail(file);
      results.push({ filename: file.name, thumb });
      if (onProgress) onProgress(i + 1, videoFiles.length, file.name);
    } catch (e) {
      results.push({ filename: file.name, thumb: null, error: e });
    }
  }
  return results;
}

// Single thumbnail extraction logic (same as before)
export function getThumbnail(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    video.src = URL.createObjectURL(videoFile);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      video.currentTime = 1;
    };
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbUrl = canvas.toDataURL("image/jpeg", 0.8);
      URL.revokeObjectURL(video.src);
      resolve(thumbUrl);
    };
    video.onerror = (e) =>
      reject("Friction detected: Could not sight video frame.");
  });
}
