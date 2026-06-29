<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">iopic.world</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li v-for="t in tabs" :key="t" class="nav-item">
            <button
              class="nav-link"
              :class="{ active: modelValue === t }"
              @click="$emit('update:modelValue', t)"
            >
              {{ t }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  modelValue: String,
  tabs: Array
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.nav-link.active {
  color: #fff !important;
  border-bottom: 2px solid #00ff41;
}
</style>
