import { ref, shallowRef, markRaw } from 'vue';
import type { Component } from 'vue';

export interface ModalOptions {
  closeText?: string;
  [key: string]: any;
}

// Shared global state so the modal can be triggered from anywhere
// but rendered in a single root location (like App.vue).
const isOpen = ref(false);
const modalComponent = shallowRef<Component | null>(null);
const modalProps = ref<Record<string, any>>({});
const modalOptions = ref<ModalOptions>({});

export function useModal() {
  const openModal = (
    component: Component,
    props: Record<string, any> = {},
    options: ModalOptions = {}
  ) => {
    // Use markRaw to prevent Vue from adding unnecessary reactivity overhead to the component itself
    modalComponent.value = markRaw(component);
    modalProps.value = props;
    modalOptions.value = options;
    isOpen.value = true;
  };

  const closeModal = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    modalComponent,
    modalProps,
    modalOptions,
    openModal,
    closeModal
  };
}
