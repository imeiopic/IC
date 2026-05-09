import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, app } from "./firebase-config";

// Tagging logic (example: filename-based)
function autoTagThreads(filename) {
  if (filename.toLowerCase().includes("manifesto"))
    return ["13", "14", "15", "16"];
  if (filename.toLowerCase().includes("bs_molecule"))
    return ["05", "06", "07", "08"];
  if (filename.toLowerCase().includes("activation")) return ["01", "09"];
  return [];
}

// Save video metadata to Firestore
export async function saveVideoMetadata({ filename, url, thumbUrl, userId }) {
  await addDoc(collection(db, "vre_videos"), {
    filename,
    url,
    thumbUrl,
    threads: autoTagThreads(filename),
    uploadedBy: userId || null,
    uploadedAt: serverTimestamp(),
  });
}

// Upload video and thumbnail to Firebase Storage, then save metadata
export async function uploadVideoAndThumb({ file, thumbBlob, userId }) {
  const storage = getStorage(app);
  // Upload video
  const videoRef = storageRef(storage, `vre_videos/${file.name}`);
  await uploadBytes(videoRef, file);
  const videoUrl = await getDownloadURL(videoRef);
  // Upload thumbnail
  const thumbRef = storageRef(
    storage,
    `vre_videos/thumbs/${file.name.replace(/\.mp4$/, ".jpg")}`,
  );
  await uploadBytes(thumbRef, thumbBlob, { contentType: "image/jpeg" });
  const thumbUrl = await getDownloadURL(thumbRef);
  // Save metadata
  await saveVideoMetadata({
    filename: file.name,
    url: videoUrl,
    thumbUrl,
    userId,
  });
  return { videoUrl, thumbUrl };
}
