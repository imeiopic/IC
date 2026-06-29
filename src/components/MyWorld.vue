<template>
  <div class="myworld">
    <img
      src="@assets/images/myworld.png"
      alt="My World"
      style="width: 120px; display: block; margin: 0 auto 2rem"
    />
    <div class="button-row">
      <MyInviteButton @click="goTo('InviteList')" />
      <MyPeopleButton @click="goTo('MyConnections')" />
      <IOorderTakerButton @click="goTo('OrderTaker')" />
      <IOComButton @click="goTo('IOCom')" />
      <button class="manifesto-toggle" @click="goTo('IopicManifesto')" title="IOPIC Manifesto">
        Manifesto
      </button>
      <button class="boot-toggle" @click="goTo('IopicBoot')" title="Initialize VRE">
        Boot VRE
      </button>
      <button class="truth-toggle" @click="goTo('LogicalTruth')" title="Logical Truth">iiii</button>
    </div>
    <button @click="goTo('MyConnections')" style="margin-top: 1rem">Go to My Connections</button>

    <div style="margin: 2rem 0">
      <label for="coinx-account">CoinX Account:</label>
      <input
        id="coinx-account"
        type="text"
        v-model="profile.coinxAccount"
        @change="saveProfile"
        placeholder="Enter your CoinX account info"
      />
    </div>
    <ul>
      <li v-for="(conn, idx) in connections" :key="idx">
        {{ conn }}
        <button @click="removeConnection(idx)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MyInviteButton from '@components/MyInviteButton.vue';
import MyPeopleButton from '@components/MyPeopleButton.vue';
import IOorderTakerButton from '@components/IOorderTakerButton.vue';
import IOComButton from '@components/IOComButtonRenamed.vue';

const router = useRouter();
function goTo(name: string) {
  router.push({ name });
}

const profile = ref({
  name: '',
  description: '',
  avatar: '',
  coinxAccount: ''
});
const connections = ref<string[]>([]);

function removeConnection(idx: number) {
  connections.value.splice(idx, 1);
  localStorage.setItem('instanceConnections', JSON.stringify(connections.value));
}

// Load from localStorage on mount
if (typeof window !== 'undefined') {
  const savedProfile = localStorage.getItem('instanceProfile');
  if (savedProfile) profile.value = JSON.parse(savedProfile);
  const savedConnections = localStorage.getItem('instanceConnections');
  if (savedConnections) connections.value = JSON.parse(savedConnections);
}

function saveProfile() {
  localStorage.setItem('instanceProfile', JSON.stringify(profile.value));
}
</script>

<style lang="scss" scoped>
.myworld {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  /* Example: background-image: url("@assets/images/background-pattern.png"); */
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
.truth-toggle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #f8f9fa;
  color: #333;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.truth-toggle:hover {
  background: #333;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.manifesto-toggle {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #f8f9fa;
  color: #007bff; /* Blue to match manifesto theme */
  font-weight: 600;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex; /* Use flex to center text */
  align-items: center;
  justify-content: center;
}
.manifesto-toggle:hover {
  background: #007bff;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
form {
  margin-bottom: 1.5rem;
}
input,
textarea {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
