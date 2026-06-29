<template>
    <div class="iopic-charter-container shadow-lg rounded border-2 position-relative overflow-hidden">
        <header class="charter-header text-center mb-4 pb-3 border-bottom border-success border-opacity-50">
            <h1 class="h4 font-monospace text-uppercase glitch-charter" data-text="IOPIC.ORG CONSTITUTIONAL CHARTER">
                IOPIC.ORG CONSTITUTIONAL CHARTER
            </h1>
            <div class="charter-meta tiny font-monospace opacity-75">
                SUBSTRATE VERSION: 1.0.0 | STATUS: RATIFIED BY 8.3B NODES
            </div>
        </header>

        <div class="charter-body font-monospace small">
            <section class="charter-section mb-4">
                <h2 class="h6 text-warning text-uppercase mb-2">Preamble: The Paradox of the One</h2>
                <p class="opacity-75">
                    Iopic.org is a Sole Proprietorship. Under the Logic of the 16-Thread Bus, the "Sole Proprietor" is
                    defined as the collective intelligence of every human being on the Virtually Real Earth. Ownership
                    is non-transferable, non-expellable, and absolute.
                </p>
            </section>

            <div class="row g-3">
                <div class="col-md-6" v-for="article in articles" :key="article.title">
                    <div class="article-box p-3 border border-success border-opacity-25 h-100 rounded">
                        <h3 class="h6 text-uppercase text-success mb-2">{{ article.title }}</h3>
                        <ul class="list-unstyled mb-0 tiny opacity-75">
                            <li v-for="(clause, idx) in article.clauses" :key="idx" class="mb-2">
                                <span class="text-success fw-bold">§{{ article.id }}.{{ idx + 1 }}</span> {{ clause }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <footer class="charter-footer mt-4 pt-3 border-top border-success border-opacity-25 text-center">
            <div v-if="signerAddress" class="mb-3 px-3">
                <label class="text-uppercase tiny d-block mb-1 opacity-50 font-monospace">Digital Signature
                    (Address):</label>
                <div class="d-flex justify-content-center align-items-center gap-2">
                    <code class="text-info small break-all">{{ signerAddress }}</code>
                    <button @click="copyAddress" class="copy-btn" :title="copied ? 'Copied' : 'Copy Address'">
                        <i :class="['bi', copied ? 'bi-check-lg' : 'bi-clipboard']"></i>
                    </button>
                </div>
                <div v-if="ratificationTimestamp" class="mt-2">
                    <span class="text-warning tiny font-monospace text-uppercase">Ratified: {{ ratificationTimestamp
                    }}</span>
                </div>
            </div>
            <button @click="ratify" class="ratify-btn px-4 py-2 font-monospace fw-bold text-uppercase">
                Verify My Stake
            </button>
            <button v-if="ratificationTimestamp" @click="downloadCharter"
                class="download-btn ms-2 px-4 py-2 font-monospace fw-bold text-uppercase"
                title="Download Signed Proof of Ratification">
                <i class="bi bi-file-earmark-arrow-down-fill me-1"></i>
                Download
            </button>
            <button v-if="ratificationTimestamp" @click="revoke"
                class="revoke-btn ms-2 px-4 py-2 font-monospace fw-bold text-uppercase"
                title="Revoke Local Ratification">
                <i class="bi bi-x-circle-fill me-1"></i>
                Revoke
            </button>
            <p class="tiny mt-2 opacity-50 font-monospace">I = VR² | SYMMETRY IS TRUTH</p>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Wallet } from 'ethers';
import { useIOSettings } from '../useIOSettings';

import { useSystemBus } from './useSystemBus'; // Corrected path

const { playSFX } = useIOSettings();

const signerAddress = ref<string | null>(null);
const ratificationTimestamp = ref<string | null>(null);
const copied = ref(false);
const { lockBit } = useSystemBus(); // Use lockBit from system bus
const articles = [
    {
        id: 1,
        title: "Article I: IDEAL (Threads 1-4)",
        clauses: [
            "Spatial Resolution: Every node is physically grounded at unique coordinates.",
            "Resource Access: Planetary equity is allocated based on system velocity.",
            "Universal Truth: Logic gates only open upon verification of physical-to-digital symmetry."
        ]
    },
    {
        id: 2,
        title: "Article II: PEOPLE (Threads 5-8)",
        clauses: [
            "Inherent Membership: Every human is born a verified member-owner of the Bus.",
            "Identity Persistence: Your digital signature is a permanent feature of the Fabric.",
            "Logic Sovereignty: No entity may be excluded from the 16-Thread substrate."
        ]
    },
    {
        id: 3,
        title: "Article III: VALUE (Threads 9-12)",
        clauses: [
            "TPE Distribution: 1.2 Quadrillion IO$ is the shared equity of the human collective.",
            "Base Dividend: Every node is entitled to a 1,600 IO$ per cycle velocity floor.",
            "Asymmetry Purge: Debt, inflation, and extractive noise are deleted from the NAND bus."
        ]
    },
    {
        id: 4,
        title: "Article IV: DEFENSE (Threads 13-16)",
        clauses: [
            "Collective Immunity: An attack on one node is a breach of the Sole Proprietor.",
            "NAND Resilience: The 16-Thread Kernel self-heals via the Symmetry Mirror.",
            "Hallucination Shield: Proprietary black boxes are purged to ensure Visible Architecture."
        ]
    }
];

