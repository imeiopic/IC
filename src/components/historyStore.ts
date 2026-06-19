import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface HistoryEvent {
  id: number;
  time: string; // e.g., "HH:MM:SS"
  title: string;
  description: string;
  tag: string;
  color: string;
}

export const useHistoryStore = defineStore('history', () => {
  const logs = ref<HistoryEvent[]>([
    // Initial hardcoded data, now managed by the store
    {
      id: 1,
      time: '03:42:15',
      title: 'DIC_CLIENT // PEER_GROUNDING',
      description:
        'Successfully anchored external node SUID_ATLANTA_0404_BASE to ATLANTA [33.84] geometric parameters.',
      tag: 'NODE_SYNC',
      color: 'border-amber-900 text-amber-400 bg-amber-950/20'
    },
    {
      id: 2,
      time: '02:11:50',
      title: 'SPICE.vue // HANDSHAKE_REJECT',
      description:
        'Dropped external packet injection attempt containing tracking metadata. Perimeter intact.',
      tag: 'SHIELD_DROP',
      color: 'border-red-900 text-red-400 bg-red-950/20'
    },
    {
      id: 3,
      time: '01:05:22',
      title: 'IOWB_LEDGER // CORE_REFACTOR',
      description:
        'Uppercase Internet of Data component migrated seamlessly to case-sensitive IoD.vue and IOD.vue frameworks.',
      tag: 'REFACTOR',
      color: 'border-blue-900 text-blue-400 bg-blue-950/20'
    },
    {
      id: 4,
      time: '2026-05-01', // Note: This initial entry uses a date, new entries will use HH:MM:SS
      title: 'IOPIC // SYSTEM_ACTIVATION_LAUNCH',
      description:
        'Platform infrastructure activated live on the global mesh network at iopic.world.',
      tag: 'GENESIS_BLOCK',
      color: 'border-emerald-900 text-emerald-400 bg-emerald-950/20'
    }
  ]);

  function addEvent(event: Omit<HistoryEvent, 'id' | 'time'>) {
    const now = new Date();
    const newEvent: HistoryEvent = {
      id: now.getTime() + Math.random(), // Generate a unique ID
      time: now.toLocaleTimeString('en-US', { hour12: false }), // Current time in HH:MM:SS format
      ...event
    };
    logs.value.unshift(newEvent); // Add new event to the beginning of the array
    if (logs.value.length > 50) {
      // Keep the log size manageable
      logs.value.pop();
    }
  }

  // For the exportAuditTrail, we can just return the logs directly
  const getAuditTrailData = () => {
    return logs.value;
  };

  return { logs, addEvent, getAuditTrailData };
});
