<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Fingerprint Capture</h2>
      <div class="fingerprint-box">
        <p>
          Place your finger on the sensor and click capture.<br />
          <small
            >Fingerprint data is stored securely in your node's personal
            storage.</small
          >
        </p>
        <button @click="capture">Capture Fingerprint</button>
        <button @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["success", "close"]);
async function capture() {
  // WebAuthn integration for fingerprint
  try {
    const publicKey = {
      challenge: new Uint8Array(32), // Should be set by backend for real security
      rp: { name: "IOPIC-VRE" },
      user: {
        id: new Uint8Array(16), // Should be unique per user
        name: "user@iopic",
        displayName: "IOPIC User",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    };
    const cred = await navigator.credentials.create({ publicKey });
    emit("success", JSON.stringify(cred));
  } catch (e) {
    alert("Fingerprint/WebAuthn failed: " + (e?.message || e));
  }
}
</script>

<style scoped>
.fingerprint-box {
  margin-top: 1rem;
}
</style>
