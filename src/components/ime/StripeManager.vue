<template>
  <div class="stripe-manager p-4 bg-zinc-950 border border-zinc-800 rounded">
    <h3 class="text-info font-black italic mb-4 uppercase">STRIPE_PRODUCT_CRUD</h3>

    <!-- Create Form -->
    <div class="mb-5 p-3 border border-zinc-800 rounded">
      <h6 class="extra-tiny text-zinc-500 mb-3">INITIALIZE_NEW_RESOURCE</h6>
      <div class="d-flex gap-2">
        <CFormInput v-model="newProduct.name" placeholder="Name" class="bg-black text-white" />
        <CFormInput
          v-model.number="newProduct.amount"
          type="number"
          placeholder="IO$"
          class="bg-black text-white"
        />
        <CButton color="info" @click="handleCreate" :disabled="loading">CREATE</CButton>
      </div>
    </div>

    <!-- List/Read -->
    <div v-if="loading" class="text-center py-3">
      <CSpinner color="info" size="sm" />
    </div>

    <div v-else class="product-list">
      <div
        v-for="product in products"
        :key="product.id"
        class="d-flex justify-content-between align-items-center p-2 border-b border-zinc-900 mb-2"
      >
        <div>
          <span class="tiny font-black text-white">{{ product.name }}</span>
          <p class="extra-tiny text-zinc-500 m-0">{{ product.id }}</p>
        </div>

        <div class="d-flex gap-2">
          <!-- Update Toggle -->
          <CButton
            size="sm"
            :color="product.active ? 'warning' : 'success'"
            variant="outline"
            @click="handleToggleActive(product)"
          >
            {{ product.active ? 'ARCHIVE' : 'RESTORE' }}
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StripeCRUD, type StripeProduct } from '@services/StripeCRUD';
import { CFormInput, CButton, CSpinner } from '@coreui/vue';
import { useSuccessStore } from '@/stores/success';
import { useGlobalError } from '../useGlobalError';

const successStore = useSuccessStore();
const { setError } = useGlobalError();

const products = ref<StripeProduct[]>([]);
const loading = ref(false);
const newProduct = ref({ name: '', amount: 0, description: 'Sovereign Resource' });

const fetchProducts = async () => {
  loading.value = true;
  try {
    products.value = await StripeCRUD.listProducts();
  } catch (err: any) {
    setError('FRACTURE: Failed to list Stripe resources.');
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  loading.value = true;
  try {
    await StripeCRUD.createProduct(
      newProduct.value.name,
      newProduct.value.amount,
      newProduct.value.description
    );
    successStore.setSuccessMessage('RESOURCE_INITIALIZED: Stripe product created.');
    newProduct.value = { name: '', amount: 0, description: 'Sovereign Resource' };
    await fetchProducts();
  } catch (err: any) {
    setError('FRACTURE: Creation sequence failed.');
  } finally {
    loading.value = false;
  }
};

const handleToggleActive = async (product: StripeProduct) => {
  try {
    await StripeCRUD.updateProduct(product.id, { active: !product.active });
    await fetchProducts();
  } catch (err: any) {
    setError('FRACTURE: State mutation failed.');
  }
};

onMounted(fetchProducts);
</script>

<style scoped>
.extra-tiny {
  font-size: 0.65rem;
}
.tiny {
  font-size: 0.8rem;
}
.font-black {
  font-weight: 900;
}
.bg-zinc-950 {
  background-color: #050505;
}
</style>
