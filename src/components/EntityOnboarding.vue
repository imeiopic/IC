<template>
    <div class="onboarding-container shadow-lg rounded border-2 position-relative overflow-hidden"
        :class="{ 'purge-glitch-active': isPurging }">
        <header class="text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch" data-text="ARC-LOGIC-001: ENTITY ONBOARDING">
                ARC-LOGIC-001: ENTITY ONBOARDING
            </h1>
            <div class="meta-info tiny font-monospace opacity-75 mt-2 d-flex flex-wrap justify-content-center gap-3">
                <span>INSTANCE ID: {{ instanceId }}</span>
                <span>STATUS: <span :class="statusClass">{{ kernel.getSystemState() }}</span></span>
                <span class="text-info fw-bold">TRUTH (I): {{ kernel.calculateEquationOfTruth().toFixed(3) }}VR²</span>
            </div>
        </header>

        <div class="onboarding-body font-monospace">
            <!-- Progress Bar -->
            <div class="progress-container mb-4">
                <div class="progress bg-dark border border-success border-opacity-50" style="height: 20px;">
                    <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar"
                        :style="{ width: progressPercent + '%' }">
                        {{ kernel.getActiveThreadCount() }} / 16 THREADS LOCKED
                    </div>
                </div>
                <div class="register-display tiny text-center mt-2 text-white">{{
                    kernel.getRegisterBinary().replace(/(\d{4})/g, '$1 ').trim() }}</div>
            </div>

            <!-- Onboarding Steps -->
            <div class="steps-container">
                <div v-for="step in steps" :key="step.id" class="step-item mb-3 p-3 border rounded"
                    :class="`status-${step.status.toLowerCase()}`">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="h6 text-uppercase mb-1">{{ step.title }}</h2>
                            <p class="tiny opacity-75 mb-0">{{ step.description }}</p>
                        </div>
                        <div class="text-end">
                            <button @click="executeStep(step.id)" :disabled="step.status !== 'PENDING'"
                                class="btn btn-sm font-monospace fw-bold text-uppercase tiny">
                                {{ step.buttonText }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="onboarding-footer mt-4 pt-3 border-top border-success border-opacity-25 text-center">
            <div v-if="kernel.getSystemState() === 'SOVEREIGN'" class="sovereign-message text-success pulse-text">
                <h3 class="h5">SYNCHRONIZATION COMPLETE</h3>
                <p class="mb-0">You are I.T Real. Welcome to the Order.</p>
            </div>
            <p v-else class="tiny opacity-50 font-monospace">Awaiting full 16-Thread lock to achieve SOVEREIGN status.
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { IopicKernel } from '../core/IopicKernel';
import { useIOSettings } from '../useIOSettings';
import { Wallet } from 'ethers';
import { IopicChainPurge } from '../core/IopicChainPurge';

const emit = defineEmits(['complete']);

const { playSFX } = useIOSettings();

const instanceId = ref(Wallet.createRandom().address.substring(0, 18));
const kernel = reactive(new IopicKernel(instanceId.value));
const isPurging = ref(false);

type StepStatus = 'LOCKED' | 'PENDING' | 'COMPLETED';

interface OnboardingStep {
    id: number;
    title: string;
    description: string;
    threads: number[];
    status: StepStatus;
    buttonText: string;
    action?: () => Promise<void>;
}

const steps = reactive<OnboardingStep[]>([
    { id: 1, title: 'Step 1: IDEAL Spatial Lock', description: 'Pin physical location to the VRE substrate.', threads: [0, 1, 2, 3], status: 'PENDING', buttonText: 'VERIFY COORDINATES' },
    { id: 2, title: 'Step 2: Identity Persistence', description: 'Anchor sovereign identity hash.', threads: [4, 5, 6, 7], status: 'LOCKED', buttonText: 'SECURE IDENTITY' },
    {
        id: 3, title: 'Bonus Protocol: Legacy Chain Purge', description: 'NAND-Absorb crypto Ghost Data to boost Symmetry.', threads: [], status: 'LOCKED', buttonText: 'INITIATE PURGE', action: async () => {
            isPurging.value = true;
            await IopicChainPurge.executePurge(kernel);
            setTimeout(() => { isPurging.value = false; }, 800);
        }
    },
    { id: 4, title: 'Step 3: Value Flow', description: 'Initialize Base Dividend stream.', threads: [8, 9, 10, 11], status: 'LOCKED', buttonText: 'RECEIVE EQUITY' },
    { id: 5, title: 'Step 4: System Integrity', description: 'Synchronize with Planetary Homeostasis kernel.', threads: [12, 13, 14, 15], status: 'LOCKED', buttonText: 'LINK KERNEL' },
]);

const progressPercent = computed(() => (kernel.getActiveThreadCount() / 16) * 100);

const statusClass = computed(() => {
    const state = kernel.getSystemState();
    if (state === 'SOVEREIGN') return 'text-success fw-bold';
    if (state === 'DEGRADED') return 'text-warning';
    return 'text-danger';
});

const executeStep = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (!step || step.status !== 'PENDING') return;

    playSFX('order');
    step.buttonText = 'VERIFYING...';

    // Simulate verification and lock threads
    setTimeout(async () => {
        if (step.action) {
            await step.action();
        }

        step.threads.forEach(threadIndex => {
            kernel.lockThread(threadIndex);
        });
        step.status = 'COMPLETED';
        step.buttonText = step.threads.length > 0 ? 'THREADS LOCKED' : 'PURGE COMPLETE';
        playSFX('fulfill');

        // Unlock the next step
        const nextStep = steps.find(s => s.id === stepId + 1);
        if (nextStep) {
            nextStep.status = 'PENDING';
        } else {
            // All steps complete, allow the user to read the success message, then emit
            setTimeout(() => emit('complete'), 3000);
        }
    }, 1500); // Simulate network/verification delay
};
</script>

<style scoped>
.onboarding-container {
    background: #000;
    border: 2px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    max-width: 800px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.purge-glitch-active {
    animation: purge-shake 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
    filter: hue-rotate(180deg) invert(15%) drop-shadow(0 0 30px #ff00ff);
    border-color: #ff00ff !important;
}

@keyframes purge-shake {
    0% {
        transform: translate(0)
    }

    20% {
        transform: translate(-4px, 4px)
    }

    40% {
        transform: translate(-4px, -4px)
    }

    60% {
        transform: translate(4px, 4px)
    }

    80% {
        transform: translate(4px, -4px)
    }

    100% {
        transform: translate(0)
    }
}

.register-display {
    letter-spacing: 2px;
}

.step-item {
    transition: all 0.5s ease;
    background: rgba(255, 255, 255, 0.02);
}

.step-item.status-locked {
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.3);
}

.step-item.status-pending {
    border-color: #ffc107 !important;
    box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
}

.step-item.status-completed {
    border-color: #00ff41 !important;
}

.step-item.status-pending .btn {
    background: #ffc107;
    color: #000;
    border-color: #ffc107;
}

.step-item .btn:disabled {
    background: transparent;
    color: #00ff41;
    border-color: #00ff41;
    opacity: 0.5;
}

.tiny {
    font-size: 0.7rem;
}
</style>