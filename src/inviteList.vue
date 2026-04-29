<script setup lang="ts">
import { onMounted, onUnmounted, reactive, computed, ref, watch } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { safeOnSnapshot } from './firestoreUtils';
import { db } from './firebase-config';
import { useInviteManagement } from './useInviteManagement';
// Import the SCSS variables for use in JS logic
import NolandTribute from './components/NolandTribute.vue';

const auth = getAuth();
const isReconnecting = ref(false);
const currentUserLevel = ref<string | null>(null);

let userUnsubscribe: (() => void) | null = null;
let authUnsubscribe: (() => void) | null = null;

// Audio Assets
const deleteSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const addSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
const onuSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');

// Toast Notification State
const toastMessage = ref('');
const showToast = ref(false);
const toastTheme = ref('#00bfff'); // protocolBlue
let toastTimeout: ReturnType<typeof setTimeout>;

const triggerToast = (message: string, theme: string = '#00bfff') => {
  toastMessage.value = message;
  toastTheme.value = theme;
  showToast.value = true;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    showToast.value = false;
  }, 4000);
};

// Local state for tracking UI interactions
const deleting = reactive<Record<string, boolean>>({});
const flipping = reactive<Record<string, boolean>>({});

const {
  newName,
  newLevel,
  inviteePays,
  isSubmitting,
  addInvitee,
  invitees,
  filteredInvitees,
  searchQuery,
  lastSyncTimestamp,
  loading,
  connectionError,
  retryCount,
  handleProposal: protocolProposal,
  removeInvitee,
  connectToProtocol,
  isInitialLoad
} = useInviteManagement();

// Determine if the currently logged-in member has 'Vector' privileges
const isCurrentMemberVector = computed(() => currentUserLevel.value === 'Vector');

const manualReconnect = () => {
  isReconnecting.value = true;
  // Call the protocol connection logic from the composable
  connectToProtocol();
  // Reset the reconnecting state after a brief delay to provide UI feedback
  setTimeout(() => {
    isReconnecting.value = false;
  }, 1000);
};

// Protocol Heartbeat Logic
const isPulseActive = ref(false);
watch(lastSyncTimestamp, (newVal) => {
  if (newVal > 0) {
    isPulseActive.value = true;
    // Duration matches the CSS animation
    setTimeout(() => {
      isPulseActive.value = false;
    }, 800);
  }
});

const handleProposal = async (id: string, action: 'accept' | 'deny' | 'onu') => {
  try {
    if (action === 'onu') {
      // Trigger the 3D flip animation locally
      flipping[id] = true;
      onuSound.currentTime = 0;
      onuSound.play().catch(() => {
        /* Handle silent browser blocks */
      });
      setTimeout(() => {
        flipping[id] = false;
      }, 600);
    }

    await protocolProposal(id, action);

    const messages = {
      accept: 'Connection established (Proposal Accepted).',
      deny: 'Connection terminated.',
      onu: 'Connection established (Standard relationship maintained).'
    };

    // Dynamically change toast theme based on action
    const theme = action === 'deny' ? '#dc3545' : '#00bfff';
    triggerToast(messages[action], theme);
  } catch (error) {
    console.error('Iopic Protocol Error: Handshake failed.', error);
  }
};

const deleteInvitee = async (id: string) => {
  if (!confirm('Are you sure you want to remove this entity from the protocol?')) return;

  deleting[id] = true;
  try {
    await removeInvitee(id);
  } catch (error) {
    console.error('Iopic Protocol Error: Failed to remove invitee.', error);
    deleting[id] = false;
  }
};

/**
 * JavaScript Animation Hooks
 * Concealing the implementation details of the motion subsystem
 */
const onBeforeEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '0';
  (el as HTMLElement).style.transform = 'translateX(30px)';
};

interface LevelTheme {
  shadow: string;
  shadowHover: string;
  gradient: string;
  badge: { backgroundColor: string; color: string };
  easing: string;
  textColor: string;
}

