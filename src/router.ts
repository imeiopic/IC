import { createRouter, createWebHistory } from 'vue-router'



import Login from './components/Login.vue';
import Signup from './components/Signup.vue';
import InstanceHome from './components/InstanceHome.vue';
import OrderTaker from './components/OrderTaker.vue';
import InstanceCommunicate from './components/InstanceCommunicate.vue';
import Homepage from './components/Homepage.vue';

const routes = [
  { path: '/', name: 'Homepage', component: Homepage },
  { path: '/instancehome', name: 'InstanceHome', component: InstanceHome },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/ordertaker', name: 'OrderTaker', component: OrderTaker },
  { path: '/communicate', name: 'InstanceCommunicate', component: InstanceCommunicate }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
