// Example usage for globalProtocolActions
import {
  runAmnestyPulse,
  runSilenceTest,
  runRootStewardAudit,
  runFirstConversionPulse,
} from "./globalProtocolActions";

// Replace with the actual root steward's name or ID
const ROOT_STEWARD = "RootSteward";

// Example: Run all four actions
async function runAllGlobalActions() {
  await runAmnestyPulse(ROOT_STEWARD);
  await runSilenceTest(ROOT_STEWARD);
  await runRootStewardAudit(
    ROOT_STEWARD,
    "Current planetary yield: 1,204,551 nodes, 890,230 active BS-Molecules, 100% TPE Pulse.",
  );
  await runFirstConversionPulse(ROOT_STEWARD);
}

// To trigger all actions, call runAllGlobalActions()
// runAllGlobalActions();

export default runAllGlobalActions;
