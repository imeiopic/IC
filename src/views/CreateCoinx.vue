<template>
  <div
    class="coinx-creation-hub relative w-full h-[600px] overflow-hidden bg-black border-4 transition-colors duration-500"
    :class="isDrifting ? 'border-red-500' : 'border-lime-500'"
  >
    <div class="map-layer absolute inset-0">
      <!-- Grid Visualization for Map Surface -->
      <div
        class="w-full h-full bg-zinc-900 flex items-center justify-center text-lime-900 font-mono text-[10px]"
      >
        [ MAP_SURFACE_GRID: {{ userCoordinate.lat.toFixed(6) }},
        {{ userCoordinate.lng.toFixed(6) }} ]
      </div>
    </div>

    <div class="interaction-layer absolute inset-0 flex items-center justify-center">
      <svg class="w-full h-full pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          :r="pixelRadius"
          :class="[
            'transition-all duration-1000 stroke-2',
            isEngaged
              ? 'stroke-lime-400 fill-lime-500/30 animate-pulse'
              : 'stroke-lime-900 fill-lime-900/10',
          ]"
        />
      </svg>

      <div
        v-if="isDrifting"
        class="drift-warning absolute inset-0 bg-red-900/20 flex items-center justify-center animate-pulse"
      >
        <div
          class="text-red-500 font-bold text-xl border-2 border-red-500 p-4 bg-black uppercase tracking-tighter"
        >
          CRITICAL_ERROR: ENTROPIC_LEAK // NODE_DRIFT > 9M
        </div>
      </div>
    </div>

    <div
      class="ui-overlay absolute top-4 left-4 p-4 bg-black/80 border font-mono transition-colors"
      :class="isEngaged ? 'text-lime-400 border-lime-500' : 'text-zinc-500 border-zinc-800'"
    >
      <h2 class="text-xs uppercase font-bold mb-2 tracking-widest text-lime-500">
        Coinx Initialization
      </h2>
      <div class="text-[10px] space-y-1 uppercase">
        <p>Radius: 9 Meters [FIXED]</p>
        <p>Expiration: {{ formattedTime }}</p>
        <p>Locality: {{ currentLocality }}</p>
        <p v-if="isEngaged" class="text-lime-400 font-bold animate-bounce">
          PARTNER_SIGHTED: {{ partnerId?.substring(0, 8) }}...
        </p>
        <p v-else class="text-zinc-600 italic">STEALTH_MODE: Awaiting Binary Partner</p>
        <p :class="isDrifting ? 'text-red-500' : 'text-lime-500'">
          Status: {{ isDrifting ? 'SELF_PARTITIONING' : 'STABLE_ORBIT' }}
        </p>
      </div>

      <!-- 16-Thread Visual Bus Load Indicator -->
      <div class="mt-4 pt-2 border-t border-lime-900/50">
        <div class="text-[8px] text-zinc-500 mb-1 tracking-widest uppercase">
          Bus_Load // 16_Threads
        </div>
        <div class="grid grid-cols-8 gap-1">
          <div
            v-for="(load, i) in threadLoads"
            :key="i"
            class="h-3 bg-zinc-900 relative overflow-hidden border border-zinc-800"
          >
            <div
              class="absolute bottom-0 w-full transition-all duration-300"
              :style="{
                height: `${load}%`,
                backgroundColor: `hsla(${85 * (1 - load / 100)}, 100%, 50%, 0.6)`,
              }"
            ></div>
          </div>
        </div>
      </div>

      <button
        @click="commitCoinx"
        class="mt-4 w-full bg-lime-500 text-black font-bold py-2 hover:bg-lime-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="isDrifting || isExpired"
      >
        STAKE_COINX
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc as fireDoc,
} from 'firebase/firestore';
import { useAuth } from '../useAuth';

const { user } = useAuth();
const db = getFirestore();

const RADIUS_METERS = 9;
const EXPIRATION_MS = 120 * 60 * 1000;
const DRIFT_THRESHOLD = 9;

