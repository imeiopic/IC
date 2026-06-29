import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // ... keep your existing aliases
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate heavy libraries into a vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('@firebase') || id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('ethers') || id.includes('stripe')) return 'vendor-crypto';
            return 'vendor'; // Generic vendor chunk
          }
        }
      }
    },
    chunkSizeWarningLimit: 600 // Optional: slightly increase limit for complex apps
  }
});