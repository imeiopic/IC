<template>
  <div class="myworld">
    <img src="../assets/images/myworld.png" alt="My World" style="width:120px;display:block;margin:0 auto 2rem;" />
    <div class="button-row">
      <MyPeopleButton @click="goTo('MyConnections')" />
      <IOorderTakerButton @click="goTo('OrderTaker')" />
      <IOComButton @click="goTo('IOCom')" />
      <button @click="goTo('Login')" style="margin-left: 1rem;">Go to Login</button>
    </div>
    <button @click="goTo('MyConnections')" style="margin-top: 1rem;">Go to My Connections</button>

    <ul>
      <li v-for="(conn, idx) in connections" :key="idx">
        {{ conn }}
        <button @click="removeConnection(idx)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import './MyPeopleButton.vue'
import './IOorderTakerButton.vue'
import './IOComButtonRenamed.vue'

const router = useRouter()
function goTo(name: string) {
  router.push({ name })
}

const profile = ref({
  name: '',
  description: '',
  avatar: ''
})
const connections = ref<string[]>([])

function removeConnection(idx: number) {
  connections.value.splice(idx, 1)
  localStorage.setItem('instanceConnections', JSON.stringify(connections.value))
}

// Load from localStorage on mount
if (typeof window !== 'undefined') {
  const savedProfile = localStorage.getItem('instanceProfile')
  if (savedProfile) profile.value = JSON.parse(savedProfile)
  const savedConnections = localStorage.getItem('instanceConnections')
  if (savedConnections) connections.value = JSON.parse(savedConnections)
}
</script>

<style scoped>
.myworld {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}
form {
  margin-bottom: 1.5rem;
}
input, textarea {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>