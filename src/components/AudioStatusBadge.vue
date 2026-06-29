<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useIOSettings } from '../useIOSettings';

const { isMuted, masterVolume, audioActivityKey, lastSfxType, analyserNode } = useIOSettings();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;
let smoothedVolume = isMuted.value ? 0 : masterVolume.value;

const activeColor = computed(() => {
    switch (lastSfxType.value) {
        case 'fulfill': return '#28a745'; // Success Green
        case 'static': return '#dc3545';  // Danger Red
        default: return '#007bff';       // IO Blue / Order
    }
});

const drawWaveform = () => {
    const analyser = analyserNode();
    if (!canvasRef.value || !analyser) {
        animationId = requestAnimationFrame(drawWaveform);
        return;
    }

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = activeColor.value;
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    const centerY = canvas.height / 2;
    let x = 0;

    // Subtle smoothing: move the visual volume towards the actual target (or 0 if muted)
    const targetVolume = isMuted.value ? 0 : masterVolume.value;
    const smoothingFactor = 0.15;
    smoothedVolume += (targetVolume - smoothedVolume) * smoothingFactor;

    for (let i = 0; i < bufferLength; i++) {
        // v represents the normalized deviation from the center line (-1.0 to 1.0)
        const v = (dataArray[i] - 128) / 128.0;
        // Scale the visual height (amplitude) by the current masterVolume
        const y = centerY + (v * centerY * smoothedVolume);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationId = requestAnimationFrame(drawWaveform);
};

onMounted(() => {
    animationId = requestAnimationFrame(drawWaveform);
});

onUnmounted(() => {
    cancelAnimationFrame(animationId);
});
</script>

<template>
    <span :key="audioActivityKey"
        class="badge bg-secondary audio-ping text-uppercase d-inline-flex align-items-center gap-2"
        :class="lastSfxType ? 'ping-' + lastSfxType : ''" style="font-size: 0.6rem; padding: 0.4rem 0.6rem;">
        <canvas ref="canvasRef" width="40" height="12" class="audio-viz"></canvas>
        <div class="badge-text">
            <template v-if="lastSfxType">{{ lastSfxType }} | </template>
            {{ Math.round(masterVolume * 100) }}%
        </div>
    </span>
</template>

<style scoped>
.audio-viz {
    filter: drop-shadow(0 0 2px var(--ping-color, #007bff));
    opacity: 0.8;
}

.audio-ping {
    /* Force hardware acceleration for smoother scaling */
    backface-visibility: hidden;
    perspective: 1000px;
    /* Animation restarts every time the :key change re-mounts the span */
    animation: badge-pulse-base 0.4s ease-out;
}

.ping-order {
    --ping-color: rgba(0, 123, 255, 0.7);
    /* IO Blue */
}

.ping-fulfill {
    --ping-color: rgba(40, 167, 69, 0.7);
    /* Success Green */
}

.ping-static {
    --ping-color: rgba(220, 53, 69, 0.7);
    /* Error Red */
}

@keyframes badge-pulse-base {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 var(--ping-color, rgba(0, 123, 255, 0.7));
    }

    50% {
        transform: scale(1.2);
        box-shadow: 0 0 10px 4px var(--ping-color, rgba(0, 123, 255, 0));
    }

    100% {
        transform: scale(1);
    }
}
</style>