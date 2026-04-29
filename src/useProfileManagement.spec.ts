import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileManagement } from './useProfileManagement';
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  updateProfile: vi.fn()
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn()
}));

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