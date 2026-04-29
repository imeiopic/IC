import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export interface NewOrder {
  origin_thread: string;
  creator_id: string;
  rational_choice: string;
  target_id: string;
  order_status: string;
  timestamp: any; // Firestore serverTimestamp
}

export const newOrder: NewOrder = {
  origin_thread: "1000",
  creator_id: "Member_A_0110",
  rational_choice: "1001_COMMERCE", // The choice made in the menu
  target_id: "Member_B_0110", // The "Pair" in the VR^2 equation
  order_status: "PENDING_LOGIC",
  timestamp: serverTimestamp()
};

export const saveNewOrder = async (orderId: string, order: NewOrder) => {
  const ref = doc(db, "1000_ordertaker", orderId);
  await setDoc(ref, order);
  console.log("New order saved to Firestore.");
};
