import { ref, onUnmounted } from 'vue';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';

export function usePeers({ filterLevel = false } = {}) {
  const peers = ref<any[]>([]);
  let unsub: (() => void) | null = null;

  const peersQuery = filterLevel
    ? query(
        collection(db, 'invitees'),
        where('status', '==', 'Active'),
        where('level', '==', 'Member'),
        orderBy('name', 'asc')
      )
    : query(collection(db, 'invitees'), where('status', '==', 'Active'), orderBy('name', 'asc'));

  unsub = onSnapshot(peersQuery, (snapshot) => {
    peers.value = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Avatar: use photoURL if present, else fallback to initials/avatar service
      let avatar = data.photoURL;
      if (!avatar && data.name) {
        const initials = data.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.name
        )}&background=random&color=fff&size=80&length=2&rounded=true`;
      }
      return { ...data, id: doc.id, avatar };
    });
  });

  onUnmounted(() => {
    if (unsub) unsub();
  });

  return { peers };
}

export function useSellers({ filterType = false } = {}) {
  const sellers = ref<any[]>([]);
  let unsub: (() => void) | null = null;

  const sellersQuery = filterType
    ? query(collection(db, '0110_entities'), where('type', '==', 'seller'), orderBy('name', 'asc'))
    : query(collection(db, '0110_entities'), orderBy('name', 'asc'));

  unsub = onSnapshot(sellersQuery, (snapshot) => {
    sellers.value = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Logo: use logo if present, else fallback to initials/logo service
      let logo = data.logo;
      if (!logo && data.name) {
        const initials = data.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();
        logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.name
        )}&background=random&color=fff&size=80&length=2&rounded=true`;
      }
      return {
        ...data,
        id: doc.id,
        logo,
        menu: data.menu || [{ id: 'a', name: 'Sample Item', price: 10.0 }]
      };
    });
  });

  onUnmounted(() => {
    if (unsub) unsub();
  });

  return { sellers };
}
