export interface CommerceLogic {
  seller_id: string;
  buyer_id: string;
  rational_reason: string;
  status: string;
  earth_location: string;
  manifestation_result: string;
}

export const commerceLogic: CommerceLogic = {
  seller_id: "Member_A_0110", // The Male Instance
  buyer_id: "Member_B_0110",  // The Female Instance
  rational_reason: "Value Exchange",
  status: "0011_CONNECTED",
  earth_location: "1101_LAT_LONG",
  manifestation_result: "!" // Finalized Information
};

import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Standardized to firebase.ts

export const saveCommerceLogic = async (transactionId: string, logic: CommerceLogic) => {
  const ref = doc(db, "1001_commerce", transactionId);
  await setDoc(ref, logic);
  console.log("Commerce logic saved to Firestore.");
};
