<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, where, onSnapshot, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * IopicHandshake Component
 * Handles multiple pending invites for the authenticated user.
 */

const pendingInvites = ref<any[]>([]);
const loading = ref(true);
const isSubmitting = ref<string | null>(null);

let unsubscribe: () => void;

onMounted(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
        collection(db, 'invitees'),
        where('targetUid', '==', currentUser.uid),
        where('status', '==', 'Pending')
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        pendingInvites.value = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            uiInviteePays: false,
            uiInviteePaysHalf: false
        }));
        loading.value = false;
    });
});

async function confirmHandshake(invite: any) {
    isSubmitting.value = invite.id;
    try {
        await runTransaction(db, async (transaction) => {
            const inviteRef = doc(db, 'invitees', invite.id);
            const inviteSnap = await transaction.get(inviteRef);

            if (!inviteSnap.exists()) {
                throw new Error("Invite does not exist!");
            }

            const currentVersion = inviteSnap.data().version || 0;

            transaction.update(inviteRef, {
                status: 'Active',
                inviteePays: invite.uiInviteePays,
                inviteePaysHalf: invite.uiInviteePaysHalf,
                lastModified: serverTimestamp(),
                version: currentVersion + 1
            });
        });
    } catch (error: any) {
        console.error('Handshake error:', error);
        alert(`Failed to accept: ${error.message}`);
    } finally {
        isSubmitting.value = null;
    }
}

onUnmounted(() => {
    if (unsubscribe) unsubscribe();
});
</script>

<template>
    <div class="handshake-container">
        <div v-if="loading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else-if="pendingInvites.length === 0" class="alert alert-secondary">
            No pending handshakes detected in the substrate.
        </div>

        <div v-for="invite in pendingInvites" :key="invite.id"
            class="handshake-ui border p-3 rounded shadow-sm mb-3 bg-dark text-light">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="m-0 text-primary">{{ invite.name }}</h5>
                <span class="badge bg-info text-dark">VER: {{ invite.version }}</span>
            </div>

            <p class="small text-secondary mb-3">From UID: {{ invite.inviterUid }}</p>

            <div class="form-check form-switch mb-2">
                <input v-model="invite.uiInviteePays" @change="invite.uiInviteePaysHalf = false"
                    class="form-check-input" type="checkbox" :id="'full-' + invite.id">
                <label class="form-check-label" :for="'full-' + invite.id">Invitee pays full amount</label>
            </div>

            <div class="form-check form-switch mb-4">
                <input v-model="invite.uiInviteePaysHalf" @change="invite.uiInviteePays = false"
                    class="form-check-input" type="checkbox" :id="'half-' + invite.id">
                <label class="form-check-label" :for="'half-' + invite.id">Invitee pays half amount</label>
            </div>

            <button @click="confirmHandshake(invite)" :disabled="isSubmitting === invite.id"
                class="btn btn-success w-100 fw-bold">
                <span v-if="isSubmitting === invite.id" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting === invite.id ? 'SYNCHRONIZING...' : 'CONFIRM HANDSHAKE' }}
            </button>
        </div>
    </div>
</template>