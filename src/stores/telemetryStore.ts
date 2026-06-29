import { defineStore } from 'pinia';

export interface ThreadMetrics {
  threadId: number;
  latency: number; // in ms
  status: 'OPTIMAL' | 'DRIFTING' | 'LOCKED';
  load: number; // 0-100%
}

export const useTelemetryStore = defineStore('telemetry', {
  state: () => ({
    threads: Array.from({ length: 16 }, (_, i) => ({
      threadId: i + 1,
      latency: 0,
      status: 'OPTIMAL',
      load: 0
    })) as ThreadMetrics[],
    globalUptime: '99.998%',
  }),

  actions: {
    // Ingest data from the WebSocket telemetry stream
    ingestThreadPulse(pulse: ThreadMetrics) {
      const thread = this.threads.find(t => t.threadId === pulse.threadId);
      if (thread) {
        thread.latency = pulse.latency;
        thread.status = pulse.status;
        thread.load = pulse.load;
      }
    }
  }
});