<template>
	<div class="instance-home p-4">
		<c-tabs v-model="activeTab" class="mb-4">
			<c-tab title="Direct Access Peers (DAPS)" />
			<c-tab title="Direct Access Sellers (DASS)" />
		</c-tabs>

		<!-- Tab 0: DAPS -->
		<div v-if="activeTab === 0">
			<div class="row g-3">
				<div v-for="peer in peers" :key="peer.id" class="col-md-4">
					<div class="card face-card shadow-sm text-center p-3">
						<img :src="peer.avatar" class="rounded-circle mb-2" style="width: 80px; height: 80px; object-fit: cover;" />
						<h5 class="mb-1">{{ peer.name }}</h5>
						<div class="d-flex justify-content-center gap-2 mt-2">
							<button class="btn btn-outline-primary btn-sm" @click="videoCall(peer)"><i class="bi bi-camera-video"></i></button>
							<button class="btn btn-outline-success btn-sm" @click="directTalk(peer)"><i class="bi bi-telephone"></i></button>
							<button class="btn btn-outline-warning btn-sm" @click="locatePeer(peer)"><i class="bi bi-geo-alt"></i></button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Tab 1: DASS -->
		<div v-else>
			<div class="row g-3">
				<div v-for="seller in sellers" :key="seller.id" class="col-md-4">
					<div class="card entity-card shadow-sm text-center p-3">
						<img :src="seller.logo" class="rounded mb-2" style="width: 80px; height: 80px; object-fit: contain; background: #f8f9fa;" />
						<h5 class="mb-1">{{ seller.name }}</h5>
						<div class="d-flex justify-content-center gap-2 mt-2">
							<button class="btn btn-outline-info btn-sm" @click="viewEntityMenu(seller)"><i class="bi bi-list"></i></button>
							<button class="btn btn-outline-primary btn-sm" @click="selectEntity(seller)"><i class="bi bi-check2-circle"></i></button>
						</div>
					</div>
				</div>
			</div>

			<!-- Entity Menu Modal -->
			<c-modal v-model="showMenu" title="Entity Menu" size="lg">
				<div v-if="selectedSeller">
					<h5>{{ selectedSeller.name }} Menu</h5>
					<ul class="list-group mb-3">
						<li v-for="item in selectedSeller.menu" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
							<span>{{ item.name }}</span>
							<span>${{ item.price.toFixed(2) }}</span>
							<button class="btn btn-success btn-sm ms-2" @click="addToCart(item)"><i class="bi bi-cart-plus"></i></button>
						</li>
					</ul>
					<h6>Shopping Cart</h6>
					<ul class="list-group mb-3">
						<li v-for="item in cart" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center">
							<span>{{ item.name }}</span>
							<span>${{ item.price.toFixed(2) }}</span>
							<button class="btn btn-danger btn-sm ms-2" @click="removeFromCart(item)"><i class="bi bi-trash"></i></button>
						</li>
					</ul>
					<div class="d-flex justify-content-between align-items-center">
						<strong>Total: ${{ cartTotal.toFixed(2) }}</strong>
						<button class="btn btn-primary" :disabled="cart.length === 0" @click="checkout">Checkout</button>
					</div>
				</div>
			</c-modal>
		</div>
	</div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CTab, CTabs, CModal } from '@coreui/vue';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';

const activeTab = ref(0);

// DAPS: Direct Access Peers (from invitees)
const peers = ref<any[]>([]);
let peersUnsub: (() => void) | null = null;

// DASS: Direct Access Sellers (from 0110_entities)
const sellers = ref<any[]>([]);
let sellersUnsub: (() => void) | null = null;

// Shopping cart state
const cart = ref<any[]>([]);
const showMenu = ref(false);
const selectedSeller = ref<any>(null);

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.price, 0));

// Real-time Firestore listeners
onMounted(() => {
	// DAPS: Peers (invitees with status 'Active' and level 'Member')
	const peersQuery = query(
		collection(db, 'invitees'),
		where('status', '==', 'Active'),
		where('level', '==', 'Member'),
		orderBy('name', 'asc')
	);
	peersUnsub = onSnapshot(peersQuery, (snapshot) => {
		peers.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	});

	// DASS: Sellers/entities (0110_entities)
	const sellersQuery = collection(db, '0110_entities');
	sellersUnsub = onSnapshot(sellersQuery, (snapshot) => {
		sellers.value = snapshot.docs.map(doc => {
			const data = doc.data();
			// Fallback for logo/menu if not present
			return {
				id: doc.id,
				name: data.name || 'Entity',
				logo: data.logo || 'https://placehold.co/80x80?text=Entity',
				menu: data.menu || [
					{ id: 'a', name: 'Sample Item', price: 10.0 },
				],
			};
		});
	});
});

onUnmounted(() => {
	if (peersUnsub) peersUnsub();
	if (sellersUnsub) sellersUnsub();
});

					import { ref, computed } from 'vue';
					import { CTab, CTabs, CModal } from '@coreui/vue';
					import { usePeers, useSellers } from '../useInstanceHomeData';
					import { useCart } from '../useCart';

					const activeTab = ref(0);
					const filterPeersByLevel = ref(true); // Toggle for DAPS filter
					const filterSellersByType = ref(false); // Toggle for DASS filter

					// DAPS: Peers composable
					const { peers } = usePeers({ filterLevel: filterPeersByLevel.value });
					// DASS: Sellers composable
					const { sellers } = useSellers({ filterType: filterSellersByType.value });

					// Shopping cart state (per seller)
					const showMenu = ref(false);
					const selectedSeller = ref<any>(null);
					let cartComposable: any = null;
					const cart = ref<any[]>([]);
					const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.price, 0));

					function videoCall(peer: any) {
					  alert(`Video call with ${peer.name}`);
					}
					function directTalk(peer: any) {
					  alert(`Direct talk with ${peer.name}`);
					}
					function locatePeer(peer: any) {
					  alert(`Locating ${peer.name}`);
					}
					function viewEntityMenu(seller: any) {
					  selectedSeller.value = seller;
					  showMenu.value = true;
					  // Listen to cart for this seller
					  if (seller && seller.id) {
					    cartComposable = useCart(seller.id);
					    cartComposable.listenCart();
					    cart.value = cartComposable.cart.value;
					  }
					}
					function selectEntity(seller: any) {
					  alert(`Selected ${seller.name}`);
					}
					function addToCart(item: any) {
					  if (cartComposable) cartComposable.addToCart(item);
					}
					function removeFromCart(item: any) {
					  if (cartComposable) cartComposable.removeFromCart(item);
					}
					function checkout() {
					  if (cartComposable) cartComposable.checkout();
					  showMenu.value = false;
					}
