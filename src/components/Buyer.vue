<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMarketStore } from '@/stores/marketStore';
import { useUserStore } from '@/stores/userStore';

const marketStore = useMarketStore();
const userStore = useUserStore();

const searchQuery = ref('');
const selectedItem = ref<any>(null);

// Computed view based on store state
const currentMarketView = computed(() => {
  const q = searchQuery.value.toLowerCase();
  return marketStore.marketItems.filter(i => 
    i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
  );
});

let unsubMarket: any;

onMounted(() => {
  unsubMarket = marketStore.subscribeToMarket();
});

onUnmounted(() => {
  if (unsubMarket) unsubMarket();
});

const handlePurchase = async (item: any) => {
  if (!userStore.uid) return;
  await marketStore.executePurchase(item, userStore.uid);
};
</script>

<template>
  <CContainer fluid class="buyer-substrate p-4 bg-black min-vh-100 font-mono text-white">
    <header class="d-flex justify-content-between align-items-center mb-4 border-bottom border-zinc-800 pb-3">
      <div class="brand d-flex align-items-center gap-3">
        <i class="bi bi-bag-check text-info h3 m-0"></i>
        <h1 class="text-glow text-info m-0 italic font-black">VRE_MARKETPLACE</h1>
      </div>
      <div class="equity-status text-end">
        <span class="tiny text-zinc-500 d-block">LIQUID_EQUITY</span>
        <span class="text-success fw-bold">{{ userStore.equity }} IO$</span>
      </div>
    </header>

    <CRow class="g-4">
      <CCol lg="8">
        <CFormInput v-model="searchQuery" placeholder="FILTER_RESOURCES..." class="bg-zinc-950 border-zinc-800 text-info mb-4" />
        
        <CRow class="g-4">
          <CCol v-for="item in currentMarketView" :key="item.id" md="6" xl="4">
            <CCard class="bg-zinc-900 border-zinc-800 h-100 item-card" @click="selectedItem = item">
              <CCardBody>
                <h5 class="font-black italic">{{ item.name }}</h5>
                <span class="text-success fw-black">{{ item.price }} IO$</span>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCol>

      <CCol lg="4">
        <CCard v-if="selectedItem" class="bg-zinc-900 border-info shadow-glow">
          <CCardHeader class="font-black italic text-info">ACQUISITION_LEDGER</CCardHeader>
          <CCardBody>
            <h4 class="text-info font-black">{{ selectedItem.name }}</h4>
            <CButton class="w-100 py-3 font-black" color="info" @click="handlePurchase(selectedItem)">
              CONFIRM_ACQUISITION
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>