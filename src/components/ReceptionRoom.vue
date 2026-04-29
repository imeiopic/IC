<template>
  <div class="reception-room">
    <h1>Reception Room</h1>
    <p>Welcome to the Reception Room of {{ hostName }}.</p>
    <p v-if="invitedBy">You were invited by {{ invitedBy }}.</p>
    <button @click="goHome">Go to Homepage</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const props = defineProps({
  hostName: {
    type: String,
    required: true
  },
  invitedBy: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.reception-room {
  padding: 2rem;
  text-align: center;
}
</style>
