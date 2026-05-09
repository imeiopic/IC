// Extend SystemBus type for HomePage.vue usage
export interface SystemBus {
  isOnline?: boolean;
  isSynced?: boolean;
  busActivity?: any;
}
