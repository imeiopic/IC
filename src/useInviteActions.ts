import { reactive } from "vue";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase-config";

export interface InviteActionOptions {
  onNotify?: (message: string) => void;
  onOnuHandshake?: () => void;
}

/**
 * useInviteActions: Composable for managing protocol handshakes (Accept, Deny, ONU)
 * and entity de-synchronization.
 */
export function useInviteActions(options: InviteActionOptions = {}) {
  // Track items being deleted for local loading states
  const deleting = reactive<Record<string, boolean>>({});
  // Track items undergoing the 'ONU' 3D flip animation
  const flipping = reactive<Record<string, boolean>>({});

  const handleProposal = async (
    id: string,
    action: "accept" | "deny" | "onu",
  ) => {
    const inviteeRef = doc(db, "invitees", id);
    try {
      if (action === "deny") {
        await deleteDoc(inviteeRef);
        options.onNotify?.("Connection terminated.");
      } else if (action === "accept") {
        await updateDoc(inviteeRef, { status: "Active" });
        options.onNotify?.("Connection established (Proposal Accepted).");
      } else if (action === "onu") {
        flipping[id] = true;
        options.onOnuHandshake?.();

        // ONU: Maintain 01-10 relationship (standard 01 terms)
        await updateDoc(inviteeRef, { status: "Active", inviteePays: false });
        options.onNotify?.(
          "Connection established (Standard relationship maintained).",
        );

        // Remove animation class after completion (match CSS duration)
        setTimeout(() => {
          flipping[id] = false;
        }, 600);
      }
    } catch (error) {
      console.error("Iopic Protocol Error: Handshake failed.", error);
    }
  };

  const deleteInvitee = async (id: string) => {
    if (
      !confirm("Are you sure you want to remove this entity from the protocol?")
    )
      return;
    deleting[id] = true;
    try {
      await deleteDoc(doc(db, "invitees", id));
    } catch (error) {
      console.error("Iopic Protocol Error: Failed to remove invitee.", error);
      deleting[id] = false;
    }
  };

  return {
    deleting,
    flipping,
    handleProposal,
    deleteInvitee,
  };
}
