<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useAuth } from './useAuth';
import { Wallet } from 'ethers'; // Added Wallet import
import { useError } from './useError';
import { app, db } from './firebase-config';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Added for view seed modal
import { useIOSettings } from './useIOSettings';
import { IopicSecretManager } from './IopicSecretManager';
import OrderTakerModel, { type OrderBond } from './orderTakerModel';
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CTooltip
} from '@coreui/vue';
import ProtocolFooter from './components/ProtocolFooter.vue';
import ProtocolMap from './components/ProtocolMap.vue';
import AudioStatusBadge from './components/AudioStatusBadge.vue';
import { useSystemBus } from './composables/useSystemBus'; // Import useSystemBus
import IopicKernelLog from './components/IopicKernelLog.vue';
import { useGeolocation } from './composables/useGeolocation'; // Import the composable
import IopicEnergyMonitor from './components/IopicEnergyMonitor.vue';
import { useRankHistory } from './composables/useRankHistory';
import { usePersistence } from './composables/usePersistence';
import { useDashboardData } from './composables/useDashboardData';
import { useProfileManagement } from './composables/useProfileManagement';
import { useDebounce } from './composables/useDebounce';

const { user } = useAuth();
const { reportError } = useError();
const { isMuted, masterVolume, playSFX, ioLoad, preloadSounds, setIOLoadFromCount } = useIOSettings();
const isShaking = ref(false);
const showEternalOverlay = ref(false);
const isFulfilling = ref(false);
const isResyncing = ref(false);
const isVerifyingCoordinates = ref(false);
const { rankHistory, addRankEntry, clearHistory } = useRankHistory();
const activeTab = ref('contributions');
const showFulfillModal = ref(false);
const bondToFulfill = ref<string | null>(null);
const distanceToTarget = ref<number | null>(null);
const showViewSeedModal = ref(false);
const viewSeedPassword = ref('');
const revealedMnemonic = ref('');
const viewSeedError = ref('');
const isVerifyingSeed = ref(false);
const showRebootConfirmation = ref(false);
const rebootConfirmCode = ref('');
let warningSoundNode: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

const { currentCoords: watchedCoords, geolocationError } = useGeolocation(); // Use the composable
const { isGlobalPurgeActive, rebootSystem, systemFriction } = useSystemBus(); // Use global purge state

const {
    newDisplayName,
    isUpdating,
    updateName
} = useProfileManagement(user.value?.displayName || '');

// IDEAL IO Constants
const PROXIMITY_THRESHOLD_METERS = 100;

const activeFulfillBond = computed(() => assignedBonds.value.find(b => b.id === bondToFulfill.value));

const {
    profile,
    myInvites,
    assignedBonds,
    loading,
    firestoreError,
    showSeedReminder,
    retryCount,
    MAX_RETRIES,
    handleSeedReminderAction
} = useDashboardData({
    onNewBond: (description) => {
        triggerToast(`IO Alert: New Bond Assigned. Payload: ${description}`);
        playSFX('order');
    }
});

const {
    persistenceScore,
    persistenceRank,
    persistenceProgress,
    persistenceTooltip
} = usePersistence(assignedBonds);

/**
 * Watch for Rank Upgrades: Handles side effects for identity stabilization.
 */
let shakeTimeout: ReturnType<typeof setTimeout>;
let eternalTimeout: ReturnType<typeof setTimeout>;

watch(persistenceRank, (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
        playSFX('static');

        clearTimeout(shakeTimeout);
        isShaking.value = true;
        shakeTimeout = setTimeout(() => { isShaking.value = false; }, 500);

        // Log Rank Achievement via composable
        addRankEntry(newVal);

        // Trigger Eternal Sequence
        if (newVal === 'ETERNAL') {
            clearTimeout(eternalTimeout);
            showEternalOverlay.value = true;
            eternalTimeout = setTimeout(() => { showEternalOverlay.value = false; }, 5000);
        }
    }
});

/**
 * Watch for System Reboot: Handles visual transition from Global Purge back to Stability.
 */
