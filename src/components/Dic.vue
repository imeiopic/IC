<template>
  <div class="dic-container p-4 bg-zinc-950 border border-zinc-800 rounded font-mono shadow-2xl">
    <header class="dic-header mb-4 border-b border-zinc-900 pb-3">
      <h2 class="text-glow text-info italic font-black uppercase tracking-widest mb-1">
        Sovereign DIC Interface
      </h2>

      <!-- Toast Notification Stack -->
      <div class="toast-stack fixed top-4 right-4 z-50 flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item bg-zinc-950 border border-red-900/50 p-3 rounded shadow-2xl animate-pulse"
        >
          <div class="flex items-center gap-2">
            <span class="text-danger font-black extra-tiny uppercase"
              >!!_TRANSMISSION_ERROR_!!</span
            >
            <button
              v-if="toast.retryAction"
              @click="
                toast.retryAction();
                removeToast(toast.id);
              "
              class="text-info extra-tiny font-black uppercase border border-info/30 px-2 py-0.5 rounded hover:bg-info/10 transition-colors ml-2 pointer-events-auto"
            >
              Retry
            </button>
            <button @click="removeToast(toast.id)" class="text-zinc-600 hover:text-white ml-auto">
              ×
            </button>
          </div>
          <div class="text-white tiny italic mt-1">{{ toast.message }}</div>
        </div>
      </div>

      <p class="extra-tiny text-zinc-500 uppercase tracking-tighter">
        // Direct Inner Circle // Node-to-Node Secure Handshake
      </p>
    </header>

    <div class="dic-content">
      <!-- Language Controls -->
      <div class="chat-controls d-flex gap-4 mb-4 p-2 bg-black/40 rounded border border-zinc-900">
        <div class="lang-group">
          <label class="extra-tiny text-zinc-500 font-black uppercase d-block mb-1"
            >Source_Input</label
          >
          <select
            v-model="sourceLang"
            class="form-select extra-tiny bg-black text-info border-zinc-800"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
        <div class="lang-group">
          <label class="extra-tiny text-zinc-500 font-black uppercase d-block mb-1"
            >Target_Output</label
          >
          <select
            v-model="targetLang"
            class="form-select extra-tiny bg-black text-info border-zinc-800"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Transmission Feed -->
      <div
        class="chat-window mb-4 bg-black border border-zinc-900 rounded p-3 overflow-y-auto"
        ref="feed"
      >
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['msg mb-3', msg.from === 'me' ? 'me' : 'them']"
        >
          <div class="msg-meta extra-tiny mb-1 text-zinc-600">
            <span class="font-black text-zinc-400">{{
              msg.from === 'me' ? 'LOCAL_NODE' : 'REMOTE_PEER'
            }}</span>
            <span class="mx-1">::</span>
            <span>{{ msg.lang }} → {{ msg.targetLang }}</span>
          </div>
          <div class="msg-bubble p-2 rounded border border-zinc-800 bg-zinc-900/50">
            <div class="msg-text small text-white">{{ msg.text }}</div>
            <div v-if="msg.translation" class="msg-translation mt-2 pt-2 border-t border-zinc-800">
              <span class="text-success opacity-75 mr-1">→</span>
              <span class="tiny text-success italic">{{ msg.translation }}</span>
              <button
                @click="play(msg.translation, msg.targetLang)"
                class="tts-btn ml-2 opacity-50 hover:opacity-100"
              >
                🔊
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Interface -->
      <div class="transmission-input d-flex gap-2">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="ENTER_DATA_PACKET..."
          class="form-control extra-tiny bg-black text-info border-zinc-800 focus:border-info"
        />
        <button
          @click="toggleRecognition"
          :class="['btn btn-sm px-3', recognizing ? 'btn-danger' : 'btn-outline-info']"
        >
          {{ recognizing ? '⏹' : '🎤' }}
        </button>
        <button @click="sendMessage" class="btn btn-sm btn-info font-black italic shadow-glow">
          SEND
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { apiFetch } from '@/api';
import { isDICPacket, type DICPacket, type Toast } from '@/types/dic';

const props = defineProps<{
  initialInput?: string;
}>();

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
const messages = reactive<DICPacket[]>([]);
const toasts = reactive<Toast[]>([]);
const feed = ref<HTMLElement | null>(null);

watch(
  () => props.initialInput,
  (newVal) => {
    if (newVal) {
      input.value = newVal;
    }
  },
  { immediate: true }
);

