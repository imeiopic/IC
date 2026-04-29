<template>
    <footer class="bg-dark text-light py-5 mt-auto border-top border-secondary">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold text-primary mb-3">IOPIC PROTOCOL</h5>
                    <p class="small opacity-75">
                        The architectural substrate for transitioning Instances into Entities.
                        Verification via the 16-thread bridge protocol.
                    </p>
                    <div v-if="!user" class="alert alert-warning py-1 px-2 mt-3 small text-dark border-0 shadow-sm"
                        role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> Guest Mode Active
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">Protocol Links</h5>
                    <ul class="list-unstyled footer-links">
                        <li><router-link to="/manifesto">The Manifesto</router-link></li>
                        <li><router-link to="/logical-truth">Logical Truth (iiii)</router-link></li>
                        <li><router-link to="/boot">Boot Sequence</router-link></li>
                        <li v-if="user">
                            <CTooltip content="Cryptographically validate the integrity of exported JSON proofs."
                                placement="top">
                                <router-link to="/verify-proof">Verify Logical Proof</router-link>
                            </CTooltip>
                        </li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4 text-md-end">
                    <h5 class="fw-bold mb-3">System Status</h5>
                    <div class="small opacity-75">
                        <p class="mb-1">
                            <span
                                :class="['status-dot', isOnline ? 'text-success' : 'text-danger status-pulse']">●</span>
                            Backbone Symmetry: {{ isOnline ? 'OK' : 'DISRUPTED' }}
                        </p>
                        <p class="mb-1">
                            <span
                                :class="['status-dot', isSynced ? 'text-success' : 'text-warning status-pulse']">●</span>
                            Temporal Logic: {{ isGlobalPurgeActive ? 'PURGE ACTIVE' : (isSynced ? 'LOCKED' : 'SYNCING')
                            }}
                            <span class="ms-1 font-monospace tiny opacity-50">[{{ busActivity }}/16]</span>
                            <!-- Thread Activity Visualizer -->
                            <span class="thread-activity ms-2 d-inline-flex gap-1" :key="busActivity">
                                <CTooltip v-for="(locked, index) in busThreads" :key="index"
                                    :content="`T-${(index + 1).toString().padStart(2, '0')}: ${manifestoThreads[index]}`"
                                    placement="top">
                                    <span class="thread-bar pulse" :class="{ 'locked': locked }"
                                        :style="{ animationDelay: (index * 0.02) + 's' }">
                                    </span>
                                </CTooltip>
                            </span>
                        </p>
                        <p class="mb-0">
                            <span
                                :class="['status-dot', user ? 'text-primary' : 'text-secondary status-pulse']">●</span>
                            Entities: {{ user ? 'ACTIVE' : 'STANDBY' }} ({{ activeEntityCount }} synchronized)
                        </p>
                        <p v-if="isGlobalPurgeActive" class="mb-0 text-danger fw-bold font-monospace tiny mt-2">
                            <span class="status-dot text-danger status-pulse">●</span>
                            GLOBAL PURGE ACTIVE
                        </p>

                        <!-- IOPIC System Fault Classifications -->
                        <div v-if="globalError" class="mt-3 pt-2 border-top border-secondary">
                            <p class="text-danger fw-bold font-monospace mb-2" style="font-size: 0.7rem;">// SUBSTRATE
                                FAULTS DETECTED</p>
                            <div v-for="fault in SYSTEM_FAULTS" :key="fault.classification"
                                class="mb-1 font-monospace opacity-100" style="font-size: 0.65rem;">
                                <span class="text-danger status-pulse">●</span>
                                {{ fault.classification }}: <span class="text-white">{{ fault.state }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr class="border-secondary my-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 small opacity-50">
                <span>&copy; 2024 IOPIC Digital Reality</span>
                <div class="social-links d-flex gap-3">
                    <a href="#" target="_blank" rel="noopener" class="text-light" title="X (Twitter)"><i
                            class="bi bi-twitter-x"></i></a>
                    <a href="#" target="_blank" rel="noopener" class="text-light" title="GitHub"><i
                            class="bi bi-github"></i></a>
                    <a href="#" target="_blank" rel="noopener" class="text-light" title="Discord"><i
                            class="bi bi-discord"></i></a>
                </div>
                <span class="font-monospace">I = VR²</span>
            </div>
        </div>

        <!-- Back to Top Button -->
        <Transition name="fade">
            <div v-if="showScrollTop" @click="scrollToTop" class="back-to-top-container" title="Return to Top">
                <svg class="progress-ring" width="54" height="54">
                    <circle class="progress-ring__circle" stroke="#007bff" stroke-width="3" fill="transparent" r="24"
                        cx="27" cy="27" :style="{ strokeDashoffset: strokeDashoffset }" />
                </svg>
                <button class="back-to-top btn btn-primary shadow-lg" :class="{ 'rotate-360': isRotating }">
                    <img :src="ioLogo" alt="Back to Top" width="24" height="24" class="back-to-top-icon">
                </button>
            </div>
        </Transition>
    </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../useAuth';
import { useError } from '../useError';
import ioLogo from '../assets/io.svg';
import { CTooltip } from '@coreui/vue';
import { useSystemBus } from './useSystemBus'; // Import the new composable

const { user } = useAuth(); // Assuming user is also reactive from useAuth
const { globalError } = useError();
const activeEntityCount = ref(0);
const showScrollTop = ref(false);
const scrollProgress = ref(0);
const isRotating = ref(false);
const { isOnline, isSynced, setSyncing, isGlobalPurgeActive, busActivity, busThreads, manifestoThreads } = useSystemBus(); // Use the composable

const SYSTEM_FAULTS = [
    { classification: 'LOGIC STARVATION', state: 'NODE DISCONNECTION' },
    { classification: 'HARDWARE OVERHEAT', state: 'THREAD 13 FAILURE' },
    { classification: 'DATA NOISE', state: 'SYSTEM HALLUCINATION' },
    { classification: 'SYMMETRY BREACH', state: 'PERMANENT GROUND FAULT' }
];

const circumference = 2 * Math.PI * 24; // r=24

const handleScroll = () => {
    showScrollTop.value = window.scrollY > 300;

    const winScroll = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.value = height > 0 ? (winScroll / height) * 100 : 0;
};

const strokeDashoffset = computed(() => {
    return circumference - (scrollProgress.value / 100) * circumference;
});

const scrollToTop = () => {
    isRotating.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset the rotation state after the animation duration (600ms)
    setTimeout(() => {
        isRotating.value = false;
    }, 600);
};

let unsubscribeEntities: () => void;

onMounted(() => {
    window.addEventListener('scroll', handleScroll);

    // onSnapshotsInSync fires when all active listeners have caught up with the server.
    // It serves as a reliable proxy for the Firestore connection health.
    // Real-time listener for active entity count
    const q = query(collection(db, 'invitees'), where('status', '==', 'Active'));
    unsubscribeEntities = onSnapshot(q, (snapshot) => {
        setSyncing(); // Transition to SYNCING state before processing the snapshot
        activeEntityCount.value = snapshot.size;
    });
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    if (unsubscribeEntities) unsubscribeEntities();
});
</script>

<style scoped>
.footer-links li {
    margin-bottom: 0.5rem;
}

.footer-links a {
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
    transition: color 0.2s;
}

.footer-links a:hover {
    color: #007bff;
}

.social-links a {
    opacity: 0.7;
    transition: all 0.2s ease-in-out;
    font-size: 1.1rem;
}

.social-links a:hover {
    opacity: 1;
    transform: translateY(-2px);
    color: #007bff !important;
}

.status-dot {
    display: inline-block;
    margin-right: 4px;
    transition: all 0.3s ease;
}

.status-pulse {
    animation: status-pulse-keyframes 2s infinite ease-in-out;
}

@keyframes status-pulse-keyframes {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(1.3);
    }
}

