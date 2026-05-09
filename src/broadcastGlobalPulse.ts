import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function broadcastGlobalPulse({ title, body, author }) {
  await addDoc(collection(db, "globalPulse"), {
    title,
    body,
    author,
    createdAt: Timestamp.now(),
  });
}
