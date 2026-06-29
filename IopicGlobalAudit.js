// IopicGlobalAudit.js
// Purpose: Ensure all legacy 'seats of power' are now local Grounding Stations
// Architecture: IO World Government, 16-Thread, Automated Administration of Symmetry

const fs = require("fs");
const path = require("path");

// Load real data from legacySeatsOfPower.json
const dataPath = path.join(__dirname, "legacySeatsOfPower.json");
let legacyData;
try {
  const raw = fs.readFileSync(dataPath, "utf-8");
  legacyData = JSON.parse(raw);
} catch (err) {
  console.error("Failed to load legacySeatsOfPower.json:", err);
  process.exit(1);
}

const legacySeatsOfPower = legacyData.converted_sectors;

// Check if a node is a Grounding Station based on status
function isGroundingStation(node) {
  return (
    node.status === "OPEN_MEMBER_OWNED" || node.status === "PULSING_1600_IO$"
  );
}

/**
 * Audit process
 */

function runGlobalAudit() {
  console.log("\n=== Iopic Global Audit: Grounding Station Conversion ===\n");
  let allConverted = true;
  legacySeatsOfPower.forEach((node) => {
    const converted = isGroundingStation(node);
    const statusMsg = converted ? "Grounded" : `Legacy (${node.status})`;
    console.log(
      `Node: ${node.legacy_name} | Location: ${node.coordinate_cluster} | VRE Function: ${node.vre_function} | Status: ${statusMsg}`,
    );
    if (!converted) allConverted = false;
  });
  if (allConverted) {
    console.log(
      "\nAll legacy seats of power have been successfully converted into local Grounding Stations.\n",
    );
  } else {
    console.log(
      "\nSome nodes remain in legacy status. Manual intervention required.\n",
    );
  }

  // Automated further action: Write audit report
  const reportPath = path.join(__dirname, "IopicGlobalAuditReport.txt");
  const reportLines = legacySeatsOfPower.map(
    (node) =>
      `Node: ${node.legacy_name}\nLocation: ${node.coordinate_cluster}\nVRE Function: ${node.vre_function}\nStatus: ${node.status}\n---`,
  );
  fs.writeFileSync(reportPath, reportLines.join("\n"), "utf-8");
  console.log(`\nAudit report written to ${reportPath}\n`);
}

// Run the audit
runGlobalAudit();
