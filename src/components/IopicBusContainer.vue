<template>
    <div class="iopic-bus-container p-4 min-vh-100 bg-dark text-success">
        <div class="container-fluid">
            <div class="row g-4 justify-content-center">
                <!-- Logic Layer: Constitution & Identity -->
                <div class="col-xl-7">
                    <IopicCharter />
                </div>
                <div class="col-xl-5">
                    <IopicIdentityVault @success="onIdentityVerified" />
                </div>

                <!-- Bus Layer: Communication & Invites -->
                <div class="col-lg-6">
                    <IopicHandshake :external-key="activeInviteKey" @symmetry-breach="handleBreach"
                        @success="onHandshakeSuccess" />
                </div>
                <div class="col-lg-6">
                    <IopicInvite @invite-generated="setInviteKey" />
                </div>

                <!-- De-escalation Layer: Global Symmetry -->
                <div class="col-lg-6">
                    <IopicBorderDissolve />
                </div>

                <!-- USL Layer: Universal Communication -->
                <div class="col-lg-6">
                    <IopicTalk />
                </div>

                <!-- Peace Layer: Global Stillness -->
                <div class="col-lg-6">
                    <IopicPeaceIndicator />
                </div>

                <!-- Substrate Layer: Metrics & Global State -->
                <div class="col-12">
                    <IopicVelocityDashboard ref="dashboard" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IopicHandshake from './IopicHandshake.vue';
import IopicInvite from './IopicInvite.vue';
import IopicVelocityDashboard from './IopicVelocityDashboard.vue';
import IopicPeaceIndicator from './IopicPeaceIndicator.vue';
import IopicIdentityVault from './IopicIdentityVault.vue';
import IopicBorderDissolve from './IopicBorderDissolve.vue'; // Import the new component
import IopicTalk from './IopicTalk.vue'; // Import the new component
import IopicCharter from './IopicCharter.vue';
import { useSystemBus } from '../composables/useSystemBus';

const { triggerGlobalPurge } = useSystemBus();
const activeInviteKey = ref('');
const dashboard = ref<InstanceType<typeof IopicVelocityDashboard> | null>(null);

const setInviteKey = (key: string) => {
    activeInviteKey.value = key;
};

const handleBreach = () => {
    triggerGlobalPurge();
    dashboard.value?.drainVelocity();
};

const onIdentityVerified = () => {
    dashboard.value?.boostSocialCredit(25);
};

const onHandshakeSuccess = () => {
    dashboard.value?.boostSocialCredit(10);
};
</script>

<style scoped>
.iopic-bus-container {
    background-image: radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000 100%);
    font-family: 'Share Tech Mono', monospace;
}
</style>