<template>
  <CModal :visible="visible" @close="$emit('update:visible', false)">
    <CModalHeader>STAKE_BOND_INITIALIZATION</CModalHeader>
    <CModalBody>
      Confirming bond with SUID: {{ suid }}
    </CModalBody>
    <CModalFooter>
      <CButton @click="$emit('confirm')">CONFIRM_BOND_INJECTION</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; suid: string }>();
defineEmits(['update:visible', 'confirm']);
</script>