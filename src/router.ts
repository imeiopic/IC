import { createRouter, createWebHistory } from 'vue-router'




import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import MyWorld from './components/MyWorld.vue';
import OrderTaker from './components/OrderTaker.vue';
import IOCom from './components/IOCom.vue';
import Homepage from './components/Homepage.vue';
import About from './components/About.vue';
import MyConnections from './components/MyConnections.vue';

import QRScanner from './components/QRScanner.vue';
const routes = [
  { path: '/', name: 'Homepage', component: Homepage },
  { path: '/myworld', name: 'MyWorld', component: MyWorld },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/ordertaker', name: 'OrderTaker', component: OrderTaker },
  { path: '/communicate', name: 'IOCom', component: IOCom },
  { path: '/about', name: 'About', component: About },
  { path: '/connections', name: 'MyConnections', component: MyConnections },
  { path: '/qr', name: 'QRScanner', component: QRScanner }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for auth
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './firebase.js';

router.beforeEach((to, _from, next) => {
  if (to.name === 'MyWorld') {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      next();
    } else {
      // Wait for auth state to resolve (handles page reload)
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next();
        } else {
          next({ name: 'Login' });
        }
      });
    }
  } else {
    next();
  }
});

export default router
