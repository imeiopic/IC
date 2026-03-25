
<template>
  <section id="center">
    <div class="hero">
      <img :src="iocreation" class="iocreation" alt="Io Creation" />
    </div>
    <div class="button-row">
      <button class="img-btn" @click="goTo('InstanceHome')">
        <img :src="hero" alt="Instance Home" />
        <span>Instance Home</span>
      </button>
      <button class="img-btn" @click="goTo('InstanceConnections')">
        <img :src="makeconnection" alt="Instance Connections" />
        <span>Instance Connections</span>
      </button>
      <button class="img-btn" @click="goTo('GetConnection')">
        <img :src="entertheworld" alt="Get Connection" />
        <span>Get Connection</span>
      </button>
    </div>
  </section>

</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import iocreation from '../assets/iocreation.png'
import hero from '../assets/hero.png'
import makeconnection from '../assets/makeconnection.png'
import entertheworld from '../assets/entertheworld.png'

const router = useRouter()
function goTo(name: string) {
  router.push({ name })
}

</script>
<style scoped>
.iocreation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.button-row {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}
.img-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}
.img-btn img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.img-btn span {
  font-size: 1rem;
  color: #333;
  margin-top: 0.25rem;
}
.img-btn:hover {
  transform: scale(1.08);
}
</style>