const THEMES: Record<string, LevelTheme> = {
  Vector: {
    shadow: '0 10px 25px rgba(0, 123, 255, 0.2)',
    shadowHover: '0 20px 35px rgba(0, 123, 255, 0.35)',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
    badge: { backgroundColor: '#007bff', color: 'white' },
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Back Out (Bouncy)
    textColor: '#0056b3'
  },
  Guest: {
    shadow: '0 10px 25px rgba(40, 167, 69, 0.2)',
    shadowHover: '0 20px 35px rgba(40, 167, 69, 0.35)',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
    badge: { backgroundColor: '#28a745', color: 'white' },
    easing: 'ease-in-out',
    textColor: '#1e7e34'
  },
  Member: {
    shadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    shadowHover: '0 12px 24px rgba(0, 0, 0, 0.15)',
    gradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    badge: { backgroundColor: '#6c757d', color: 'white' },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Standard Smooth
    textColor: '#333333'
  }
};

const DEFAULT_THEME: LevelTheme = {
  shadow: 'none',
  shadowHover: 'none',
  gradient: 'white',
  badge: { backgroundColor: '#f0f0f0', color: '#333' },
  easing: 'ease',
  textColor: '#333333'
};

const getTheme = (level: string) => THEMES[level] || DEFAULT_THEME;

const onEnter = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;
  const index = parseInt(htmlEl.dataset.index || '0');
  const invitee = filteredInvitees.value[index];
  const theme = getTheme(invitee?.level || '');

  // Complex Logic: Only stagger during the first render of the 'Genesis' list
  const delay = isInitialLoad.value ? index * 100 : 0;

  // Auditory feedback: Play the add sound only for new entities after initial sync
  if (!isInitialLoad.value) {
    addSound.currentTime = 0;
    addSound.play().catch(() => {
      /* Handle potential browser blocks silently */
    });
  }

  setTimeout(() => {
    const animation = htmlEl.animate(
      [
        { opacity: 0, transform: 'translateX(30px)' },
        { opacity: 1, transform: 'translateX(0)' }
      ],
      {
        duration: 500,
        easing: theme.easing,
        fill: 'forwards'
      }
    );
    animation.onfinish = done;
  }, delay);
};

const onLeave = (el: Element, done: () => void) => {
  const htmlEl = el as HTMLElement;

  // Trigger sound effect immediately upon leaving the protocol
  deleteSound.currentTime = 0;
  deleteSound.play().catch(() => {
    /* Handle potential browser blocks silently */
  });

  // Avoid layout jumps during removal
  htmlEl.style.position = 'absolute';
  htmlEl.style.zIndex = '10';

  const animation = htmlEl.animate(
    [
      {
        opacity: 1,
        transform: 'scale(1)',
        borderColor: 'transparent'
      },
      {
        opacity: 0,
        transform: 'scale(0.3)',
        backgroundColor: '#fff5f5',
        borderColor: '#dc3545',
        filter: 'blur(6px)'
      }
    ],
    {
      duration: 400,
      easing: 'ease-in'
    }
  );
  animation.onfinish = done;
};

const setupMemberListener = (uid: string) => {
  if (userUnsubscribe) {
    userUnsubscribe();
    userUnsubscribe = null;
  }

  userUnsubscribe = safeOnSnapshot(doc(db, 'invitees', uid), (snapshot) => {
    currentUserLevel.value = snapshot.exists() ? (snapshot.data()?.level as string) : null;
  });
};

onMounted(() => {
  // Watch for auth state to establish a dedicated listener for user privileges
  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setupMemberListener(user.uid);
    } else {
      currentUserLevel.value = null;
    }
  });
  connectToProtocol();
});

onUnmounted(() => {
  if (userUnsubscribe) userUnsubscribe();
  if (authUnsubscribe) authUnsubscribe();
});
</script>

