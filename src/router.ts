// ...existing code...
import { IopicCitizenAuditUI, IopicPharmacyUI } from './components/index.js';
import DICChat from './components/dic/DICChat.vue';
import DICClient from './components/dic/DICClient.vue';
import IOTPolicyManager from './components/IOTPolicyManager.vue';
import IOTAuditDashboard from './components/IOTAuditDashboard.vue';
import IOTLawAndOrder from '../IOTLawAndOrder.vue';
import IopicSoleProprietorship from '../IopicSoleProprietorship.vue';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomePage from './HomePage.vue';
import IOorg from './IOorg.vue';
import InviteList from './inviteList.vue';
import LogicalTruth from './logicalTruth.vue';
import IopicManifesto from './IopicManifesto.vue';
import IopicBootSequence from './IopicBootSequence.vue';
import LoginPage from './LoginPage.vue';
import { useAuth } from './useAuth';
import IOGoverment from './components/IOGoverment.vue'; // Import IO World Government component
import OrderTakerNodeRoles from '../OrderTakerNodeRoles.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/register-node',
    name: 'RegisterNode',
    component: () => import('./views/NodeRegistration.vue'),
    meta: { transition: 'page' }
  },
  {
    path: '/citizen-audit',
    name: 'IopicCitizenAudit',
    component: IopicCitizenAuditUI,
    meta: { transition: 'page' }
  },
  {
    path: '/pharmacy',
    name: 'IopicPharmacy',
    component: IopicPharmacyUI,
    meta: { transition: 'page' }
  },
  {
    path: '/dic-chat',
    name: 'DICChat',
    component: DICChat,
    meta: { transition: 'page' }
  },
  {
    path: '/dic',
    name: 'DICClient',
    component: DICClient,
    meta: { transition: 'page' }
  },
  {
    path: '/iot-policy-manager',
    name: 'IOTPolicyManager',
    component: IOTPolicyManager,
    meta: { transition: 'page' }
  },
  {
    path: '/iot-audit-dashboard',
    name: 'IOTAuditDashboard',
    component: IOTAuditDashboard,
    meta: { transition: 'page' }
  },
  {
    path: '/iot-law-and-order',
    name: 'IOTLawAndOrder',
    component: IOTLawAndOrder,
    meta: { transition: 'page' }
  },
  { path: '/', name: 'Home', component: HomePage },
  {
    path: '/iopic-sole-proprietorship',
    name: 'IopicSoleProprietorship',
    component: IopicSoleProprietorship,
    meta: { transition: 'page' }
  },
  { path: '/it', name: 'IT', component: () => import('./components/IT.vue') },
  {
    path: '/io-org',
    name: 'IOorg',
    component: IOorg
  },
  { path: '/invite-list', name: 'InviteList', component: InviteList },
  {
    path: '/logical-truth',
    name: 'LogicalTruth',
    component: LogicalTruth,
    meta: { transition: 'glitch' }
  },
  {
    path: '/manifesto',
    name: 'IopicManifesto',
    component: IopicManifesto,
    meta: { transition: 'page' } // Using standard page transition for readability
  },
  {
    path: '/boot',
    name: 'IopicBoot',
    component: IopicBootSequence,
    meta: { transition: 'glitch' }
  },
  {
    path: '/io-government',
    name: 'IOGoverment',
    component: IOGoverment,
    meta: { transition: 'page' }
  },
  {
    path: '/order-taker-node-roles',
    name: 'OrderTakerNodeRoles',
    component: OrderTakerNodeRoles,
    meta: { transition: 'page' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./RegisterPage.vue')
  },
  {
    path: '/verify-proof',
    name: 'VerifyProof',
    component: () => import('./VerifyProofPage.vue')
  },
  {
    path: '/invest',
    name: 'InVest',
    component: () => import('./InVest.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global Navigation Guard
router.beforeEach(async (to, from, next) => {
  const { ensureAuthInitialized } = useAuth();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // Wait for Firebase to initialize before deciding where to send the user
  const user = await ensureAuthInitialized();

  if (requiresAuth && !user) {
    next('/login');
  } else {
    next();
  }
});

export default router;
