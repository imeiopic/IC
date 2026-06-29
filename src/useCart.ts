import { ref } from 'vue'; // Removed onUnmounted
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Standardized to firebase.ts
import { useAuth } from '../useAuth'; // Corrected path for useAuth

export function useCart(sellerId: string) {
  const { user } = useAuth();
  const cart = ref<any[]>([]);

  // Listen to cart changes for this user and seller
  /**
   * Starts listening to cart changes for this user and seller.
   * Returns an unsubscribe function.
   */
  function listenCart(): (() => void) | undefined { // Explicitly return the unsubscribe function
    // The unsubscribe function is now returned by listenCart,
    // allowing the caller (e.g., a Pinia store) to manage its lifecycle.
    // This ensures the listener is not tied to a component's lifecycle
    // and can be managed explicitly by a global state manager like Pinia.

    if (!user.value) {
      console.warn("useCart: Cannot listen to cart, no user authenticated.");
      return undefined;
    }
    const cartDoc = doc(db, 'shopping_carts', `${user.value.uid}_${sellerId}`);
    const unsub = onSnapshot(cartDoc, (snap) => { // Use const for unsub
      if (snap.exists()) {
        cart.value = snap.data().items || [];
      } else {
        cart.value = [];
      }
    });
    return unsub;
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

  return { cart, addToCart, removeFromCart, checkout, listenCart };
}
