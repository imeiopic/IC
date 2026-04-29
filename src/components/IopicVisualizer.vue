<template>
    <div class="visualizer-container" :class="{
        'ambient-noise': currentNoiseLevel > 0,
        'ambient-critical': currentNoiseLevel >= 2
    }">
        <canvas ref="canvasRef" class="visualizer-canvas"></canvas>
        <button @click="toggleEnergyProfile" class="low-power-btn tiny font-monospace"
            :class="{ 'active': energyProfile === 'ADAPTIVE' }">
            BUS: {{ energyProfile }} {{ isLowPower ? '[LP]' : '' }}
        </button>
        <button v-if="burnInPixels.length > 0" @click="resetSubstrate" class="reset-btn tiny font-monospace">
            RESET SUBSTRATE
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useIOSettings } from '../useIOSettings';
import { useSystemBus } from '../composables/useSystemBus';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { analyserNode, ioLoad, playSFX } = useIOSettings();
const { currentNoiseLevel, systemFriction, isGlobalPurgeActive, triggerGlobalPurge, isLowPower, energyProfile, toggleEnergyProfile, isStabilizing, prefersReducedMotion, isScreenReaderDetected, manualFocusMode, rebootSeconds, isIOsticAcknowledged, busThreads, addLog } = useSystemBus();
let animationFrame: number;

const isGlitching = ref(false);
const recoveryProgress = ref(1); // 1 = fully recovered, 0 = glitch start (red)
const binaryParticles = ref<{ x: number; y: number; vx: number; speed: number; char: string; opacity: number }[]>([]);
const burnInPixels = ref<{ x: number; y: number; color: string; opacity: number }[]>([]);
const zeroHealthTimestamp = ref<number | null>(null);
const purgeStartTime = ref<number | null>(null);
const startupStartTime = ref<number | null>(null);
const criticalMemLogIssued = ref(false); // Flag to prevent duplicate log entries
const lastTickedLineCount = ref(0);

const fps = ref(0);
let frameCount = 0;
let lastFpsUpdateTime = 0;
const pathCount = ref(0);

const frictionHistory = ref<number[]>([]);
let lastSampleTime = 0;
const MAX_HISTORY = 60; // Number of points to track (approx 6 seconds at 100ms sampling)
const MAX_VERTICAL_LINES = 100; // Safety limit for grid manifestation

let lastFrameTime = 0;
const LP_INTERVAL = 1000 / 20; // 20 FPS Target

watch(isGlobalPurgeActive, (active, oldVal) => {
    if (active) {
        purgeStartTime.value = performance.now();
        startupStartTime.value = null; // Reset startup state if a new purge begins
        stopStartupHum();
    } else {
        purgeStartTime.value = null;
        // If transitioning from active to inactive, trigger startup sequence
        if (oldVal === true) {
            startupStartTime.value = performance.now();
            lastTickedLineCount.value = 0;
        }
    }
});

watch(systemFriction, (newVal, oldVal) => {
    // Detect sudden friction spike (threshold of 0.05)
    if (oldVal !== undefined && newVal > oldVal + 0.05) {
        isGlitching.value = true;
        recoveryProgress.value = 0; // Reset recovery state to start the fade from red
        playSFX('glitch', { volume: 0.6 });

        // Reset glitch state after a brief duration (250ms)
        setTimeout(() => { isGlitching.value = false; }, 250);
    }
});

watch(() => burnInPixels.value.length, (newCount) => {
    const CRITICAL_BURN_IN_THRESHOLD = 950;
    if (newCount >= CRITICAL_BURN_IN_THRESHOLD && !criticalMemLogIssued.value) {
        addLog(`MEMORY_LOAD: Critical burn-in (${newCount}px). Substrate integrity at risk.`, 'error');
        criticalMemLogIssued.value = true;
    } else if (newCount < CRITICAL_BURN_IN_THRESHOLD && criticalMemLogIssued.value) {
        // Reset the flag if it recovers below the threshold
        criticalMemLogIssued.value = false;
        addLog(`MEMORY_LOAD: Burn-in recovered below critical threshold (${newCount}px).`, 'info');
    }
});

const humNode = ref<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
const startupHumNode = ref<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
let isStartingHum = false;
let isStartingStartupHum = false;

const stopHum = () => {
    if (humNode.value) {
        humNode.value.source.stop();
        humNode.value = null;
    }
    isStartingHum = false;
};

const stopStartupHum = () => {
    if (startupHumNode.value) {
        startupHumNode.value.source.stop();
        startupHumNode.value = null;
    }
    isStartingStartupHum = false;
};

const resetSubstrate = () => {
    burnInPixels.value = [];
    playSFX('order');
    stopHum();
    stopStartupHum();
};

