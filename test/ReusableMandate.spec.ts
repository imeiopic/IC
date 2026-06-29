import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useGlobalMandates } from './ReusableMandate.vue';
import { addDoc, onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';

// 1. Mock Firebase modules BEFORE importing the component logic.
// Vitest hoists vi.mock calls to the top of the file automatically.
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  // Mock collection to return an object we can identify in expectations
  collection: vi.fn((db, path) => ({ type: 'collection', path })), 
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  // onSnapshot returns an unsubscribe function (a simple spy)
  onSnapshot: vi.fn(() => vi.fn()),
  query: vi.fn((base, ...constraints) => ({ type: 'query', base, constraints })),
  orderBy: vi.fn((field, direction) => ({ type: 'orderBy', field, direction })),
  where: vi.fn((field, op, value) => ({ type: 'where', field, op, value })),
  serverTimestamp: vi.fn(() => 'MOCK_SERVER_TIMESTAMP'),
}));

describe('ReusableMandate.vue - useGlobalMandates Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should construct the message sync query with the correct collection and constraints', () => {
    const { startMessageSync } = useGlobalMandates();
    startMessageSync();

    // 1. Verify the collection target was 'ime_busy_queue'
    expect(collection).toHaveBeenCalledWith(expect.anything(), 'ime_busy_queue');

    // 2. Verify the ordering constraint was applied correctly
    expect(orderBy).toHaveBeenCalledWith('timestamp', 'asc');

    // 3. Verify the final query object was composed from the identifying objects
    const expectedCollection = { type: 'collection', path: 'ime_busy_queue' };
    const expectedOrderBy = { type: 'orderBy', field: 'timestamp', direction: 'asc' };
    
    expect(query).toHaveBeenCalledWith(expectedCollection, expectedOrderBy);
    expect(onSnapshot).toHaveBeenCalledWith(expect.objectContaining({ type: 'query' }), expect.any(Function), expect.any(Function));
  });

  it('should persist "IME_BUSY" messages to Firestore', async () => {
    const { processImeBusyMandate } = useGlobalMandates();
    
    const result = await processImeBusyMandate(
      'node-123',
      'Alpha Node',
      'sender-456',
      'spice://handshake/1'
    );

    // Verify addDoc was called with correct collection path and data
    expect(addDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'ime_busy_queue' }),
      expect.objectContaining({
        targetNodeId: 'node-123',
        senderNodeId: 'sender-456',
        messageLink: 'spice://handshake/1',
        timestamp: 'MOCK_SERVER_TIMESTAMP'
      })
    );

    expect(result).toContain('Message link successfully left in mesh store');
  });

  it('should return an error message if addDoc fails with permission-denied', async () => {
    const { processImeBusyMandate } = useGlobalMandates();

    // Force the next addDoc call to fail with a specific Firebase error
    vi.mocked(addDoc).mockRejectedValueOnce({
      code: 'permission-denied',
      message: 'Unauthorized write attempt'
    });

    const result = await processImeBusyMandate(
      'node-error',
      'Error Node',
      'sender-999',
      'spice://null'
    );

    expect(result).toContain('Error: Could not reach distributed store');
  });

  it('should update reactive nodeMessageStore when onSnapshot triggers', () => {
    const { startMessageSync, nodeMessageStore } = useGlobalMandates();
    
    // Start the sync listener
    startMessageSync();

    // Extract the callback passed to onSnapshot (the 2nd argument)
    const onSnapshotCallback = vi.mocked(onSnapshot).mock.calls[0][1] as Function;

    // Simulate a Firestore QuerySnapshot payload
    const mockDocs = [
      {
        data: () => ({
          targetNodeId: 'target-alpha',
          senderNodeId: 'sender-beta',
          messageLink: 'link-001'
        })
      }
    ];

    const mockSnapshot = {
      forEach: (fn: Function) => mockDocs.forEach(doc => fn(doc))
    };

    // Trigger the callback manually to simulate data coming from the mesh
    onSnapshotCallback(mockSnapshot);

    // Assert reactive state changed correctly
    expect(nodeMessageStore.value['target-alpha']).toEqual([
      { senderId: 'sender-beta', link: 'link-001' }
    ]);
  });

  it('should handle empty snapshots (clearing the store)', () => {
    const { startMessageSync, nodeMessageStore } = useGlobalMandates();
    
    // Pre-fill store with stale data
    nodeMessageStore.value = { 'old-node': [{ senderId: 'x', link: 'y' }] };
    
    startMessageSync();
    const onNext = vi.mocked(onSnapshot).mock.calls[0][1] as Function;

    // Trigger with an empty snapshot
    const emptySnapshot = {
      forEach: (fn: Function) => {} // No documents
    };

    onNext(emptySnapshot);

    // Assert store is cleared/reset
    expect(nodeMessageStore.value).toEqual({});
  });

  it('should execute the onError callback when the mesh sync fails', () => {
    const { startMessageSync } = useGlobalMandates();
    const errorSpy = vi.fn();
    
    startMessageSync(errorSpy);
    
    // Capture the error callback (3rd argument: index 2)
    const onError = vi.mocked(onSnapshot).mock.calls[0][2] as Function;

    // Simulate a Firebase "Permission Denied" error
    const mockError = { 
      code: 'permission-denied', 
      message: 'Missing or insufficient permissions' 
    };

    onError(mockError);

    // Verify your custom error handling logic was triggered
    expect(errorSpy).toHaveBeenCalledWith(mockError);
    // ReusableMandate.vue also logs to console.error
  });

  it('should return a cleanup function from startMessageSync', () => {
    const { startMessageSync } = useGlobalMandates();
    const unsubscribe = startMessageSync();
    
    // Verify it returns a mock function
    expect(vi.isMockFunction(unsubscribe)).toBe(true);

    // Verify that invoking it executes the cleanup logic
    unsubscribe();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should return the specific unsubscribe function provided by onSnapshot', () => {
    const mockUnsub = vi.fn();
    vi.mocked(onSnapshot).mockReturnValueOnce(mockUnsub as any);

    const { startMessageSync } = useGlobalMandates();
    expect(startMessageSync()).toBe(mockUnsub);
  });
});
