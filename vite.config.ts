import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Mirrors: "@/*": ["./src/*"]
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      
      // Mirrors: "@components/*": ["./src/components/*"]
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),

      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@directives': fileURLToPath(new URL('./src/directives', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    }
  }
});
