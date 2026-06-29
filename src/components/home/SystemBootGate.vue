<template>
  <div class="system-boot-gateway">
    <div v-if="!user" class="unauthenticated-flow">
      <p class="extra-tiny text-zinc-400 mb-3">Sovereign Mesh requires balanced alignment.</p>
      <CButton color="info" class="w-100 mb-3" @click="router.push('/onboarding')">EXECUTE_INITIALIZATION</CButton>
    </div>
    
    <div v-else class="authenticated-flow">
      <p class="extra-tiny text-success italic mb-2">Node Status: GROUNDED</p>
      <StakingTerminal />
      <EntityGrid @request-bond="$emit('request-bond', $event)" />
      <BankLinkingSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import StakingTerminal from './StakingTerminal.vue';
import EntityGrid from './EntityGrid.vue';
import BankLinkingSection from './BankLinkingSection.vue';

defineProps<{ user: any }>();
defineEmits(['request-bond']);
const router = useRouter();
</script>