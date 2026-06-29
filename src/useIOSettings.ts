import { ref, watch } from 'vue';

const isMuted = ref(false);
const masterVolume = ref(0.4);
const ioLoad = ref(0);
const audioActivityKey = ref(0);
const lastSfxType = ref('');

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;
const soundBuffers: Record<string, AudioBuffer> = {};

/**
 * Synthesizes a white noise buffer for the 'static' (error/purge) sound.
 */
const createStaticBuffer = (ctx: AudioContext) => {
    const length = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

/**
 * Synthesizes a rising arpeggio for the 'fulfill' (success) sound.
 */
const createFulfillBuffer = (ctx: AudioContext) => {
    const length = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    for (let i = 0; i < length; i++) {
        const t = i / ctx.sampleRate;
        const noteIdx = Math.min(Math.floor(t * 4), freqs.length - 1);
        data[i] = Math.sin(2 * Math.PI * freqs[noteIdx] * t) * Math.max(0, 1 - t);
    }
    return buffer;
};

/**
 * Synthesizes a short, sharp white noise burst for the 'glitch' sound.
 * The actual glitch effect (modulation) will be applied in playSFX.
 */
const createGlitchBuffer = (ctx: AudioContext) => {
    // This buffer will be played for a short, random duration in playSFX
    const length = ctx.sampleRate * 0.3; // Max duration of the glitch sound source
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
};

/**
 * Synthesizes a 'reboot' sound: a power-down descent followed by a sharp startup chime.
 */
const createRebootBuffer = (ctx: AudioContext) => {
    const length = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        const t = i / ctx.sampleRate;
        if (t < 0.8) {
            const f = 200 * Math.pow(0.1, t / 0.8);
            data[i] = Math.sin(2 * Math.PI * f * t) * (0.8 - t);
        } else {
            const tRel = t - 0.8;
            data[i] = Math.sin(2 * Math.PI * 880 * tRel) * Math.exp(-tRel * 10);
        }
    }
    return buffer;
};

/**
 * Synthesizes a subtle 'tick' sound: a very short high-frequency pulse.
 */
const createTickBuffer = (ctx: AudioContext) => {
    const length = Math.floor(ctx.sampleRate * 0.005); // 5ms
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        const t = i / ctx.sampleRate;
        data[i] = Math.sin(2 * Math.PI * 4000 * t) * Math.exp(-t * 1000);
    }
    return buffer;
};

/**
 * Synthesizes a clean sine wave for 'order' (system interaction/tuning).
 */
const createOrderBuffer = (ctx: AudioContext) => {
    const length = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
        data[i] = Math.sin(2 * Math.PI * 440 * (i / ctx.sampleRate));
    }
    return buffer;
};

export function useIOSettings() {
    const initAudio = async () => {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') await audioCtx.resume();
            return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        
        masterGain = audioCtx.createGain();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256; // Decent balance between resolution and performance

        masterGain.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);

        soundBuffers['static'] = createStaticBuffer(audioCtx);
        soundBuffers['fulfill'] = createFulfillBuffer(audioCtx);
        soundBuffers['order'] = createOrderBuffer(audioCtx);
        soundBuffers['glitch'] = createGlitchBuffer(audioCtx); // Add glitch buffer
        soundBuffers['reboot'] = createRebootBuffer(audioCtx); // Add reboot buffer
        soundBuffers['tick'] = createTickBuffer(audioCtx); // Add tick buffer

        syncVolume();
    };

    const syncVolume = () => {
        if (!masterGain || !audioCtx) return;
        const targetValue = isMuted.value ? 0 : masterVolume.value;
        masterGain.gain.setTargetAtTime(targetValue, audioCtx.currentTime, 0.05);
    };

    watch([isMuted, masterVolume], syncVolume);

    const playSFX = async (key: string, options: { frequency?: number, volume?: number, loop?: boolean } = {}) => {
        if (!audioCtx) await initAudio();
        const buffer = soundBuffers[key];
        if (!buffer || !audioCtx || !masterGain) return null;

        // Update telemetry for diagnostic badges
        lastSfxType.value = key;
        audioActivityKey.value++;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        if (options.loop) source.loop = true;

        let currentNode: AudioNode = source;
        const now = audioCtx.currentTime;
        let sfxDuration = buffer.duration; // Default duration is the full buffer length

        if (key === 'glitch') {
            const glitchDuration = 0.1 + Math.random() * 0.2; // Random duration between 0.1 and 0.3 seconds
            sfxDuration = glitchDuration; // Override duration for glitch

            // Glitch Filter Modulation: Rapidly sweep frequency
            const glitchFilter = audioCtx.createBiquadFilter();
            glitchFilter.type = 'lowpass';
            const startFreq = 8000 + Math.random() * 4000; // Start high (8k-12k Hz)
            const endFreq = 200 + Math.random() * 800;    // End low (200-1000 Hz)
            glitchFilter.frequency.setValueAtTime(startFreq, now);
            glitchFilter.frequency.linearRampToValueAtTime(endFreq, now + glitchDuration * 0.8); // Ramp down
            glitchFilter.frequency.linearRampToValueAtTime(0, now + glitchDuration); // Cut off at the end
            currentNode.connect(glitchFilter);
            currentNode = glitchFilter;

            // Glitch Volume Modulation: Random start volume and fade out
            const glitchGain = audioCtx.createGain();
            const startVol = 0.5 + Math.random() * 0.5; // Random volume between 0.5 and 1.0
            glitchGain.gain.setValueAtTime(startVol, now);
            glitchGain.gain.linearRampToValueAtTime(0, now + glitchDuration); // Fade out
            currentNode.connect(glitchGain);
            currentNode = glitchGain;

            currentNode.connect(masterGain);
            source.start(now, 0, sfxDuration);
            return { source, gain: glitchGain };
        } else {
            // Existing filter and gain logic for other SFX (static, fulfill, order)
            // Apply a low-pass filter to simulate distance (muffling effect)
            if (key === 'static' || options.frequency) {
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(options.frequency ?? 1000, now);
                currentNode.connect(filter);
                currentNode = filter;
            }
            
            let gainNode: GainNode | undefined;
            // Apply a GainNode for volume reduction based on distance
            if (options.volume !== undefined) { // Check for undefined to allow 0 volume
                gainNode = audioCtx.createGain();
                gainNode.gain.setValueAtTime(options.volume, now);
                currentNode.connect(gainNode);
                currentNode = gainNode;
            }

            currentNode.connect(masterGain);
            // Omitting sfxDuration if looping to allow continuous playback
            source.start(now, 0, options.loop ? undefined : sfxDuration);
            return { source, gain: gainNode };
        }
    };

    const setIOLoadFromCount = (count: number) => {
        ioLoad.value = Math.min(count / 10, 1);
    };

    return {
        isMuted,
        masterVolume,
        ioLoad,
        audioActivityKey,
        lastSfxType,
        playSFX,
        analyserNode: () => analyserNode,
        preloadSounds: initAudio,
        setIOLoadFromCount
    };
}