<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Sign Manifesto</h2>
      <canvas
        ref="canvas"
        width="400"
        height="200"
        class="signature-canvas"
      ></canvas>
      <div class="actions">
        <button @click="clear">Clear</button>
        <button @click="submit">Submit</button>
        <button @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SignaturePad from "signature_pad";
const emit = defineEmits(["success", "close"]);
const canvas = ref(null);
let signaturePad;

onMounted(() => {
  signaturePad = new SignaturePad(canvas.value, {
    backgroundColor: "#fff",
  });
});

function clear() {
  signaturePad.clear();
}
function submit() {
  if (signaturePad.isEmpty()) {
    alert("Please provide a signature first.");
    return;
  }
  const dataUrl = signaturePad.toDataURL();
  emit("success", dataUrl);
}
</script>

<style scoped>
.signature-canvas {
  border: 1px solid #ccc;
  background: #fff;
}
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>
