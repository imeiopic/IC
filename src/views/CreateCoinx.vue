<template>
  <div
    class="coinx-creation-hub relative w-full h-[600px] overflow-hidden bg-black border-4 transition-colors duration-500"
    :class="isDrifting ? 'border-red-500' : 'border-lime-500'"
  >
    <!-- Map Substrate -->
    <div class="map-layer absolute inset-0">
      <div class="w-full h-full bg-zinc-900 flex items-center justify-center text-lime-900 font-mono text-[10px]">
        [ MAP_SURFACE_GRID: {{ userCoordinate.lat.toFixed(6) }}, {{ userCoordinate.lng.toFixed(6) }} ]
      </div>
    </div>

    <!-- Interaction Layer -->
    <div class="interaction-layer absolute inset-0 flex items-center justify-center">
      <svg class="w-full h-full pointer-events-none">
        <circle
          cx="50%" cy="50%" :r="pixelRadius"
          :class="[
            'transition-all duration-1000 stroke-2',
            isEngaged ? 'stroke-lime-400 fill-lime-500/30 animate-pulse' : 'stroke-lime-900 fill-lime-900/10'
          ]"
        />
      </svg>

      <!-- Drift Warning -->
      <transition name="fade">
        <div v-if="isDrifting" class="absolute inset-0 bg-red-900/20 flex items-center justify-center animate-pulse">
          <div class="text-red-500 font-bold text-xl border-2 border-red-500 p-4 bg-black uppercase tracking-tighter">
            CRITICAL_ERROR: ENTROPIC_LEAK // NODE_DRIFT > 9M
          </div>
        </div>
      </transition>
    </div>

    <!-- UI Controls -->
    <div class="ui-overlay absolute top-4 left-4 p-4 bg-black/80 border font-mono transition-colors"
         :class="isEngaged ? 'text-lime-400 border-lime-500' : 'text-zinc-500 border-zinc-800'">
      <h2 class="text-xs uppercase font-bold mb-2 tracking-widest text-lime-500">Coinx Initialization</h2>
      <div class="text-[10px] space-y-1 uppercase">
        <p>Radius: 9 Meters [FIXED]</p>
        <p>Expiration: {{ formattedTime }}</p>
        <p>Status: {{ isDrifting ? 'SELF_PARTITIONING' : 'STABLE_ORBIT' }}</p>
        
        <p v-if="isEngaged" class="text-lime-400 font-bold animate-bounce">
          PARTNER_SIGHTED: {{ partnerId?.substring(0, 8) }}...
        </p>
      </div>

      <button
        @click="commitCoinx"
        class="mt-4 w-full bg-lime-500 text-black font-bold py-2 hover:bg-lime-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="isDrifting || isExpired || isCommitting"
      >
        {{ isCommitting ? 'STAKING...' : 'STAKE_COINX' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc, doc as fireDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();
const RADIUS_METERS = 9;
const DRIFT_THRESHOLD = 9;

// State
const userCoordinate = ref({ lat: 0, lng: 0 });
const anchorCoordinate = ref<{ lat: number; lng: number } | null>(null);
const timeRemaining = ref(7200000); // 120 mins
const isDrifting = ref(false);
const isCommitting = ref(false);
const isEngaged = ref(false);
const partnerId = ref<string | null>(null);
const stakedDocId = ref<string | null>(null);

// Geolocation Logic (Production hardened)
let watchId: number;
let timerId: number;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const p = Math.PI / 180;
  const a = 0.5 - Math.cos((lat2 - lat1) * p) / 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p)) / 2;
  return 12742000 * Math.asin(Math.sqrt(a));
};

const commitCoinx = async () => {
  if (!user.value || !anchorCoordinate.value || isCommitting.value) return;
  isCommitting.value = true;
  try {
    const docRef = await addDoc(collection(db, 'coinx_stakes'), {
      creatorId: user.value.uid,
      coordinate: anchorCoordinate.value,
      expiresAt: new Date(Date.now() + timeRemaining.value),
      status: 'active',
      createdAt: serverTimestamp()
    });
    stakedDocId.value = docRef.id;
    initPartnerListener();
  } catch (err) {
    console.error('STAKE_FAILURE', err);
  } finally {
    isCommitting.value = false;
  }
};

const initPartnerListener = (): Unsubscribe => {
  const q = query(collection(db, 'coinx_stakes'), where('status', '==', 'active'));
  return onSnapshot(q, (snapshot) => {
    isEngaged.value = snapshot.docs.some(d => {
      const data = d.data();
      if (data.creatorId === user.value?.uid) return false;
      const dist = getDistance(anchorCoordinate.value!.lat, anchorCoordinate.value!.lng, data.coordinate.lat, data.coordinate.lng);
      if (dist <= RADIUS_METERS) {
        partnerId.value = data.creatorId;
        return true;
      }
      return false;
    });
  });
};

onMounted(() => {
  watchId = navigator.geolocation.watchPosition((pos) => {
    userCoordinate.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (!anchorCoordinate.value) anchorCoordinate.value = userCoordinate.value;
    
    const dist = getDistance(anchorCoordinate.value.lat, anchorCoordinate.value.lng, userCoordinate.value.lat, userCoordinate.value.lng);
    isDrifting.value = dist > DRIFT_THRESHOLD;
  }, (err) => console.error("GPS_DENIED", err), { enableHighAccuracy: true });

  timerId = window.setInterval(() => { if (timeRemaining.value > 0) timeRemaining.value -= 1000; }, 1000);
});

onUnmounted(() => {
  navigator.geolocation.clearWatch(watchId);
  clearInterval(timerId);
});

const isExpired = computed(() => timeRemaining.value <= 0);
const formattedTime = computed(() => `${Math.floor(timeRemaining.value / 60000)}m`);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>