const addToast = (message: string, type: 'error' | 'info' = 'error', retry?: () => void) => {
  const id = Date.now();
  toasts.push({ id, message, type, retryAction: retry });
  setTimeout(() => removeToast(id), 5000);
};

const removeToast = (id: number) => {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
};

let recognition: any = null;
let ws: WebSocket | null = null;

const log = (...args: any[]) => console.log('[DIC_PROTOCOL]', ...args);

const scrollToBottom = async () => {
  await nextTick();
  if (feed.value) feed.value.scrollTop = feed.value.scrollHeight;
};

const connectWS = () => {
  if (ws) ws.close();
  const wsUrl = import.meta.env.VITE_DIC_WS_URL || 'ws://localhost:5001';
  ws = new WebSocket(wsUrl);

  ws.onopen = () => log('SECURE_SOCKET_OPEN');
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (isDICPacket(data)) {
        if (data.from === 'me') data.from = 'them'; // Mark incoming peer messages
        messages.push(data);
        scrollToBottom();
      } else {
        log('INVALID_PACKET_DROPPED', data);
      }
    } catch (e) {
      log('DATA_FRACTURE', e);
    }
  };
};

onMounted(() => connectWS());
onUnmounted(() => {
  ws?.close();
  recognition?.stop();
});

const sendMessage = async () => {
  if (!input.value.trim()) return;

  const msg: DICPacket = {
    id: Date.now(),
    timestamp: Date.now(),
    from: 'me',
    text: input.value,
    lang: sourceLang.value,
    targetLang: targetLang.value,
    translation: '',
    status: 'transmitting',
  };

  messages.push(msg);
  input.value = '';
  scrollToBottom();

  const attemptSend = async () => {
    const translation = await translateText(msg.text, msg.lang, msg.targetLang, attemptSend);
    msg.translation = translation;

    if (translation !== '!!_TRANS_FRACTURE_!!') {
      msg.status = 'synced';
      if (ws?.readyState === 1) {
        ws.send(JSON.stringify(msg));
      }
      scrollToBottom();
    } else {
      msg.status = 'fractured';
    }
  };

  await attemptSend();
};

const toggleRecognition = () => {
  if (recognizing.value) {
    recognition?.stop();
    return;
  }
  if (!('webkitSpeechRecognition' in window)) return;

  recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = sourceLang.value;
  recognition.onresult = (e: any) => {
    input.value = e.results[0][0].transcript;
    recognizing.value = false;
  };
  recognition.onend = () => (recognizing.value = false);
  recognizing.value = true;
  recognition.start();
};

async function translateText(
  text: string,
  from: string,
  to: string,
  onRetry?: () => void
): Promise<string> {
  try {
    const res = await apiFetch('/dic/translate', {
      method: 'POST',
      body: JSON.stringify({ text, from, to }),
    });
    const data = await res.json();
    return data.translation || '...';
  } catch (e) {
    log('TRANSLATION_ERROR', e);
    addToast('Translation uplink failed. check network or API keys.', 'error', onRetry);
    return '!!_TRANS_FRACTURE_!!';
  }
}

const play = (text: string, lang: string) => {
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  window.speechSynthesis.speak(utter);
};
</script>

<style scoped>
.toast-stack {
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  min-width: 240px;
}
.dic-container {
  max-width: 600px;
  margin: 2rem auto;
}
.chat-window {
  height: 400px;
}
.msg {
  max-width: 85%;
}
.msg.me {
  margin-left: auto;
  text-align: right;
}
.msg.them {
  margin-right: auto;
  text-align: left;
}
.msg-bubble {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
.me .msg-bubble {
  border-color: #004d61;
  background: #002b36;
}
.text-glow {
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.5);
}
.shadow-glow {
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}
.extra-tiny {
  font-size: 0.6rem;
}
.tiny {
  font-size: 0.75rem;
}
.font-black {
  font-weight: 900;
}
.tts-btn {
  background: none;
  border: none;
  cursor: pointer;
}

/* Custom Scrollbar */
.chat-window::-webkit-scrollbar {
  width: 4px;
}
.chat-window::-webkit-scrollbar-track {
  background: transparent;
}
.chat-window::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 10px;
}
.chat-window::-webkit-scrollbar-thumb:hover {
  background: #444;
}

/* Animation */
.msg {
  animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
