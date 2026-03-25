import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkFunVwuTEEgmt4hn2LTi0yWEUXHr91OQ",
  authDomain: "calcium-channel-489906-m2.firebaseapp.com",
  projectId: "calcium-channel-489906-m2",
  storageBucket: "calcium-channel-489906-m2.firebasestorage.app",
  messagingSenderId: "859589499177",
  appId: "1:859589499177:web:622e39eedf04ae71c1ff38",
  measurementId: "G-HKFP3D219Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
