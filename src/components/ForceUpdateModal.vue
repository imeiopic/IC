<template>
    <div class="force-update-overlay" role="dialog" aria-modal="true" aria-labelledby="update-title">
        <div class="force-update-modal scanline-bg">
            <!-- Using your existing glitch effect classes -->
            <h2 id="update-title" class="glitch text-danger title" data-text="CRITICAL UPDATE REQUIRED">
                CRITICAL UPDATE REQUIRED
            </h2>

            <div class="message-body font-monospace text-warning opacity-75 mt-3">
                <p>
                    A new iteration of the Iopic World logic fabric has been deployed.
                </p>
                <p>
                    Your current local session is out of sync with the physical and digital substrate.
                    Continuing without synchronization may cause data corruption or chaos state divergence.
                </p>
            </div>

            <div class="d-flex justify-content-center mt-4">
                <button @click="initiateReboot" class="btn btn-outline-danger glitch bootstrap-btn"
                    data-text="INITIATE SYSTEM REBOOT">
                    INITIATE SYSTEM REBOOT
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const initiateReboot = () => {
    // Appending a timestamp query parameter ensures the browser 
    // completely bypasses the local cache when fetching the new index.html
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('t', Date.now().toString());
    window.location.href = currentUrl.toString();
};
</script>

<style scoped>
.force-update-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 9999;
    /* Ensure this sits above everything else */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.force-update-modal {
    background: rgba(20, 0, 0, 0.95);
    border: 1px solid #ff003c;
    box-shadow: 0 0 30px rgba(255, 0, 60, 0.3), inset 0 0 20px rgba(255, 0, 60, 0.1);
    padding: 2.5rem;
    border-radius: 8px;
    text-align: center;
    max-width: 600px;
    position: relative;
    overflow: hidden;
}

.title {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    margin-bottom: 1rem;
}

.message-body p {
    margin-bottom: 0.5rem;
}
</style>