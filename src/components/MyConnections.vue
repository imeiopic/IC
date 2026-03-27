<template>
    <div class="my-connections">
        <!-- Profile Image -->
        <div style="display:flex;justify-content:center;margin-bottom:1.5rem;">
          <img src="../assets/images/myworld.png" alt="Connection" class="myworld-img" />
        </div>

        <!-- Connections Card -->
        <div class="connections-card">
          <template v-if="connections.length > 0">
            <div class="connection-list">
              <div v-for="(conn, idx) in connections" :key="idx" class="connection-item">
                <img :src="conn.img ? conn.img : '../assets/images/profile.png'" alt="Connection" class="conn-img" />
                <span>{{ conn.display }}</span>
                <a href="#" @click.prevent="removeConnection(idx)">Remove</a>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="placeholder-list">
              <div v-for="n in 4" :key="n" class="connection-item placeholder" @click="toggleActions">
                <img src="../assets/images/profile.png" alt="Profile" class="conn-img" />
                <span>Empty</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Action Buttons Card -->
        <div class="actions-card" v-show="showActions">
          <div class="actions-grid">
            <a href="#" class="action-btn" @click.prevent="activePopover = 'scan'">
              <img src="../assets/images/scanqr.png" alt="Scan" />
              <span>Scan</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'show'">
              <img src="../assets/images/showqr.png" alt="Show QR" />
              <span>Show</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="openLocationPopover">
              <img src="../assets/images/mylocation.png" alt="My Location" />
              <span>Loc</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'wifi'">
              <img src="../assets/images/mywifi.png" alt="My Wifi" />
              <span>Wifi</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'bluetooth'">
              <img src="../assets/images/mybluetooth.png" alt="My Bluetooth" />
              <span>My BT</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'nfc'">
              <img src="../assets/images/mynfc.png" alt="My NFC" />
              <span>NFC</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'sms'">
              <img src="../assets/images/myemail.png" alt="Send SMS" />
              <span>SMS</span>
            </a>
            <a href="#" class="action-btn" @click.prevent="activePopover = 'mms'">
              <img src="../assets/images/myemail.png" alt="Send MMS" />
              <span>MMS</span>
            </a>
          </div>
        </div>

        <!-- Popovers for all actions -->
        <div v-if="activePopover" class="qr-popover-overlay" @click.self="activePopover = ''">
          <div class="qr-popover">
            <button class="qr-popover-close" @click="activePopover = ''">&times;</button>
            <template v-if="activePopover === 'scan'">
              <qrcode-stream @decode="onDecode" @init="onInit" />
              <div v-if="qrError" class="error">{{ qrError }}</div>
            </template>
            <template v-else-if="activePopover === 'show'">
              <qrcode-vue :value="myIdentifier" :size="180" background="#fff" foreground="#222" />
              <div style="margin-top:0.5rem; color:#333;">Scan this QR to connect with you</div>
              <div style="font-size:0.9em; color:#888; word-break:break-all;">{{ myIdentifier }}</div>
            </template>
            <template v-else-if="activePopover === 'loc'">
              <div v-if="locationUrl">
                <iframe :src="locationUrl" width="320" height="240" style="border:0; border-radius:12px;" allowfullscreen loading="lazy"></iframe>
              </div>
              <div v-else>Loading location...</div>
            </template>
            <template v-else-if="activePopover === 'wifi'">
              <div>{{ bluetoothStatus || 'Wifi action' }}</div>
            </template>
            <template v-else-if="activePopover === 'bluetooth'">
              <div>{{ bluetoothStatus || 'Bluetooth action' }}</div>
            </template>
            <template v-else-if="activePopover === 'nfc'">
              <div>{{ nfcStatus || 'NFC action' }}</div>
            </template>
            <template v-else-if="activePopover === 'sms'">
              <div>SMS action (implement as needed)</div>
            </template>
            <template v-else-if="activePopover === 'mms'">
              <quill-editor v-model="mmsContent" style="height:200px;width:320px;background:#fff;" />
              <button class="qr-btn" style="margin-top:1rem;" @click="sendMMSRich">Send MMS</button>
            </template>
          </div>
        </div>
      
    </div> 
