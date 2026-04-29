<template>
    <div class="invest-page d-flex flex-column min-vh-100 bg-black text-light"
        :class="{ 'degauss-effect': isDegaussing }">
        <div class="vignette-overlay"></div>

        <main class="flex-grow-1 container py-5">
            <header class="mb-5 text-center">
                <h2 class="fw-bold text-primary font-monospace chromatic-text">// IOWB INVESTMENT MATRIX //
                    ARC-LOGIC-020</h2>
                <p class="text-muted small">VELOCITY CONTRIBUTION PROTOCOL ACTIVE</p>
            </header>

            <!-- Global System Velocity Monitor -->
            <div class="card bg-dark border-info mb-5 shadow-lg overflow-hidden vsys-monitor" data-coreui-theme="dark">
                <div class="card-header border-info bg-transparent py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 font-monospace text-info">// PLANETARY VELOCITY MONITOR (V_sys)</h5>
                        <div class="text-info font-monospace h4 mb-0">{{ currentVsys.toFixed(2) }} V</div>
                    </div>
                </div>
                <div class="card-body p-0 position-relative">
                    <svg viewBox="0 0 1000 150" class="vsys-graph" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="vsysGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.2);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(0, 212, 255, 0);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path :d="'M ' + vsysPoints + ' L 1000 150 L 0 150 Z'" fill="url(#vsysGradient)" />
                        <polyline fill="none" stroke="#00d4ff" stroke-width="2" :points="vsysPoints" />
                    </svg>
                    <div class="vsys-grid"></div>
                </div>
                <div class="card-footer bg-transparent border-info py-2">
                    <div class="small font-monospace text-muted text-uppercase">
                        <span class="text-success">●</span> Collective Acceleration Factor: +{{ ((totalStaked / 1000) *
                            0.12).toFixed(2) }}% Surge
                    </div>
                </div>
            </div>

            <!-- Account Symmetry Status -->
            <div class="row g-4 mb-5">
                <div class="col-lg-3 col-md-6">
                    <div class="card bg-dark border-secondary h-100 shadow-sm">
                        <div class="card-body">
                            <div class="small font-monospace text-secondary text-uppercase mb-1">Flow Balance (Liquid)
                            </div>
                            <div class="h3 mb-0 text-white font-monospace">{{ flowBalance.toLocaleString() }} IO$</div>
                            <div class="progress mt-3 bg-black" style="height: 4px;">
                                <div class="progress-bar" :class="flowBalance < 1600 ? 'bg-danger' : 'bg-success'"
                                    :style="{ width: Math.min((flowBalance / 1600) * 100, 100) + '%' }"></div>
                            </div>
                            <div class="small mt-2" :class="flowBalance < 1600 ? 'text-danger' : 'text-muted'">
                                {{ flowBalance < 1600 ? 'CRITICAL: Below Symmetry Maintenance'
                                    : 'Symmetry Surplus: Stable' }} </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card bg-dark border-secondary h-100 shadow-sm">
                            <div class="card-body">
                                <div class="small font-monospace text-secondary text-uppercase mb-1">Staked Logic
                                    (16-Thread Matrix)</div>
                                <div class="h3 mb-0 text-primary font-monospace">{{ totalStaked.toLocaleString() }} IO$
                                </div>
                                <div class="small mt-2 text-muted">Symmetry Cap: 240,000 IO$</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card bg-dark border-secondary h-100 shadow-sm">
                            <div class="card-body">
                                <div class="small font-monospace text-secondary text-uppercase mb-1">Logic Reputation
                                    (Social Credit)</div>
                                <div class="h3 mb-0 text-info font-monospace">Sc {{ socialCredit.toFixed(2) }}x</div>
                                <div class="small mt-2 text-info">Priority Sync: Enabled</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6">
                        <div class="card bg-dark border-secondary h-100 shadow-sm">
                            <div class="card-body">
                                <div class="small font-monospace text-secondary text-uppercase mb-1">Global Buffer Fund
                                    (Shielding)</div>
                                <CTooltip
                                    content="Shields staked principal from 'Hallucination' errors, ensuring 100% coverage."
                                    placement="top">
                                    <div class="h3 mb-0 text-success font-monospace" style="cursor: help;">
                                        {{ globalBufferFund.toLocaleString() }} IO$
                                    </div>
                                </CTooltip>
                                <div class="small mt-2 text-success">Coverage: 100% Principal</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- The 16-Thread Allocation Matrix -->
                <div class="row g-4">
                    <div v-for="sector in sectors" :key="sector.name" class="col-md-6">
                        <div class="card bg-dark border-secondary h-100">
                            <div
                                class="card-header border-secondary d-flex justify-content-between align-items-center py-3">
                                <h5 class="mb-0 font-monospace text-uppercase" :style="{ color: sector.color }">{{
                                    sector.name }}</h5>
                                <span class="badge bg-black border border-secondary font-monospace">Threads {{
                                    sector.threads }}</span>
                            </div>
                            <div class="card-body">
                                <p class="small text-muted">{{ sector.description }}</p>

                                <!-- Thread Activity Visualizer -->
                                <div class="d-flex gap-1 mb-4">
                                    <div v-for="t in sector.threadCount" :key="t" class="flex-grow-1 thread-bar"
                                        :class="{ 'active-pulse': sector.staked > 0 }"
                                        :style="{ height: '12px', backgroundColor: sector.staked > 0 ? sector.color : '#222' }">
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-end">
                                    <div>
                                        <div class="small text-secondary text-uppercase mb-1">Current Power</div>
                                        <div class="h4 mb-0 font-monospace">{{ sector.staked.toLocaleString() }} IO$
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <button class="btn btn-outline-primary btn-sm font-monospace"
                                            @click="openStakeModal(sector)" :disabled="flowBalance <= 1600">
                                            ALLOCATE +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Terminal 10: Exit Symmetry -->
                <div class="mt-5 p-4 border border-info rounded bg-dark shadow-lg">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="text-info font-monospace">// TERMINAL 10: EXIT SYMMETRY</h5>
                            <p class="small text-muted mb-0">Reclaim logic-energy to flow balance. The system will
                                verify truth generation proportionality before release.</p>
                        </div>
                        <div class="col-md-4 text-md-end mt-3 mt-md-0">
                            <button class="btn btn-info text-white font-monospace fw-bold" @click="handleExitSymmetry"
                                :disabled="totalStaked === 0">
                                INITIATE ZERO-WASTE EXIT
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Transaction History Log -->
                <div class="mt-5">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="text-secondary font-monospace text-uppercase small mb-0">// Transaction History Log
                        </h5>
                        <button v-if="transactions.length > 0" @click="clearHistory"
                            class="btn btn-outline-danger btn-sm py-0 px-2 font-monospace"
                            style="font-size: 0.65rem; border-style: dashed;">
                            [ PURGE_HISTORY ]
                        </button>
                    </div>
                    <div class="card bg-dark border-secondary shadow-sm">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-dark table-hover mb-0 small font-monospace align-middle">
                                    <thead>
                                        <tr class="text-muted border-secondary">
                                            <th class="ps-3 py-3 border-secondary">TIMESTAMP</th>
                                            <th class="border-secondary">TYPE</th>
                                            <th class="border-secondary">SECTOR</th>
                                            <th class="border-secondary text-end">AMOUNT</th>
                                            <th class="pe-3 border-secondary">STATUS</th>
                                        </tr>
                                    </thead>
                                    <TransitionGroup tag="tbody" name="tx-list">
                                        <tr v-for="tx in transactions" :key="tx.id" class="border-secondary">
                                            <td class="ps-3 py-3 border-secondary text-muted">{{ tx.timestamp }}</td>
                                            <td class="border-secondary">
                                                <span
                                                    :class="tx.type === 'ALLOCATION' ? 'text-primary' : 'text-info'">{{
                                                        tx.type }}</span>
                                            </td>
                                            <td class="border-secondary text-muted">{{ tx.sector }}</td>
                                            <td class="border-secondary text-end text-white">{{
                                                tx.amount.toLocaleString() }} IO$</td>
                                            <td class="pe-3 border-secondary">
                                                <span
                                                    :class="tx.status === 'SUCCESS' || tx.status === 'TRUTH_VERIFIED' ? 'text-success' : 'text-danger'">
                                                    {{ tx.status }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr v-if="transactions.length === 0" key="empty">
                                            <td colspan="5" class="text-center py-4 text-muted italic">No protocol
                                                transmissions recorded in this session.</td>
                                        </tr>
                                    </TransitionGroup>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
        </main>

        <!-- Allocation Modal -->
        <CModal :visible="showStakeModal" @close="() => { showStakeModal = false }"
            content-class="bg-dark text-white border-secondary shadow-lg" data-coreui-theme="dark">
            <CModalHeader class="border-secondary">
                <CModalTitle class="font-monospace">
                    // ALLOCATE TO {{ selectedSector?.name }}
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <p class="small text-muted mb-4">Input amount of IO$ to stake into the 16-thread bus. This will increase
                    your Logic Reputation.</p>
                <div class="mb-3">
                    <label class="form-label small text-secondary text-uppercase font-monospace">Stake Amount
                        (IO$)</label>
                    <div class="input-group">
                        <input v-model.number="stakeAmount" type="number"
                            class="form-control bg-black text-white border-secondary" placeholder="Amount..." min="1">
                        <span class="input-group-text bg-secondary border-secondary text-white">IO$</span>
                    </div>
                </div>
                <div class="small text-info font-monospace">
                    Estimated Sc Multiplier: +{{ ((stakeAmount || 0) / 1000 * 0.05).toFixed(2) }}x
                </div>
            </CModalBody>
            <CModalFooter class="border-secondary">
                <CButton color="secondary" @click="() => { showStakeModal = false }">Cancel</CButton>
                <CButton color="primary" @click="handleStake" :disabled="!stakeAmount || stakeAmount <= 0">
                    CONFIRM ALLOCATION
                </CButton>
            </CModalFooter>
        </CModal>

        <ProtocolFooter />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import ProtocolFooter from './components/ProtocolFooter.vue';
import { useError } from './useError';
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton
} from '@coreui/vue';
import { CTooltip } from '@coreui/vue';

const { reportError } = useError();

const flowBalance = ref(12500); // Mock liquid balance
const socialCredit = ref(1.0);
const showStakeModal = ref(false);
const selectedSector = ref<any>(null);
const stakeAmount = ref(1000);
const isDegaussing = ref(false);
const globalBufferFund = ref(842500000000); // 842.5B IO$
const transactions = ref<any[]>([]);

// Audio Abstraction: Divergence Alert Sound
const divergenceSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2560/2560-preview.mp3'); // Example: "Error" or "Alarm" sound
divergenceSound.volume = 0.4;

const playDivergenceSound = () => {
    divergenceSound.currentTime = 0;
    divergenceSound.play().catch(() => { /* Handle silent browser blocks */ });
};

// Audio Abstraction: Transaction Notification Sound
const txSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3');
txSound.volume = 0.2;

const playTxSound = () => {
    txSound.currentTime = 0;
    txSound.play().catch(() => { /* Handle silent browser blocks */ });
};

// Audio Abstraction: Purge Notification Sound
const purgeSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
purgeSound.volume = 0.3;

const playPurgeSound = () => {
    purgeSound.currentTime = 0;
    purgeSound.play().catch(() => { /* Handle silent browser blocks */ });
};

// V_sys Simulation State
const vsysHistory = ref<number[]>(Array.from({ length: 40 }, (_, i) => 102400 + Math.sin(i * 0.5) * 50 + (i * 5)));

const currentVsys = computed(() => vsysHistory.value[vsysHistory.value.length - 1]);

const vsysPoints = computed(() => {
    if (vsysHistory.value.length === 0) return "";
    const min = Math.min(...vsysHistory.value) - 10;
    const max = Math.max(...vsysHistory.value) + 10;
    const range = (max - min) || 1;
    return vsysHistory.value.map((val, i) => {
        const x = (i / (vsysHistory.value.length - 1)) * 1000;
        const y = 150 - ((val - min) / range) * 150;
        return `${x},${y}`;
    }).join(" ");
});

const sectors = ref([
    {
        name: 'Biocapacity',
        threads: '13',
        threadCount: 1,
        staked: 4000,
        color: '#28a745',
        description: 'Funding carbon-to-truth conversion and planetary reforestation.',
        risk: 'REALITY_SYNCED',
        riskClass: 'border-success text-success'
    },
    {
        name: 'Information Architecture',
        threads: '5-8',
        threadCount: 4,
        staked: 2500,
        color: '#007bff',
        description: 'Enhancing the Identity Hash and global backbone symmetry.',
        risk: 'STABLE',
        riskClass: 'border-primary text-primary'
    },
    {
        name: 'BS-Molecule Scaling',
        threads: '9-12',
        threadCount: 4,
        staked: 0,
        color: '#ffc107',
        description: 'Supporting startups creating perfect Buyer-Seller logic bonds.',
        risk: 'DIVERGENCE_WARNING',
        riskClass: 'border-warning text-warning'
    },
    {
        name: 'Active Defense',
        threads: '14-16',
        threadCount: 3,
        staked: 1200,
        color: '#dc3545',
        description: 'Powering the Hallucination Purge and security kernels.',
        risk: 'KERNEL_LOCKED',
        riskClass: 'border-info text-info'
    }
]);

const totalStaked = computed(() => {
    return sectors.value.reduce((acc, s) => acc + s.staked, 0);
});

const openStakeModal = (sector: any) => {
    selectedSector.value = sector;
    stakeAmount.value = 1000;
    showStakeModal.value = true;
};

const handleStake = () => {
    const amount = stakeAmount.value;
    if (!selectedSector.value || amount <= 0) return;

    if (flowBalance.value - amount < 1600) {
        reportError("PROTOCOL ERROR: Stake would breach Base Maintenance Level.");
        return;
    }

    selectedSector.value.staked += amount;
    flowBalance.value -= amount;
    socialCredit.value += (amount / 1000) * 0.05;

    // Record protocol transmission
    transactions.value.unshift({
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'ALLOCATION',
        sector: selectedSector.value.name,
        amount: amount,
        status: 'SUCCESS'
    });

    playTxSound();

    showStakeModal.value = false;
    selectedSector.value = null;
};

onMounted(() => {
    // Simulate planetary velocity data stream
    setInterval(() => {
        const last = vsysHistory.value[vsysHistory.value.length - 1];
        // Growth influenced by total collective stakes (simulated via user contribution factor)
        const contributionBoost = totalStaked.value / 2500;
        const next = last + (Math.random() * 15 - 4) + contributionBoost;
        vsysHistory.value.push(next);
        if (vsysHistory.value.length > 60) vsysHistory.value.shift();
    }, 3000);

    // Simulate XOR Risk Protocol Divergence alerts
    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 12 seconds
            const randomIndex = Math.floor(Math.random() * sectors.value.length);
            const sector = sectors.value[randomIndex];
            if (sector.risk === 'DIVERGENCE_DETECTED') return;

            const originalRisk = sector.risk;
            const originalClass = sector.riskClass;

            sector.risk = 'DIVERGENCE_DETECTED';
            sector.riskClass = 'border-danger text-danger status-pulse';
            playDivergenceSound();

            // Active Defense Kernel "purges" the divergence after a short delay
            setTimeout(() => {
                sector.risk = originalRisk;
                sector.riskClass = originalClass;
            }, 5000);
        }
    }, 12000);

    // Simulate Global Buffer Fund fluctuations
    setInterval(() => {
        globalBufferFund.value += Math.floor(Math.random() * 1000000 - 400000);
    }, 8000);
});

