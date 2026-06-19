import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export async function broadcastGlobalPulse({
  title,
  body,
  author,
}: {
  title: string;
  body: string;
  author: string;
}) {
  await addDoc(collection(db, "globalPulse"), {
    title,
    body,
    author,
    createdAt: Timestamp.now(),
  });
}
