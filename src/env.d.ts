/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLIC_KEY: string;
    readonly VITE_IME_ROOT_SIGNATURE: string;
    readonly VITE_IOWB_REGISTRY_ADDRESS: string;
    readonly VITE_BLOCKCHAIN_RPC_URL: string;
    readonly VITE_GOOGLE_API_KEY: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_GOOGLE_MAP_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // Global shim for Vue SFCs
  declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
  }
}