/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_IOWB_REGISTRY_ADDRESS: string;
    readonly VITE_BLOCKCHAIN_RPC_URL: string;
    readonly VITE_GOOGLE_API_KEY: string;
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_GOOGLE_MAP_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    initConnectorMap?: () => void;
    initStreetView?: () => void;
    google: typeof google;
  }
}

declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
declare const __ENABLE_BETA_FEATURES__: boolean;
declare const __WASM_HASH__: string;

// Global shim for Vue SFCs
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

export {};
