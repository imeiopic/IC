import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import { useAuth } from './src/useAuth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/iopic-sole-proprietorship',
    name: 'IopicSoleProprietorship',
    component: () => import('./IopicSoleProprietorship.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/features',
    name: 'Features',
    // Lazy loading components for better performance
    component: () => import('../views/FeaturesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('../views/PricingPage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./src/views/DashboardPage.vue'),
    meta: { requiresAuth: true, requiresEditor: true }
  },
  {
    path: '/403',
    name: 'AccessDenied',
    component: () => import('./src/views/AccessDeniedPage.vue')
  },
  {
    path: '/admin/email-logs',
    name: 'EmailLogs',
    component: () => import('./src/views/EmailLogsDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  const { ensureAuthInitialized, isAdmin, isEditor } = useAuth();
  const user = await ensureAuthInitialized();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresEditor = to.matched.some((record) => record.meta.requiresEditor);

  if (requiresAuth && !user) {
    return next('/login');
  }

  if (requiresAdmin && !isAdmin.value) {
    return next({ path: '/403', query: { role: 'admin' } });
  }

  if (requiresEditor && !isEditor.value && !isAdmin.value) {
    return next({ path: '/403', query: { role: 'editor' } });
  }

  next();
});

export default router;
