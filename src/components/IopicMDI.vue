<template>
  <div
    class="mdi-viewer shadow-lg rounded position-relative overflow-hidden"
    :class="{ 'scanning-active': isScanning, 'locking-active': isLocking }"
  >
    <div class="coordinate-header mb-4">
      <h3
        class="font-monospace h6 text-uppercase mb-0 glitch-mdi"
        data-text="MDI VISUALIZER: PROJECTING REALITY"
      >
        MDI VISUALIZER: PROJECTING REALITY
      </h3>
      <div class="sync-light" :class="{ synced: isLocked }"></div>
    </div>

    <!-- Simulated Radar Sweep Overlay -->
    <div v-if="isScanning" class="radar-line"></div>

    <form class="validation-form mb-4" @submit.prevent="handleSubmit">
      <div class="mb-2">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': emailTouched && !isEmailValid, 'is-valid': emailTouched && isEmailValid }"
          @blur="emailTouched = true"
          autocomplete="email"
        />
        <div v-if="emailTouched && !isEmailValid" class="invalid-feedback">Invalid email address.</div>
      </div>
      <div class="mb-2">
        <label for="phone" class="form-label">Phone</label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          class="form-control"
          :class="{ 'is-invalid': phoneTouched && !isPhoneValid, 'is-valid': phoneTouched && isPhoneValid }"
          @blur="phoneTouched = true"
          autocomplete="tel"
        />
        <div v-if="phoneTouched && !isPhoneValid" class="invalid-feedback">Invalid phone number.</div>
      </div>
      <button type="submit" class="btn btn-success mt-2" :disabled="!isEmailValid || !isPhoneValid">Submit</button>
    </form>
    <div class="thread-visualization">
      <!-- IDEAL NIBBLE (BITS 1-4) -->
      <section class="nibble-block" :class="{ 'active-thread': threads[0].state }">
        <label class="text-uppercase small opacity-75 d-block mb-2 font-monospace"
          >IDEAL (BITS 1-4)</label
        >
        <div class="coordinates font-monospace small">
          <div class="d-flex justify-content-between">
            <span>LAT:</span> <span class="text-white">{{ lat }}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>LONG:</span> <span class="text-white">{{ long }}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>ELV:</span> <span class="text-white">{{ elevation }}m</span>
          </div>
        </div>
      </section>

      <!-- LOGIC GATES (PEOPLE, VALUE, DEFENSE) -->
      <section class="logic-flow">
        <div v-for="n in [1, 2, 3]" :key="n" class="nibble-status mb-2">
          <label class="text-uppercase tiny opacity-50 d-block font-monospace">{{
            getNibbleLabel(n)
          }}</label>
          <div class="bit-dots d-flex gap-1 mt-1">
            <span v-for="b in 4" :key="b" class="dot" :class="getBitClass(n, b)"></span>
          </div>
        </div>
      </section>
    </div>

    <div
      class="terminal-footer mt-4 pt-3 border-top border-success border-opacity-25 d-flex justify-content-between align-items-center"
    >
      <div class="status-message-container flex-grow-1">
        <Transition name="fade" mode="out-in">
          <p v-if="isLocked" class="font-monospace mb-0 small text-uppercase">
            <i class="bi bi-shield-check me-1"></i> STATUS: SYMMETRICAL
          </p>
          <p v-else class="warning font-monospace mb-0 small text-uppercase">
            <i class="bi bi-broadcast me-1"></i> STATUS: ASYMMETRICAL
          </p>
        </Transition>
      </div>
      <button
        @click="triggerScan"
        class="scan-btn font-monospace tiny text-uppercase ms-2"
        :disabled="isScanning"
      >
        {{ isScanning ? 'Scanning...' : 'Scan Substrate' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from '../composables/useSystemBus'; 

const { playSFX } = useIOSettings();
const emit = defineEmits(['symmetry-breach']);
const props = defineProps<{
  userLat?: number;
  userLong?: number;
  userElv?: number | null;
}>();

const email = ref('');
const phone = ref('');
const emailTouched = ref(false);
const phoneTouched = ref(false);
const elevation = ref(props.userElv?.toFixed(0) || '198');

const isEmailValid = computed(() => /^[\w.!#$%&'*+/=?^_`{|}~-]+@[\w-]+(\.[\w-]+)+$/i.test(email.value));
const isPhoneValid = computed(() => /^\+?[0-9\s\-()]{7,20}$/.test(phone.value));

const handleSubmit = () => {
  emailTouched.value = true;
  phoneTouched.value = true;
  if (isEmailValid.value && isPhoneValid.value) {
    alert('Symmetry Handshake Validated.');
  }
};

const lat = ref(props.userLat?.toFixed(4) || '41.4993');
const long = ref(props.userLong?.toFixed(4) || '-81.6944');
const isLocked = ref(true); // Keep as local ref
const isScanning = ref(false);
const isLocking = ref(false);

const triggerScan = () => {
  isScanning.value = true;
  playSFX('order');

  if (!isLocked.value) {
    emit('symmetry-breach');
  }

  setTimeout(() => {
    isScanning.value = false;
  }, 2000);
};

const triggerLockAnimation = () => {
  isLocking.value = true;
  setTimeout(() => {
    isLocking.value = false;
  }, 800);
};

const threads = ref<Thread[]>([
  { state: true, label: 'IDEAL' },
  { state: true, label: 'PEOPLE' },
  { state: true, label: 'VALUE' },
  { state: true, label: 'DEFENSE' }
]);

const getNibbleLabel = (n: number) => threads.value[n].label;
const getBitClass = (n: number, b: number) => (isLocked.value ? 'on' : 'off');

onMounted(() => {
  if (isLocked.value) {
    playSFX('fulfill');
  }
});

defineExpose({ triggerLockAnimation });
</script>

<style scoped>
.mdi-viewer {
  background: radial-gradient(circle at center, #001a00 0%, #000 100%);
  border: 2px solid #00ff41;
  padding: 1.5rem;
  color: #00ff41;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.15);
  max-width: 450px;
  margin: auto;
}

.coordinate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sync-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #300;
  transition: all 0.3s;
}

.synced {
  background: #0f0;
  box-shadow: 0 0 12px #0f0;
}

.thread-visualization {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5rem;
  margin: 1rem 0;
}

.nibble-block {
  border: 1px solid rgba(0, 255, 65, 0.3);
  padding: 12px;
  background: rgba(0, 255, 65, 0.02);
}

.active-thread {
  border-color: #00ff41;
  box-shadow: inset 0 0 10px rgba(0, 255, 65, 0.1);
}

.tiny {
  font-size: 0.6rem;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border: 1px solid rgba(0, 255, 65, 0.5);
  transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.on {
  background: #00ff41;
  box-shadow: 0 0 5px #00ff41;
}

.off {
  background: transparent;
}

.warning {
  color: #ff0000;
  text-shadow: 0 0 8px #ff0000;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.glitch-mdi {
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for small coordinate blocks */
.coordinates::-webkit-scrollbar {
  width: 2px;
}

.coordinates::-webkit-scrollbar-thumb {
  background: #00ff41;
}

.radar-line {
  position: absolute;
  top: 0;
  left: -15%;
  width: 60px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.3), transparent);
  border-right: 1px solid #00ff41;
  z-index: 10;
  pointer-events: none;
  animation: sweep 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes sweep {
  0% {
    left: -15%;
  }

  100% {
    left: 115%;
  }
}

.scan-btn {
  background: transparent;
  color: #00ff41;
  border: 1px solid rgba(0, 255, 65, 0.5);
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.scan-btn:hover:not(:disabled) {
  background: rgba(0, 255, 65, 0.1);
  border-color: #00ff41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}

.scan-btn:disabled {
  opacity: 0.5;
  cursor: wait;
  border-style: dashed;
}

.scanning-active .dot {
  animation: dot-ping 0.4s ease-out forwards;
}

.scanning-active .nibble-status:nth-child(1) .dot {
  animation-delay: 0.8s;
}

.scanning-active .nibble-status:nth-child(2) .dot {
  animation-delay: 1.2s;
}

.scanning-active .nibble-status:nth-child(3) .dot {
  animation-delay: 1.6s;
}

@keyframes dot-ping {
  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(3);
    box-shadow: 0 0 10px #00ff41;
  }
}
</style>
/* Validation Form Styles */
.validation-form {
  background: rgba(0,255,65,0.04);
  border: 1px solid rgba(0,255,65,0.15);
  border-radius: 8px;
  padding: 1.2rem 1.5rem 1rem 1.5rem;
  margin-bottom: 2rem;
}
.form-label {
  color: #00ff41;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  font-size: 0.95rem;
}
.form-control {
  background: #000;
  color: #00ff41;
  border: 1px solid #00ff41;
  border-radius: 4px;
  padding: 0.4rem 0.7rem;
  font-family: inherit;
  margin-bottom: 0.2rem;
}
.form-control.is-invalid {
  border-color: #ff0000;
  box-shadow: 0 0 4px #ff0000;
}
.form-control.is-valid {
  border-color: #00ff41;
  box-shadow: 0 0 4px #00ff41;
}
.invalid-feedback {
  color: #ff0000;
  font-size: 0.85rem;
  margin-top: 0.1rem;
}
.btn-success {
  background: #00ff41;
  color: #000;
  border: none;
  font-family: inherit;
  font-weight: bold;
  border-radius: 4px;
  padding: 0.4rem 1.2rem;
  transition: background 0.2s;
}
.btn-success:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}
