import { vi } from 'vitest';
import type {
  CollectionReference,
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  FirestoreError,
  SnapshotOptions,
} from 'firebase/firestore';

// --- Mocked Firestore References ---
// These are simple objects that mimic the structure of Firestore references
// and allow chaining of methods like .collection().doc()
export const mockCollectionRef = (id: string): CollectionReference => ({
  id,
  path: `mock-collection/${id}`,
  firestore: {} as any, // Dummy firestore instance
  parent: null,
  type: 'collection',
  withConverter: vi.fn(() => mockCollectionRef(id)),
  // Add other methods if your code uses them, e.g., .add()
} as any);

export const mockDocumentRef = (id: string, collectionId: string): DocumentReference => ({
  id,
  path: `mock-collection/${collectionId}/mock-doc/${id}`,
  firestore: {} as any,
  parent: mockCollectionRef(collectionId),
  type: 'document',
  withConverter: vi.fn(() => mockDocumentRef(id, collectionId)),
  // Add other methods if your code uses them, e.g., .collection()
} as any);

// --- Mocked Firestore Snapshots ---
// Helper to create a mock DocumentSnapshot
export const createMockDocumentSnapshot = <T>(
  id: string,
  data: T | null,
  exists: boolean = true,
): DocumentSnapshot<T> => ({
  id,
  exists: vi.fn(() => exists),
  data: vi.fn(() => data),
  get: vi.fn((field: string) => (data as any)?.[field]),
  ref: mockDocumentRef(id, 'mock-collection'), // Dummy ref
  metadata: {} as any,
} as any);

// Helper to create a mock QuerySnapshot
export const createMockQuerySnapshot = <T>(
  docs: Array<{ id: string; data: T }>,
  empty: boolean = false,
): QuerySnapshot<T> => ({
  docs: docs.map(d => createMockDocumentSnapshot(d.id, d.data)),
  empty: vi.fn(() => empty || docs.length === 0),
  size: docs.length,
  forEach: vi.fn((callback: (doc: DocumentSnapshot<T>) => void) => {
    docs.forEach(d => callback(createMockDocumentSnapshot(d.id, d.data)));
  }),
  metadata: {} as any,
  query: {} as any, // Dummy query
} as any);

// --- Mocked Firestore Functions ---
export const collection = vi.fn((_db: any, path: string) => mockCollectionRef(path));
export const doc = vi.fn((_db: any, collectionPath: string, docId: string) => mockDocumentRef(docId, collectionPath));
export const addDoc = vi.fn(async (_colRef: CollectionReference, _data: any) => ({ id: 'mock-add-doc-id' } as DocumentReference));
export const updateDoc = vi.fn(async (_docRef: DocumentReference, _data: any) => undefined);
export const deleteDoc = vi.fn(async (_docRef: DocumentReference) => undefined);
export const setDoc = vi.fn(async (_docRef: DocumentReference, _data: any, _options?: any) => undefined);

export const getDoc = vi.fn(async (_docRef: DocumentReference) => createMockDocumentSnapshot('mock-doc-id', {}));
export const getDocs = vi.fn(async (_query: Query) => createMockQuerySnapshot([]));

export const query = vi.fn((_colRef: CollectionReference, ..._queryConstraints: any[]) => ({
  type: 'query',
  firestore: {} as any,
  withConverter: vi.fn(() => query(_colRef, ..._queryConstraints)),
} as Query));
export const where = vi.fn((_field: string, _op: any, _value: any) => ({ type: 'where' }));
export const orderBy = vi.fn((_field: string, _direction: any) => ({ type: 'orderBy' }));
export const limit = vi.fn((_limit: number) => ({ type: 'limit' }));
export const serverTimestamp = vi.fn(() => ({ toMillis: () => Date.now() })); // Simplified mock

// --- onSnapshot Mocking ---
// This is the most complex part. We need to capture the callback and allow tests to trigger it.
export let mockOnSnapshotCallback: ((snapshot: QuerySnapshot<any> | DocumentSnapshot<any>) => void) | undefined;
export let mockOnSnapshotErrorCallback: ((error: FirestoreError) => void) | undefined;
export let mockOnSnapshotUnsubscribe: Unsubscribe | undefined;

export const onSnapshot = vi.fn((
  ref: Query | DocumentReference,
  optionsOrObserver: SnapshotOptions | ((snapshot: QuerySnapshot<any> | DocumentSnapshot<any>) => void),
  error?: (error: FirestoreError) => void,
  complete?: () => void,
) => {
  // Determine if options were passed or if it's just the callback
  let callback: (snapshot: QuerySnapshot<any> | DocumentSnapshot<any>) => void;
  if (typeof optionsOrObserver === 'function') {
    callback = optionsOrObserver;
    mockOnSnapshotErrorCallback = error;
  } else {
    callback = (optionsOrObserver as any).next || (() => {});
    mockOnSnapshotErrorCallback = (optionsOrObserver as any).error || error;
  }

  mockOnSnapshotCallback = callback;
  mockOnSnapshotUnsubscribe = vi.fn(() => {
    // console.log('onSnapshot unsubscribe called');
    mockOnSnapshotCallback = undefined;
    mockOnSnapshotErrorCallback = undefined;
  });
  return mockOnSnapshotUnsubscribe;
});

// Helper to reset all Firestore mocks
export const resetFirestoreMocks = () => {
  vi.clearAllMocks();
  mockOnSnapshotCallback = undefined;
  mockOnSnapshotErrorCallback = undefined;
  mockOnSnapshotUnsubscribe = undefined;
  // Re-assign vi.fn() to ensure they are fresh for each test
  collection.mockImplementation((_db: any, path: string) => mockCollectionRef(path));
  doc.mockImplementation((_db: any, collectionPath: string, docId: string) => mockDocumentRef(docId, collectionPath));
  addDoc.mockResolvedValue({ id: 'mock-add-doc-id' } as DocumentReference);
  updateDoc.mockResolvedValue(undefined);
  deleteDoc.mockResolvedValue(undefined);
  setDoc.mockResolvedValue(undefined);
  getDoc.mockResolvedValue(createMockDocumentSnapshot('mock-doc-id', {}));
  getDocs.mockResolvedValue(createMockQuerySnapshot([]));
  query.mockImplementation((_colRef: CollectionReference, ..._queryConstraints: any[]) => ({
    type: 'query',
    firestore: {} as any,
    withConverter: vi.fn(() => query(_colRef, ..._queryConstraints)),
  } as Query));
  where.mockImplementation((_field: string, _op: any, _value: any) => ({ type: 'where' }));
  orderBy.mockImplementation((_field: string, _direction: any) => ({ type: 'orderBy' }));
  limit.mockImplementation((_limit: number) => ({ type: 'limit' }));
  serverTimestamp.mockImplementation(() => ({ toMillis: () => Date.now() }));
  onSnapshot.mockImplementation((...args: any[]) => {
    const [ref, optionsOrObserver, error] = args;
    let callback: (snapshot: QuerySnapshot<any> | DocumentSnapshot<any>) => void;
    if (typeof optionsOrObserver === 'function') {
      callback = optionsOrObserver;
      mockOnSnapshotErrorCallback = error;
    } else {
      callback = (optionsOrObserver as any).next || (() => {});
      mockOnSnapshotErrorCallback = (optionsOrObserver as any).error || error;
    }
    mockOnSnapshotCallback = callback;
    mockOnSnapshotUnsubscribe = vi.fn(() => {
      mockOnSnapshotCallback = undefined;
      mockOnSnapshotErrorCallback = undefined;
    });
    return mockOnSnapshotUnsubscribe;
  });
};