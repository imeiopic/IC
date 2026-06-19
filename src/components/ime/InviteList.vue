<template>
  <div class="invite-list-page">
    <div class="list-card">
      <h1 class="glitch" data-text="Access Protocol: Invitees">Access Protocol: Invitees</h1>
      <p class="description rgb-text"
        data-text="Reviewing entity authorization status within the logical digital fabric.">
        Reviewing entity authorization status within the logical digital fabric.
      </p>

      <div class="search-container">
        <input v-model="searchQuery" type="text" placeholder="Search by entity name..." class="search-input" />
        <button @click="fetchFromContacts" class="import-btn">
          <span>📡</span> Scan Device Contacts
        </button>
      </div>
      <div v-if="firestoreError" class="error-banner glitch" :data-text="firestoreError">{{ firestoreError }}</div>

      <div class="table-wrapper">
        <table class="invite-table">
          <thead>
            <tr>
              <th>Entity Identifier</th>
              <th>Access Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entity in filteredEntities" :key="entity.id">
              <td>{{ entity.name }}</td>
              <td>{{ entity.level }}</td>
              <td>
                <span :class="['status-tag', entity.status.toLowerCase()]">
                  {{ entity.status }}
                </span>
              </td>
              <td>
                <button @click="deleteEntity(entity.id)" class="delete-btn" title="De-sync Entity">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <router-link to="/signup-login" class="back-link">← Return to Gateway</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase'; // Use standardized firebase import

interface Entity {
  id: string;
  name: string;
  level: string;
  status: 'Authorized' | 'Pending' | 'De-synced';
}

const searchQuery = ref('');

const entities = ref<Entity[]>([]);
const firestoreError = ref('');
let unsubscribe: (() => void) | null = null;

onMounted(async () => {

  // Define the query with sorting. 
  // Use orderBy('name', 'asc') for name or orderBy('status', 'asc') for status.
  const q = query(
    collection(db, 'invitees'),
    where('status', '==', 'Pending'),
    orderBy('name', 'asc')
  );

  // Establish real-time listener
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const updatedEntities: Entity[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      updatedEntities.push({
        id: doc.id,
        name: data.name,
        level: data.level || 'Guest',
        status: data.status || 'Pending'
      } as Entity);
    });
    entities.value = updatedEntities;
  }, (error) => {
    console.error("Firestore Listen Error:", error);
    if (error.code === 'failed-precondition') {
      firestoreError.value = "Protocol Error: Missing Composite Index. Check system logs for the generation link.";
    } else if (error.code === 'permission-denied') {
      firestoreError.value = "Security Error: Insufficient clearance to access the fabric.";
    } else {
      firestoreError.value = "Transmission Error: " + error.message;
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const filteredEntities = computed(() => {
  return entities.value.filter(e =>
    e.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const fetchFromContacts = async () => {
  // Check if the Contact Picker API is supported
  const supported = ('contacts' in navigator && 'ContactsManager' in window);

  if (!supported) {
    alert('The Contact Picker API is not supported in this browser. Try using Chrome on Android.');
    return;
  }

  try {
    const props = ['name', 'email'];
    const opts = { multiple: true };
    // @ts-ignore - Experimental API
    const selectedContacts = await navigator.contacts.select(props, opts);

    const inviteesCol = collection(db, 'invitees');

    // Use for...of to handle async Firestore writes sequentially or Promise.all for speed
    for (const contact of selectedContacts) {
      const contactName = contact.name?.[0] || contact.email?.[0] || 'Unknown Signal';
      const newEntityData = {
        name: contactName,
        level: 'Guest',
        status: 'Pending' as const
      };

      // Save to Firestore
      // We no longer need to manually push to entities.value here 
      // because onSnapshot will detect the addition and update the UI automatically.
      await addDoc(inviteesCol, newEntityData);
    }
  } catch (err: any) {
    console.warn('Contact selection cancelled or failed:', err.message);
  }
};

const deleteEntity = async (id: string) => {
  if (confirm('Are you sure you want to de-sync this entity from the logical fabric?')) {
    try { // db is already imported
      // Deleting the document in Firestore triggers the onSnapshot listener, updating the UI.
      await deleteDoc(doc(db, 'invitees', id));
    } catch (err: any) {
      console.error('De-sync protocol failed:', err.message);
    }
  }
};
</script>

<style scoped>
.invite-list-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  width: 100vw;
  background: #000 url('../assets/images/iocreation.png') no-repeat center center;
  background-size: contain;
  color: white;
  overflow: hidden;
  position: relative;
}

.list-card {
  background: rgba(0, 0, 0, 0.9);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #1a73e8;
  width: 95%;
  max-width: 800px;
  backdrop-filter: blur(15px);
  box-shadow: 0 0 40px rgba(26, 115, 232, 0.2);
  z-index: 20;
}

.glitch {
  position: relative;
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  color: #fff;
  margin-bottom: 0.5rem;
  text-align: center;
}

.search-container {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.search-input {
  width: 100%;
  background: #111;
  border: 1px solid #333;
  padding: 0.8rem;
  color: #0ff;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
}

.import-btn {
  background: #1a73e8;
  border: none;
  color: white;
  padding: 0 1rem;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: bold;
  font-size: 0.85rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.import-btn:hover {
  background: #155ab6;
}

.table-wrapper {
  max-height: 40vh;
  overflow-y: auto;
  margin-bottom: 2rem;
  border: 1px solid #222;
}

.invite-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.invite-table th,
.invite-table td {
  padding: 1rem;
  border-bottom: 1px solid #222;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.authorized {
  background: rgba(0, 255, 0, 0.2);
  color: #0f0;
}

.pending {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.de-synced {
  background: rgba(255, 0, 0, 0.2);
  color: #f00;
}

.error-banner {
  background: rgba(255, 0, 0, 0.15);
  border: 1px solid #f00;
  color: #f00;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.delete-btn {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #f00;
  color: #f00;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: 'Courier New', Courier, monospace;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #f00;
  color: #fff;
  box-shadow: 0 0 10px #f00;
}

.back-link {
  display: block;
  text-align: center;
  color: #666;
  text-decoration: none;
  font-size: 0.85rem;
}
</style>