const handleExitSymmetry = () => {
    const totalToReclaim = totalStaked.value;
    sectors.value.forEach(s => {
        flowBalance.value += s.staked;
        s.staked = 0;
    });
    // Logic for Symmetry Cap diverts excess ROI automatically
    if (flowBalance.value > 240000) {
        flowBalance.value = 240000;
    }

    // Record reclamation event
    transactions.value.unshift({
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        type: 'RECLAMATION',
        sector: 'TERMINAL 10',
        amount: totalToReclaim,
        status: 'TRUTH_VERIFIED'
    });

    playTxSound();
};

const clearHistory = () => {
    if (confirm("PROTOCOL ALERT: Purging session logs will erase the local audit trail. Proceed?")) {
        isDegaussing.value = true;
        transactions.value = [];
        playPurgeSound();

        // Reset degauss state after animation completes
        setTimeout(() => {
            isDegaussing.value = false;
        }, 500);
    }
};
</script>

<style scoped>
.invest-page {
    background: radial-gradient(circle, #050505 0%, #000 100%);
    position: relative;
}

.thread-bar {
    border-radius: 2px;
    transition: all 0.3s ease;
    opacity: 0.3;
}

.active-pulse {
    opacity: 1;
    animation: thread-glow 2s infinite ease-in-out;
}

@keyframes thread-glow {

    0%,
    100% {
        filter: brightness(1) drop-shadow(0 0 2px var(--pillar-color));
    }

    50% {
        filter: brightness(1.5) drop-shadow(0 0 8px var(--pillar-color));
    }
}

.vignette-overlay {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.4) 150%);
    pointer-events: none;
    z-index: 10;
}

