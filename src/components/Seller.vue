<template>
  <CContainer fluid class="seller-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-5 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-tag text-success h3 m-0"></i>
        <h1 class="text-glow text-success m-0 italic font-black">MARKET_DISTRIBUTION</h1>
      </div>
      <div class="node-status tiny text-zinc-500">
        SELLER_NODE: {{ user?.uid.substring(0, 8) }}
      </div>
    </header>

    <CRow>
      <CCol lg="5">
        <CCard class="bg-zinc-900 border-zinc-800 text-white shadow-glow mb-4">
          <CCardHeader class="bg-zinc-800 border-0 font-black italic py-3">
            04_GROUND_NEW_RESOURCE
          </CCardHeader>
          <CCardBody class="p-4">
            <CForm @submit.prevent="groundResource">
              <div class="mb-3">
                <label class="tiny text-zinc-500 uppercase mb-2">Resource_Name</label>
                <CFormInput v-model="form.name" placeholder="e.g. 5G_NODE_ACCESS" class="bg-black border-zinc-800 text-info" required />
              </div>

              <div class="mb-3">
                <label class="tiny text-zinc-500 uppercase mb-2">Category</label>
                <CFormSelect v-model="form.category" class="bg-black border-zinc-800 text-white">
                  <option value="HARDWARE">HARDWARE</option>
                  <option value="DATA_STREAM">DATA_STREAM</option>
                  <option value="SPATIAL_UTILITY">SPATIAL_UTILITY</option>
                  <option value="CONSULT_THREAD">CONSULT_THREAD</option>
                </CFormSelect>
              </div>

              <div class="mb-3">
                <label class="tiny text-zinc-500 uppercase mb-2">Price_Anchor (IO$)</label>
                <CFormInput v-model.number="form.price" type="number" class="bg-black border-zinc-800 text-success fw-bold" required />
              </div>

              <div class="mb-4">
                <label class="tiny text-zinc-500 uppercase mb-2">Manifest_Description</label>
                <CFormTextarea v-model="form.description" rows="3" class="bg-black border-zinc-800 text-zinc-400 small" placeholder="Define the utility of this resource..."></CFormTextarea>
              </div>

              <CButton type="submit" color="success" class="w-100 py-3 font-black italic shadow-success" :disabled="isGrounding">
                <span v-if="!isGrounding">GROUND_TO_MARKETPLACE</span>
                <span v-else class="vibrate">WRITING_MANIFEST...</span>
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="7">
        <h5 class="text-zinc-500 tiny uppercase mb-3 px-2">Active_Inventory_Sightings</h5>
        <div class="inventory-grid">
          <div v-if="myItems.length === 0" class="text-center py-5 bg-zinc-900 border border-zinc-800 rounded opacity-25 italic">
            NO_RESOURCES_GROUNDED_YET
          </div>
          <CCard v-for="item in myItems" :key="item.id" class="bg-zinc-900 border-zinc-800 mb-2 transition-all">
            <CCardBody class="d-flex justify-content-between align-items-center py-2 px-3">
              <div>
                <span class="text-success fw-bold me-3">{{ item.price }} IO$</span>
                <span class="text-white small font-black">{{ item.name }}</span>
                <span class="ms-3 tiny text-zinc-600 font-mono">[{{ item.category }}]</span>
              </div>
              <div class="d-flex gap-2">
                <CButton color="danger" variant="ghost" size="sm" class="tiny" @click="delistItem(item.id)">
                  DELIST
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </div>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const user = ref(auth.currentUser);
const isGrounding = ref(false);
const myItems = ref<any[]>([]);

const form = ref({
  name: '',
  category: 'HARDWARE',
  price: 100,
  description: ''
});

/**
 * 01_SIGHTING_MY_INVENTORY
 */
const initInventoryStream = () => {
  if (!auth.currentUser) return;
  const q = query(collection(db, 'marketplace'), where('sellerID', '==', auth.currentUser.uid));
  onSnapshot(q, (snapshot) => {
    myItems.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

/**
 * 02_GROUND_RESOURCE
 */
const groundResource = async () => {
  if (!auth.currentUser) return;
  isGrounding.value = true;
  try {
    await addDoc(collection(db, 'marketplace'), {
      sellerID: auth.currentUser.uid,
      sellerNode: auth.currentUser.uid.substring(0, 8),
      name: form.value.name,
      category: form.value.category,
      price: form.value.price,
      description: form.value.description,
      timestamp: serverTimestamp()
    });
    form.value = { name: '', category: 'HARDWARE', price: 100, description: '' };
    alert("MANIFEST_GROUNDED: Resource is now visible in the marketplace.");
  } catch (err) {
    console.error("GROUNDING_FRACTURE:", err);
  } finally {
    isGrounding.value = false;
  }
};

const delistItem = async (id: string) => {
  if (confirm("RECALL_RESOURCE: Are you sure you want to delist this item?")) {
    await deleteDoc(doc(db, 'marketplace', id));
  }
};

onMounted(() => {
  initInventoryStream();
});
</script>

<style scoped>
.shadow-success { box-shadow: 0 0 25px rgba(40, 167, 69, 0.15) !important; }
.transition-all { transition: all 0.2s ease; }
.transition-all:hover { border-color: #28a745 !important; background-color: #050505 !important; }
.vibrate { animation: jitter 0.1s infinite; }
@keyframes jitter { 0% { transform: translate(1px, -1px); } 100% { transform: translate(-1px, 1px); } }
.tiny { font-size: 0.65rem; }
.font-black { font-weight: 900; }
</style>