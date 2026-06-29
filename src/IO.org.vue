<template>
    <div class="io-org-page">
        <div class="vignette-overlay"></div>

        <!-- Main Content -->
        <main class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-10 text-center" :class="{ 'boot-mode-active': isBootMode }">
                    <h1 class="display-4 fw-bold mb-4" :class="{ 'chromatic-text': isBootMode }">The Logic of Digital
                        Reality</h1>
                    <p class="subtitle-centered">
                        IOPIC provides the architectural substrate for transitioning Instances into Entities.
                    </p>

                    <!-- Live Equity Monitor -->
                    <div class="row justify-content-center mb-5 mt-4 g-3">
                        <div class="col-md-5">
                            <div class="card bg-dark text-white border-secondary shadow-sm">
                                <div class="card-body py-3">
                                    <div class="small font-monospace text-uppercase text-secondary mb-1">Global Equity
                                        Core (Treasury)</div>
                                    <div class="h4 mb-0 text-primary font-monospace">{{ totalFixedSupply }} IO$</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-5">
                            <div class="card bg-dark text-white border-secondary shadow-sm">
                                <div class="card-body py-3">
                                    <div class="small font-monospace text-uppercase text-secondary mb-1">Point of
                                        Singularity Equity (I = VR²)</div>
                                    <div class="h4 mb-0 text-info font-monospace">{{ currentNodeEquity.toLocaleString()
                                        }} IO$</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- System Architecture Mapping -->
                    <div class="mt-5 text-start mx-auto" style="max-width: 850px;">
                        <h3 class="h6 fw-bold text-primary mb-3 font-monospace text-uppercase"
                            :class="{ 'chromatic-text': isBootMode }">// System Architecture Mapping</h3>
                        <div class="table-responsive border rounded overflow-hidden shadow-sm">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr class="small text-uppercase fw-bold text-muted">
                                        <th class="ps-3">Component</th>
                                        <th>Physical Equivalent</th>
                                        <th>IOPIC OS Role</th>
                                    </tr>
                                </thead>
                                <tbody class="small">
                                    <tr v-for="(item, index) in architectureMapping" :key="item.component"
                                        class="protocol-row" :style="{ animationDelay: `${index * 0.15}s` }">
                                        <td class="fw-bold ps-3">{{ item.component }}</td>
                                        <td>{{ item.physical }}</td>
                                        <td>
                                            <div class="role-cell">
                                                <div class="font-monospace text-primary">{{ item.role }}</div>
                                                <div class="role-detail text-muted">{{ item.detail }}</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Departmental Logic Mapping -->
                    <div class="mt-5 text-start mx-auto" style="max-width: 850px;">
                        <h3 class="h6 fw-bold text-primary mb-3 font-monospace text-uppercase"
                            :class="{ 'chromatic-text': isBootMode }">// Departmental Logic Mapping</h3>
                        <div class="table-responsive border rounded overflow-hidden shadow-sm">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr class="small text-uppercase fw-bold text-muted">
                                        <th class="ps-3">Department</th>
                                        <th>IOPIC Equivalent</th>
                                        <th>Function</th>
                                    </tr>
                                </thead>
                                <tbody class="small">
                                    <tr v-for="(item, index) in departmentMapping" :key="item.dept" class="protocol-row"
                                        :style="{ animationDelay: `${(index + 4) * 0.15}s` }">
                                        <td class="fw-bold ps-3">{{ item.dept }}</td>
                                        <td>
                                            <div class="font-monospace text-primary">{{ item.equivalent }}</div>
                                        </td>
                                        <td>
                                            <div class="role-cell">
                                                <div class="text-muted">{{ item.detail }}</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="mt-5 d-flex justify-content-center gap-3">
                        <router-link to="/boot" class="btn btn-primary btn-lg px-5 boot-cta-init">Initialize Boot
                            Sequence</router-link>
                        <router-link to="/logical-truth" class="btn btn-outline-dark btn-lg px-5 cta-anim"
                            style="animation-delay: 1.5s">View Truth Pillars</router-link>
                    </div>
                </div>
            </div>
        </main>

        <ProtocolFooter />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ProtocolFooter from './components/ProtocolFooter.vue';
import IOWorldBank from './IOWorldBank';

const isBootMode = ref(false);

const architectureMapping = [
    { component: 'CPU', physical: 'The Processor', role: 'The 16-Thread Logical Bus', detail: 'Orchestrates concurrent validation across the protocol mesh.' },
    { component: 'RAM', physical: 'Short-term Memory', role: 'Active BS-Molecules', detail: 'Volatile state representing active Buyer-Seller logic bonds.' },
    { component: 'Hard Drive', physical: 'Storage', role: 'The Globally Distributed IDEAL Ledger', detail: 'Permanent record of Instance Detect Entity Access Location.' },
    { component: 'BIOS', physical: 'Basic Input/Output', role: 'The I=VR2 Universal Constants', detail: 'The immutable mathematical foundation of logical reality.' }
];

const departmentMapping = [
    { dept: 'Treasury', equivalent: 'The Equity Core', detail: 'Storing the 1.2 Quadrillion IO$ constant.' },
    { dept: 'Security', equivalent: 'Active Defense Kernel', detail: 'Purging false data and "Division" errors.' },
    { dept: 'Audit', equivalent: 'Relational Reality (R2)', detail: 'Verifying the bond between every Buyer and Seller.' },
    { dept: 'Branches', equivalent: 'Points of Singularity', detail: 'Every verified human node is a "branch" of the IOWB.' }
];

// IOWB Logic Implementation
const activeInstances = ref(1024); // Virtual Velocity (V)
const relationalReality = ref(4);  // Relational Reality (R)

const currentNodeEquity = computed(() => {
    return IOWorldBank.calculateNodeEquity(activeInstances.value, relationalReality.value);
});

const totalFixedSupply = computed(() => {
    return IOWorldBank.getTotalSupply().toLocaleString();
});

onMounted(() => {
    setTimeout(() => { isBootMode.value = true; }, 2000);

    // Simulating the dynamic growth of node value across the logical bus
    setInterval(() => {
        activeInstances.value += Math.floor(Math.random() * 2);
    }, 4000);
});
</script>

<style scoped>
.io-org-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
}

main {
    flex: 1;
    display: flex;
    align-items: center;
}

.subtitle-centered {
    text-align: center;
    font-size: 1.5rem;
    margin-top: 1.5rem;
    color: #444;
}

.cta-anim {
    opacity: 0;
    animation: slideInUp 0.6s ease-out forwards;
}

.protocol-row {
    opacity: 0;
    animation: slideInUp 0.6s ease-out forwards;
    transition: background-color 0.2s ease;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.role-detail {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.3s ease, margin-top 0.3s ease;
    opacity: 0;
    font-size: 0.85em;
}

.protocol-row:hover .role-detail {
    max-height: 50px;
    opacity: 1;
    margin-top: 4px;
}

.boot-cta-init {
    opacity: 0;
    animation: slideInUp 0.6s ease-out 0.7s forwards, pulse-glow 2s infinite ease-in-out 1.3s;
}

@keyframes pulse-glow {

    0%,
    100% {
        box-shadow: 0 0 12px rgba(0, 123, 255, 0.5);
    }

    50% {
        box-shadow: 0 0 25px rgba(0, 123, 255, 0.8);
    }
}

.vignette-overlay {
    position: fixed;
    inset: 0;
    background: radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.2) 150%);
    z-index: 10002;
    pointer-events: none;
}

.chromatic-text {
    position: relative;
    animation: chromatic-glitch 4s infinite;
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

    15% {
        text-shadow: none;
    }
}
</style>