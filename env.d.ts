/// <reference types="vite/client" />

// import { EnvSchema } from './src/env';
// interface ImportMetaEnv extends EnvSchema {}

interface ImportMeta {
  readonly env: Record<string, string>;
}

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.png' {
  const src: string;
  export default src;
}
