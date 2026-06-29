import { useAuthStore } from '@/stores/authStore'; // Import the new auth store
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * 16_THREAD_COORDINATES
 * Policed Path: src/components/
 */
import Earth from '@/views/Earth.vue';
import Entity from '@/views/Entity.vue';
import EntityMenu from '@/views/EntityMenu.vue';
import Virtual from '@/views/Gov.vue';
import IoHome from '@/views/HomePage.vue';
import Ime from '@/views/Intro.vue';
import Manifesto from '@/views/Manifesto.vue';
import EntityOnboarding from '@/views/OnboardingView.vue';

const routes: Array<RouteRecordRaw> = [
  // 0000_PLANETARY_ANCHOR
  {
    path: '/',
    name: 'home',
    component: IoHome,
  },

  // 0001_DIC_GROUNDING (The Identity Handshake)
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: EntityOnboarding,
    meta: { transition: 'page' },
  },

  // 0011_DIC_HANDSHAKE (Mesh Expansion)
  {
    path: '/my-qrc',
    name: 'QrCode',
    component: () => import('@/views/Code.vue'),
    meta: { requiresAuth: true },
  },

  // 0101_VIRTUAL_OS (The Mesh Interface)
  {
    path: '/virtual',
    name: 'Virtual',
    component: Virtual,
    meta: { requiresAuth: true },
  },

  // 1101_VR_EARTH (Spatial Geometry)
  {
    path: '/earth',
    name: 'Earth',
    component: Earth,
    meta: { requiresAuth: true },
  },

  // 0110_PEOPLE (Peer Sighting)
  {
    path: '/people',
    name: 'People',
    component: () => import('@/views/People.vue'),
    meta: { requiresAuth: true },
  },

  // 1111_INFORMATION (The Filter)
  {
    path: '/information',
    name: 'Information',
    component: () => import('@/views/Information.vue'),
    meta: { requiresAuth: true },
  },

  // 1001_COMMERCE (1.2Q TPE Ledger)
  {
    path: '/commerce',
    name: 'Commerce',
    component: () => import('@/views/Commerce.vue'),
    meta: { requiresAuth: true },
  },

  // MASTER_LOGIC_NODES
  {
    path: '/ime',
    name: 'Ime',
    component: Ime,
    // meta: { requiresAuth: true } <-- FRACTURE REMOVED
  },
  {
    path: '/code',
    name: 'SystemCode',
    component: () => import('@/views/Code.vue'),
  },
  {
    path: '/manifesto',
    name: 'Manifesto',
    component: Manifesto,
  },
  {
    path: '/entity-menu/:entityId?', // Optional entityId parameter
    name: 'EntityMenu',
    component: EntityMenu,
    props: true, // Pass route params as props to the component
    meta: { requiresAuth: true },
  },
  {
    path: '/entity/:entityId?', // Optional entityId parameter
    name: 'Entity',
    component: Entity,
    props: true, // Pass route params as props to the component
    meta: { requiresAuth: true },
  },
  {
    path: '/truth',
    name: 'LogicalTruth',
    component: () => import('@/views/logicalTruth.vue'),
  },
  // show off routes
  {
    path: '/it',
    name: 'IT',
    component: () => import('@/views/IT.vue'),
  },
  {
    path: '/ot',
    name: 'OT',
    component: () => import('@/views/OT.vue'),
  },
  {
    path: '/playlist',
    name: 'Playlist',
    component: () => import('@/views/PlayList.vue'),
  },
  {
    path: '/gov',
    name: 'Gov',
    component: () => import('@/views/Gov.vue'),
  },
  {
    path: '/roles',
    name: 'RoleOrchestrator',
  component: EntityMenu,
    meta: { requiresAuth: true },
  },
  // CATCH_ALL_NOISE_REDUCTION
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

/**
 * THE SOVEREIGN SHIELD (Navigation Guard)
 * Policing the transition between legacy Noise and Grounded Reality.
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  // Wait for Firebase Auth to initialize and get the user from the store
  const user = await authStore.authInitialized();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // 1. AUTHENTICATION_POLICING
  if (requiresAuth && !user) {
    console.warn('LOGIC_FRACTURE: Unauthorized node access detected. Redirecting to Anchor.');
    return next({ name: 'home' });
  }

  // 2. REFERRAL_SIGHTING (The 2% Profit Shield Pulse)
  if (to.query.ref) {
    sessionStorage.setItem('referrer_instance_id', to.query.ref as string);
    // If arriving with a ref pulse, force transition to Onboarding to ground the node
    if (user && to.name !== 'Onboarding') {
      return next({ name: 'Onboarding' });
    }
  }

  // 3. ONBOARDING_LOOP_PREVENTION
  if (user && to.name === 'Onboarding' && !to.query.ref) {
    return next({ name: 'Virtual' });
  }

  next();
});

export default router;
