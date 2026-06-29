<template>
  <CContainer
    fluid
    class="vre-substrate p-0 bg-black min-vh-100 overflow-hidden font-mono text-white"
  >
    <div
      class="vre-hud fixed-top p-4 d-flex justify-content-between align-items-start z-max pointer-events-none"
    >
      <div class="hud-left pointer-events-auto">
        <div class="d-flex align-items-center gap-3 mb-2">
          <img src="/images/iologo.png" alt="IOPIC" width="45" class="animate-pulse" />
          <h1 class="text-glow text-info m-0 italic font-black h4">VRE_OS.GLOBAL</h1>
        </div>
        <CBadge color="info" variant="outline" class="tiny tracking-widest px-3">
          NODE_CLUSTER: {{ entityData?.cluster_id || 'SCANNING_GEO_LOCK...' }}
        </CBadge>
      </div>

      <div class="hud-right text-end pointer-events-auto">
        <div class="equity-pulse text-success font-black h5 m-0">{{ userBalance }} IO$</div>
        <CButton
          color="link"
          class="p-0 tiny text-danger uppercase text-decoration-none hover-glow"
          @click="purgeLegacyDebt"
        >
          [!] NAND_DEBT_PURGE
        </CButton>
        <div class="tiny text-zinc-500 uppercase">Schumann_Sync: 7.83Hz</div>
      </div>
    </div>

    <div
      class="world-viewport position-relative w-100 vh-100 bg-zinc-950 d-flex align-items-center justify-content-center"
    >
      <div class="hex-grid-container position-absolute inset-0 opacity-25">
        <div class="hex-grid"></div>
      </div>

      <div class="reality-anchor position-relative animate-float">
        <div
          class="core-ring border border-info rounded-circle position-absolute translate-middle top-50 start-50"
        ></div>
        <div class="core-glow position-absolute translate-middle top-50 start-50"></div>
        <img
          :src="entityData?.photoURL || '/images/imeiopic.png'"
          class="rounded-circle border border-info p-1 shadow-glow position-relative grayscale"
          width="120"
        />
      </div>

      <div
        v-for="n in 16"
        :key="n"
        class="thread-node position-absolute border border-zinc-800 rounded-pill px-2 tiny"
        :style="getThreadStyle(n)"
      >
        T_{{ n.toString().padStart(2, '0') }}
      </div>
    </div>

    <div class="fixed-bottom p-4 z-max d-flex justify-content-center">
      <div
        class="dock-substrate bg-zinc-900 bg-opacity-80 border border-zinc-800 rounded-pill px-4 py-2 shadow-lg d-flex gap-4 backdrop-blur"
      >
        <CButton color="link" class="text-info p-0" title="PEOPLE" @click="transit('People')">
          <i class="bi bi-people-fill h4"></i>
        </CButton>
        <div class="vr-divider border-end border-zinc-800"></div>
        <CButton
          color="link"
          class="text-success p-0"
          title="COMMERCE"
          @click="transit('Commerce')"
        >
          <i class="bi bi-shop h4"></i>
        </CButton>
        <div class="vr-divider border-end border-zinc-800"></div>
        <CButton color="link" class="text-warning p-0" title="REALITY" @click="transit('Reality')">
          <i class="bi bi-cpu h4"></i>
        </CButton>
        <div class="vr-divider border-end border-zinc-800"></div>
        <CButton color="link" class="text-white p-0" title="ENTITY" @click="transit('Entity')">
          <i class="bi bi-shield-lock h4"></i>
        </CButton>
      </div>
    </div>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useGlobalMandates } from '../../ReusableMandate.vue';

const router = useRouter();
const userBalance = ref(0);
const entityData = ref<any>(null);
const { applyDebtSilenceMandate } = useGlobalMandates();

/**
 * 01_GLOBAL_SIGHTING_LOGIC
 */
const initVRE = () => {
  if (auth.currentUser) {
    onSnapshot(doc(db, 'users', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        entityData.value = snap.data();
        userBalance.value = snap.data().iowb?.balance || 0;
      }
    });
  }
};

/**
 * 01.1_DEBT_PURGE_LOGIC
 * Enforces the ZERO_NOISE_DEBT mandate by stripping interest-bearing
 * legacy ownership noise from the molecular buffer.
 */
const purgeLegacyDebt = async () => {
  if (!auth.currentUser) return;

  const groundedEquity = applyDebtSilenceMandate(userBalance.value);

  // Ground the transaction into the substrate
  const userRef = doc(db, 'users', auth.currentUser.uid);
  await updateDoc(userRef, {
    'iowb.balance': groundedEquity,
    'iowb.last_purge': Date.now(),
  });

  console.log(`[SYNAPSE] Legacy noise purged. Grounded Equity: ${groundedEquity} IO$`);
};

/**
 * 02_ORBITAL_GEOMETRY
 * Distributes the 16 threads in a 360-degree logical circle
 */
const getThreadStyle = (n: number) => {
  const angle = n * (360 / 16) * (Math.PI / 180);
  const radius = 200;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return {
    transform: `translate(${x}px, ${y}px)`,
    opacity: 0.3 + Math.random() * 0.4,
    transition: 'all 2s ease-in-out',
    animation: `float-thread ${3 + n * 0.2}s ease-in-out infinite alternate`,
  };
};

const transit = (name: string) => router.push({ name });

onMounted(() => initVRE());
</script>

<style scoped>
.vre-substrate {
  cursor: crosshair;
}
.z-max {
  z-index: 1000;
}
.pointer-events-none {
  pointer-events: none;
}
.pointer-events-auto {
  pointer-events: auto;
}
.backdrop-blur {
  backdrop-filter: blur(10px);
}
.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
}

/* WORLD ANIMATIONS */
.animate-float {
  animation: float-core 6s ease-in-out infinite;
}
@keyframes float-core {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes float-thread {
  from {
    opacity: 0.2;
  }
  to {
    opacity: 0.6;
  }
}

.core-ring {
  width: 160px;
  height: 160px;
  animation: rotate-ring 30s linear infinite;
  opacity: 0.15;
}
@keyframes rotate-ring {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.core-glow {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, transparent 70%);
}

.hex-grid-container {
  background-image: radial-gradient(circle, #1a1a1a 1px, transparent 1px);
  background-size: 40px 40px;
}

.shadow-glow {
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.2);
}
.grayscale {
  filter: grayscale(100%) contrast(120%);
}
.font-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.tracking-widest {
  letter-spacing: 0.3em;
}

.animate-pulse {
  animation: pulse-op 2s infinite;
}
@keyframes pulse-op {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.hover-glow:hover {
  text-shadow: 0 0 10px #ff0041;
  color: #ff0041 !important;
}
</style>
