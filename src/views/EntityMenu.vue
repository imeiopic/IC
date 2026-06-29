<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/menuStore';
import { useGlobalMandates } from '../utils/mandate'; // Refactored path

const props = defineProps<{ entityId: string; entityName: string }>();
const menuStore = useMenuStore();
const { checkSymmetryMandate } = useGlobalMandates();

// Local UI State
const isBuilderMode = ref(false);
const activeCategory = ref('ALL');

onMounted(() => {
  menuStore.fetchAllMenus(props.entityId);
});

// Computed for optimized rendering
const currentMenu = computed(() => menuStore.menus[0]); // Simplified example
const filteredItems = computed(() => {
  if (!currentMenu.value) return [];
  return activeCategory.value === 'ALL' 
    ? currentMenu.value.items 
    : currentMenu.value.items.filter((i: any) => i.category === activeCategory.value);
});
</script>

<template>
  <div class="entity-menu-container">
    <header class="menu-header">
      <div class="entity-seal">{{ entityName }} // LOGIC_OFFERINGS</div>
      <button @click="isBuilderMode = !isBuilderMode" class="admin-toggle">
        {{ isBuilderMode ? 'EXIT_BUILDER' : 'MENU_BUILDER' }}
      </button>
    </header>

    <div v-if="menuStore.isSyncing" class="status-msg">SYNCING_CATALOGUE...</div>
    
    <template v-else>
      <div v-if="!isBuilderMode" class="menu-grid">
        <div v-for="item in filteredItems" :key="item.id" class="menu-card">
          </div>
      </div>
      <div v-else class="builder-container">
        </div>
    </template>
  </div>
</template>