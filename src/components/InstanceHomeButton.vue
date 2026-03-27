<template>
  <button class="img-btn">
    <img :src="imgSrc" alt="Instance Home" />
    <span>Instance Home</span>
  </button>
</template>

<script setup lang="ts">
// @ts-ignore
import imgSrc from '../assets/0001.png'
</script>

export default {};

<style scoped>
.img-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
}
.img-btn img {
  width: 64px;
  height: 64px;
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
</style>
