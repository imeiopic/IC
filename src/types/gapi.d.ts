// Global declaration for gapi on window
// This ensures TypeScript recognizes window.gapi

import "gapi.auth2";
declare global {
  interface Window {
    gapi: typeof gapi;
  }
}
export {};
