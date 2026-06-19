<template>
  <CContainer fluid class="-master-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <ImeBiometricGate
      :user="user"
      :errors="errors"
      :is-verified="isVerified"
      @update:isVerified="isVerified = $event"
      @update:globalError="setError"
      @dismiss-error="removeError"
      @biometric-enrolled="handleBiometricEnrolled"
    />

    <div v-if="isVerified" class="master-interface animate-in">
      <ImeMasterHeader
        :user-id="userId"
        :display-name="user?.displayName"
        :photo-url="user?.photoURL"
      />

      <CNav variant="tabs" class="border-zinc-800 mb-4">
        <CNavItem>
          <CNavLink
            href="javascript:void(0)"
            :active="activeTab === 'dashboard'"
            @click="setActiveTab('dashboard')"
          >
            <i class="bi bi-speedometer2 me-2"></i>GLOBAL_DASH
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            href="javascript:void(0)"
            :active="activeTab === 'clusters'"
            @click="setActiveTab('clusters')"
          >
            <i class="bi bi-globe me-2"></i>MESH_CLUSTERS
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            href="javascript:void(0)"
            :active="activeTab === 'fix-usa'"
            @click="setActiveTab('fix-usa')"
          >
            <i class="bi bi-flag me-2"></i>FIX_USA
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            href="javascript:void(0)"
            :active="activeTab === 'stripe'"
            @click="setActiveTab('stripe')"
          >
            <i class="bi bi-credit-card-2-front me-2"></i>STRIPE_MGMT
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink
            href="javascript:void(0)"
            :active="activeTab === 'audit-log'"
            @click="setActiveTab('audit-log')"
          >
            <i class="bi bi-journal-text me-2"></i>AUDIT_LOG
          </CNavLink>
        </CNavItem>
        <CNavItem class="ms-auto">
          <CButton color="link" class="text-danger text-xs text-decoration-none" @click="lockNode">
            LOCK_INSTANCE
          </CButton>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane role="tabpanel" :visible="activeTab === 'dashboard'">
          <ImeDashboard
            :user="user"
            :user-photo="userPhoto"
            @update:globalError="setError"
          />
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'clusters'">
          <ImeClusters :user="user" @update:globalError="setError" />
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'fix-usa'">
          <ImeFixUSA :user="user" @update:globalError="setError" />
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'stripe'">
          <ImeStripeManager />
        </CTabPane>

        <CTabPane role="tabpanel" :visible="activeTab === 'audit-log'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <History />
            <DicClient />
          </div>
        </CTabPane>
      </CTabContent>
    </div>

    <ImeFooter />
  </CContainer>
</template>
<script setup lang="ts">
import { CButton, CContainer, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/vue';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../firebase';
import { useAuth } from '../useAuth';
import DicClient from './DicClient.vue'; // Import DicClient.vue
import History from './History.vue'; // Import History.vue
import ImeFooter from './ImeFooter.vue';
import ImeBiometricGate from './ImeBiometricGate.vue';
import ImeClusters from './ImeClusters.vue';
import ImeDashboard from './ImeDashboard.vue';
import ImeFixUSA from './ImeFixUSA.vue';
import ImeMasterHeader from './ImeMasterHeader.vue';
import ImeStripeManager from './ImeStripeManager.vue';
import { useGlobalError } from './useGlobalError';

const { user } = useAuth();
const { errors, setError, clearError, removeError } = useGlobalError();
const router = useRouter(); // Keep router for lockNode

// Reactive State
const isVerified = ref(false);
const userPhoto = ref(null as string | null); // This would ideally come from user data or a sighting
const activeTab = ref('clusters'); // Default to clusters tab for easier testing

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
};

// Computed Properties
const userId = computed(() => user.value?.uid?.substring(0, 8) || 'UNKNOWN');

// Watch for user changes to potentially auto-verify or load user photo
// This watch now also sets `isVerified` based on user data, which will trigger the `watch(isVerified, ...)` below.
watch(
  user,
  (newUser: any | null) => {
    if (newUser) {
      if (newUser.biometricVerified) {
        isVerified.value = true;
      }
      userPhoto.value = newUser.photoURL || null;
    } else {
      isVerified.value = false;
      userPhoto.value = null;
    }
  },
  { immediate: true }
);

// Watch for isVerified state to play the welcome message
watch(isVerified, (newVal) => {
  if (newVal) {
    // Ensure the message plays only once upon successful verification
    // This handles both initial load (if already verified) and post-handshake verification
    playWelcomeMessage();
  }
});

// This function is called when the biometric gate confirms enrollment.
// It doesn't need to directly modify the user object here, as the `isVerified` ref
// is already being updated by the `update:isVerified` event from BiometricGate.
// If there's a need to persist biometric enrollment status to the user's profile,
// that would typically involve a call to a backend service or a user store action.
const handleBiometricEnrolled = () => {
  /* Logic for post-enrollment actions, if any */
};
// Placeholder for welcome message function
const playWelcomeMessage = () => {
  console.log('Welcome, Master Node. Global Sighting Confirmed.');
  // In a real app, this might trigger an audio message, a toast, or a complex animation.
};

// Lock Instance (Logout)
const lockNode = async () => {
  try {
    clearError();
    await auth.signOut();
    isVerified.value = false; // Reset verification state
    router.push('/'); // Redirect to home page
  } catch (error) {
    setError('LOGOUT_FAILURE: SYSTEM_ERROR');
    console.error('Logout error:', error);
  }
};
</script>

<style scoped></style>