<template>
  <div class="invite-container">
    <div class="header-area">
      <h2>Iopic World: Access Protocol</h2>
      <div class="sync-dot" :class="{ pulse: isPulseActive }" title="Protocol Heartbeat"></div>
    </div>

    <!-- Import from Contacts Button -->
    <div class="import-contacts-area">
      <button @click="importFromContacts" class="import-btn">Import from Contacts</button>
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.vcf,text/csv,text/vcard"
        style="display: none"
        @change="handleFileImport"
      />
    </div>

    <!-- Connection Pricing Info -->
    <div class="connection-pricing">
      <h3>Peer Connection Pricing</h3>
      <ul>
        <li>1 IO$ / month</li>
        <li>10 IO$ / year</li>
        <li>75 IO$ / 10 years</li>
        <li>200 IO$ / lifetime</li>
      </ul>
    </div>

    <form @submit.prevent="addInvitee" class="invite-form-container">
      <div class="invite-form">
        <input v-model="newName" placeholder="Entity Name" required class="form-input" />
        <select v-model="newLevel" class="form-select">
          <option value="Member">Member</option>
          <option value="Vector">Vector</option>
          <option value="Guest">Guest</option>
        </select>
        <button type="submit" :disabled="isSubmitting" class="invite-btn">
          {{ isSubmitting ? 'Inviting...' : 'Send Invite' }}
        </button>
      </div>
      <label
        class="form-options"
        :title="!isCurrentMemberVector ? 'Only Vectors can flip relationships' : ''"
      >
        <input type="checkbox" v-model="inviteePays" :disabled="!isCurrentMemberVector" />
        <span>Invitee Pays (01 ↔ 10 Flip)</span>
      </label>
    </form>

    <div v-if="loading && !connectionError">Synchronizing with persistence layer...</div>

    <div v-if="connectionError" class="retry-status">
      <p>Connection unstable. Attempting to reconnect (Try #{{ retryCount }})...</p>
      <button @click="manualReconnect" :disabled="isReconnecting" class="reconnect-btn">
        <span v-if="isReconnecting" class="spinner-small inline-spinner"></span>
        {{ isReconnecting ? 'Reconnecting...' : 'Reconnect Now' }}
      </button>
    </div>

    <div v-if="!loading && !connectionError" class="protocol-controls">
      <input v-model="searchQuery" placeholder="Filter protocol entities..." class="search-input" />
    </div>

    <TransitionGroup
      name="list"
      tag="ul"
      v-if="!loading && !connectionError"
      class="invite-list"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
    >
      <li
        v-for="(invitee, index) in filteredInvitees"
        :key="invitee.id"
        class="invite-item"
        :class="{
          'is-deleting': deleting[invitee.id],
          'is-flipping': flipping[invitee.id]
        }"
        :data-index="index"
        :style="{
          '--card-shadow': getTheme(invitee.level).shadow,
          '--card-shadow-hover': getTheme(invitee.level).shadowHover,
          '--card-gradient': getTheme(invitee.level).gradient,
          '--card-text-color': getTheme(invitee.level).textColor
        }"
      >
        <div class="info">
          <span class="name">{{ invitee.name }}</span>
          <span class="level badge" :style="getTheme(invitee.level).badge">{{
            invitee.level
          }}</span>
          <span v-if="invitee.inviteePays" class="flipped-badge" title="01-10 Relationship Flipped"
            >Flipped</span
          >
        </div>
        <div class="status" :class="invitee.status.toLowerCase()">
          {{ invitee.status }}
        </div>
        <div
          v-if="invitee.status === 'Pending' && invitee.targetUid === auth.currentUser?.uid"
          class="handshake-controls"
        >
          <button @click="handleProposal(invitee.id, 'accept')" class="hs-btn accept">
            Accept
          </button>
          <button
            @click="handleProposal(invitee.id, 'onu')"
            class="hs-btn onu"
            v-if="invitee.inviteePays"
          >
            ONU
          </button>
          <button @click="handleProposal(invitee.id, 'deny')" class="hs-btn deny">Deny</button>
        </div>
        <div v-if="deleting[invitee.id]" class="spinner-small"></div>
        <button v-else @click="deleteInvitee(invitee.id)" class="delete-btn" title="Remove Invitee">
          &times;
        </button>
      </li>
    </TransitionGroup>

    <div v-if="!loading && invitees.length === 0" class="empty-state">
      Nothing and no one can connect or interact with you unless you first invite them.
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="toast-notification">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use './_variables.scss' as *;

.connection-pricing {
  margin: 1.5rem 0 2rem 0;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  h3 {
    margin-top: 0;
    color: #1a237e;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  ul {
    margin: 0;
    padding-left: 1.2rem;
    color: #222;
    font-size: 1rem;
    li {
      margin-bottom: 0.2rem;
    }
  }
}

.invite-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.header-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
  }
}

.sync-dot {
  width: 8px;
  height: 8px;
  background-color: #444;
  border-radius: 50%;
  transition: background-color 0.3s ease;

  &.pulse {
    background-color: $protocol-green;
    animation: protocol-pulse 0.8s ease-out;
  }
}

