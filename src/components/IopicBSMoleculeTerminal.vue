<template>
    <div class="bs-molecule-terminal shadow-lg rounded border-2 position-relative overflow-hidden">
        <header class="text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch" data-text="BS-MOLECULE TERMINAL">
                BS-MOLECULE TERMINAL
            </h1>
            <div class="meta-info tiny font-monospace opacity-75 mt-2">
                PROTOCOL: VALUE FLOW | THREADS: 9-12
            </div>
        </header>

        <div class="terminal-body font-monospace">
            <div class="row mb-4">
                <!-- Node A (Buyer) -->
                <div class="col-6 border-end border-success border-opacity-25 text-center">
                    <h2 class="h6 text-info mb-1 opacity-75 text-uppercase">Node A (Buyer)</h2>
                    <div class="small mb-1">State: <span class="fw-bold" :class="stateColor(buyerState)">{{ buyerState
                            }}</span></div>
                    <div class="small mb-2 text-secondary">Threads: {{ buyerThreads }}/16</div>
                    <div class="small fw-bold text-success mb-3">Truth (I): {{ buyerTruth.toFixed(4) }} VR²</div>
                    <div class="d-flex flex-column gap-2 px-3">
                        <button class="btn btn-sm btn-outline-info tiny" @click="lockAll(buyer)">[+] LOCK ALL</button>
                        <button class="btn btn-sm btn-outline-danger tiny" @click="dropOne(buyer)">[-] DROP
                            THREAD</button>
                    </div>
                </div>

                <!-- Node B (Seller) -->
                <div class="col-6 text-center">
                    <h2 class="h6 text-info mb-1 opacity-75 text-uppercase">Node B (Seller)</h2>
                    <div class="small mb-1">State: <span class="fw-bold" :class="stateColor(sellerState)">{{ sellerState
                            }}</span></div>
                    <div class="small mb-2 text-secondary">Threads: {{ sellerThreads }}/16</div>
                    <div class="small fw-bold text-success mb-3">Truth (I): {{ sellerTruth.toFixed(4) }} VR²</div>
                    <div class="d-flex flex-column gap-2 px-3">
                        <button class="btn btn-sm btn-outline-info tiny" @click="lockAll(seller)">[+] LOCK ALL</button>
                        <button class="btn btn-sm btn-outline-danger tiny" @click="dropOne(seller)">[-] DROP
                            THREAD</button>
                    </div>
                </div>
            </div>

            <!-- Transaction Config & Execution -->
            <div
                class="transaction-controls p-3 border border-warning border-opacity-50 rounded bg-dark mb-4 text-center">
                <h3 class="h6 text-warning mb-3 text-uppercase">Configure Transaction</h3>
                <div class="d-flex justify-content-center gap-3 mb-3">
                    <div>
                        <label class="d-block tiny text-secondary mb-1">Amount (IO$)</label>
                        <input type="number" v-model.number="txAmount"
                            class="form-control bg-black text-warning border-warning font-monospace text-center form-control-sm"
                            style="width: 100px; margin: 0 auto;" />
                    </div>
                    <div>
                        <label class="d-block tiny text-secondary mb-1">Target Density</label>
                        <input type="number" step="0.05" v-model.number="txDensity"
                            class="form-control bg-black text-warning border-warning font-monospace text-center form-control-sm"
                            style="width: 100px; margin: 0 auto;" />
                    </div>
                </div>
                <button @click="executeMolecule"
                    class="execute-btn w-100 py-2 font-monospace fw-bold text-uppercase tiny" :disabled="isExecuting">
                    {{ isExecuting ? 'EXECUTING STREAM...' : 'EXECUTE BS-MOLECULE' }}
                </button>
            </div>
        </div>

        <!-- Substrate Logic Logs -->
        <div class="system-logs mt-4 p-3 border border-success border-opacity-25 rounded text-start position-relative">
            <div class="bg-scanlines position-absolute w-100 h-100 top-0 start-0 opacity-25"
                style="pointer-events: none;"></div>
            <div v-for="(log, index) in logs" :key="index"
                class="log-entry tiny text-success opacity-75 mb-1 font-monospace z-1 position-relative">
                <span class="text-white opacity-50">></span> {{ log }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { IopicKernel } from '../core/IopicKernel';
import { BSMolecule } from '../core/BSMolecule';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

// Reactive Nodes
const buyer = reactive(new IopicKernel("ui-buyer-seed"));
const seller = reactive(new IopicKernel("ui-seller-seed"));

const txAmount = ref(1000);
const txDensity = ref(0.95);
const isExecuting = ref(false);
const logs = ref<string[]>(['INITIALIZING BS-MOLECULE TERMINAL...']);

// Computed Properties for reactivity
const buyerState = computed(() => buyer.getSystemState());
const buyerThreads = computed(() => buyer.getActiveThreadCount());
const buyerTruth = computed(() => buyer.calculateEquationOfTruth());

const sellerState = computed(() => seller.getSystemState());
const sellerThreads = computed(() => seller.getActiveThreadCount());
const sellerTruth = computed(() => seller.calculateEquationOfTruth());

const addLog = (msg: string) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    logs.value.push(`[${timestamp}] ${msg}`);
    if (logs.value.length > 5) logs.value.shift();
};

