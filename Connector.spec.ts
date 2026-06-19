import { mount } from '@vue/test-utils';
import { addDoc } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Connector from './Connector.vue';

// Mock Firebase to prevent network activity and initialization errors
vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  serverTimestamp: vi.fn(),
}));

describe('Connector.vue Error Feedback', () => {
  const mockToast = {
    error: vi.fn(),
    success: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random to a fixed value to control "busy" simulation logic
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('renders a specific error message when mesh persistence fails', async () => {
    // 1. Setup scenario: Force a "busy" signal and mock Firestore to reject the write
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Triggers "isNodeBusy" in initiateSpiceConnection
    vi.mocked(addDoc).mockRejectedValueOnce({ 
      code: 'permission-denied', 
      message: 'Insufficient permissions' 
    });

    const wrapper = mount(Connector, {
      global: {
        provide: {
          toast: mockToast,
        },
      },
    });

    // 2. Trigger the connection attempt
    const mockNode = { 
      id: 'target-node', 
      name: 'Test Node', 
      localityCoordinate: '0,0', 
      lat: 0, 
      lng: 0 
    };
    await wrapper.vm.initiateSpiceConnection(mockNode as any);

    // 3. Wait for the async processImeBusyMandate to resolve and update searchStatus
    await wrapper.vm.$nextTick();

    // Verify error was called with expected message
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Error: Could not reach distributed store.')
    );
  });
});
