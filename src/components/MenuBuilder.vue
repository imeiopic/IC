<template>
  <div class="menu-builder">
    <h2>Menu Builder</h2>
    <form @submit.prevent="addMenuItem">
      <input v-model="newItem.name" placeholder="Item name" required />
      <input v-model.number="newItem.price" type="number" placeholder="Price" required min="0" />
      <button type="submit">Add Item</button>
    </form>
    <ul>
      <li v-for="item in menu" :key="item.id">
        {{ item.name }} - ${{ item.price }}
        <button @click="removeMenuItem(item.id)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

const menu = ref<MenuItem[]>([]);
const newItem = ref<MenuItem>({ id: 0, name: '', price: 0 });
let nextId = 1;

function addMenuItem() {
  if (!newItem.value.name || newItem.value.price < 0) return;
  menu.value.push({ ...newItem.value, id: nextId++ });
  newItem.value.name = '';
  newItem.value.price = 0;
}

function removeMenuItem(id: number) {
  menu.value = menu.value.filter((item) => item.id !== id);
}
</script>

<style scoped>
.menu-builder {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.menu-builder form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.menu-builder ul {
  list-style: none;
  padding: 0;
}
.menu-builder li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}
</style>