@keyframes protocol-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 255, 65, 0.7);
    transform: scale(1);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(0, 255, 65, 0);
    transform: scale(1.2);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 255, 65, 0);
    transform: scale(1);
  }
}

.invite-form-container {
  margin-bottom: 2rem;
}

.protocol-controls {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-family: $protocol-font;
  box-sizing: border-box;
}

.invite-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.form-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: -1.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
}

.invite-btn {
  padding: 0.5rem 1rem;
  background-color: $protocol-blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.invite-btn:disabled {
  background-color: #ccc;
}

.invite-list {
  list-style: none;
  padding: 0;
  position: relative;
  perspective: 1000px;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
}

.retry-status {
  color: #dc3545;
  font-style: italic;
  margin-bottom: 1rem;
  text-align: center;
}

.handshake-controls {
  display: flex;
  gap: 0.5rem;
  margin-right: 1rem;
}

.hs-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: bold;
}

.hs-btn.accept {
  background: #28a745;
  color: white;
}

.hs-btn.onu {
  background: #6610f2;
  color: white;
}

.hs-btn.deny {
  background: #6c757d;
  color: white;
}

.reconnect-btn {
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-style: normal;
  transition: background-color 0.2s;
}

.reconnect-btn:hover {
  background-color: #bd2130;
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #dc3545;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 0.5rem;
}

.inline-spinner {
  vertical-align: middle;
  margin: 0 0.5rem 0 0;
  border-top-color: white;
  /* Match button text color */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.invite-item {
  display: flex;
  justify-content: space-between;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 12px;
  border: 1px solid transparent;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  background: var(--card-gradient);
  box-shadow: var(--card-shadow);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease,
    border 0.3s ease, background 0.3s ease;
  cursor: pointer;
}

.invite-item:not(.is-deleting):hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: var(--card-shadow-hover);
  z-index: 2;
}

.is-deleting {
  pointer-events: none;
  cursor: default;
  border-color: #dc3545;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%) !important;
  opacity: 0.8;
}

.is-flipping {
  animation: card-flip 0.6s cubic-bezier(0.455, 0.03, 0.515, 0.955), bg-flash 0.6s;
  pointer-events: none;
}

.is-flipping .flipped-badge {
  /* Syncs with card-flip duration to vanish exactly halfway (0.3s) */
  animation: badge-vanish 0.6s forwards;
}

.is-flipping .name {
  /* Synchronizes glitch with the mid-point of the flip */
  animation: text-glitch 0.6s;
}

/* Moved detailed animations to JS hooks for better abstraction control. */
/* We keep .list-move to handle the sliding up of items when one is removed. */
.list-move {
  transition: transform 0.5s ease;
}

.name {
  color: var(--card-text-color);
  font-weight: bold;
  transition: color 0.3s ease;
}

@keyframes card-flip {
  0% {
    transform: rotateY(0deg);
  }

  50% {
    transform: rotateY(180deg) scale(1.05);
  }

  100% {
    transform: rotateY(360deg);
  }
}

@keyframes bg-flash {
  0%,
  45%,
  55%,
  100% {
    filter: none;
  }

  50% {
    filter: brightness(2.5) contrast(1.2) saturate(150%);
  }
}

@keyframes badge-vanish {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}

@keyframes text-glitch {
  0%,
  45%,
  55%,
  100% {
    transform: translate(0);
    text-shadow: none;
  }

  47% {
    transform: translate(-2px, 1px);
    text-shadow: 1px 0 #ff0000, -1px 0 #00ffff;
  }

  50% {
    transform: translate(2px, -1px);
    text-shadow: -1px 0 #ff0000, 1px 0 #00ffff;
  }

  53% {
    transform: translate(-1px, 0);
    text-shadow: 0.5px 0 #ff0000, -0.5px 0 #00ffff;
  }
}

.flipped-badge {
  font-size: 0.65rem;
  color: #6610f2;
  border: 1px solid #6610f2;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 5px;
  text-transform: uppercase;
  font-weight: bold;
}

.badge {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.pending {
  color: orange;
  font-weight: bold;
}

.active {
  color: green;
  font-weight: bold;
}

/* Toast Notifications */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: v-bind(toastTheme);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-size: 0.9rem;
  pointer-events: none;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  bottom: 0rem;
}
</style>

<NolandTribute />
