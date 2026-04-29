import { ref, onUnmounted } from 'vue';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../src/useAuth';

export function useCart(sellerId: string) {
  const { user } = useAuth();
  const cart = ref<any[]>([]);
  let unsub: (() => void) | null = null;

  // Listen to cart changes for this user and seller
  function listenCart() {
    if (!user.value) return;
    const cartDoc = doc(db, 'shopping_carts', `${user.value.uid}_${sellerId}`);
    unsub = onSnapshot(cartDoc, (snap) => {
      if (snap.exists()) {
        cart.value = snap.data().items || [];
      } else {
        cart.value = [];
      }
    });
  }

  async function addToCart(item: any) {
    if (!user.value) return;
    const cartDoc = doc(db, 'shopping_carts', `${user.value.uid}_${sellerId}`);
    const docSnap = await getDoc(cartDoc);
    let items = [];
    if (docSnap.exists()) {
      items = docSnap.data().items || [];
    }
    items.push(item);
    await setDoc(cartDoc, { items }, { merge: true });
  }

  async function removeFromCart(item: any) {
    if (!user.value) return;
    const cartDoc = doc(db, 'shopping_carts', `${user.value.uid}_${sellerId}`);
    const docSnap = await getDoc(cartDoc);
    let items = [];
    if (docSnap.exists()) {
      items = docSnap.data().items || [];
    }
    items = items.filter((i: any) => i.id !== item.id);
    await setDoc(cartDoc, { items }, { merge: true });
  }

  async function checkout() {
    if (!user.value) return;
    const cartDoc = doc(db, 'shopping_carts', `${user.value.uid}_${sellerId}`);
    await updateDoc(cartDoc, { items: [] });
    // Optionally, create an order document here
  }

  onUnmounted(() => {
    if (unsub) unsub();
  });

  return { cart, addToCart, removeFromCart, checkout, listenCart };
}
