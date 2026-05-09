<template>
  <div class="dic-client">
    <h2>Direct Internet Communication (DIC)</h2>
    <div>
      <label
        >Your Language:
        <select v-model="sourceLang">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="fr">French</option>
        </select>
      </label>
      <label
        >Target Language:
        <select v-model="targetLang">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="de">German</option>
          <option value="fr">French</option>
        </select>
      </label>
    </div>
    <div>
      <button @click="startRecognition" :disabled="recognizing">🎤 Speak</button>
      <button @click="stopRecognition" :disabled="!recognizing">⏹️ Stop</button>
    </div>
    <div>
      <p><strong>You said:</strong> {{ transcript }}</p>
      <p><strong>Translation:</strong> {{ translation }}</p>
      <button v-if="translation" @click="speakTranslation">🔊 Play Translation</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sourceLang = ref('en');
const targetLang = ref('es');
const transcript = ref('');
const translation = ref('');
const recognizing = ref(false);
let recognition: any = null;

function startRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser.');
    return;
  }
  recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = sourceLang.value;
  recognition.interimResults = false;
  recognition.onresult = (event: any) => {
    transcript.value = event.results[0][0].transcript;
    recognizing.value = false;
    translateText(transcript.value, sourceLang.value, targetLang.value);
  };
  recognition.onerror = () => (recognizing.value = false);
  recognition.onend = () => (recognizing.value = false);
  recognizing.value = true;
  recognition.start();
}

function stopRecognition() {
  if (recognition) recognition.stop();
  recognizing.value = false;
}

async function translateText(text: string, from: string, to: string) {
  // Call backend API for translation
  const res = await fetch(`/api/dic/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, from, to })
  });
  const data = await res.json();
  translation.value = data.translation;
}

function speakTranslation() {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech not supported in this browser.');
    return;
  }
  const utter = new SpeechSynthesisUtterance(translation.value);
  utter.lang = targetLang.value;
  window.speechSynthesis.speak(utter);
}
</script>

<style scoped>
.dic-client {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafbfc;
}
label {
  margin-right: 1rem;
}
button {
  margin: 0.5rem 0.5rem 0.5rem 0;
}
</style>