watch(isGlobalPurgeActive, (active, wasActive) => {
    if (!active && wasActive) {
        // Enter resyncing state to match the Visualizer's manifestation sequence
        isResyncing.value = true;
        playSFX('order');
        setTimeout(() => { isResyncing.value = false; }, 2500);
    }
});

/**
 * Profile Update Logic: Manages identity synchronization.
 */
const handleUpdateName = async () => {
    if (!user.value || isUpdating.value) return;
    cancelUpdateName();
    await updateName(user.value.uid);
};

const { run: debounceUpdateName, cancel: cancelUpdateName } = useDebounce(handleUpdateName, 2000);

watch(newDisplayName, (val) => {
    cancelUpdateName();

    // Only initiate auto-sync if the name has actually changed, is valid, and not already updating
    if (val === user.value?.displayName || !val.trim() || isUpdating.value) return;

    debounceUpdateName();
});

// Notification State
const toastMessage = ref('');
const showToast = ref(false);
let toastTimeout: ReturnType<typeof setTimeout>;

const triggerToast = (message: string) => {
    toastMessage.value = message;
    showToast.value = true;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        showToast.value = false;
    }, 5000);
};

onUnmounted(() => { // Keep this for Firestore listeners cleanup
    clearTimeout(shakeTimeout);
    clearTimeout(eternalTimeout);
    if (warningSoundNode) warningSoundNode.source.stop();
});

const handleVerifyAndShowSeed = async () => {
    if (!user.value?.email || !viewSeedPassword.value) return;

    isVerifyingSeed.value = true;
    viewSeedError.value = '';

    try {
        const auth = getAuth(app);
        if (!auth.currentUser) throw new Error("No active session.");

        // Firebase re-authentication protocol
        const credential = EmailAuthProvider.credential(user.value.email, viewSeedPassword.value);
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Decrypt the mnemonic from the local substrate using the verified password
        const encryptedVault = localStorage.getItem('io_entity_mnemonic');
        if (!encryptedVault) throw new Error("Vault Missing");

        revealedMnemonic.value = await IopicSecretManager.decryptSeed(encryptedVault, viewSeedPassword.value);
        playSFX('fulfill');
    } catch (err: any) {
        viewSeedError.value = 'Verification failed. Asymmetrical access code detected.';
        playSFX('static');
    } finally {
        isVerifyingSeed.value = false;
    }
};

const closeViewSeedModal = () => {
    showViewSeedModal.value = false;
    viewSeedPassword.value = '';
    revealedMnemonic.value = '';
    viewSeedError.value = '';
};

const clearRankHistory = () => {
    if (confirm('Are you sure you want to purge the rank achievement log?')) {
        clearHistory();
        triggerToast("Achievement log purged.");
    }
};

const openFulfillModal = (bondId: string) => {
    bondToFulfill.value = bondId;
    showFulfillModal.value = true;
};

