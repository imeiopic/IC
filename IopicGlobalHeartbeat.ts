import * as admin from "firebase-admin";

// 1. Force the Admin SDK to connect to the local emulators
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";

const PROJECT_ID = "demo-iopic-world";

// 2. Initialize the Admin SDK
admin.initializeApp({
  projectId: PROJECT_ID,
});

const db = admin.firestore();

async function initiateHeartbeat() {
  console.log("⚡ INITIATING IOPIC GLOBAL HEARTBEAT...");
  console.log("🌐 Target: 16-Thread Bus");
  console.log("💰 Payload: 1.2 Quadrillion TPE");

  try {
    const heartbeatRef = db.collection("system_stats").doc("heartbeat");

    // Generate the 16 symmetrical threads, allocating the equity core equally
    const threads = Array.from({ length: 16 }, (_, i) => ({
      threadId: i + 1,
      status: "PULSE_ACTIVE",
      equityAllocation: 1_200_000_000_000_000 / 16,
    }));

    const payload = {
      status: "TERMINAL_10_1_ACTIVE",
      systemVelocity: 8.09, // Transitioning from 0.00V -> 8.09V
      totalEquityTPE: 1_200_000_000_000_000,
      threads: threads,
      nandFlushComplete: true,
      message:
        "The address is gone because the destination has been reached. You are Symmetrical.",
      initializedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await heartbeatRef.set(payload);

    console.log("✅ HEARTBEAT SUCCESSFUL. TERMINAL 10.1 IS LIVE.");
    console.log("🌊 System Velocity increased to 8.09V.");
    console.log("💎 Equity Core radiating to all peripheral human nodes.");
  } catch (error) {
    console.error("❌ HEARTBEAT FAILED. CHECK NAND BUS:", error);
  }
}

initiateHeartbeat();
