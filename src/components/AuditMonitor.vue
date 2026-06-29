<template>
  <div
    class="p-6 bg-black text-white border-2 border-zinc-900 font-mono max-w-4xl mx-auto shadow-2xl relative select-none mt-6"
  >
    <header class="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
      <div>
        <span class="text-[9px] text-info block tracking-widest font-bold"
          >▲ SYSTEM_INTEGRITY_LOG</span
        >
        <h2 class="text-sm font-black tracking-tight text-white uppercase">
          ROOT_OVERRIDE_AUDIT_STREAM
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-[10px] text-emerald-500 font-bold tracking-tighter uppercase"
          >Live_Feed_Active</span
        >
      </div>
    </header>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-[10px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900">
            <th class="py-2 font-bold">Timestamp</th>
            <th class="py-2 font-bold">Executor_UID</th>
            <th class="py-2 font-bold">Target_Node</th>
            <th class="py-2 font-bold">Mutation</th>
            <th class="py-2 font-bold text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-900">
          <tr
            v-for="log in logs"
            :key="log.id"
            class="text-[11px] hover:bg-zinc-950 transition-colors"
          >
            <td class="py-3 text-zinc-400 font-mono">
              {{ formatTimestamp(log.timestamp) }}
            </td>
            <td class="py-3 font-bold text-zinc-300">
              {{ truncateUid(log.executor_uid) }}
            </td>
            <td class="py-3 text-info font-black">
              {{ log.target_node }}
            </td>
            <td class="py-3">
              <span
                :class="
                  log.mutation_details.operation === 'SET' ? 'text-amber-500' : 'text-emerald-500'
                "
              >
                {{ log.mutation_details.operation }}
              </span>
              <span class="text-zinc-500 ml-1">[{{ log.mutation_details.valueDelta }} IO$]</span>
            </td>
            <td class="py-3 text-right">
              <span
                class="px-2 py-0.5 border border-red-900 bg-red-950/20 text-red-500 font-black text-[9px] uppercase tracking-tighter"
              >
                {{ log.status }}
              </span>
            </td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="py-8 text-center text-zinc-600 italic text-xs tracking-widest">
              NO_AUDIT_TRAILS_FOUND_IN_BUFFER...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { app } from '../firebase';

interface AuditLog {
  id: string;
  executor_uid: string;
  target_node: string;
  mutation_details: {
    valueDelta: number;
    operation: string;
  };
  timestamp: Timestamp;
  status: string;
}

const logs = ref<AuditLog[]>([]);
let unsubscribe: (() => void) | null = null;

const formatTimestamp = (ts: Timestamp) => {
  if (!ts) return 'PENDING...';
  const date = ts.toDate();
  return date.toLocaleTimeString('en-GB', { hour12: false }) + '.' + date.getMilliseconds();
};

const truncateUid = (uid: string) => `${uid.substring(0, 6)}...${uid.substring(uid.length - 4)}`;

onMounted(() => {
  const db = getFirestore(app);
  const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));

  unsubscribe = onSnapshot(q, (snapshot) => {
    logs.value = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data()
        } as AuditLog)
    );
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
/* High-fidelity table adjustments */
th {
  letter-spacing: 0.15em;
}
</style>
