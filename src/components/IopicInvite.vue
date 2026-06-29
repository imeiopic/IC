<template>
    <div class="iopic-card invite-layer shadow-lg rounded position-relative overflow-hidden">
        <h3 class="font-monospace h6 text-uppercase mb-3">INVITE MANDATE (Bit 0011)</h3>
        <p class="small mb-3">
            Status:
            <span :class="isVerified ? 'text-success' : 'text-warning'" class="fw-bold">
                {{ isVerified ? 'ROOT STEWARD' : 'SYNCING...' }}
            </span>
        </p>

        <div class="invite-zone">
            <div class="input-group-custom mb-3">
                <input v-model="targetEntity" placeholder="Enter Entity Hash or ID"
                    class="handshake-input font-monospace mb-2" />
                <button @click="generateInvite" :disabled="!targetEntity" class="handshake-btn w-100 py-2">
                    GENERATE SYMMETRY LINK
                </button>
            </div>
        </div>

        <Transition name="fade">
            <div v-if="inviteLink" class="output mt-3 pt-3 border-top border-secondary border-dashed">
                <label class="small text-secondary text-uppercase d-block mb-1">Temporary Handshake Key:</label>
                <code class="text-info d-block mb-2 fs-5">{{ inviteLink }}</code>
                <p class="velocity-hint mb-0">
                    <i class="bi bi-lightning-charge-fill me-1"></i>
                    +0.809 Velocity Bonus Available
                </p>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useIOSettings } from '../useIOSettings';

const { playSFX } = useIOSettings();

const emit = defineEmits(['symmetry-breach', 'invite-generated']);

const targetEntity = ref('');
const inviteLink = ref('');
const isVerified = ref(true); // Derived from Thread 5-8 logic

const generateInvite = () => {
    // Logic: Create a 16-bit key with 0011 in the third nibble
    // Format: [IDEAL][PEOPLE][0011][DEFENSE]
    const ideal = Math.random() > 0.5 ? "1010" : "1100";
    const people = Math.random() > 0.5 ? "1100" : "1010";
    const invite = "0011";
    // Defense nibble derived for symmetry (mirror of Ideal)
    const defense = ideal.split('').reverse().join('');

    inviteLink.value = `${ideal}${people}${invite}${defense}`;
    emit('invite-generated', inviteLink.value);
    playSFX('order');
    console.log("INVITE MANDATE: Symmetry Link Broadcasted to Bus.");
};
</script>

<style scoped>
.iopic-card {
    background: #050505;
    border: 1px solid #00ff41;
    padding: 1.5rem;
    font-family: 'Courier New', Courier, monospace;
    color: #00ff41;
}

.handshake-input {
    background: #111;
    color: #00ff41;
    border: 1px solid #00ff41;
    width: 100%;
    padding: 0.5rem;
    outline: none;
}

.handshake-btn {
    background: #00ff41;
    color: #000;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.2s;
}

.handshake-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.output {
    border-style: dashed !important;
}

.velocity-hint {
    font-size: 0.75rem;
    color: #ffeb3b;
}

.text-info {
    color: #007bff !important;
}

.border-dashed {
    border-style: dashed !important;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>