<template>
  <div class="order-taker-node-roles">
    <h2>OrderTaker Node Roles</h2>
    <ul>
      <li v-for="role in roles" :key="role.key" class="role-block">
        <h3>{{ role.label }}</h3>
        <p>{{ role.description }}</p>
        <div v-if="role.dependsOn.length">
          <strong>Depends on:</strong> {{ role.dependsOn.map(getLabel).join(', ') }}
        </div>
        <div v-if="role.provides.length">
          <strong>Provides:</strong> {{ role.provides.map(getLabel).join(', ') }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { OrderTakerNodeRoles } from './OrderTakerNodeRoles.js';
import { computed } from 'vue';

const roles = computed(() => OrderTakerNodeRoles);
const labelMap = Object.fromEntries(OrderTakerNodeRoles.map((r) => [r.key, r.label]));
const getLabel = (key) => labelMap[key] || key;
</script>

<style scoped>
.order-taker-node-roles {
  max-width: 800px;
  margin: 2rem auto;
  background: #181818;
  color: #eee;
  border-radius: 16px;
  box-shadow: 0 4px 32px #000a;
  padding: 2rem;
}
.role-block {
  margin-bottom: 2rem;
  padding: 1rem;
  border-left: 4px solid #0ff;
  background: #232323;
  border-radius: 8px;
}
.role-block h3 {
  color: #0ff;
  margin-bottom: 0.5rem;
}
</style>