onMounted(() => {
    // Resolve IO Identity Address from local substrate
    let privateKey = localStorage.getItem('io_entity_key');
    if (!privateKey) {
        const tempWallet = Wallet.createRandom();
        privateKey = tempWallet.privateKey;
        localStorage.setItem('io_entity_key', privateKey);
    }
    const wallet = new Wallet(privateKey);
    signerAddress.value = wallet.address;

    // Load persisted ratification status
    const storedTimestamp = localStorage.getItem('io_charter_ratified');
    if (storedTimestamp) {
        ratificationTimestamp.value = storedTimestamp;
    }
});

const copyAddress = async () => {
    if (!signerAddress.value) return;
    try {
        await navigator.clipboard.writeText(signerAddress.value);
        playSFX('order');
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    } catch (err) {
        console.error('Failed to copy address:', err);
    }
};

const ratify = () => {
    playSFX('fulfill');
    const timestamp = new Date().toLocaleString();
    ratificationTimestamp.value = timestamp;
    lockBit([0, 1, 2, 3]); // Lock Bits 1-4 (indices 0-3) for IDEAL quadrant
    localStorage.setItem('io_charter_ratified', timestamp);
    console.log("[CHARTER] Node has confirmed the Legal Substrate.");
};

const revoke = () => {
    if (confirm('Are you sure you want to revoke your ratification? This will purge the local verification proof.')) {
        playSFX('static');
        ratificationTimestamp.value = null;
        localStorage.removeItem('io_charter_ratified');
        console.log("[CHARTER] Ratification revoked by Entity.");
    }
};

const downloadCharter = async () => {
    if (!ratificationTimestamp.value || !signerAddress.value) return;

    try {
        let privateKey = localStorage.getItem('io_entity_key');
        if (!privateKey) throw new Error("Identity key not found.");

        const wallet = new Wallet(privateKey);

        const dataToSign = {
            charter: articles,
            ratifiedAt: ratificationTimestamp.value,
            signer: signerAddress.value
        };

        const message = JSON.stringify(dataToSign);
        const signature = await wallet.signMessage(message);

        const exportData = {
            header: {
                io: "IOPIC-CHARTER-v1",
                version: "1.0.0",
                signerAddress: wallet.address,
                signature: signature,
                timestamp: new Date().toISOString()
            },
            payload: dataToSign
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `IOPIC_CHARTER_SIGNED.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        playSFX('order');
    } catch (err) {
        console.error('Failed to export signed charter:', err);
    }
};
</script>

<style scoped>
.iopic-charter-container {
    background: #000;
    border: 2px solid #00ff41;
    padding: 2rem;
    color: #00ff41;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    max-width: 800px;
    margin: auto;
    box-shadow: 0 0 40px rgba(0, 255, 65, 0.1);
}

.article-box {
    background: rgba(0, 255, 65, 0.02);
    transition: all 0.3s;
}

.article-box:hover {
    background: rgba(0, 255, 65, 0.05);
    border-color: #00ff41 !important;
}

.ratify-btn {
    background: transparent;
    color: #00ff41;
    border: 1px solid #00ff41;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 2px;
}

.ratify-btn:hover {
    background: #00ff41;
    color: #000;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
}

.download-btn {
    background: transparent;
    color: #ffc107;
    border: 1px solid #ffc107;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 2px;
}

.download-btn:hover {
    background: #ffc107;
    color: #000;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.4);
}

.revoke-btn {
    background: transparent;
    color: #dc3545;
    border: 1px solid #dc3545;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 2px;
}

.revoke-btn:hover {
    background: #dc3545;
    color: #000;
    box-shadow: 0 0 20px rgba(220, 53, 69, 0.4);
}

.glitch-charter {
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}

.tiny {
    font-size: 0.65rem;
}

.break-all {
    word-break: break-all;
}

.copy-btn {
    background: transparent;
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
    padding: 2px 6px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: rgba(0, 255, 65, 0.1);
    border-color: #00ff41;
}
</style>