const stateColor = (state: string) => {
    if (state === 'SOVEREIGN') return 'text-success';
    if (state === 'DEGRADED') return 'text-warning';
    return 'text-danger';
};

const lockAll = (node: IopicKernel) => {
    for (let i = 0; i < 16; i++) node.lockThread(i);
    addLog(`Node threads fully locked. Protocol state: SOVEREIGN.`);
};

const dropOne = (node: IopicKernel) => {
    const target = Math.floor(Math.random() * 16);
    node.dropThread(target);
    addLog(`Thread ${target} compromised. Relational integrity dropping...`);
};

const executeMolecule = () => {
    if (isExecuting.value) return;
    isExecuting.value = true;
    playSFX('order');
    addLog(`PROPOSING BSMOLECULE: ${txAmount.value} IO$ @ ${txDensity.value} Density`);

    setTimeout(() => {
        try {
            const molecule = new BSMolecule(buyer as unknown as IopicKernel, seller as unknown as IopicKernel, txAmount.value, txDensity.value);
            addLog('INITIATING PAIRING VERIFICATION...');

            if (!molecule.verifyPairing()) {
                addLog(`PAIRING FAILED: Active Defense Kernel Rejected.`);
                isExecuting.value = false;
                return;
            }

            addLog('PAIRING VERIFIED. EXECUTING VALUE STREAM...');

            setTimeout(() => {
                molecule.executeStream();
                addLog(`STREAM COMPLETED. TRUTH EQUATIONS MULTIPLIED.`);
                playSFX('fulfill');
                isExecuting.value = false;
            }, 1000);

        } catch (err: any) {
            addLog(`CRITICAL ERROR: ${err.message}`);
            isExecuting.value = false;
        }
    }, 800);
};
</script>

<style scoped>
.bs-molecule-terminal {
    background: #000;
    border: 2px solid rgba(0, 255, 65, 0.5);
    padding: 2rem;
    color: #00ff41;
    max-width: 800px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.system-logs {
    background: rgba(0, 255, 65, 0.02);
    min-height: 140px;
}

.execute-btn {
    background: transparent;
    color: #ffc107;
    border: 1px solid #ffc107;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 1px;
}

.execute-btn:hover:not(:disabled) {
    background: #ffc107;
    color: #000;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.execute-btn:disabled {
    color: #00ff41;
    border-color: #00ff41;
    opacity: 0.7;
    cursor: not-allowed;
}

.tiny {
    font-size: 0.7rem;
}
</style>