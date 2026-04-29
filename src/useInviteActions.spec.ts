import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInviteActions } from './useInviteActions';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock Firestore Substrate
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}));

// Mock Firebase Configuration
vi.mock('../firebase-config', () => ({
  db: {}
}));

describe('useInviteActions', () => {
  const mockId = 'entity-0110-abc';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Stub browser confirm for deletion protocol
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  describe('handleProposal', () => {
    it('should terminate connection when action is "deny"', async () => {
      const onNotify = vi.fn();
      const { handleProposal } = useInviteActions({ onNotify });

      await handleProposal(mockId, 'deny');

      expect(deleteDoc).toHaveBeenCalled();
      expect(onNotify).toHaveBeenCalledWith("Connection terminated.");
    });

    it('should activate connection when action is "accept"', async () => {
      const onNotify = vi.fn();
      const { handleProposal } = useInviteActions({ onNotify });

      await handleProposal(mockId, 'accept');

      expect(updateDoc).toHaveBeenCalledWith(undefined, { status: 'Active' });
      expect(onNotify).toHaveBeenCalledWith("Connection established (Proposal Accepted).");
    });

    it('should handle ONU handshake with 3D flip animation and status reset', async () => {
      const onNotify = vi.fn();
      const onOnuHandshake = vi.fn();
      const { handleProposal, flipping } = useInviteActions({ onNotify, onOnuHandshake });

      const promise = handleProposal(mockId, 'onu');
      
      expect(flipping[mockId]).toBe(true);
      expect(onOnuHandshake).toHaveBeenCalled();

      await promise;

      expect(updateDoc).toHaveBeenCalledWith(undefined, { status: 'Active', inviteePays: false });
      expect(onNotify).toHaveBeenCalledWith("Connection established (Standard relationship maintained).");

      // Advance temporal bus to clear animation state
      vi.advanceTimersByTime(600);
      expect(flipping[mockId]).toBe(false);
    });

    it('should catch and log Firestore errors during handshake', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (updateDoc as any).mockRejectedValue(new Error('Substrate Failure'));

      const { handleProposal } = useInviteActions();
      await handleProposal(mockId, 'accept');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Handshake failed"), expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('deleteInvitee', () => {
    it('should trigger deletion after user confirmation', async () => {
      const { deleteInvitee, deleting } = useInviteActions();

      const promise = deleteInvitee(mockId);
      expect(deleting[mockId]).toBe(true);

      await promise;
      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should abort deletion if user cancels confirmation', async () => {
      vi.stubGlobal('confirm', vi.fn(() => false));
      const { deleteInvitee, deleting } = useInviteActions();

      await deleteInvitee(mockId);

      expect(deleteDoc).not.toHaveBeenCalled();
      expect(deleting[mockId]).toBeUndefined();
    });
  });
});