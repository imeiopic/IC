// Extend SystemBus type for HomePage.vue usage
export interface SystemBus {
  isGlobalPurgeActive: Ref<boolean>;
  lockBit: Ref<boolean>;
  currentNoiseLevel: Ref<number>;
  isOnline?: boolean;
  isSynced?: boolean;
  busActivity?: any;
}
