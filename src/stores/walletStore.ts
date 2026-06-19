import { defineStore } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue';

export const useWalletStore = defineStore('wallet', () => {
  // --- State ---
  // In Setup stores, we use ref() and reactive()
  const walletAddress = ref<string>('');
  const ethBalance = ref<string>('0');
  const sendTo = ref<string>('');
  const sendAmount = ref<number>(0);
  const copySuccess = ref<boolean>(false);

  // --- Getters ---
  // In Setup stores, computed() properties act as getters
  const isGrounded = computed(() => walletAddress.value !== '');

  // --- Actions ---
  // Regular functions serve as actions. No 'this' context required.
  async function connectWallet() {
    // Logic for MetaMask connection...
    console.log('Connecting to mesh...');
  }

  function setAddress(address: string) {
    walletAddress.value = address;
  }

  function copyAddress() {
    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = false), 2000);
  }

  // --- Lifecycle Hooks & Watchers ---
  onMounted(() => {
    // Centralized: Check for existing MetaMask connection on store initialization
    if (window.ethereum?.selectedAddress) {
      walletAddress.value = window.ethereum.selectedAddress;
      getBalance();
    }
  });

  // Watch for address changes to log or trigger analytics
  watch(walletAddress, (newAddress) => {
    if (newAddress) {
      console.log(`[Wallet] Active node re-grounded to: ${newAddress}`);
    }
  });

  // We must return everything the components need access to
  return {
    walletAddress,
    ethBalance,
    sendTo,
    sendAmount,
    copySuccess,
    isGrounded,
    connectWallet,
    getBalance,
    setAddress,
    copyAddress
  };
});
