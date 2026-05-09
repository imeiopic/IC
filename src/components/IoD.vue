<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { db } from '../firebase'; // Fixed path to root
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../composables/useAuth';

// Initialize state
const { user } = useAuth();
const successMsg = ref('');

const donationTiers = [
  { amount: "1.00", label: "Node_Seed", description: "Ground a single thread.", image: "/images/1$.jpg", progress: 0, color: "#555", pay: "https://www.paypal.com/ncp/payment/BV6KVXVKUM45J" },
  { amount: "10.00", label: "Deca_Node", description: "Activate a 10x Cluster.", image: "/images/10$.jpg", progress: 50, color: "#00e5ff", pay: "https://www.paypal.com/ncp/payment/7AR2DXBAABA3W" },
  { amount: "100.00", label: "Centurion_Core", description: "1.5x Equity Multiplier active.", image: "/images/100$.jpg", progress: 75, color: "#c5a059", pay: "https://www.paypal.com/ncp/payment/BV6KVXVKUM45J" },
  { amount: "1000.00", label: "Sovereign_Kilo", description: "Planetary Equity 2.0x active.", image: "/images/1000$.jpg", progress: 100, color: "#fff", pay: "https://www.paypal.com/ncp/payment/68EBVEEFRDSUY" }
];

const verifyTransit = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentConfirmed = urlParams.has('token') || urlParams.has('PayerID');

  // Verify both the payment signal and the authenticated user presence
  if (paymentConfirmed && user.value) {
    successMsg.value = "TRANSIT_VERIFIED: SYNCING_EQUITY_THREAD...";
    
    try {
      const amountSent = urlParams.get('amt'); 

      const userRef = doc(db, 'users', user.value.uid);
      await updateDoc(userRef, {
        status: 'EQUITY_GROUNDED',
        equityTier: amountSent || "1.00", 
        lastTransit: serverTimestamp()
      });

      localStorage.setItem('hasDonated', 'true');
      if (amountSent) localStorage.setItem('equity_tier', amountSent);
      
      // Notify the global bus (Navbar/MYB) to update visuals
      window.dispatchEvent(new CustomEvent('equity-updated'));
      
      setTimeout(() => { successMsg.value = "EQUITY_STABILIZED: WELCOME_TO_THE_MESH"; }, 3000);
      setTimeout(() => { successMsg.value = ''; }, 7000);
    } catch (err) {
      console.error("TRANSIT_VERIFICATION_FAILED", err);
    }
  }
};

onMounted(() => {
  if (user.value) verifyTransit();
});

// Sync if auth grounds after the component mounts
watch(user, (newVal) => {
  if (newVal) verifyTransit();
});
</script>