const draw = (timestamp: number) => {
    animationFrame = requestAnimationFrame(draw);

    // Sample System Friction for the stability graph (every 100ms)
    if (timestamp - lastSampleTime > 100) {
        frictionHistory.value.push(systemFriction.value);
        if (frictionHistory.value.length > MAX_HISTORY) frictionHistory.value.shift();
        lastSampleTime = timestamp;
    }

    // Throttling Logic for Low Power Mode
    if (isLowPower.value) {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed < LP_INTERVAL) return;
        lastFrameTime = timestamp - (elapsed % LP_INTERVAL);
    }

    const analyser = analyserNode();
    if (!analyser || !canvasRef.value) {
        return;
    }

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get Time Domain data for a waveform visualizer
    analyser.getByteTimeDomainData(dataArray);

    const now = performance.now();
    let localPathCount = 0;

    // Set dynamic canvas size
    // Performance Suggestion: Only update dimensions if they have changed to avoid unnecessary reflows
    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    frameCount++;
    if (now - lastFpsUpdateTime > 1000) {
        fps.value = frameCount;
        frameCount = 0;
        lastFpsUpdateTime = now;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isCritical = currentNoiseLevel.value >= 2;
    // Suppress visual distortion if the user prefers reduced motion (Federal Standard)
    ctx.save();
    if (isGlitching.value) {
        // High-intensity coordinate distortion for the 'glitch' effect
        const xDistort = (Math.random() - 0.5) * 20;
        const yDistort = (Math.random() - 0.5) * 10;
        ctx.translate(xDistort, yDistort);
        if (Math.random() > 0.7) ctx.scale(1.05, 0.95);
        ctx.globalAlpha = 0.8 + Math.random() * 0.2; // Brightness flicker
    }
    if (isCritical) {
        // Global Lens Bulge: Entire substrate pulses non-linearly
        const lensPulse = 1.02 + (Math.sin(performance.now() * 0.01) * 0.04);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(lensPulse, lensPulse);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    const startupFade = startupStartTime.value !== null
        ? Math.min(1, (performance.now() - startupStartTime.value) / 1000)
        : 1;

    const isStill = systemFriction.value < 0.05 && currentNoiseLevel.value === 0;

    // Calculate stillness pulse factor (matches the duration in the color block)
    // Pulse between Logic Green (#00ff41) and Brighter Lime (#b2ff59) over 4s
    let stillnessPulseFactor = 0;
    if (isStill) {
        const stillnessDuration = 4000;
        stillnessPulseFactor = (Math.sin(((performance.now() % stillnessDuration) / stillnessDuration) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    }

    // Calculate common pulse factor for noise levels (matches CSS duration of 2s or 0.5s)
    let pulseFactor = 0;
    if (currentNoiseLevel.value > 0) {
        const duration = currentNoiseLevel.value >= 2 ? 500 : 2000;
        pulseFactor = (Math.sin(((performance.now() % duration) / duration) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    }

    // Determine target RGB components based on current system state
    let targetR = 0, targetG = 255, targetB = 65; // Default Logic Green
    if (isStill) {
        targetR = Math.round(178 * stillnessPulseFactor);
        targetG = 255;
        targetB = Math.round(65 + (24 * stillnessPulseFactor));
    } else if (currentNoiseLevel.value === 1) {
        targetR = 255; targetG = 193; targetB = 7; // Warning Yellow
    } else if (currentNoiseLevel.value >= 2) {
        targetR = 255; targetG = 0; targetB = 0; // Critical Red
    }

    // Progress recovery animation (incrementing by 0.01 per frame creates a ~1.6s fade at 60fps)
    if (recoveryProgress.value < 1) {
        recoveryProgress.value = Math.min(1, recoveryProgress.value + 0.01);
    }

    // Interpolate from Glitch Red (255, 0, 0) to target state components
    const r = Math.round(255 + (targetR - 255) * recoveryProgress.value);
    const g = Math.round(0 + (targetG - 0) * recoveryProgress.value);
    const b = Math.round(0 + (targetB - 0) * recoveryProgress.value);
    let activeColor = `rgb(${r}, ${g}, ${b})`;

    // Accessibility: High-contrast override for the waveform and UI elements
    if (isScreenReaderDetected.value) {
        if (currentNoiseLevel.value === 1) activeColor = '#ffff00'; // Pure Yellow
        else if (currentNoiseLevel.value >= 2) activeColor = '#ff0000'; // Pure Red
        else activeColor = '#ffffff'; // Pure White for standard state
    }

    // Calculate dynamic chromatic aberration colors based on system friction
    // As friction increases (max simulated ~0.3), colors shift from Red/Cyan toward Purple/Magenta
    // Forced to 0 during stabilization for a static-free look
    const frictionFactor = isStabilizing.value ? 0 : Math.min(1, systemFriction.value / 0.3);
    const abColor1 = `rgb(255, 0, ${Math.round(255 * frictionFactor)})`; // Red -> Magenta
    const abColor2 = `rgb(${Math.round(128 * frictionFactor)}, ${Math.round(255 * (1 - frictionFactor))}, 255)`; // Cyan -> Violet

    // Scaling factor for chromatic aberration offsets based on friction (1x to 4x)
    const abOffsetFactor = 1 + (frictionFactor * 3);

    // Render Data Stream Fragments during glitch
    if (!isScreenReaderDetected.value && !isStabilizing.value && (isGlitching.value || binaryParticles.value.length > 0)) {
        ctx.save();
        // Dynamic particle size based on system friction (base 8px + expansion factor)
        const particleSize = 8 + (systemFriction.value * 40);
        ctx.font = `${particleSize}px "Share Tech Mono", monospace`;
        // Force particles to red during active glitch pulse independently of the waveform's state
        ctx.fillStyle = isGlitching.value ? '#ff0000' : activeColor;

        // Spawn new fragments during active glitch pulse
        if (isGlitching.value && Math.random() > 0.4) {
            // Horizontal velocity (vx) scales with system velocity (ioLoad).
            // Reduced drift calculation complexity in Low Power
            const horizontalDrift = (Math.random() - 0.3) * (ioLoad.value * (isLowPower.value ? 10 : 20));
            binaryParticles.value.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - 20,
                speed: 2 + Math.random() * 5,
                vx: horizontalDrift,
                char: Math.random() > 0.5 ? '1' : '0',
                opacity: 1.0
            });
        }

        for (let i = binaryParticles.value.length - 1; i >= 0; i--) {
            const p = binaryParticles.value[i];
            p.y += p.speed;
            p.x += p.vx; // Apply the calculated horizontal drift
            p.opacity -= 0.02; // Particles fade as they drift

            if (p.opacity <= 0 || p.y > canvas.height || p.x < -20 || p.x > canvas.width + 20) {
                binaryParticles.value.splice(i, 1);
            } else {
                // Apply positional jitter based on abOffsetFactor during active glitch state
                let renderX = p.x;
                let renderY = p.y;
                if (isGlitching.value && !isLowPower.value) {
                    renderX += (Math.random() - 0.5) * (abOffsetFactor * 6);
                    renderY += (Math.random() - 0.5) * (abOffsetFactor * 6);
                }

                // Permanent Static Burn-in: Occasionally drop a persistent pixel during glitch
                if (isGlitching.value && Math.random() > 0.98 && burnInPixels.value.length < 1000) {
                    burnInPixels.value.push({
                        x: renderX,
                        y: renderY,
                        color: Math.random() > 0.5 ? '#ff0000' : activeColor,
                        opacity: 1.0
                    });
                }

                // Render Trail Effect: Draw ghost characters at previous positions
                if (!isLowPower.value) {
                    const trailLength = 4;
                    for (let j = 1; j <= trailLength; j++) {
                        const trailX = renderX - (p.vx * j * 0.6);
                        const trailY = renderY - (p.speed * j * 0.6);
                        ctx.globalAlpha = p.opacity * (1 - j / (trailLength + 1)) * 0.4;
                        ctx.fillText(p.char, trailX, trailY);
                    }
                }

                // Friction-driven flickering: higher friction increases the intensity of random opacity drops
                const flickerFactor = systemFriction.value > 0.05
                    ? (1 - Math.random() * (systemFriction.value * 5))
                    : 1;

                ctx.globalAlpha = Math.max(0, p.opacity * flickerFactor);
                ctx.fillText(p.char, renderX, renderY);
            }
        }
        ctx.restore();
    }

    // Render Persistent Burn-in Pixels (Static digital artifacts trapped in the substrate)
    if (!isScreenReaderDetected.value && burnInPixels.value.length > 0) {
        ctx.save();
        for (let i = burnInPixels.value.length - 1; i >= 0; i--) {
            const p = burnInPixels.value[i];

            // Accelerate decay in Low Power to keep substrate clean
            p.opacity -= isLowPower.value ? 0.0005 : 0.0001;

            if (p.opacity <= 0) {
                burnInPixels.value.splice(i, 1);
            } else {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity * (0.2 + (isLowPower.value ? 0.1 : Math.random() * 0.3));
                ctx.fillRect(p.x, p.y, 1, 1);
            }
        }
        ctx.restore();
    }

    // Draw Background Grid
    ctx.save();

    if (!isScreenReaderDetected.value && currentNoiseLevel.value >= 2 && !isLowPower.value && !isStabilizing.value) {
        // Grid Jitter: Randomly translate the grid coordinates
        ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
    }

    ctx.beginPath();

    // Grid thickness reacts to stillness: thinner/sharper when pulsing
    ctx.lineWidth = isStill ? (0.3 + stillnessPulseFactor * 0.2) : 0.5;
    ctx.strokeStyle = activeColor;

    let gridAlpha = isStill ? 0.15 : 0.05;

    // Accessibility: Reduce grid visibility significantly for screen readers to avoid visual clutter
    if (isScreenReaderDetected.value) gridAlpha = 0.02;

    if (isStill) {
        // Grid alpha pulses gently during stillness to simulate substrate "breathing"
        gridAlpha *= (0.6 + stillnessPulseFactor * 0.4);
    }

    if (currentNoiseLevel.value > 0) {
        gridAlpha *= (0.7 + pulseFactor * 0.6);

        if (currentNoiseLevel.value >= 2 && !isLowPower.value && !isStabilizing.value) {
            // Add high-frequency noise jitter for critical levels
            gridAlpha *= (0.8 + Math.random() * 0.4);
        }
    }
    ctx.globalAlpha = gridAlpha;

    // Calculate Grid Scroll Offsets based on ioLoad (System Velocity)
    const scrollSpeed = ioLoad.value * 0.05;
    const time = performance.now();
    const offsetX = (time * scrollSpeed) % 30;
    const offsetY = (time * (scrollSpeed * 0.5)) % 15;

    // Warp Effect Calculation: Triggers when system velocity (ioLoad) exceeds 0.8
    const warpFactor = isLowPower.value ? 0 : Math.max(0, ioLoad.value - 0.8) / 0.2;
    const warpIntensity = warpFactor * 20; // Maximum 20px displacement at full velocity

    // Horizontal Grid Lines
    for (let y = -offsetY; y <= canvas.height + 15; y += 15) {
        // Data Corruption: Randomly skip lines during critical noise
        if (currentNoiseLevel.value >= 2 && Math.random() < 0.15) continue;

        let controlY = y;
        if (warpFactor > 0) {
            const distFromCenter = (y - canvas.height / 2) / (canvas.height / 2);
            controlY += (distFromCenter * warpIntensity);
        }
        // Lens Distortion: Bow horizontal lines upwards during critical noise to match waveform curvature
        if (isCritical && !isLowPower.value) controlY -= 24;

        ctx.moveTo(0, y);
        if (warpFactor > 0 || (isCritical && !isLowPower.value)) {
            ctx.quadraticCurveTo(canvas.width / 2, controlY, canvas.width, y);
        } else {
            ctx.lineTo(canvas.width, y);
        }
    }

    // Vertical Grid Lines
    let vCount = 0;
    for (let x = -offsetX; x <= canvas.width + 30; x += 30) {
        if (vCount >= MAX_VERTICAL_LINES) break;
        vCount++;

        // Data Corruption: Randomly skip lines during critical noise
        if (currentNoiseLevel.value >= 2 && Math.random() < 0.15) continue;

        let controlX = x;
        if (warpFactor > 0) {
            const distFromCenter = (x - canvas.width / 2) / (canvas.width / 2);
            controlX += (distFromCenter * warpIntensity);
        }
        // Lens Distortion: Bow vertical lines outward during critical noise for a barrel effect
        if (isCritical && !isLowPower.value) {
            const xDistFromCenter = (x - canvas.width / 2) / (canvas.width / 2);
            controlX += xDistFromCenter * 10;
        }

        ctx.moveTo(x, 0);
        if (warpFactor > 0 || (isCritical && !isLowPower.value)) {
            ctx.quadraticCurveTo(controlX, canvas.height / 2, x, canvas.height);
        } else {
            ctx.lineTo(x, canvas.height);
        }
    }

    if (isCritical && !isLowPower.value && !isStabilizing.value) {
        // Subtle Chromatic Aberration for the grid during critical noise
        // Modulate the shift intensity using pulseFactor to sync with the noise pulse
        const gridShift = (Math.random() - 0.5) * (2 + pulseFactor * 4) * abOffsetFactor;

        // Red Channel Offset
        ctx.save();
        ctx.strokeStyle = abColor1;
        ctx.translate(gridShift, 0);
        ctx.stroke();
        ctx.restore();

        // Cyan Channel Offset
        ctx.save();
        ctx.strokeStyle = abColor2;
        ctx.translate(-gridShift, 0);
        ctx.stroke();
        ctx.restore();

        // Retain a faint baseline of the active color for structural stability
        ctx.save();
        ctx.globalAlpha *= 0.4;
        ctx.stroke();
        ctx.restore();
    } else {
        ctx.stroke();
    }
    ctx.restore();

    // Configure Line Styles
    let baseLineWidth = isStill ? 1 : 2;
    if (isScreenReaderDetected.value) baseLineWidth = 3; // Thicker lines for improved accessibility
    if (currentNoiseLevel.value > 0) {
        // Pulse thickness in sync with the noise level
        const extraThickness = currentNoiseLevel.value >= 2 ? 1.5 : 0.8;
        baseLineWidth += pulseFactor * extraThickness;
    }
    ctx.lineWidth = baseLineWidth;
    ctx.strokeStyle = activeColor;

    // Pulse glow intensity in sync with the stillness state (20px to 30px)
    // This maintains the "Bottom-Up Peace" aesthetic of a stabilized substrate
    let baseShadowBlur = isStill ? (20 + stillnessPulseFactor * 10) : 10;

    if (currentNoiseLevel.value > 0) {
        // Pulse glow intensity in sync with the noise level
        const extraBlur = currentNoiseLevel.value >= 2 ? 15 : 8;
        baseShadowBlur += pulseFactor * extraBlur;
    }
    ctx.shadowBlur = (isLowPower.value || isScreenReaderDetected.value) ? 0 : baseShadowBlur;
    ctx.shadowColor = activeColor;

    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;

    // Startup Audio Modulation: High-frequency hum following the scan progress
    if (startupStartTime.value !== null && !startupHumNode.value && !isStartingStartupHum) {
        isStartingStartupHum = true;
        // Initialize a looping sine hum at zero volume
        playSFX('order', { volume: 0, loop: true }).then(node => {
            if (node && node.gain) {
                startupHumNode.value = { source: node.source, gain: node.gain as GainNode };
            }
        });
    }

    if (startupHumNode.value) {
        // Pitch rises as segments approach the center; volume surges in the middle
        const pitch = 1.0 + (startupFade * 1.5); // 1.0 -> 2.5 playback rate
        startupHumNode.value.source.playbackRate.setTargetAtTime(pitch, 0, 0.05);
        const vol = Math.sin(startupFade * Math.PI) * 0.3; // Peaks at 50% progress
        startupHumNode.value.gain.gain.setTargetAtTime(vol, 0, 0.05);
    }

    // Horizontal Progress: Meet in the middle during startup manifestation
    const halfLength = bufferLength / 2;
    const progress = Math.floor(halfLength * startupFade);
    const leftLimit = progress;
    const rightLimit = Math.max(0, bufferLength - 1 - progress);

    let leftEdgeX = 0, leftEdgeY = 0;
    let rightEdgeX = 0, rightEdgeY = 0;

    for (let i = 0; i < bufferLength; i++) {
        const currentX = i * sliceWidth;

        // Skip the middle gap that hasn't manifested yet
        if (i > leftLimit && i < rightLimit) continue;

        // Normalize the byte value (0-255) to a float (0-2)
        // 128 is the center point (silence)
        let v = (dataArray[i] / 128.0) - 1.0;

        v *= startupFade; // Apply vertical building effect

        // Apply stillness compression to the amplitude
        if (isStill) {
            // Modulate amplitude: breathes between 0.10 and 0.25 in sync with the pulse
            const amplitudeMod = 0.10 + (stillnessPulseFactor * 0.15);
            v *= amplitudeMod;
        }

        let y = ((v + 1.0) * canvas.height) / 2;

        // Lens Distortion: Apply barrel curvature to the waveform during critical noise
        if (isCritical && !isLowPower.value) {
            const distFromCenterNorm = (currentX - canvas.width / 2) / (canvas.width / 2);
            y += (distFromCenterNorm * distFromCenterNorm) * 12; // Parabolic curve
        }

        // Capture coordinates for re-materialization sparkles at scanning heads
        if (i === leftLimit) { leftEdgeX = currentX; leftEdgeY = y; }
        if (i === rightLimit) { rightEdgeX = currentX; rightEdgeY = y; }

        const fragment = !isScreenReaderDetected.value && currentNoiseLevel.value >= 2 && !isLowPower.value && Math.random() < 0.2;

        // Start a new path for the left segment (i=0), the right segment (i=rightLimit), or glitches
        const isStartOfSegment = i === 0 || (startupFade < 1 && i === rightLimit);
        if (isStartOfSegment || fragment) {
            ctx.moveTo(currentX, y);
            localPathCount++;
        } else {
            ctx.lineTo(currentX, y);
            localPathCount++;
        }
    }

    // Randomly skip the final grounding line to enhance the "broken" signal effect
    // Only allow the grounding line once the horizontal draw sequence is 100% complete
    if (startupFade === 1 && !(currentNoiseLevel.value >= 2 && Math.random() < 0.5)) {
        ctx.lineTo(canvas.width, canvas.height / 2);
        localPathCount++;
    }

    pathCount.value = localPathCount;

    if (isCritical && !isLowPower.value && !isStabilizing.value && !isScreenReaderDetected.value) {
        // Chromatic Aberration: Split signal into Red and Cyan channels during critical noise
        // Modulate the jitter intensity using pulseFactor to sync with the noise pulse
        const jitterAmount = (Math.random() - 0.5) * (4 + pulseFactor * 8) * abOffsetFactor;
        ctx.shadowBlur = 0; // Disable shadows for sharp aberration edges

        // Red Channel Offset
        ctx.save();
        ctx.strokeStyle = abColor1;
        ctx.translate(jitterAmount, 0);
        ctx.stroke();
        ctx.restore();

        // Cyan Channel Offset
        ctx.save();
        ctx.strokeStyle = abColor2;
        ctx.translate(-jitterAmount, 0);
        ctx.stroke();
        ctx.restore();

        // Retain a faint baseline of the active color for structural stability
        ctx.save();
        ctx.globalAlpha *= 0.4;
        ctx.stroke();
        ctx.restore();
    } else {
        ctx.stroke();
    }

    // Add high-frequency Re-materialization Sparkles at leading edges during startup manifestation
    if (startupFade < 1 && startupStartTime.value !== null && !isLowPower.value && !isScreenReaderDetected.value) {
        ctx.save();
        const drawSparkles = (ex: number, ey: number) => {
            const count = 5 + Math.floor(Math.random() * 8);
            for (let s = 0; s < count; s++) {
                const offX = (Math.random() - 0.5) * 15;
                const offY = (Math.random() - 0.5) * 15;
                const size = Math.random() * 1.5;
                ctx.fillStyle = Math.random() > 0.3 ? '#fff' : activeColor;
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle as string;
                ctx.beginPath();
                ctx.arc(ex + offX, ey + offY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };
        drawSparkles(leftEdgeX, leftEdgeY);
        drawSparkles(rightEdgeX, rightEdgeY);
        ctx.restore();
    }

    // Vignette Effect: Darkens edges and adds static when system friction is high
    const frictionThreshold = 0.05;
    if (systemFriction.value > frictionThreshold && !isLowPower.value && !isStabilizing.value && !isScreenReaderDetected.value) {
        ctx.save();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = Math.sqrt(centerX ** 2 + centerY ** 2);
        const frictionDelta = systemFriction.value - frictionThreshold;

        // Determine vignette color: dark red for critical noise, black otherwise
        const vignetteBaseColor = currentNoiseLevel.value >= 2 ? '40, 0, 0' : '0, 0, 0';

        // Create a radial gradient from the center to the corners
        const vignetteGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
        const intensity = Math.min(0.75, frictionDelta * 2.5);

        vignetteGradient.addColorStop(0.4, `rgba(${vignetteBaseColor}, 0)`); // Center remains clear
        vignetteGradient.addColorStop(1, `rgba(${vignetteBaseColor}, ${intensity})`); // Edges darken

        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle Static Burn-in (Grain Effect)
        let staticIntensity = frictionDelta * 2;
        if (currentNoiseLevel.value > 0) {
            // Synchronize static intensity with the system noise pulse (pulseFactor)
            // Fluctuates between 80% and 150% of the friction-based baseline
            staticIntensity *= (0.8 + pulseFactor * 0.7);
        }
        const grainCount = Math.floor(canvas.width * canvas.height * 0.02 * staticIntensity);

        for (let i = 0; i < grainCount; i++) {
            const gx = Math.random() * canvas.width;
            const gy = Math.random() * canvas.height;
            const dist = Math.sqrt((gx - centerX) ** 2 + (gy - centerY) ** 2);

            // Mask static to vignette area (starts at 40% radius)
            if (dist > outerRadius * 0.4) {
                const edgeRatio = (dist - outerRadius * 0.4) / (outerRadius * 0.6);
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08 * edgeRatio * staticIntensity})`;
                ctx.fillRect(gx, gy, 1, 1);
            }
        }
        ctx.restore();
    }

    // Draw System Velocity Readout
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillStyle = activeColor;
    ctx.textAlign = 'left';

    let textX = 8;
    let textY = 12;
    if (currentNoiseLevel.value >= 2 && !isLowPower.value) {
        textX += (Math.random() - 0.5) * 3; // Apply horizontal jitter
        textY += (Math.random() - 0.5) * 3; // Apply vertical jitter
    }

    const busLabel = `V-BUS: ${(1.618 + ioLoad.value).toFixed(3)}`;

    if (currentNoiseLevel.value >= 2 && !isLowPower.value) {
        // Chromatic Aberration for Text Readout
        ctx.save();
        ctx.fillStyle = abColor1;
        ctx.fillText(busLabel, textX + abOffsetFactor, textY);

        ctx.fillStyle = abColor2;
        ctx.fillText(busLabel, textX - abOffsetFactor, textY);
        ctx.restore();

        ctx.fillText(busLabel, textX, textY);
    } else {
        ctx.fillText(busLabel, textX, textY);
    }

    // 16-THREAD BUS Visualization: Shows anchored logic vs active searching
    const threadX = textX;
    const threadY = textY + 6;
    const bitW = 4;
    const bitH = 2;
    const bitGap = 1;

    ctx.save();
    for (let i = 0; i < busThreads.value.length; i++) {
        const isBitLocked = busThreads.value[i];
        // Simulate "searching" behavior for the next unlocked bit if the previous one is locked
        const isSearching = (i > 0 && busThreads.value[i - 1] && !isBitLocked && !isGlobalPurgeActive.value);

        const bx = threadX + (i * (bitW + bitGap));
        const isTraced = (i === activeTraceBit.value);

        if (isBitLocked) {
            ctx.fillStyle = activeColor;
            ctx.globalAlpha = 0.9;
            if (!isLowPower.value) ctx.shadowBlur = 4;
        } else if (isTraced) {
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.6 + Math.sin(timestamp * 0.01) * 0.3;
            if (!isLowPower.value) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#fff';
            }
        } else {
            ctx.fillStyle = isGlobalPurgeActive.value ? '#f00' : activeColor;
            // Searching head flickers intensely; idle threads remain faint baseline
            ctx.globalAlpha = isSearching ? (0.3 + Math.random() * 0.5) : 0.05; // Faint baseline for unlocked bits
        }
        ctx.fillRect(bx, threadY, bitW, bitH);

        if (isTraced) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx - 1, threadY - 1, bitW + 2, bitH + 2);
        }
    }
    ctx.restore();

    // KERNEL DIAGNOSTICS: FPS, Path Complexity & Memory Load
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Ignore distortion
    ctx.font = '7px "Share Tech Mono", monospace';

    let diagnosticColor = activeColor;
    if (fps.value < 30 && fps.value > 0) {
        const isFlickerRed = Math.floor(performance.now() / 150) % 2 === 0;
        diagnosticColor = isFlickerRed ? '#ff0000' : activeColor;
    }
    ctx.fillStyle = diagnosticColor;
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.5;

    // Memory Load: Active Particles (P) and Persistent Burn-in Pixels (B)
    const burnInCount = burnInPixels.value.length;
    const memLoad = binaryParticles.value.length + burnInCount;

    let memLoadColor = diagnosticColor;
    if (burnInCount > 800) {
        const isWarningFlicker = Math.floor(performance.now() / 200) % 2 === 0;
        // Warning: Yellow flicker if > 800, Solid Red if > 950
        memLoadColor = burnInCount > 950 ? '#ff0000' : (isWarningFlicker ? '#ffc107' : activeColor);
    }
    ctx.fillStyle = memLoadColor;
    ctx.fillText(`MEM_LOAD: ${memLoad} [P:${binaryParticles.value.length} B:${burnInCount}]`, canvas.width - 8, canvas.height - 14);

    ctx.fillStyle = diagnosticColor; // Reset for FPS line
    ctx.fillText(`FPS: ${fps.value} | PATHS: ${pathCount.value}`, canvas.width - 8, canvas.height - 6);
    ctx.restore();

    // GLOBAL STILLNESS Readout
    if (isStill) {
        ctx.save();
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = activeColor;
        ctx.globalAlpha = 0.5 + (stillnessPulseFactor * 0.5); // Pulse visibility in sync with substrate
        ctx.textAlign = 'right';
        ctx.fillText('GLOBAL STILLNESS', canvas.width - 8, 12);

        // Flickering 'DATA STABILIZED' for ultra-low friction states (< 0.02)
        if (systemFriction.value < 0.02 && Math.random() > 0.15) {
            const stabilizedLabel = 'DATA STABILIZED //';
            let stabilizedX = canvas.width - 110;
            let stabilizedY = 12;

            // Apply jitter first so the background and text move together
            stabilizedX += (Math.random() - 0.5) * 2;
            stabilizedY += (Math.random() - 0.5) * 2;

            // Background Pulse for 'DATA STABILIZED'
            ctx.save();
            ctx.fillStyle = activeColor;
            // Modulate opacity (0.0 to 0.2) in sync with the 4s stillness cycle
            ctx.globalAlpha = stillnessPulseFactor * 0.2;
            ctx.fillRect(stabilizedX - 2, stabilizedY - 9, 105, 12);

            // Subtle border stroke around the highlight
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = stillnessPulseFactor * 0.4; // Slightly more defined than the fill
            ctx.strokeRect(stabilizedX - 2, stabilizedY - 9, 105, 12);
            ctx.restore();

            ctx.save();
            // Subtle Red/Cyan offset to simulate chromatic aberration
            ctx.fillStyle = abColor1;
            ctx.fillText(stabilizedLabel, stabilizedX + abOffsetFactor, stabilizedY);

            ctx.fillStyle = abColor2;
            ctx.fillText(stabilizedLabel, stabilizedX - abOffsetFactor, stabilizedY);
            ctx.restore();

            ctx.fillText(stabilizedLabel, stabilizedX, stabilizedY);
        }
        ctx.restore();
    }

    // SUBSTRATE HEALTH Readout - Decreases as burnInPixels approach the 1000 limit
    let health = Math.max(0, Math.floor(100 * (1 - burnInPixels.value.length / 1000)));

    // If we are in the startup sequence, health follows the manifestation progress
    if (startupStartTime.value !== null && startupFade < 1) {
        health = Math.floor(startupFade * 100);
    } else if (isGlobalPurgeActive.value) {
        health = 0;
    }

    let healthX = 8;
    let healthY = canvas.height - 6;

    if (currentNoiseLevel.value >= 2 && !isLowPower.value && !isStabilizing.value) {
        healthX += (Math.random() - 0.5) * 2;
        healthY += (Math.random() - 0.5) * 2;
    }

    ctx.save();
    ctx.font = '9px "Share Tech Mono", monospace';
    // Color coding: Critical (<40%), Warning (<80%), Stable (activeColor)
    ctx.fillStyle = health < 40 ? '#ff0000' : (health < 80 ? '#ffc107' : activeColor);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 0.7; // Subtle diagnostic overlay look
    ctx.fillText(`SUBSTRATE HEALTH: ${health}%`, healthX, healthY);
    ctx.restore();

    // SYSTEM STABILITY TRACE - Line graph of friction history
    if (frictionHistory.value.length > 1) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Diagnostics ignore lens/glitch distortion

        const gWidth = 80;
        const gHeight = 15;
        const gx = canvas.width - gWidth - 8;
        const gy = canvas.height - gHeight - 22; // Positioned above the reset button

        // Background for Stability Trace: Solid red at 0% health, Pulsing red below 20%
        if (health < 20) {
            ctx.save();
            ctx.fillStyle = '#ff0000';
            if (health === 0) {
                // Solid warning state when substrate is fully saturated
                ctx.globalAlpha = isLowPower.value ? 0.15 : 0.4;
            } else {
                const pulse = (Math.sin(performance.now() * 0.008) + 1) / 2;
                ctx.globalAlpha = pulse * (isLowPower.value ? 0.1 : 0.25);
            }
            ctx.fillRect(gx, gy, gWidth, gHeight);
            ctx.restore();
        }

        // Background Grid for Stability Trace
        ctx.beginPath();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = isLowPower.value ? 0.05 : 0.1;
        for (let h = 0; h <= gHeight; h += 5) {
            ctx.moveTo(gx, gy + h);
            ctx.lineTo(gx + gWidth, gy + h);
        }
        for (let v = 0; v <= gWidth; v += 20) {
            ctx.moveTo(gx + v, gy);
            ctx.lineTo(gx + v, gy + gHeight);
        }
        ctx.stroke();

        ctx.lineWidth = 1;
        const baseAlpha = isLowPower.value ? 0.2 : 0.4;

        for (let i = 0; i < frictionHistory.value.length; i++) {
            const lx = gx + (i / (MAX_HISTORY - 1)) * gWidth;
            // Scale friction (0.0 to 0.3) to graph height
            const ly = gy + gHeight - (Math.min(1, frictionHistory.value[i] / 0.3) * gHeight);

            if (i > 0) {
                // Detect sudden friction delta between current and previous sample
                const delta = Math.abs(frictionHistory.value[i] - frictionHistory.value[i - 1]);
                const isSpike = delta > 0.05;

                ctx.beginPath();
                const prevLx = gx + ((i - 1) / (MAX_HISTORY - 1)) * gWidth;
                const prevLy = gy + gHeight - (Math.min(1, frictionHistory.value[i - 1] / 0.3) * gHeight);

                ctx.moveTo(prevLx, prevLy);
                ctx.lineTo(lx, ly);

                if (isSpike && !isLowPower.value) {
                    // Active Trace Pulsing: Spikes pulse their neon intensity
                    const tracePulse = (Math.sin(performance.now() * 0.02) + 1) / 2;
                    ctx.shadowBlur = 8 + (tracePulse * 12);
                    ctx.shadowColor = '#ff0000';
                    ctx.strokeStyle = '#ff0000';
                    ctx.globalAlpha = 0.5 + (tracePulse * 0.5);
                } else {
                    ctx.shadowBlur = 0;
                    // Visual feedback: Spikes turn red and gain higher opacity
                    ctx.strokeStyle = isSpike ? '#ff0000' : activeColor;
                    ctx.globalAlpha = isSpike ? 0.8 : baseAlpha;
                }

                ctx.stroke();
            }
        }
        ctx.shadowBlur = 0; // Ensure shadow doesn't bleed into other readouts

        ctx.font = '7px "Share Tech Mono", monospace';
        ctx.fillStyle = activeColor;
        ctx.textAlign = 'right';

        const lastIdx = frictionHistory.value.length - 1;
        const hasActiveSpike = lastIdx > 0 && Math.abs(frictionHistory.value[lastIdx] - frictionHistory.value[lastIdx - 1]) > 0.05;

        if (hasActiveSpike) {
            ctx.save();
            // Subtle blinking logic: Toggle visibility every 250ms
            const isIconVisible = Math.floor(performance.now() / 250) % 2 === 0;
            if (isIconVisible) {
                ctx.fillStyle = '#ff0000';
                const titleWidth = ctx.measureText('STABILITY TRACE').width;
                // Position triangle icon just to the left of the title
                ctx.fillText('▲', canvas.width - 12 - titleWidth, gy - 2);
            }
            ctx.restore();
        }

        ctx.fillText('STABILITY TRACE', canvas.width - 8, gy - 2);

        // Y-Axis Scale Reference Labels
        ctx.font = '5px "Share Tech Mono", monospace';
        ctx.globalAlpha = isLowPower.value ? 0.2 : 0.4;
        ctx.fillText('0.3', gx - 3, gy + 4);
        ctx.fillText('0.0', gx - 3, gy + gHeight);

        ctx.restore();
    }

    // STRUCTURAL INTEGRITY WARNING - Flashes when health is below 20%
    if (health < 20) {
        const flashInterval = 400; // Frequency of the flash in ms
        const isVisible = Math.floor(performance.now() / flashInterval) % 2 === 0;

        if (isVisible) {
            ctx.save();
            ctx.font = 'bold 10px "Share Tech Mono", monospace';
            ctx.fillStyle = '#ff0000';
            ctx.textAlign = 'center';

            let warnX = canvas.width / 2;
            let warnY = canvas.height - 18; // Positioned safely above health readout

            if (isCritical && !isLowPower.value) {
                warnX += (Math.random() - 0.5) * 4;
                warnY += (Math.random() - 0.5) * 2;
            }

            ctx.fillText('CRITICAL: STRUCTURAL INTEGRITY COMPROMISED', warnX, warnY);
            ctx.restore();
        }
    }

    // SYSTEM SHUTDOWN COUNTDOWN - Triggers if health stays at 0%
    if (health === 0) {
        if (!zeroHealthTimestamp.value) {
            zeroHealthTimestamp.value = performance.now();
        }

        const elapsed = performance.now() - zeroHealthTimestamp.value;
        const remaining = Math.max(0, 10 - Math.floor(elapsed / 1000));

        // Substrate Stress Hum: Increases in volume as shutdown nears
        if (!humNode.value && !isStartingHum) {
            isStartingHum = true;
            // Initialize a low-pass 'static' hum at 300Hz
            playSFX('static', { volume: 0, loop: true, frequency: 300 }).then(node => {
                if (node && node.gain) {
                    humNode.value = { source: node.source, gain: node.gain as GainNode };
                }
            });
        }

        if (humNode.value) {
            const progress = elapsed / 10000; // 0.0 to 1.0
            humNode.value.gain.gain.setTargetAtTime(progress * 0.5, 0, 0.1);
        }

        // Render Countdown
        ctx.save();
        ctx.font = 'bold 14px "Share Tech Mono", monospace';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';

        // Aggressive flicker/shake for the countdown
        let shakeX = 0, shakeY = 0;
        if (!isLowPower.value) {
            shakeX = (Math.random() - 0.5) * 6;
            shakeY = (Math.random() - 0.5) * 3;
        }

        ctx.fillText(`CRITICAL FAILURE: SHUTDOWN IN ${remaining}s`, canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);

        // Secondary sub-text
        ctx.font = '8px "Share Tech Mono", monospace';
        ctx.globalAlpha = 0.6;
        ctx.fillText('GROUND ASYMMETRY IMMEDIATELY', canvas.width / 2, canvas.height / 2 + 15);
        ctx.restore();

        // Final Shutdown Trigger
        if (remaining === 0) {
            stopHum();
            playSFX('reboot');
            triggerGlobalPurge(5000); // 5 second hard purge
            resetSubstrate();         // Wipe the artifacts
            zeroHealthTimestamp.value = null;
        }
    } else {
        zeroHealthTimestamp.value = null;
        stopHum();
    }

    // Scanline Overlay
    if (currentNoiseLevel.value > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 1;
        // Increase scanline prominence during high noise/interference
        const scanlineAlpha = currentNoiseLevel.value >= 2 ? 0.3 : 0.2;
        // Use red for Level 1 (Warning), black for Level 2+ (Critical)
        ctx.strokeStyle = currentNoiseLevel.value === 1
            ? `rgba(255, 0, 0, ${scanlineAlpha})`
            : `rgba(0, 0, 0, ${scanlineAlpha})`;

        // Vertical scrolling animation: Speed scales with noise level
        const scanSpeed = currentNoiseLevel.value >= 2 ? 0.12 : 0.04;
        const scanOffset = (performance.now() * scanSpeed) % 6;

        for (let y = scanOffset; y < canvas.height; y += 6) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // SIGNAL LOST Overlay - Triggers during critical noise (Level 2+)
    if (!isScreenReaderDetected.value && !isStabilizing.value && currentNoiseLevel.value >= 2 && (isLowPower.value ? true : Math.random() > 0.3)) {
        ctx.save();
        const dynamicFontSize = 12 + (pathCount.value / 64);
        ctx.font = `bold ${dynamicFontSize}px "Share Tech Mono", monospace`;
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Aggressive jitter for the 'glitch' effect
        let jitterX = 0, jitterY = 0;
        if (!isLowPower.value) {
            jitterX = (Math.random() - 0.5) * 8;
            jitterY = (Math.random() - 0.5) * 4;
        }

        ctx.fillText('SIGNAL LOST', canvas.width / 2 + jitterX, canvas.height / 2 + jitterY);
        ctx.restore();
    }

    // SIGNAL SUPPRESSED Overlay - Triggers when Focus Mode is manually active
    if (manualFocusMode.value) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // UI overlays ignore lens/glitch distortion
        ctx.font = 'bold 10px "Share Tech Mono", monospace';
        ctx.fillStyle = '#007bff'; // Use the focus-blue aesthetic
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Subtle pulsing for the suppression message
        ctx.globalAlpha = 0.6 + Math.sin(performance.now() * 0.004) * 0.2;

        ctx.fillText('SIGNAL SUPPRESSED', canvas.width / 2, canvas.height / 2 + 12);
        ctx.restore();
    }

    // CRITICAL INSTABILITY Overlay - High-intensity countdown before reboot
    if (rebootSeconds.value > 0) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.font = 'bold 12px "Share Tech Mono", monospace';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Aggressive jitter for impending failure
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 6;

        ctx.fillText(`CRITICAL INSTABILITY: REBOOT IN ${rebootSeconds.value}s`, canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
        ctx.restore();
    }

    // Global Purge Fade to Black
    if (isGlobalPurgeActive.value && purgeStartTime.value !== null) {
        const elapsed = performance.now() - purgeStartTime.value;
        const fadeAlpha = Math.min(1, elapsed / 1500); // Go to complete black over 1.5s

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation to ensure full coverage
        ctx.fillStyle = 'black';
        ctx.globalAlpha = fadeAlpha;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (fadeAlpha >= 1) {
            ctx.font = 'bold 10px "Share Tech Mono", monospace';
            ctx.fillStyle = '#00ff41';
            ctx.textAlign = 'center';

            // Apply slight jitter to the reboot text for a diagnostic feel
            let jitterX = 0, jitterY = 0;
            if (!isLowPower.value) {
                jitterX = (Math.random() - 0.5) * 2;
                jitterY = (Math.random() - 0.5) * 2;
            }

            // Insight: Add binary noise flicker to simulate low-level diagnostic signal
            const binarySuffix = isLowPower.value ? "...." : Array.from({ length: 4 }, () => Math.random() > 0.5 ? '1' : '0').join('');
            ctx.fillText(`SUBSTRATE REBOOT IN PROGRESS... [${binarySuffix}]`, canvas.width / 2 + jitterX, canvas.height / 2 + jitterY);
        }
        ctx.restore();
    }

    if (isGlitching.value || isCritical) {
        ctx.restore();
    }
};

onMounted(() => {
    requestAnimationFrame(draw);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrame);
});
</script>

<style scoped>
.visualizer-container {
    position: relative;
    width: 100%;
    height: 60px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(0, 255, 65, 0.2);
    transition: all 0.5s ease;
}

.visualizer-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.ambient-noise {
    border-bottom-color: rgba(255, 0, 0, 0.4) !important;
    animation: pulse-ambient 2s infinite ease-in-out;
}

.ambient-critical {
    /* Overrides animation duration for critical noise levels */
    animation-duration: 0.5s !important;
}

@keyframes pulse-ambient {

    0%,
    100% {
        box-shadow: inset 0 0 15px rgba(255, 0, 0, 0.1);
    }

    50% {
        box-shadow: inset 0 0 30px rgba(255, 0, 0, 0.3);
    }
}

.reset-btn {
    position: absolute;
    bottom: 5px;
    right: 8px;
    background: transparent;
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.6rem;
    transition: all 0.2s;
    z-index: 10;
}

.reset-btn:hover {
    background: rgba(0, 255, 65, 0.1);
    border-color: #00ff41;
}

.low-power-btn {
    position: absolute;
    bottom: 5px;
    right: 130px;
    background: transparent;
    border: 1px solid rgba(0, 255, 65, 0.3);
    color: #00ff41;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.6rem;
    transition: all 0.2s;
    z-index: 10;
}

.low-power-btn.active {
    background: rgba(0, 255, 65, 0.2);
    border-color: #00ff41;
}
</style>