/**
 * Haversine formula to calculate distance between two points on Earth.
 */
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const exportAuditProof = async (bond: OrderBond) => {
    if (!bond.verificationData) return;

    // 1. Resolve IO Identity (Private Key)
    let privateKey = localStorage.getItem('io_entity_key');
    if (!privateKey) {
        const tempWallet = Wallet.createRandom();
        privateKey = tempWallet.privateKey;
        localStorage.setItem('io_entity_key', privateKey);
        triggerToast("New cryptographic identity assigned to this node.");
    }
    const wallet = new Wallet(privateKey);

    // 2. Prepare Payload for Signing
    const bondPayload = {
        id: bond.id,
        vreId: bond.vreId,
        payload: bond.payload,
        audit: bond.verificationData
    };

    // 3. Cryptographic Signature Generation
    const messageToSign = JSON.stringify(bondPayload);
    const signature = await wallet.signMessage(messageToSign);

    const proof = {
        header: {
            io: "IOPIC-IDEAL-v1",
            transmission: "SIGNED_JSON_PROOF",
            version: "1.0.5",
            timestamp: new Date().toISOString(),
            signerAddress: wallet.address,
            signature: signature
        },
        entity: {
            uid: user.value?.uid,
            displayName: user.value?.displayName
        },
        bond: bondPayload
    };

    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IOPIC_PROOF_${bond.id?.substring(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast("Audit proof exported successfully.");
};

const handleFulfillBond = async () => {
    if (!user.value || !bondToFulfill.value) return;

    isFulfilling.value = true;
    isVerifyingCoordinates.value = true;

    try {
        // Step 1: IDEAL IO - Verify Physical Coordinates
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        // Step 2: Proximity Validation
        if (activeFulfillBond.value?.targetCoords && watchedCoords.value) {
            const dist = getDistance(
                watchedCoords.value.lat, watchedCoords.value.lon,
                activeFulfillBond.value.targetCoords.lat, activeFulfillBond.value.targetCoords.lon
            );
            distanceToTarget.value = dist;

            if (dist > PROXIMITY_THRESHOLD_METERS) {
                throw new Error(`Proximity Error: Entity is ${dist.toFixed(0)}m from target node. Maximum allowed: ${PROXIMITY_THRESHOLD_METERS}m.`);
            }
        }

        isVerifyingCoordinates.value = false;
        // Step 3: IO Synchronization (Firestore Update)
        await OrderTakerModel.updateBondStatus(bondToFulfill.value, 'FULFILLED', {
            coordinates: {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                alt: position.coords.altitude
            },
            distanceMeters: distanceToTarget.value,
            verifiedAt: new Date().toISOString()
            // ... verification payload
        });

        playSFX('fulfill');

        triggerToast("Bond FULFILLED. Physical-to-Digital link verified.");
        showFulfillModal.value = false;
        bondToFulfill.value = null;
        distanceToTarget.value = null;
    } catch (error) {
        console.error("IO Verification Failed:", error);
        let errorMessage = error.message || "Spatial resolution failed.";
        if (error.code === 1) errorMessage = "Access Denied: GPS synchronization required for Logical Truth.";
        else if (error.code === 3) errorMessage = "Network Timeout: Spatial data stream disrupted.";

        reportError(errorMessage);
    } finally {
        isFulfilling.value = false;
        isVerifyingCoordinates.value = false;
    }
};

// Play static sound when the glitchy modal appears
watch(showFulfillModal, (isVisible) => {
    if (isVisible) {
        playSFX('static');
    }
});

watch(() => assignedBonds.value.length, (count) => {
    setIOLoadFromCount(count);
});

watch(showRebootConfirmation, async (val) => {
    if (val) {
        rebootConfirmCode.value = '';
        // Initiate critical substrate warning loop: persistent high-frequency oscillation (1200Hz)
        const sfx = await playSFX('static', { volume: 0.15, loop: true, frequency: 1200 });
        if (sfx) warningSoundNode = sfx as any;
    } else {
        if (warningSoundNode) {
            warningSoundNode.source.stop();
            warningSoundNode = null;
        }
    }
});

const handleConfirmReboot = () => {
    if (rebootConfirmCode.value !== 'PURGE') return;
    showRebootConfirmation.value = false;
    rebootSystem(5000);
};
</script>

<template>
    <div class="dashboard-page d-flex flex-column min-vh-100" :class="{ 'shake-animation': isShaking }"
        @pointerdown.once="preloadSounds" :style="{ '--io-velocity': ioLoad }">

        <!-- Eternal Achievement Overlay -->
        <Teleport to="body">
            <Transition name="eternal-fade">
                <div v-if="showEternalOverlay"
                    class="eternal-overlay d-flex flex-column align-items-center justify-content-center">
                    <h1 class="eternal-title font-monospace glitch" data-text="IDENTITY STABILIZED">IDENTITY STABILIZED
                    </h1>
                    <div class="eternal-subtitle text-uppercase font-monospace mt-3 text-info">Substrate Node Status:
                        ETERNAL</div>
                    <div class="eternal-scanline"></div>
                </div>
            </Transition>
        </Teleport>

        <main class="flex-grow-1 container py-5">
            <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Accessing Personal Node...</p>
            </div>

            <div v-else-if="firestoreError"
                class="alert alert-danger shadow-sm border-0 d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>{{ firestoreError }}</span>
                </div>
                <div v-if="retryCount < MAX_RETRIES && !loading" class="spinner-grow spinner-grow-sm text-danger ms-3"
                    role="status">
                    <span class="visually-hidden">Retrying...</span>
                </div>
            </div>

            <!-- Seed Phrase Backup Reminder -->
            <div v-if="showSeedReminder && !firestoreError"
                class="alert alert-warning border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap">
                <div>
                    <i class="bi bi-shield-exclamation me-2"></i>
                    <strong class="font-monospace text-uppercase">Security Synchronization:</strong>
                    <span class="ms-1">Your cryptographic seed phrase has not been flagged as backed up in the last 30
                        days.</span>
                </div>
                <div class="mt-2 mt-md-0">
                    <button @click="handleSeedReminderAction(false)"
                        class="btn btn-sm btn-link text-dark text-decoration-none me-2 tiny font-monospace text-uppercase">Remind
                        Later</button>
                    <button @click="handleSeedReminderAction(true)"
                        class="btn btn-sm btn-warning fw-bold tiny font-monospace text-uppercase shadow-sm">I Have
                        Secured My Key</button>
                </div>
            </div>

            <!-- Global Purge Active Display -->
            <div v-if="isGlobalPurgeActive" class="alert alert-danger shadow-sm border-0 mb-4">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <span>CRITICAL: GLOBAL PURGE ACTIVE. System integrity compromised.</span>
            </div>

            <!-- Geolocation Error Display -->
            <div v-if="geolocationError" class="alert alert-danger shadow-sm border-0 mb-4">
                <i class="bi bi-geo-alt-fill me-2"></i>
                <span>Spatial Data Error: {{ geolocationError }}</span>
            </div>

            <div v-else>
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
                    <h1 class="h4 mb-0 font-monospace text-uppercase text-light" style="letter-spacing: 2px;">Entity
                        Dashboard</h1>
                    <div class="d-flex align-items-center gap-3">
                        <button @click="showRebootConfirmation = true"
                            class="btn btn-outline-danger btn-sm font-monospace tiny text-uppercase"
                            :class="{ 'pulse-critical-reboot': systemFriction > 0.25 }" :disabled="isGlobalPurgeActive">
                            [System Reboot]
                        </button>
                        <span class="badge bg-warning text-dark font-monospace px-3 py-2 shadow-sm"
                            style="letter-spacing: 1px;">
                            RANK: {{ persistenceRank }}
                        </span>
                    </div>
                </div>

                <div class="row">
                    <!-- Profile Card -->
                    <div class="col-md-4 mb-4">
                        <IopicEnergyMonitor />
                        <IopicKernelLog class="mb-4" />
                        <div class="card shadow-sm border-0 bg-dark text-white velocity-card"
                            :class="{ 'high-velocity': ioLoad > 0.7, 'resyncing-substrate': isResyncing }">
                            <div class="card-body text-center">
                                <div class="mb-3">
                                    <div class="rounded-circle bg-primary d-inline-block p-3 mb-2">
                                        <i class="bi bi-person-fill fs-1"></i>
                                    </div>
                                    <h4 class="mb-0">{{ user?.displayName || 'IO Entity' }}</h4>
                                    <small class="text-secondary">{{ user?.email }}</small>
                                </div>
                                <hr class="border-secondary" />
                                <div class="d-flex justify-content-between px-3">
                                    <span>Status</span>
                                    <span class="badge bg-success">{{ profile?.status || 'Active' }}</span>
                                </div>
                                <div class="d-flex justify-content-between px-3 mt-2">
                                    <span>IO Level</span>
                                    <span class="text-info fw-bold">{{ profile?.level || 'Member' }}</span>
                                </div>
                                <div class="d-flex justify-content-between px-3 mt-2">
                                    <span>Persistence</span>
                                    <span class="text-warning fw-bold">{{ persistenceScore }} <small
                                            class="text-uppercase opacity-75">[{{ persistenceRank }}]</small></span>
                                </div>
                                <CTooltip :content="persistenceTooltip" placement="top">
                                    <div class="px-3 mt-1 mb-2">
                                        <div class="progress bg-secondary" style="height: 2px;">
                                            <div class="progress-bar bg-warning transition-all"
                                                :style="{ width: persistenceProgress + '%' }"></div>
                                        </div>
                                    </div>
                                </CTooltip>
                                <!-- System Velocity Indicator (V) -->
                                <div class="px-3 mt-3">
                                    <div class="d-flex justify-content-between small text-secondary mb-1">
                                        <span>Fabric Velocity (V)</span>
                                        <span>{{ Math.round(ioLoad * 100) }}%</span>
                                    </div>
                                    <div class="progress bg-secondary" style="height: 4px;">
                                        <div class="progress-bar velocity-bar" :style="{ width: (ioLoad * 100) + '%' }">
                                        </div>
                                    </div>
                                </div>
                                <hr class="border-secondary" />
                                <div class="mt-3 px-3">
                                    <label class="form-label small text-secondary d-block text-start">Update Display
                                        Name</label>
                                    <form @submit.prevent="handleUpdateName" class="input-group input-group-sm">
                                        <input v-model="newDisplayName" type="text"
                                            class="form-control bg-dark text-white border-secondary"
                                            placeholder="New name...">
                                        <button type="submit" class="btn btn-primary"
                                            :disabled="isUpdating || newDisplayName === user?.displayName">
                                            <span v-if="isUpdating" class="spinner-border spinner-border-sm"></span>
                                            <span v-else>Save</span>
                                        </button>
                                    </form>
                                </div>
                                <div class="mt-3 px-3 text-start">
                                    <label
                                        class="form-label small text-secondary d-flex justify-content-between align-items-center">
                                        System Audio
                                        <AudioStatusBadge />
                                    </label>
                                    <div class="d-flex align-items-center gap-2">
                                        <button type="button" class="btn btn-sm p-0 text-secondary"
                                            @click="isMuted = !isMuted" :title="isMuted ? 'Unmute' : 'Mute'">
                                            <i
                                                :class="['bi', isMuted ? 'bi-volume-mute-fill text-danger' : 'bi-volume-up-fill']"></i>
                                        </button>
                                        <input v-model.number="masterVolume" type="range" class="form-range" min="0"
                                            max="1" step="0.01" :disabled="isMuted">
                                    </div>
                                </div>
                                <hr class="border-secondary" />
                                <div class="mt-3 px-3">
                                    <button
                                        class="btn btn-sm btn-outline-warning w-100 font-monospace tiny text-uppercase"
                                        @click="showViewSeedModal = true">
                                        <i class="bi bi-key-fill me-1"></i> View Recovery Seed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Activity/Stats Card -->
                    <div class="col-md-8">
                        <div class="card shadow-sm border-0 h-100">
                            <div class="card-header bg-white">
                                <ul class="nav nav-tabs card-header-tabs">
                                    <li class="nav-item">
                                        <button class="nav-link border-0 bg-transparent"
                                            :class="{ active: activeTab === 'contributions' }"
                                            @click="activeTab = 'contributions'">
                                            Contributions
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link border-0 bg-transparent d-flex align-items-center"
                                            :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
                                            Assigned Orders
                                            <span v-if="assignedBonds.length > 0" class="badge bg-primary ms-2">{{
                                                assignedBonds.length }}</span>
                                        </button>
                                    </li>
                                    <li class="nav-item">
                                        <button class="nav-link border-0 bg-transparent"
                                            :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
                                            Rank History
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <div v-if="activeTab === 'contributions'">
                                    <p v-if="myInvites.length === 0" class="text-muted italic">
                                        Establish any outbound IO connections here.
                                    </p>
                                    <div v-else class="table-responsive">
                                        <table class="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Entity Name</th>
                                                    <th>Level</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="invite in myInvites" :key="invite.id">
                                                    <td>{{ invite.name }}</td>
                                                    <td>
                                                        <span class="badge bg-light text-dark border">{{ invite.level
                                                        }}</span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            :class="invite.status === 'Active' ? 'text-success' : 'text-warning'">
                                                            ● {{ invite.status }}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div v-else-if="activeTab === 'orders'">
                                    <p v-if="assignedBonds.length === 0" class="text-muted italic">
                                        No IO bonds have been assigned to your node yet.
                                    </p>
                                    <div v-else class="table-responsive">
                                        <table class="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Value</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="bond in assignedBonds" :key="bond.id">
                                                    <td>
                                                        <div class="fw-bold">{{ bond.payload.description }}</div>
                                                        <div class="mt-1">
                                                            <span v-for="item in bond.payload.items" :key="item.id"
                                                                class="badge bg-secondary me-1"
                                                                style="font-size: 0.6rem;">{{ item.name
                                                                }}</span>
                                                        </div>
                                                        <!-- IDEAL IO Audit Data -->
                                                        <div v-if="bond.verificationData"
                                                            class="mt-2 p-2 bg-light border rounded shadow-none"
                                                            style="border-style: dashed !important;">
                                                            <div class="text-uppercase font-monospace text-muted"
                                                                style="font-size: 0.6rem;">// IDEAL IO Verification
                                                                Proof:
                                                            </div>
                                                            <div class="font-monospace text-dark"
                                                                style="font-size: 0.7rem;">
                                                                LOC: {{ bond.verificationData.coordinates.lat.toFixed(4)
                                                                }},
                                                                {{ bond.verificationData.coordinates.lon.toFixed(4)
                                                                }}<br />
                                                                DIST: {{
                                                                    bond.verificationData.distanceMeters?.toFixed(1)
                                                                }}m<br />
                                                                SYNC: {{ new
                                                                    Date(bond.verificationData.verifiedAt).toLocaleString()
                                                                }}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{{ bond.payload.totalValue }} {{ bond.payload.currency }}</td>
                                                    <td>
                                                        <span class="badge" :class="{
                                                            'bg-success': bond.status === 'LOCKED',
                                                            'bg-warning text-dark': bond.status === 'SYNCING',
                                                            'bg-danger': bond.status === 'DISRUPTED',
                                                            'bg-secondary': bond.status === 'INIT',
                                                            'bg-info': bond.status === 'FULFILLED'
                                                        }">{{ bond.status }}</span>
                                                    </td>
                                                    <td>
                                                        <button v-if="bond.status === 'LOCKED'"
                                                            class="btn btn-sm btn-outline-info"
                                                            @click="openFulfillModal(bond.id!)">
                                                            Mark Fulfilled
                                                        </button>
                                                        <button v-else-if="bond.status === 'FULFILLED'"
                                                            class="btn btn-sm btn-outline-secondary"
                                                            @click="exportAuditProof(bond)"
                                                            title="Download Signed Proof">
                                                            <i class="bi bi-shield-check me-1"></i> Export
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div v-else-if="activeTab === 'history'">
                                    <p v-if="rankHistory.length === 0" class="text-muted italic">
                                        No rank transitions recorded in the current substrate cycle.
                                    </p>
                                    <div v-else>
                                        <div class="d-flex justify-content-end mb-3">
                                            <button class="btn btn-sm btn-outline-danger" @click="clearRankHistory">
                                                <i class="bi bi-trash-fill me-1"></i> Clear History
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Rank Achieved</th>
                                                        <th>Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(entry, idx) in rankHistory" :key="idx">
                                                        <td>
                                                            <span class="badge bg-warning text-dark font-monospace">{{
                                                                entry.rank }}</span>
                                                        </td>
                                                        <td class="font-monospace small text-secondary">
                                                            {{ new Date(entry.timestamp).toLocaleString() }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Secure Mnemonic View Modal -->
        <CModal :visible="showViewSeedModal" @close="closeViewSeedModal" alignment="center" backdrop="static">
            <CModalHeader class="bg-dark border-secondary">
                <CModalTitle class="text-warning font-monospace text-uppercase small">Identity Recovery Protocol
                </CModalTitle>
            </CModalHeader>
            <CModalBody class="bg-dark text-light p-4">
                <div v-if="!revealedMnemonic">
                    <p class="small opacity-75 mb-3 text-center">Re-displaying the 12-word mnemonic requires
                        high-fidelity verification. Enter your IO access code.</p>
                    <div v-if="viewSeedError" class="alert alert-danger py-2 small border-0 mb-3 font-monospace">{{
                        viewSeedError }}</div>
                    <input v-model="viewSeedPassword" type="password"
                        class="form-control bg-black text-white border-secondary mb-3" placeholder="Access Code"
                        @keyup.enter="handleVerifyAndShowSeed">
                    <button class="btn btn-warning w-100 fw-bold py-2 text-uppercase" @click="handleVerifyAndShowSeed"
                        :disabled="isVerifyingSeed || !viewSeedPassword">
                        <span v-if="isVerifyingSeed" class="spinner-border spinner-border-sm me-2"></span>
                        Verify Logical Truth
                    </button>
                </div>
                <div v-else>
                    <div class="alert alert-danger py-2 small border-0 mb-4 text-center">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Symmetry Breach Warning:</strong> Never share these words.
                    </div>
                    <div class="p-3 bg-black rounded border border-warning border-opacity-50 mb-4">
                        <div class="row g-2">
                            <div v-for="(word, index) in revealedMnemonic.split(' ')" :key="index" class="col-4">
                                <div
                                    class="p-2 bg-dark rounded text-center small font-monospace border border-secondary border-opacity-25">
                                    <span class="text-secondary me-1">{{ index + 1 }}.</span> {{ word }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-outline-light w-100 fw-bold py-2 text-uppercase" @click="closeViewSeedModal">
                        Purge Secure View
                    </button>
                </div>
            </CModalBody>
            <CModalFooter class="bg-dark border-top-0 pt-0 pb-3 justify-content-center">
                <div class="tiny font-monospace opacity-50">BUS: SECURE CHANNEL T-13</div>
            </CModalFooter>
        </CModal>

        <!-- System Reboot Confirmation Modal -->
        <CModal :visible="showRebootConfirmation" @close="showRebootConfirmation = false" alignment="center"
            backdrop="static">
            <CModalHeader class="bg-dark border-danger">
                <CModalTitle class="text-danger font-monospace text-uppercase small">Substrate Reboot Protocol
                </CModalTitle>
            </CModalHeader>
            <CModalBody class="bg-dark text-light p-4 position-relative overflow-hidden">
                <div class="reboot-scanline" aria-hidden="true"></div>
                <div class="text-center mb-4">
                    <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
                </div>
                <p class="small opacity-75 text-center mb-3">
                    Warning: A manual reboot will initiate a full global purge of the substrate.
                    All unanchored logic and kernel logs will be deleted.
                </p>
                <p class="tiny text-warning font-monospace text-uppercase text-center">
                    Are you sure you want to proceed with the synchronization reset?
                </p>
                <div class="mt-4">
                    <label class="tiny font-monospace text-uppercase opacity-50 d-block mb-2 text-center">Type 'PURGE'
                        to confirm:</label>
                    <input v-model="rebootConfirmCode" type="text"
                        class="form-control text-danger border-danger text-center font-monospace shadow-none reboot-confirm-input"
                        placeholder="......" />
                </div>
            </CModalBody>
            <CModalFooter class="bg-dark border-top border-secondary border-opacity-25 py-3 justify-content-center">
                <button class="btn btn-sm btn-outline-light font-monospace tiny text-uppercase px-3"
                    @click="showRebootConfirmation = false">
                    Cancel
                </button>
                <button class="btn btn-sm btn-danger font-monospace tiny text-uppercase px-3 fw-bold"
                    @click="handleConfirmReboot" :disabled="rebootConfirmCode !== 'PURGE'">
                    Confirm Purge
                </button>
            </CModalFooter>
        </CModal>

        <ProtocolFooter />
    </div>
</template>

<style scoped>
.velocity-card {
    transition: box-shadow 0.5s ease;
    /* Shadow intensity scales with contribution/load */
    box-shadow: 0 4px 12px rgba(0, 123, 255, calc(0.1 + var(--io-velocity) * 0.3)) !important;
}

.high-velocity {
    animation: velocity-pulse 2s infinite ease-in-out;
}

.velocity-bar {
    background-color: #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, var(--io-velocity));
    transition: width 0.5s ease, box-shadow 0.5s ease;
}

@keyframes velocity-pulse {

    0%,
    100% {
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    }

    50% {
        box-shadow: 0 4px 20px rgba(0, 123, 255, 0.8);
    }
}

.dashboard-page {
    /* Subtle atmospheric glow based on system velocity */
    background: radial-gradient(circle at top right, rgba(0, 123, 255, calc(var(--io-velocity) * 0.05)), transparent);
}

.resyncing-substrate {
    animation: resync-flicker 0.2s infinite ease-in-out;
    border: 1px solid #00ff41 !important;
    /* Logic Green border during resync */
    box-shadow: 0 0 15px rgba(0, 255, 65, 0.3) !important;
}

@keyframes resync-flicker {

    0%,
    100% {
        opacity: 1;
        filter: brightness(1);
    }

    50% {
        opacity: 0.85;
        filter: brightness(1.2);
    }
}

.shake-animation {
    animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
}

@keyframes shake {

    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

.eternal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, rgba(0, 123, 255, 0.15) 0%, black 100%);
    z-index: 99999;
    backdrop-filter: blur(15px);
    color: #007bff;
    text-align: center;
}

.eternal-title {
    font-size: clamp(2rem, 10vw, 5rem);
    font-weight: 900;
    letter-spacing: 0.8rem;
    text-shadow: 0 0 30px rgba(0, 123, 255, 0.8);
}

.eternal-subtitle {
    letter-spacing: 0.4rem;
    opacity: 0.9;
    border-top: 1px solid rgba(0, 123, 255, 0.4);
    padding-top: 1.5rem;
}

.eternal-scanline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom,
            transparent 0%,
            rgba(0, 123, 255, 0.05) 50%,
            transparent 100%);
    background-size: 100% 4px;
    pointer-events: none;
    animation: scanline-scroll 10s linear infinite;
}