</template>

    <script setup lang="ts">
    import { ref } from 'vue'
    import { QrcodeStream } from 'vue-qrcode-reader'
    import QrcodeVue from 'qrcode.vue'
      import { quillEditor } from 'vue3-quill'

    type Connection = {
      display: string;
      img?: string;
      device?: { name: string; id: string };
      nfc?: string;
    };
    const connections = ref<Connection[]>([
      {
        display: 'Test User',
        img: '../assets/images/profile.png',
        device: { name: 'TestDevice', id: '123' },
        nfc: 'test-nfc'
      }
    ])


    const showScanner = ref(false)
    const qrError = ref('')
    const activePopover = ref('')
    const mmsContent = ref('')
    const locationUrl = ref('')
        function openLocationPopover() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                // Google Maps Street View URL
                locationUrl.value = `https://www.google.com/maps?q=&layer=c&cbll=${pos.coords.latitude},${pos.coords.longitude}`;
                activePopover.value = 'loc';
              },
              () => {
                locationUrl.value = '';
                activePopover.value = 'loc';
              }
            );
          } else {
            locationUrl.value = '';
            activePopover.value = 'loc';
          }
        }

        function sendMMSRich() {
          alert('MMS sent!\n' + mmsContent.value);
          activePopover.value = '';
          mmsContent.value = '';
        }
    const bluetoothStatus = ref('')
    const nfcStatus = ref('')
    const myIdentifier = ref(localStorage.getItem('userEmail') || 'my-unique-id')
    const showActions = ref(true)

    function removeConnection(idx: number) {
      connections.value.splice(idx, 1)
      localStorage.setItem('instanceConnections', JSON.stringify(connections.value))
    }

    function onDecode(result: string) {
      qrError.value = ''
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const geo = `@${pos.coords.latitude},${pos.coords.longitude}`
            const connection = { display: `${result} ${geo}` }
            if (!connections.value.some(c => c.display === connection.display)) {
              connections.value.push(connection)
              localStorage.setItem('instanceConnections', JSON.stringify(connections.value))
            }
            showScanner.value = false
          },
          () => {
            qrError.value = 'Geolocation error.'
          }
        )
      } else {
        qrError.value = 'Geolocation not supported.'
      }
    }

    function onInit(promise: Promise<void>) {
      promise.catch(e => {
        qrError.value = e.message || 'Camera initialization failed.'
      })
    }

    if (typeof window !== 'undefined') {
      const savedConnections = localStorage.getItem('instanceConnections')
      if (savedConnections) connections.value = JSON.parse(savedConnections)
    }

    function toggleActions() {
      if (connections.value.length === 0) {
        showActions.value = !showActions.value
      }
    }
    </script>

<style scoped>
    .my-qr {
      margin-bottom: 1.5rem;
    }
    .myworld-img {
      width: 256px;
      height: 256px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
  .my-connections {
    margin: 1rem auto;
    padding: 1rem;
    background: #fff;
    border-radius: 12px;
  }
  .qr-btn {
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    background: #007bff;
    color: #fff;
    cursor: pointer;
  }
  .qr-btn:hover {
    background: #0056b3;
  }
  .qr-popover-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-popover {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    min-width: 320px;
    max-width: 90vw;
    min-height: 320px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .qr-popover-close {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #888;
    cursor: pointer;
    z-index: 1;
    line-height: 1;
  }
  .qr-popover-close:hover {
    color: #222;
  }
  .error {
    color: red;
    margin-top: 0.5rem;
  }
  .no-connections {
    text-align: center;
    margin-bottom: 2rem;
  }
  .add-form {
    margin-top: 1.5rem;
  }
  input {
    width: 70%;
    padding: 0.5rem;
    margin-right: 0.5rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
  button, a.action-btn, .connection-item a {
    padding: 0;   border-radius: 6px;
    border: none;
    background: #007bff;
    color: #fff;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
  }
  button:hover, a.action-btn:hover, .connection-item a:hover {
    background: #0056b3;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .connections-card {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }
  .connection-list, .placeholder-list {
    display: flex;
    gap: 1.5rem;
  }
  .connection-item {
    width: 256px;
    min-width: 256px;
    max-width: 256px;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
  }
  .conn-img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 0;
    margin-bottom: 1rem;
    object-fit: cover;
  }
  .connection-item:hover .conn-img {
    box-shadow: 0 0 0 4px #007bff33, 0 2px 8px rgba(0,0,0,0.12);
    transition: box-shadow 0.2s;
  }
  .actions-card {
    margin-bottom: 2rem;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .actions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  .action-btn {
    width: 64px;
    height: 64px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: box-shadow 0.2s;
  }
  .action-btn:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .action-btn img {
    width: 40px;
    height: 40px;
    margin: auto;
    display: block;
    object-fit: contain;
  }
  .connection-item a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: fit-content;
    margin: 0 auto;
  }
  .profile-img {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
</style>
