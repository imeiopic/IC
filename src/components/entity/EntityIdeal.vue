<script setup lang="ts">
/**
 * EntityIdeal.vue
 * Identity Pivot UI for switching between active IDEAL profiles, locations, or sub-entities.
 */

defineProps<{
  /** Available identities, locations, or sub-entity profiles */
  ideals: string[];
  /** The currently active identity or location name */
  activeIdeal?: string;
}>();

defineEmits<{
  /** Emitted when a persona is selected */
  (e: 'select', name: string): void;
}>();
</script>

<template>
  <section class="ideal-selector">
    <label>Active Identity / Location:</label>
    <div class="ideal-chips">
      <button
        v-for="ideal in ideals"
        :key="ideal"
        class="chip"
        :class="{ active: activeIdeal === ideal }"
        @click="$emit('select', ideal)"
      >
        {{ ideal }}
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ideal-selector {
  margin-bottom: 1.5rem;

  label {
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.5rem;
    display: block;
  }

  .ideal-chips {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    .chip {
      background: #222;
      border: 1px solid #444;
      color: #ccc;
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;

      &:hover {
        border-color: #666;
      }

      &.active {
        border-color: #ffd700;
        color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
      }
    }
  }
}
</style>