const userCoordinate = ref({ lat: 0, lng: 0 });
const anchorCoordinate = ref<{ lat: number; lng: number } | null>(null);
const timeRemaining = ref(EXPIRATION_MS);
const isDrifting = ref(false);
const isStaked = ref(false);
const isEngaged = ref(false);
const partnerId = ref<string | null>(null);
const stakedDocId = ref<string | null>(null);
const currentLocality = ref('CLEVELAND_ROOT_ANCHOR');
const velocity = ref(0);
const threadLoads = ref<number[]>(Array.from({ length: 16 }, () => Math.random() * 100));
const pixelRadius = ref(120);

const isExpired = computed(() => timeRemaining.value <= 0);
const formattedTime = computed(() => {
  const mins = Math.floor(timeRemaining.value / 60000);
  const secs = Math.floor((timeRemaining.value % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
  return 12742000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371km
};

const commitCoinx = async () => {
  if (!user.value || !anchorCoordinate.value) return;
  try {
    const docRef = await addDoc(collection(db, 'coinx_stakes'), {
      creatorId: user.value.uid,
      coordinate: anchorCoordinate.value,
      expiresAt: new Date(Date.now() + timeRemaining.value),
      status: 'active',
      createdAt: serverTimestamp(),
    });
    stakedDocId.value = docRef.id;
    isStaked.value = true;
    initPartnerListener();
  } catch (err) {
    console.error('STAKE_FAILURE', err);
  }
};

/**
 * Monitors the mesh for other active stakes within the 9m Sovereignty Bubble.
 * Fulfills the Law of Virtual Relativity: I = VR^2
 */
const initPartnerListener = () => {
  const q = query(collection(db, 'coinx_stakes'), where('status', '==', 'active'));
  onSnapshot(q, (snapshot) => {
    let matchFound = false;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.creatorId !== user.value?.uid && anchorCoordinate.value) {
        const dist = getDistance(
          anchorCoordinate.value.lat,
          anchorCoordinate.value.lng,
          data.coordinate.lat,
          data.coordinate.lng
        );
        if (dist <= RADIUS_METERS) {
          matchFound = true;
          partnerId.value = data.creatorId;
        }
      }
    });
    isEngaged.value = matchFound;
  });
};

const handleSelfPartition = async () => {
  if (stakedDocId.value) {
    const docRef = fireDoc(db, 'coinx_stakes', stakedDocId.value);
    await updateDoc(docRef, {
      status: 'partitioned',
      reason: 'ENTROPIC_LEAK_DRIFT',
    });
    isStaked.value = false;
  }
};

let watchId: number;
let timerId: number;
let busTimerId: number;

onMounted(() => {
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      velocity.value = pos.coords.speed || 0;
      userCoordinate.value = { lat, lng };
      if (!anchorCoordinate.value) anchorCoordinate.value = { lat, lng };
      const dist = getDistance(anchorCoordinate.value.lat, anchorCoordinate.value.lng, lat, lng);
      isDrifting.value = dist > DRIFT_THRESHOLD;

      // Trigger Self-Partition if drift occurs while staked
      if (isDrifting.value && isStaked.value) {
        handleSelfPartition();
      }
    },
    null,
    { enableHighAccuracy: true }
  );

  timerId = window.setInterval(() => {
    if (timeRemaining.value > 0) timeRemaining.value -= 1000;
  }, 1000);

  busTimerId = window.setInterval(() => {
    // Synchronize jitter intensity with physical velocity (m/s)
    const jitterScale = 15 + velocity.value * 25;
    // Bias the random walk center upwards based on velocity
    const velocityShift = Math.min(0.4, velocity.value * 0.01);
    threadLoads.value = threadLoads.value.map((l) =>
      Math.min(100, Math.max(5, l + (Math.random() - 0.5 + velocityShift) * jitterScale))
    );
  }, 150);
});

onUnmounted(() => {
  navigator.geolocation.clearWatch(watchId);
  clearInterval(timerId);
  clearInterval(busTimerId);
});
</script>
