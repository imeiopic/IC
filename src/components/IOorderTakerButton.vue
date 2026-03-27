<template>
  <button class="img-btn">
    <img src="../assets/0000.png" alt="Order Taker" />
    <span>Order Taker</span>
  </button>
</template>


<script setup lang="ts">
</script>


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
