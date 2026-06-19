import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileManagement } from './useProfileManagement';
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc, collection } from 'firebase/firestore';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  updateProfile: vi.fn()
}));

// 1. Mock Firebase Firestore using the centralized mock file
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  const firestoreMocks = await import('./__mocks__/firebase/firestore');
  return {
    ...actual, // Keep actual types for non-mocked exports if any
    ...firestoreMocks // Override with our mocks
  };
});

// 2. Import specific mocks from our mock file for direct control
import { resetFirestoreMocks, mockDocumentRef } from './__mocks__/firebase/firestore';

// Mock config to prevent actual initialization
vi.mock('../firebase-config', () => ({
  db: {},
  app: {}
}));

describe('useProfileManagement', () => {
  const mockUid = 'io-entity-123';

  beforeEach(() => {
    resetFirestoreMocks(); // Reset all Firestore mocks before each test
    vi.clearAllMocks();
  });

  it('should initialize with the provided identity name', () => {
    const { newDisplayName } = useProfileManagement('Ime Iopic');
    expect(newDisplayName.value).toBe('Ime Iopic');
  });

  it('should return false if the new name is empty or whitespace', async () => {
    const { newDisplayName, updateName } = useProfileManagement('Valid Name');

    newDisplayName.value = '   ';
    const result = await updateName(mockUid);

    expect(result).toBe(false);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('should synchronize name across Auth and Firestore on success', async () => {
    const mockUser = { uid: mockUid };
    (getAuth as any).mockReturnValue({ currentUser: mockUser });
    (updateProfile as any).mockResolvedValue(undefined);
    (updateDoc as any).mockResolvedValue(undefined);

    // Mock the doc function to return a predictable mockDocumentRef
    (doc as any).mockReturnValue(mockDocumentRef(mockUid, 'invitees'));

    const { newDisplayName, updateName, isUpdating } = useProfileManagement('Old Identity');
    newDisplayName.value = 'New Identity';

    const promise = updateName(mockUid);
    expect(isUpdating.value).toBe(true);

    const result = await promise;

    expect(result).toBe(true);
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Identity' });
    expect(doc).toHaveBeenCalledWith(db, 'invitees', mockUid);
    expect(updateDoc).toHaveBeenCalledWith(mockDocumentRef(mockUid, 'invitees'), {
      name: 'New Identity'
    });
    expect(isUpdating.value).toBe(false);
  });

  it('should return false if no active Auth session is detected', async () => {
    (getAuth as any).mockReturnValue({ currentUser: null });
    const { updateName } = useProfileManagement('Name');

    const result = await updateName(mockUid);
    expect(result).toBe(false);
  });

  it('should re-throw errors and reset updating state on failure', async () => {
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    (updateProfile as any).mockRejectedValue(new Error('Auth Substrate Offline'));

    const { updateName, isUpdating } = useProfileManagement('Name');

    await expect(updateName(mockUid)).rejects.toThrow('Auth Substrate Offline');
    expect(isUpdating.value).toBe(false);
  });
});

// Mock config to prevent actual initialization
vi.mock('../firebase-config', () => ({
  db: {},
  app: {}
}));

describe('useProfileManagement', () => {
  const mockUid = 'io-entity-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with the provided identity name', () => {
    const { newDisplayName } = useProfileManagement('Ime Iopic');
    expect(newDisplayName.value).toBe('Ime Iopic');
  });

  it('should return false if the new name is empty or whitespace', async () => {
    const { newDisplayName, updateName } = useProfileManagement('Valid Name');

    newDisplayName.value = '   ';
    const result = await updateName(mockUid);

    expect(result).toBe(false);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('should synchronize name across Auth and Firestore on success', async () => {
    const mockUser = { uid: mockUid };
    (getAuth as any).mockReturnValue({ currentUser: mockUser });
    (updateProfile as any).mockResolvedValue(undefined);
    (updateDoc as any).mockResolvedValue(undefined);

    const { newDisplayName, updateName, isUpdating } = useProfileManagement('Old Identity');
    newDisplayName.value = 'New Identity';

    const promise = updateName(mockUid);
    expect(isUpdating.value).toBe(true);

    const result = await promise;

    expect(result).toBe(true);
    expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New Identity' });
    expect(updateDoc).toHaveBeenCalled();
    expect(isUpdating.value).toBe(false);
  });

  it('should return false if no active Auth session is detected', async () => {
    (getAuth as any).mockReturnValue({ currentUser: null });
    const { updateName } = useProfileManagement('Name');

    const result = await updateName(mockUid);
    expect(result).toBe(false);
  });

  it('should re-throw errors and reset updating state on failure', async () => {
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    (updateProfile as any).mockRejectedValue(new Error('Auth Substrate Offline'));

    const { updateName, isUpdating } = useProfileManagement('Name');

    await expect(updateName(mockUid)).rejects.toThrow('Auth Substrate Offline');
    expect(isUpdating.value).toBe(false);
  });
});
