<template>
  <CContainer fluid class="driver-dashboard p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-car-front-fill text-warning h3 m-0"></i>
        <h1 class="text-glow text-warning m-0 italic font-black">DRIVER_DASHBOARD</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userStore.userEquity }} IO$</span>
      </div>
    </header>

    <CRow>
      <CCol lg="6" class="mb-4">
        <CCard class="bg-zinc-900 border-warning text-white shadow-glow">
          <CCardHeader class="font-black italic text-warning">PENDING_RIDE_REQUESTS</CCardHeader>
          <CCardBody>
            <div v-if="pendingRequests.length > 0">
              <div
                v-for="request in pendingRequests"
                :key="request.id"
                class="mb-3 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">REQUEST_ID:</span>
                  <span class="font-mono">{{ request.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">RIDER:</span>
                  <span class="text-info">{{ request.riderId.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">PICKUP:</span>
                  <span class="text-info">{{ request.pickupLocation }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">DROPOFF:</span>
                  <span class="text-info">{{ request.dropoffLocation }}</span>
                </div>
                <div class="mt-2">
                  <MapDisplay
                    :mapId="`driver-pending-map-${request.id}`"
                    :latitude="request.pickupLat"
                    :longitude="request.pickupLng"
                    :markerText="`Pickup: ${request.pickupLocation}`"
                    :zoom="12"
                  />
                  <MapDisplay
                    :mapId="`driver-pending-map-dropoff-${request.id}`"
                    :latitude="request.dropoffLat"
                    :longitude="request.dropoffLng"
                    :markerText="`Dropoff: ${request.dropoffLocation}`"
                    :zoom="12"
                    class="mt-2"
                  />
                </div>
                <div class="mt-2">
                  <CButton
                    color="success"
                    size="sm"
                    @click="acceptRide(request.id)"
                    :disabled="isProcessing"
                    >ACCEPT_RIDE</CButton
                  >
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">NO_PENDING_REQUESTS</div>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="6" class="mb-4">
        <CCard class="bg-zinc-900 border-info text-white shadow-glow">
          <CCardHeader class="font-black italic text-info">YOUR_ACTIVE_RIDES</CCardHeader>
          <CCardBody>
            <div v-if="activeRides.length > 0">
              <div
                v-for="ride in activeRides"
                :key="ride.id"
                class="mb-3 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">RIDE_ID:</span>
                  <span class="font-mono">{{ ride.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">RIDER:</span>
                  <span class="text-info">{{ ride.riderId.substring(0, 8) }}...</span>
                </div>
                <div class="mt-2">
                  <MapDisplay
                    :mapId="`driver-active-map-${ride.id}`"
                    :latitude="ride.pickupLat"
                    :longitude="ride.pickupLng"
                    :markerText="`Pickup: ${ride.pickupLocation}`"
                    :zoom="12"
                  />
                  <MapDisplay
                    :mapId="`driver-active-map-dropoff-${ride.id}`"
                    :latitude="ride.dropoffLat"
                    :longitude="ride.dropoffLng"
                    :markerText="`Dropoff: ${ride.dropoffLocation}`"
                    :zoom="12"
                    class="mt-2"
                  />
                </div>
                <div class="mt-2" v-if="ride.status === 'accepted' || ride.status === 'en_route'">
                  <CButton
                    color="info"
                    size="sm"
                    @click="openChat(ride.id)"
                    :disabled="isProcessing"
                    >CHAT_WITH_RIDER</CButton
                  >
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">STATUS:</span>
                  <span
                    :class="{
                      'text-info': ride.status === 'accepted',
                      'text-warning': ride.status === 'en_route',
                      'text-success': ride.status === 'completed',
                    }"
                    >{{ ride.status?.toUpperCase() || 'N/A' }}</span
                  >
                </div>
                <div class="mt-2 d-flex gap-2">
                  <CButton
                    v-if="ride.status === 'accepted'"
                    color="warning"
                    size="sm"
                    @click="updateRideStatus(ride.id, 'en_route')"
                    :disabled="isProcessing"
                    >MARK_EN_ROUTE</CButton
                  >
                  <CButton
                    v-if="ride.status === 'en_route'"
                    color="success"
                    size="sm"
                    @click="updateRideStatus(ride.id, 'completed')"
                    :disabled="isProcessing"
                    >MARK_COMPLETED</CButton
                  >
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">NO_ACTIVE_RIDES</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { useUserStore } from '../stores/userStore';
import { useErrorStore } from '../stores/error';
import { useSuccessStore } from '../stores/success';

import MapDisplay from './MapDisplay.vue'; // Import the new MapDisplay component

const userStore = useUserStore();
const errorStore = useErrorStore();
const successStore = useSuccessStore();

const pendingRequests = ref<any[]>([]);
const activeRides = ref<any[]>([]);
const isProcessing = ref(false);
const showChatModal = ref(false);
const currentChatRideId = ref<string | null>(null);

let pendingRequestsUnsubscribe: Unsubscribe | null = null;
let activeRidesUnsubscribe: Unsubscribe | null = null;

const initDriverSubstrates = () => {
  if (!userStore.isAuthenticated || !userStore.currentUser || !userStore.isDriver) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Please log in as a driver.');
    return;
  }

  // Listen for pending ride requests
  pendingRequestsUnsubscribe = onSnapshot(
    query(collection(db, 'rideRequests'), where('status', '==', 'pending')),
    (snapshot) => {
      pendingRequests.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    (error) => {
      console.error('Error fetching pending requests:', error);
      errorStore.setGlobalError('Failed to load pending ride requests.');
    }
  );

  // Listen for active rides assigned to this driver
  activeRidesUnsubscribe = onSnapshot(
    query(
      collection(db, 'rideRequests'),
      where('driverId', '==', userStore.currentUser.uid),
      where('status', 'in', ['accepted', 'en_route'])
    ),
    (snapshot) => {
      activeRides.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
    (error) => {
      console.error('Error fetching active rides:', error);
      errorStore.setGlobalError('Failed to load your active rides.');
    }
  );
};

const acceptRide = async (requestId: string) => {
  if (!userStore.isAuthenticated || !userStore.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Cannot accept ride.');
    return;
  }

  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    const requestRef = doc(db, 'rideRequests', requestId);
    await updateDoc(requestRef, {
      driverId: userStore.currentUser.uid,
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });
    successStore.setSuccessMessage('RIDE_ACCEPTED: You have accepted a ride request.');
  } catch (error) {
    console.error('RIDE_ACCEPT_FRACTURE:', error);
    errorStore.setGlobalError('RIDE_ACCEPT_FAILED: Could not accept ride request.');
  } finally {
    isProcessing.value = false;
  }
};

const updateRideStatus = async (rideId: string, newStatus: string) => {
  if (!userStore.isAuthenticated || !userStore.currentUser) {
    errorStore.setGlobalError('AUTHENTICATION_REQUIRED: Cannot update ride status.');
    return;
  }

  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    const rideRef = doc(db, 'rideRequests', rideId);
    await updateDoc(rideRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    successStore.setSuccessMessage(`RIDE_STATUS_UPDATED: Ride ${rideId} is now ${newStatus}.`);
  } catch (error) {
    console.error('RIDE_STATUS_UPDATE_FRACTURE:', error);
    errorStore.setGlobalError('RIDE_STATUS_UPDATE_FAILED: Could not update ride status.');
  } finally {
    isProcessing.value = false;
  }
};

const openChat = (rideId: string) => {
  currentChatRideId.value = rideId;
  showChatModal.value = true;
};

onMounted(() => {
  initDriverSubstrates();
});

onUnmounted(() => {
  pendingRequestsUnsubscribe?.();
  activeRidesUnsubscribe?.();
});
</script>

<style scoped>
.driver-dashboard .text-warning {
  color: #ffc107 !important;
}
.driver-dashboard .shadow-glow {
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.15) !important;
}
.bg-zinc-950 {
  background-color: #050505;
}
.font-black {
  font-weight: 900;
}
.fw-black {
  font-weight: 900;
}
.tiny {
  font-size: 0.65rem;
}
.italic {
  font-style: italic;
}
</style>
