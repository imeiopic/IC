<template>
  <div class="dic-chat">
    <h2>DIC Real-Time Chat</h2>
    <div class="chat-controls">
      <label
        >Your Language:
        <select v-model="sourceLang">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </label>
      <label
        >Target Language:
        <select v-model="targetLang">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </label>
    </div>
    <div class="chat-window">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['msg', msg.from === 'me' ? 'me' : 'them']"
      >
        <div class="msg-meta">
          {{ msg.from === 'me' ? 'You' : 'Partner' }} ({{ getLangName(msg.lang) }} →
          {{ getLangName(msg.targetLang) }})
        </div>
        <div class="msg-text">{{ msg.text }}</div>
        <div v-if="msg.translation" class="msg-translation">
          → {{ msg.translation }} ({{ getLangName(msg.targetLang) }})
          <button @click="play(msg.translation, msg.targetLang)">🔊</button>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="input" @keyup.enter="sendMessage" placeholder="Type or use mic..." />
      <button @click="startRecognition" :disabled="recognizing">🎤</button>
      <button @click="stopRecognition" :disabled="!recognizing">⏹️</button>
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'fa', name: 'Persian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'th', name: 'Thai' },
];

const sourceLang = ref('en');
const targetLang = ref('es');
const input = ref('');
const recognizing = ref(false);
const messages = reactive<any[]>([]);
let recognition: any = null;
let ws: WebSocket | null = null;

function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[DICChat]', ...args);
}

function getLangName(code: string) {
  return languages.find((l) => l.code === code)?.name || code;
}

function connectWS() {
  if (ws) ws.close();
  log('Connecting to WebSocket ws://localhost:5001');
  ws = new WebSocket('ws://localhost:5001');
  ws.onopen = () => log('WebSocket connected');
  ws.onerror = (e) => log('WebSocket error', e);
  ws.onclose = (e) => log('WebSocket closed', e);
  ws.onmessage = (event) => {
    log('WebSocket message', event.data);
    try {
      const msg = JSON.parse(event.data);
      messages.push(msg);
    } catch (err) {
      log('WebSocket message parse error', err, event.data);
    }
  };
}

onMounted(() => {
  connectWS();
});

onUnmounted(() => {
  if (ws) ws.close();
  if (recognition) recognition.stop();
});

function sendMessage() {
  if (!input.value.trim()) return;
  const msg = {
    id: Date.now() + Math.random(),
    from: 'me',
    text: input.value,
    lang: sourceLang.value,
    targetLang: targetLang.value,
    translation: '',
  };
  messages.push(msg);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(msg));
  }
  translateText(msg.text, msg.lang, msg.targetLang, (t) => {
    msg.translation = t;
  });
  input.value = '';
}

function startRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser.');
    return;
  }
  recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = sourceLang.value;
  recognition.interimResults = false;
  recognition.onresult = (event: any) => {
    input.value = event.results[0][0].transcript;
    recognizing.value = false;
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

async function translateText(text: string, from: string, to: string, cb: (t: string) => void) {
  log('Translating', { text, from, to });
  try {
    const res = await fetch(`/api/dic/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });
    log('Translation API response status', res.status);
    const contentType = res.headers.get('content-type');
    log('Translation API content-type', contentType);
    const textResponse = await res.text();
    log('Translation API raw response', textResponse);
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (err) {
      log('Translation API JSON parse error', err, textResponse);
      cb('Translation error');
      return;
    }
    cb(data.translation);
  } catch (err) {
    log('Translation API fetch error', err);
    cb('Translation error');
  }
}

function play(text: string, lang: string) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech not supported in this browser.');
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
}
</script>

<style scoped>
.dic-chat {
  margin: 2rem auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fafbfc;
}
.chat-window {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
}
.msg {
  margin-bottom: 1rem;
}
.msg.me {
  text-align: right;
}
.msg.them {
  text-align: left;
}
.msg-meta {
  font-size: 0.8em;
  color: #888;
}
.msg-translation {
  font-size: 0.95em;
  color: #2a7;
}
.chat-input {
  display: flex;
  gap: 0.5rem;
}
input {
  flex: 1;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
</style>
