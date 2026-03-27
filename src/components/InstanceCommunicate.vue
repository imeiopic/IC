
<template>
  <div class="io-com-page">
    <h1>IO Com</h1>
    <div class="peer-section">
      <div>
        <label>Your Peer ID:</label>
        <input v-model="myPeerId" readonly style="width: 260px;" />
        <button @click="copyPeerId">Copy</button>
      </div>
      <div style="margin-top:1rem;">
        <label>Connect to Peer ID:</label>
        <input v-model="remotePeerId" placeholder="Enter peer ID" style="width: 200px;" />
        <button @click="callPeer">Call</button>
      </div>
    </div>
    <div class="video-section">
      <div>
        <h3>Local Video</h3>
        <video ref="localVideo" autoplay playsinline muted width="320" height="240" style="background:#222; transform:scaleX(-1);" />
      </div>
      <div>
        <h3>Remote Video</h3>
        <video ref="remoteVideo" autoplay playsinline width="320" height="240" style="background:#222;" />
      </div>
    </div>
    <div class="chat-section">
      <h3>Text Chat</h3>
      <div class="chat-log" ref="chatLog">
        <div v-for="(msg, idx) in chatMessages" :key="idx" :class="msg.sender === 'me' ? 'chat-me' : 'chat-them'">
          <span v-if="msg.type === 'text'">{{ msg.sender }}: {{ msg.content }}</span>
          <span v-else-if="msg.type === 'file'">
            {{ msg.sender }} sent a file:
            <a :href="msg.fileUrl" :download="msg.fileName">{{ msg.fileName }}</a>
          </span>
        </div>
      </div>
      <form class="chat-input" @submit.prevent="sendChatMessage">
        <input v-model="chatInput" placeholder="Type a message..." autocomplete="off" />
        <button type="submit">Send</button>
        <input type="file" ref="fileInput" @change="sendFile" style="margin-left:1rem;" />
      </form>
    </div>
    <div v-if="status" class="status">{{ status }}</div>
  </div>
</template>


<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Peer from 'peerjs'
type MediaConnection = import('peerjs').MediaConnection
type DataConnection = import('peerjs').DataConnection

const myPeerId = ref('')
const remotePeerId = ref('')
const status = ref('')
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)
let peer: Peer | null = null
let localStream: MediaStream | null = null
let currentCall: MediaConnection | null = null

let dataConn: DataConnection | null = null
const chatMessages = ref<any[]>([])
const chatInput = ref('')
const chatLog = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function copyPeerId() {
  navigator.clipboard.writeText(myPeerId.value)
  status.value = 'Peer ID copied!'
  setTimeout(() => (status.value = ''), 1200)
}

function callPeer() {
  if (!remotePeerId.value || !peer || !localStream) {
    status.value = 'Missing peer ID or local stream.'
    return
  }
  status.value = 'Calling peer...'
  const call = peer.call(remotePeerId.value, localStream)
  setupCallHandlers(call)

  // Data connection for chat/file
  dataConn = peer.connect(remotePeerId.value)
  setupDataConnHandlers(dataConn, 'me')
}

function setupCallHandlers(call: MediaConnection) {
  currentCall = call
  call.on('stream', (remoteStream: MediaStream) => {
    if (remoteVideo.value) {
      remoteVideo.value.srcObject = remoteStream
    }
    status.value = 'Connected!'
  })
  call.on('close', () => {
    status.value = 'Call ended.'
    if (remoteVideo.value) remoteVideo.value.srcObject = null
  })
  call.on('error', err => {
    status.value = 'Call error: ' + err
  })
}

function setupDataConnHandlers(conn: DataConnection, sender: 'me' | 'them') {
  dataConn = conn
  conn.on('open', () => {
    status.value = 'Chat connected!'
  })
  conn.on('data', (data: any) => {
    if (data.type === 'text') {
      chatMessages.value.push({ sender: sender === 'me' ? 'them' : 'me', type: 'text', content: data.content })
    } else if (data.type === 'file') {
      // Receive file as blob
      const blob = new Blob([data.file], { type: data.fileType })
      const fileUrl = URL.createObjectURL(blob)
      chatMessages.value.push({ sender: sender === 'me' ? 'them' : 'me', type: 'file', fileName: data.fileName, fileUrl })
    }
    nextTick(() => {
      if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight
    })
  })
  conn.on('close', () => {
    status.value = 'Chat disconnected.'
  })
  conn.on('error', err => {
    status.value = 'Chat error: ' + err
  })
}

function sendChatMessage() {
  if (!chatInput.value || !dataConn || dataConn.open === false) return
  dataConn.send({ type: 'text', content: chatInput.value })
  chatMessages.value.push({ sender: 'me', type: 'text', content: chatInput.value })
  chatInput.value = ''
  nextTick(() => {
    if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight
  })
}

function sendFile(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files[0] || !dataConn || dataConn.open === false) return
  const file = files[0]
  const reader = new FileReader()
  reader.onload = function(evt) {
    if (evt.target && evt.target.result) {
      dataConn!.send({
        type: 'file',
        file: evt.target.result,
        fileName: file.name,
        fileType: file.type
      })
      // Show in chat
      const fileUrl = URL.createObjectURL(new Blob([evt.target.result as ArrayBuffer], { type: file.type }))
      chatMessages.value.push({ sender: 'me', type: 'file', fileName: file.name, fileUrl })
      nextTick(() => {
        if (chatLog.value) chatLog.value.scrollTop = chatLog.value.scrollHeight
      })
    }
  }
  reader.readAsArrayBuffer(file)
  // Reset file input
  if (fileInput.value) fileInput.value.value = ''
}

onMounted(async () => {
  // Get or generate a unique peer ID (use userEmail or random)
  myPeerId.value = localStorage.getItem('userEmail') || 'peer-' + Math.random().toString(36).slice(2, 10)
  peer = new Peer(myPeerId.value, { debug: 2 })

  peer.on('open', id => {
    myPeerId.value = id
    status.value = 'Ready. Share your Peer ID.'
  })
  peer.on('error', err => {
    status.value = 'Peer error: ' + err
  })

  // Get local media
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (localVideo.value) {
      localVideo.value.srcObject = localStream
    }
  } catch (e) {
    status.value = 'Could not access camera/mic.'
    return
  }

  // Listen for incoming calls
  peer.on('call', (call: MediaConnection) => {
    status.value = 'Incoming call...'
    call.answer(localStream!)
    setupCallHandlers(call)
  })

  // Listen for incoming data connections
  peer.on('connection', (conn: DataConnection) => {
    setupDataConnHandlers(conn, 'them')
  })
})

onBeforeUnmount(() => {
  if (currentCall) currentCall.close()
  if (peer) peer.destroy()
  if (localVideo.value) localVideo.value.srcObject = null
  if (remoteVideo.value) remoteVideo.value.srcObject = null
  if (dataConn) dataConn.close()
})
</script>

<style scoped>
.instance-communicate-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  text-align: center;
}
.peer-section {
  margin-bottom: 2rem;
}
.video-section {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}
.status {
  margin-top: 1rem;
  color: #1976d2;
  font-weight: bold;
}

.chat-section {
  margin: 2rem auto 0 auto;
  max-width: 500px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.chat-log {
  height: 180px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
}
.chat-me {
  text-align: right;
  color: #1976d2;
}
.chat-them {
  text-align: left;
  color: #333;
}
.chat-input {
  display: flex;
  gap: 0.5rem;
}
</style>
