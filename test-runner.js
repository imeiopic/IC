const { spawnSync } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const coverageDir = path.join(__dirname, "../coverage");
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir);
}

const download = (url, dest) => {
  return new Promise((resolve) => {
    http
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          console.warn(
            `⚠️ Could not download coverage from ${url} (Status: ${response.statusCode})`,
          );
          return resolve(); // Resolve anyway so we don't break the build
        }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`✅ Saved coverage report to ${dest}`);
          resolve();
        });
      })
      .on("error", (err) => {
        console.warn(`⚠️ Error downloading from ${url}:`, err.message);
        resolve();
      });
  });
};

async function run() {
  console.log("🚀 Running Mocha tests...");
  // 1. Run the tests and capture the exit code
  const result = spawnSync("npx", ["mocha", "test/*.spec.js"], {
    stdio: "inherit",
    shell: true,
  });

  // 2. Fetch the coverage reports using the specific Project IDs from your test files
  console.log("\n📊 Fetching Firebase Emulator coverage reports...");
  await Promise.all([
    download(
      "http://127.0.0.1:8080/emulator/v1/projects/calcium-channel-489906-m2:ruleCoverage.html",
      path.join(coverageDir, "firestore-coverage.html"),
    ),
    download(
      "http://127.0.0.1:9199/emulator/v1/projects/demo-storage-rules-test:ruleCoverage.html",
      path.join(coverageDir, "storage-coverage.html"),
    ),
  ]);

  // 3. Exit with the original Mocha status code so GitHub Actions knows if the tests passed or failed
  process.exit(result.status || 0);
}

run();
