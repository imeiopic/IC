import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuth } from './useAuth';

/**
 * CORE IDENTITY NODES
 * Policed Path: All .vue nodes are grounded in src/components/
 */
import IoHome from './components/IoHome.vue';
import EntityOnboarding from './components/EntityOnboarding.vue';
import Ime from './components/Ime.vue';
import Manifesto from './components/Manifesto.vue';
import QrCode from './components/QrCode.vue';

const routes: Array<RouteRecordRaw> = [
  // 0000_PLANETARY_ANCHOR
  {
    path: '/',
    name: 'home',
    component: IoHome
  },

  // 0001_DIC_GROUNDING (The Path from Noise to Entity)
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: EntityOnboarding,
    meta: { transition: 'page' }
  },
   //    
  // 0010_RESONANCE & 0011_CONNECTED
  {
    path: '/communication',
    name: 'Communication',
    component: () => import('./components/Communication.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/connected',
    name: 'Connected',
    component: () => import('./components/Connected.vue'),
    meta: { requiresAuth: true }
  },

  // 0101_VIRTUAL_OS & 1101_VR_EARTH
  {
    path: '/virtual',
    name: 'Virtual',
    component: () => import('./components/Virtual.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/earth',
    name: 'Earth',
    component: () => import('./components/Earth.vue'),
    meta: { requiresAuth: true }
  },

  // 0110_PEOPLE & 0111_REALITY
  {
    path: '/people',
    name: 'People',
    component: () => import('./components/People.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reality',
    name: 'Reality',
    component: () => import('./components/Reality.vue'),
    meta: { requiresAuth: true }
  },

  // 1001_COMMERCE & 1011_EXCHANGE
  {
    path: '/commerce',
    name: 'Commerce',
    component: () => import('./components/Commerce.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exchange',
    name: 'Exchange',
    component: () => import('./components/Exchange.vue'),
    meta: { requiresAuth: true }
  },

  // 1111_INFORMATION (The Filter)
  {
    path: '/information',
    name: 'Information',
    component: () => import('./components/Information.vue'),
    meta: { requiresAuth: true }
  },

  // 1110_BUYER & 1010_SELLER
  {
    path: '/buyer',
    name: 'Buyer',
    component: () => import('./components/Buyer.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/seller',
    name: 'Seller',
    component: () => import('./components/Seller.vue'),
    meta: { requiresAuth: true }
  },

  // MASTER_CONTROL_SUBSTRATE
  {
    path: '/ime',
    name: 'Ime',
    component: Ime,
    meta: { requiresAuth: true }
  },
  {
    path: '/ordertaker',
    name: 'OrderTaker',
    component: () => import('./components/OrderTaker.vue'),
    meta: { requiresAuth: true }
  },

  // DIC_HANDSHAKE_TERMINALS
  { 
    path: '/scan', 
    name: 'ScanQRC', 
    component: () => import('./components/ScanQRC.vue'), 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/my-qrc', 
    name: 'QrCode', 
    component: QrCode, 
    meta: { requiresAuth: true } 
  },

  // LOGIC_ARTIFACTS
  { path: '/manifesto', name: 'Manifesto', component: Manifesto },
  { path: '/truth', name: 'LogicalTruth', component: () => import('./components/logicalTruth.vue') },
  { path: '/entity', name: 'Entity', component: () => import('./components/Entity.vue'), meta: { requiresAuth: true } },
  { path: '/code', name: 'SystemCode', component: () => import('./components/Code.vue'), meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

/**
 * THE SOVEREIGN SHIELD (Navigation Guard)
 * Logic: Policing the transition from Noise to Grounded Truth.
 */
router.beforeEach(async (to, from, next) => {
  const { ensureAuthInitialized } = useAuth();
  const user = await ensureAuthInitialized();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // 1. Logic Policing: Redirect unauthenticated noise to home
  if (requiresAuth && !user) {
    return next({ name: 'home' });
  }

  // 2. Referral Sighting: Intercept Incoming Pulse
  if (to.query.ref) {
    sessionStorage.setItem('referrer_instance_id', to.query.ref as string);
    // If authenticated but arriving via ref, ground the node in Onboarding
    if (user && to.name !== 'Onboarding') {
      return next({ name: 'Onboarding' });
    }
  }

  // 3. Prevent Loop: Do not allow grounded entities back into Onboarding without a ref pulse
  if (user && to.name === 'Onboarding' && !to.query.ref) {
    return next({ name: 'Virtual' });
  }

  next();
});

export default router;