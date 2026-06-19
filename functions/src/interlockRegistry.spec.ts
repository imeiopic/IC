import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Mock Firebase Admin
vi.mock('firebase-admin', () => {
  const mockUpdate = vi.fn();
  const mockGet = vi.fn();
  const mockAdd = vi.fn(() => Promise.resolve({ id: 'mock_audit_id' }));
  const mockTransaction = {
    get: mockGet,
    update: mockUpdate
  };

  return {
    initializeApp: vi.fn(),
    firestore: Object.assign(
      vi.fn(() => ({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({})),
          add: mockAdd
        })),
        runTransaction: vi.fn((cb) => cb(mockTransaction))
      })),
      {
        FieldValue: {
          serverTimestamp: vi.fn(() => 'mock_timestamp')
        }
      }
    )
  };
});

// Import the function after mocks are established
import { handleLedgerMutation } from './interlockRegistry';

describe('Interlock Registry: handleLedgerMutation', () => {
  const mockFirestore = admin.firestore();
  const mockTransaction = {
    get: vi.fn(),
    update: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup transaction mock behavior
    (mockFirestore.runTransaction as any).mockImplementation((cb: any) => cb(mockTransaction));
  });

  it('should reject unauthenticated requests with 0 cycles', async () => {
    const data = { targetSuid: 'NODE_01', valueDelta: 10 };
    const context = { auth: null };

    await expect(handleLedgerMutation.run(data, context as any)).rejects.toThrow(
      'REJECT_ACTION (0 Cycles): AUTH_REQUIRED'
    );
  });

  it('should abort transaction if target node is Permanently Locked Tier 1', async () => {
    const data = {
      targetSuid: 'SUID_ROOT_STEWARD_01',
      valueDelta: 5.0,
      rootSignature: 'INVALID_SIG'
    };
    const context = { auth: { uid: 'some_user' } };

    await expect(handleLedgerMutation.run(data, context as any)).rejects.toThrow(
      'TRANSACTION_ABORTED // TARGET_NODE_PERMANENTLY_LOCKED_AT_TIER_1'
    );
  });

  it('should process standard ADD mutation (default) for non-locked nodes', async () => {
    const data = {
      targetSuid: 'STANDARD_USER_NODE',
      valueDelta: 2.5
    };
    const context = { auth: { uid: 'user_123' } };

    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ iowb: { balance: 5.0 } })
    });

    const result = await handleLedgerMutation.run(data, context as any);

    expect(result.authorized).toBe(true);
    expect(result.resultingBalance).toBe(7.5);
  });

  it('should process SET operation on standard node', async () => {
    const data = {
      targetSuid: 'STANDARD_USER_NODE',
      valueDelta: 100.0,
      operation: 'SET'
    };
    const context = { auth: { uid: 'user_123' } };

    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ iowb: { balance: 50.0 } })
    });

    const result = await handleLedgerMutation.run(data, context as any);

    expect(result.authorized).toBe(true);
    expect(result.resultingBalance).toBe(100.0);
    expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
      'iowb.balance': 100.0
    });
  });

  it('should process SET operation on locked node with valid Root Signature Override', async () => {
    const data = {
      targetSuid: 'SUID_ROOT_STEWARD_01',
      valueDelta: 15.0,
      operation: 'SET',
      rootSignature: 'SIGNATURE_NOLAND_S_NEWTON_ROOT_OVERRIDE'
    };
    const context = { auth: { uid: 'admin_user' } };

    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ iowb: { balance: 10.0 } })
    });

    const result = await handleLedgerMutation.run(data, context as any);

    expect(result.authorized).toBe(true);
    expect(result.statusCode).toBe('ROOT_OVERRIDE_SUCCESSFUL');
    expect(result.resultingBalance).toBe(15.0);
  });
});