.back-to-top-container {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 2000;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.progress-ring {
    position: absolute;
    transform: rotate(-90deg);
    pointer-events: none;
}

.progress-ring__circle {
    transition: stroke-dashoffset 0.1s linear;
    stroke-dasharray: 150.8;
    /* 2 * PI * 24 */
    filter: drop-shadow(0 0 5px rgba(0, 123, 255, 0.5));
}

.back-to-top {
    position: relative;
    bottom: 0;
    right: 0;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background-color 0.2s;
    box-shadow: 0 0 15px rgba(0, 123, 255, 0.4) !important;
}

.rotate-360 {
    animation: rotate-once 0.6s ease-in-out;
}

@keyframes rotate-once {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.back-to-top:hover {
    transform: translateY(-5px);
    background-color: #0056b3;
}

.back-to-top-icon {
    filter: brightness(0) invert(1);
    /* Ensures the logo is white on the blue button */
    transition: transform 0.3s ease, filter 0.3s ease;
}

.back-to-top:hover .back-to-top-icon {
    transform: scale(1.1);
    filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<style>
/* Global override for Tooltips to match the Protocol aesthetic */
.tooltip .tooltip-inner {
    background-color: #007bff !important;
    color: #fff !important;
    font-family: inherit;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
}

.tooltip .tooltip-arrow::before {
    border-top-color: #007bff !important;
    /* Matches 'top' placement */
    border-bottom-color: #007bff !important;
    /* Matches 'bottom' placement */
}

.thread-activity {
    height: 10px;
    align-items: center;
}

.thread-bar {
    width: 2px;
    height: 6px;
    background: rgba(0, 255, 65, 0.15);
    transition: all 0.2s;
}

.thread-bar.locked {
    background: #00ff41;
    box-shadow: 0 0 4px #00ff41;
}

.thread-bar.pulse {
    animation: thread-pulse-kf 0.4s ease-out;
}

@keyframes thread-pulse-kf {
    0% {
        background: #00ff41;
        transform: scaleY(1.6);
        box-shadow: 0 0 8px #00ff41;
    }

    100% {
        background: rgba(0, 255, 65, 0.15);
        transform: scaleY(1);
    }
}
</style>