.chromatic-text {
    animation: chromatic-glitch 5s infinite;
}

@keyframes chromatic-glitch {

    0%,
    10%,
    100% {
        text-shadow: none;
    }

    11% {
        text-shadow: 1.5px 0 rgba(255, 0, 0, 0.7), -1.5px 0 rgba(0, 255, 255, 0.7);
    }

    12% {
        text-shadow: -1.5px 0 rgba(255, 0, 0, 0.7), 1.5px 0 rgba(0, 255, 255, 0.7);
    }

    13% {
        text-shadow: none;
    }

    14% {
        text-shadow: 0.8px 0 rgba(255, 0, 0, 0.7), -0.8px 0 rgba(0, 255, 255, 0.7);
    }
}

.bg-black {
    background-color: #000 !important;
}

.card {
    transition: transform 0.3s ease, border-color 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    border-color: #007bff !important;
}

.progress {
    border: 1px solid #222;
}

.vsys-monitor {
    border-style: dashed !important;
}

.vsys-graph {
    width: 100%;
    height: 150px;
    display: block;
}

.vsys-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px);
    background-size: 50px 30px;
    pointer-events: none;
}

.uppercase {
    text-transform: uppercase;
}

.status-pulse {
    animation: status-pulse-keyframes 1s infinite ease-in-out;
}

@keyframes status-pulse-keyframes {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}
</style>