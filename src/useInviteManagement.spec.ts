import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInviteManagement } from './useInviteManagement';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Mock Firebase Auth Substrate
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn()
}));

// Mock Firebase Firestore Logic
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn()
}));

// Mock Firebase Config to prevent actual init
vi.mock('../firebase-config', () => ({
  db: {}
}));

describe('useInviteManagement', () => {
  const mockUid = 'io-entity-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default empty state substrate', () => {
    const { newName, inviteeEmail, newLevel, inviteePays, isSubmitting } = useInviteManagement();
    
    expect(newName.value).toBe('');
    expect(inviteeEmail.value).toBe('');
    expect(newLevel.value).toBe('Member');
    expect(inviteePays.value).toBe(false);
    expect(isSubmitting.value).toBe(false);
  });

  it('should not proceed if entity name is empty or whitespace', async () => {
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    const { newName, inviteeEmail, addInvitee } = useInviteManagement();
    
    newName.value = '   ';
    inviteeEmail.value = 'test@example.com';
    await addInvitee();
    
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('should not proceed if email is empty', async () => {
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    const { newName, inviteeEmail, addInvitee } = useInviteManagement();

    newName.value = 'Test Name';
    inviteeEmail.value = '';
    await addInvitee();

    expect(addDoc).not.toHaveBeenCalled();
  });

  it('should not proceed if no user identity is detected in the Auth bus', async () => {
    (getAuth as any).mockReturnValue({ currentUser: null });
    const { newName, inviteeEmail, addInvitee } = useInviteManagement();
    
    newName.value = 'New Entity';
    inviteeEmail.value = 'test@example.com';
    await addInvitee();
    
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('should lookup targetUid by email and add a new invitee on success', async () => {
    const mockUser = { uid: mockUid };
    const mockTargetUid = 'target-uid-789';
    (getAuth as any).mockReturnValue({ currentUser: mockUser });
    
    // Mocking the query result
    (getDocs as any).mockResolvedValue({
      empty: false,
      docs: [{ id: mockTargetUid }]
    });
    (addDoc as any).mockResolvedValue({ id: 'new-doc-id' });

    const { newName, inviteeEmail, newLevel, inviteePays, addInvitee, isSubmitting } = useInviteManagement();
    
    newName.value = 'Vector Alpha';
    inviteeEmail.value = 'target@iopic.world';
    newLevel.value = 'Vector';
    inviteePays.value = true;

    const promise = addInvitee();
    expect(isSubmitting.value).toBe(true);

    await promise;

    expect(getDocs).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith(undefined, {
      name: 'Vector Alpha',
      level: 'Vector',
      status: 'Pending',
      inviteePays: true,
      targetUid: mockTargetUid,
      inviterUid: mockUid
    });

    expect(isSubmitting.value).toBe(false);
    expect(newName.value).toBe('');
    expect(inviteeEmail.value).toBe('');
    expect(newLevel.value).toBe('Member');
    expect(inviteePays.value).toBe(false);
  });

  it('should stop and log error if target identity is not found', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    
    // Mock empty query result
    (getDocs as any).mockResolvedValue({ empty: true });

    const { newName, inviteeEmail, addInvitee, isSubmitting } = useInviteManagement();
    newName.value = 'Unknown User';
    inviteeEmail.value = 'none@iopic.world';

    await addInvitee();

    expect(getDocs).toHaveBeenCalled();
    expect(addDoc).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to register invitee"), expect.any(Error));
    expect(isSubmitting.value).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should catch and log substrate errors while resetting submitting state', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (getAuth as any).mockReturnValue({ currentUser: { uid: mockUid } });
    (getDocs as any).mockResolvedValue({ empty: false, docs: [{ id: 'found' }] });
    (addDoc as any).mockRejectedValue(new Error('Firestore Substrate Failure'));

    const { newName, inviteeEmail, addInvitee, isSubmitting } = useInviteManagement();
    newName.value = 'Error Entity';
    inviteeEmail.value = 'error@iopic.world';

    await addInvitee();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to register invitee"), expect.any(Error));
    expect(isSubmitting.value).toBe(false);
    
    consoleSpy.mockRestore();
  });
});
