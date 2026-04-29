import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Inject only variables/mixins first (avoid importing the full style.scss to prevent circular issues)
        additionalData: `@use "@/_variables.scss" as *;`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Change to your backend port if different
        changeOrigin: true
        // Removed rewrite to allow all /api requests to pass through unchanged
      }
    }
  }
});
