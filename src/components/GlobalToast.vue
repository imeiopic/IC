<template>
    <Teleport to="body">
        <div v-if="activeMessage" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1060;">
            <div :class="['toast show align-items-center text-white border-0 shadow-lg', activeType === 'error' ? 'bg-danger' : 'bg-success']"
                role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i
                            :class="['bi me-2', activeType === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill']"></i>
                        {{ activeMessage }}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="closeToast"
                        aria-label="Close"></button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue';
import { useErrorSubstrate } from '../errorHandler';

const { lastSubstrateError, lastSubstrateSuccess, clearError, clearSuccess } = useErrorSubstrate();

const activeMessage = computed(() => lastSubstrateError.value || lastSubstrateSuccess.value);
const activeType = computed(() => lastSubstrateError.value ? 'error' : 'success');

function closeToast() {
    clearError();
    clearSuccess();
}

// Auto-hide logic: clear the error state after 8 seconds to allow the operator to read the substrate breach details.
watch(lastSubstrateError, (newError) => {
    if (newError) {
        lastSubstrateSuccess.value = null; // Error takes priority
        setTimeout(() => {
            clearError();
        }, 8000);
    }
});

watch(lastSubstrateSuccess, (newSuccess) => {
    if (newSuccess) {
        setTimeout(() => {
            clearSuccess();
        }, 5000);
    }
});
</script>

<script lang="ts">
export default { name: 'GlobalToast' };
</script>

<style scoped>
.toast {
    min-width: 320px;
    border-left: 5px solid rgba(0, 0, 0, 0.3) !important;
}
</style>