@keyframes scanline-scroll {
    0% {
        background-position: 0 0;
    }

    100% {
        background-position: 0 100%;
    }
}

.eternal-fade-enter-active,
.eternal-fade-leave-active {
    transition: opacity 1.2s ease;
}

.eternal-fade-enter-from,
.eternal-fade-leave-to {
    opacity: 0;
}

.glitch {
    position: relative;
    display: inline-block;
}

.glitch::before,
.glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
}

.glitch::before {
    color: #0ff;
    z-index: -1;
    animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
}

.glitch::after {
    color: #f0f;
    z-index: -2;
    animation: glitch-anim 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both infinite;
}

@keyframes glitch-anim {
    0% {
        transform: translate(0);
    }

    20% {
        transform: translate(-2px, 2px);
    }

    40% {
        transform: translate(-2px, -2px);
    }

    60% {
        transform: translate(2px, 2px);
    }

    80% {
        transform: translate(2px, -2px);
    }

    100% {
        transform: translate(0);
    }
}

.pulse-critical-reboot {
    animation: critical-reboot-pulse 0.8s infinite alternate ease-in-out;
    border-color: #ff0000 !important;
    color: #ff0000 !important;
}

@keyframes critical-reboot-pulse {
    from {
        box-shadow: 0 0 5px rgba(255, 0, 0, 0.4);
        transform: scale(1);
    }

    to {
        box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
        transform: scale(1.05);
        background-color: rgba(220, 53, 69, 0.2);
    }
}

.reboot-scanline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom,
            transparent 0%,
            rgba(255, 0, 0, 0.1) 50%,
            transparent 100%);
    background-size: 100% 8px;
    pointer-events: none;
    z-index: 0;
    animation: reboot-scanline-scroll 0.15s linear infinite;
    opacity: 0.6;
}

@keyframes reboot-scanline-scroll {
    from {
        background-position: 0 0;
    }

    to {
        background-position: 0 100%;
    }
}

.reboot-confirm-input {
    background-color: #000;
    animation: reboot-input-pulse 0.15s infinite ease-in-out alternate;
}

@keyframes reboot-input-pulse {
    from {
        background-color: #000;
    }

    to {
        background-color: rgba(255, 0, 0, 0.2);
    }
}
</style>