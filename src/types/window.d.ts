// Extend the Window interface for PayPal
export {};
declare global {
  interface Window {
    paypal?: any;
  }
}
