import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import RoomList from '../components/RoomList.vue'
import BedList from '../components/BedList.vue'
import TenancyList from '../components/TenancyList.vue'
import AccountList from '../components/AccountList.vue'
import InvoiceList from '../components/InvoiceList.vue'
import InvoiceItemList from '../components/InvoiceItemList.vue'
import PaymentList from '../components/PaymentList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/rooms' },
    { path: '/login', name: 'login', component: Login, meta: { requiresGuest: true } },
    { path: '/register', name: 'register', component: Register, meta: { requiresGuest: true } },
    { path: '/rooms', name: 'rooms', component: RoomList, meta: { requiresAuth: true } },
    { path: '/beds', name: 'beds', component: BedList, meta: { requiresAuth: true } },
    { path: '/tenancies', name: 'tenancies', component: TenancyList, meta: { requiresAuth: true } },
    { path: '/accounts', name: 'accounts', component: AccountList, meta: { requiresAuth: true } },
    { path: '/invoices', name: 'invoices', component: InvoiceList, meta: { requiresAuth: true } },
    { path: '/invoice-items', name: 'invoice-items', component: InvoiceItemList, meta: { requiresAuth: true } },
    { path: '/payments', name: 'payments', component: PaymentList, meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'rooms' }
  }
})

export default router