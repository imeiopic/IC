import { defineStore } from 'pinia';
import { db, storage } from '@/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useMeshStore } from './meshStore';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [] as any[],
    isSyncing: false,
  }),

  actions: {
    /**
     * FETCH_ALL_MENUS:
     * Retrieves the state of local entity menus.
     */
    async fetchAllMenus(entityId: string) {
      const mesh = useMeshStore();
      this.isSyncing = true;
      try {
        const q = query(collection(db, `entities/${entityId}/menus`));
        const snap = await getDocs(q);
        this.menus = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        mesh.logEvent('MENU_FETCH_FRACTURE', { entityId, err });
      } finally {
        this.isSyncing = false;
      }
    },

    /**
     * GROUND_PRODUCT:
     * Atomic update to the menu substrate. Includes file handling and telemetry.
     */
    async groundProduct(entityId: string, menuId: string, product: any, file: File | null) {
      const mesh = useMeshStore();
      this.isSyncing = true;

      try {
        let imageUrl = product.image || 'https://via.placeholder.com/150';
        
        // 1. Process Asset if present
        if (file) {
          const path = `entities/${entityId}/products/${Date.now()}_${file.name}`;
          const imgRef = storageRef(storage, path);
          const snapshot = await uploadBytes(imgRef, file);
          imageUrl = await getDownloadURL(snapshot.ref);
        }

        // 2. Prepare Atomic Payload
        const productId = `PROD_${Date.now()}`;
        const updatedProduct = { ...product, id: productId, image: imageUrl };

        // 3. Commit to Firestore
        const menuRef = doc(db, `entities/${entityId}/menus`, menuId);
        await updateDoc(menuRef, {
          products: arrayUnion(updatedProduct)
        });

        // 4. Mesh Telemetry
        mesh.logEvent('PRODUCT_GROUNDED', { productId, menuId });
        
      } catch (err) {
        mesh.logEvent('GROUNDING_FRACTURE', { menuId, err });
        throw err;
      } finally {
        this.isSyncing = false;
      }
    }
  }
});