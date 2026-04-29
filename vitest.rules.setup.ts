import fs from "node:fs";
import path from "node:path";

// The teardown hook fires after all tests complete, but before Vitest exits.
// This guarantees the Firebase Emulator is still running when we fetch the report.
export async function teardown() {
  console.log("\n📊 Fetching Firebase Security Rules coverage report...");
  try {
    // The emulator host/port is automatically injected by `firebase emulators:exec`
    const host = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

    // Note: 'iopic-local' must match the projectId used in initializeTestEnvironment
    const response = await fetch(
      `http://${host}/emulator/v1/projects/iopic-local:ruleCoverage.html`,
    );

    if (!response.ok)
      throw new Error(`Emulator responded with status: ${response.status}`);

    const html = await response.text();
    const coverageDir = path.join(process.cwd(), "coverage");

    if (!fs.existsSync(coverageDir))
      fs.mkdirSync(coverageDir, { recursive: true });

    fs.writeFileSync(
      path.join(coverageDir, "firestore-rules-coverage.html"),
      html,
    );
    console.log(
      "✅ Rules coverage report successfully saved to coverage/firestore-rules-coverage.html\n",
    );
  } catch (error) {
    console.error("❌ Failed to fetch rules coverage report:", error);
  }
}
