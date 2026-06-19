<template>
  <CContainer fluid class="admin-dashboard p-4 bg-black min-vh-100 font-mono text-white">
    <header
      class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3"
    >
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-shield-fill-check text-danger h3 m-0"></i>
        <h1 class="text-glow text-danger m-0 italic font-black">ADMIN_PANEL</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">ADMIN_ID</span>
        <span class="text-danger fw-bold">{{ auth.currentUser?.uid.substring(0, 8) }}...</span>
      </div>
    </header>

    <CRow>
      <!-- User Management -->
      <CCol lg="6" class="mb-4">
        <CCard class="bg-zinc-900 border-danger text-white shadow-glow">
          <CCardHeader class="font-black italic text-danger">USER_MANAGEMENT</CCardHeader>
          <CCardBody>
            <div v-if="users.length > 0">
              <div
                v-for="user in users"
                :key="user.id"
                class="mb-3 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">USER_ID:</span>
                  <span class="font-mono">{{ user.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">EMAIL:</span>
                  <span class="text-info">{{ user.email || 'N/A' }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">CURRENT_ROLE:</span>
                  <span
                    :class="{
                      'text-info': user.role === 'buyer',
                      'text-warning': user.role === 'seller',
                      'text-danger': user.role === 'admin',
                    }"
                    >{{ user.role?.toUpperCase() || 'N/A' }}</span
                  >
                </div>
                <div class="mt-2 d-flex gap-2">
                  <CButton
                    v-if="user.role !== 'buyer'"
                    color="info"
                    size="sm"
                    @click="updateUserRole(user.id, 'buyer')"
                    :disabled="isProcessing"
                    >SET_BUYER</CButton
                  >
                  <CButton
                    v-if="user.role !== 'seller'"
                    color="warning"
                    size="sm"
                    @click="updateUserRole(user.id, 'seller')"
                    :disabled="isProcessing"
                    >SET_SELLER</CButton
                  >
                  <CButton
                    v-if="user.role !== 'admin'"
                    color="danger"
                    size="sm"
                    @click="updateUserRole(user.id, 'admin')"
                    :disabled="isProcessing"
                    >SET_ADMIN</CButton
                  >
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">NO_REGISTERED_USERS</div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Role Request Management -->
      <CCol lg="6" class="mb-4">
        <CCard class="bg-zinc-900 border-danger text-white shadow-glow">
          <CCardHeader class="font-black italic text-danger">ROLE_REQUESTS</CCardHeader>
          <CCardBody>
            <div v-if="roleRequests.length > 0">
              <div
                v-for="request in roleRequests"
                :key="request.id"
                class="mb-3 pb-3 border-bottom border-zinc-800"
              >
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">REQUEST_ID:</span>
                  <span class="font-mono">{{ request.id.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">USER_ID:</span>
                  <span class="text-info">{{ request.userId.substring(0, 8) }}...</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">EMAIL:</span>
                  <span class="text-info">{{ request.email || 'N/A' }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">REQUESTED_ROLE:</span>
                  <span class="text-warning">{{
                    request.requestedRole?.toUpperCase() || 'N/A'
                  }}</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-zinc-500">STATUS:</span>
                  <span
                    :class="{
                      'text-warning': request.status === 'pending',
                      'text-success': request.status === 'approved',
                      'text-danger': request.status === 'denied',
                    }"
                    >{{ request.status?.toUpperCase() || 'N/A' }}</span
                  >
                </div>
                <div class="mt-2 d-flex gap-2" v-if="request.status === 'pending'">
                  <CButton
                    color="success"
                    size="sm"
                    @click="approveRoleRequest(request)"
                    :disabled="isProcessing"
                    >APPROVE</CButton
                  >
                  <CButton
                    color="danger"
                    size="sm"
                    @click="denyRoleRequest(request.id)"
                    :disabled="isProcessing"
                    >DENY</CButton
                  >
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 opacity-25">NO_PENDING_ROLE_REQUESTS</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  type Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { useErrorStore } from '../stores/error';
import { useSuccessStore } from '../stores/success';

const users = ref<any[]>([]);
const roleRequests = ref<any[]>([]);
const isProcessing = ref(false);

let usersUnsubscribe: Unsubscribe | null = null;
let roleRequestsUnsubscribe: Unsubscribe | null = null;
// Pinia Stores
const errorStore = useErrorStore();
const successStore = useSuccessStore();

const initAdminSubstrates = () => {
  // Listen for all users
  usersUnsubscribe = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      users.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    (error) => {
      console.error('Error fetching users:', error);
      errorStore.setGlobalError('Failed to load user list.'); // Use errorStore
    }
  );

  // Listen for role requests
  roleRequestsUnsubscribe = onSnapshot(
    query(collection(db, 'roleRequests')),
    (snapshot) => {
      roleRequests.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    (error) => {
      console.error('Error fetching role requests:', error);
      errorStore.setGlobalError('Failed to load role requests.'); // Use errorStore
    }
  );
};

const updateUserRole = async (userId: string, newRole: string) => {
  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    successStore.setSuccessMessage(
      `USER_ROLE_UPDATE_SUCCESS: User ${userId} role set to ${newRole}.`
    );
    errorStore.clearGlobalError(); // Use errorStore
  } catch (error) {
    console.error('Error updating user role:', error);
    errorStore.setGlobalError(`Failed to update role for user ${userId}.`);
  } finally {
    isProcessing.value = false;
  }
};

const approveRoleRequest = async (request: any) => {
  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    // 1. Update user's role
    const userRef = doc(db, 'users', request.userId);
    await updateDoc(userRef, { role: request.requestedRole });

    // 2. Update request status
    const requestRef = doc(db, 'roleRequests', request.id);
    await updateDoc(requestRef, { status: 'approved', processedAt: serverTimestamp() });

    successStore.setSuccessMessage(
      `ROLE_REQUEST_APPROVED: User ${request.userId} granted ${request.requestedRole} role.`
    );
    errorStore.clearGlobalError(); // Use errorStore
  } catch (error) {
    console.error('Error approving role request:', error);
    errorStore.setGlobalError(`Failed to approve role request for user ${request.userId}.`);
  } finally {
    isProcessing.value = false;
  }
};

const denyRoleRequest = async (requestId: string) => {
  isProcessing.value = true;
  errorStore.clearGlobalError();
  try {
    const requestRef = doc(db, 'roleRequests', requestId);
    await updateDoc(requestRef, { status: 'denied', processedAt: serverTimestamp() });
    successStore.setSuccessMessage(`ROLE_REQUEST_DENIED: Request ${requestId} denied.`);
    errorStore.clearGlobalError(); // Use errorStore
  } catch (error) {
    console.error('Error denying role request:', error);
    errorStore.setGlobalError(`Failed to deny role request ${requestId}.`);
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  initAdminSubstrates();
});

onUnmounted(() => {
  usersUnsubscribe?.();
  roleRequestsUnsubscribe?.();
});
</script>

<style scoped>
.admin-dashboard .text-danger {
  color: #dc3545 !important; /* Example danger color */
}
.admin-dashboard .shadow-glow {
  box-shadow: 0 0 30px rgba(220, 53, 69, 0.15) !important; /* Example glow for admin */
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
