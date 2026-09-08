/**
 * router/index.js
 *
 * Central route table + role-based navigation guard for SOrders.
 *
 *  - Customer routes ("/", "/order/:tableId") need no auth at all.
 *  - Staff routes declare `meta.roles`; 'admin' is always allowed in on
 *    top of whatever roles are listed (see auth store `canAccess`).
 */
import { createRouter, createWebHistory } from 'vue-router'
import { ROLES } from '@/firebase/collections'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/index.vue'),
  },
  {
    path: '/order/:tableId',
    name: 'customer-order',
    component: () => import('@/pages/customer/TableOrder.vue'),
    props: true,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login.vue'),
  },
  {
    path: '/kitchen',
    name: 'kitchen',
    component: () => import('@/pages/kitchen/Board.vue'),
    meta: { requiresAuth: true, roles: [ROLES.KITCHEN] },
  },
  {
    path: '/server',
    name: 'server',
    component: () => import('@/pages/server/Dashboard.vue'),
    meta: { requiresAuth: true, roles: [ROLES.SERVER] },
  },
  {
    path: '/manager',
    name: 'manager',
    component: () => import('@/pages/manager/Dashboard.vue'),
    meta: { requiresAuth: true, roles: [ROLES.MANAGER] },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/pages/Unauthorized.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Home route for a signed-in staff member, by role.
export const ROLE_HOME = {
  [ROLES.KITCHEN]: '/kitchen',
  [ROLES.SERVER]: '/server',
  [ROLES.MANAGER]: '/manager',
  [ROLES.ADMIN]: '/admin',
}

router.beforeEach(async to => {
  if (!to.meta?.requiresAuth) {
    return true
  }

  const auth = useAuthStore()
  await auth.waitForReady()

  if (!auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (!auth.isActive) {
    await auth.logout()
    return { path: '/login', query: { redirect: to.fullPath, suspended: '1' } }
  }
  if (!auth.canAccess(to.meta.roles)) {
    return { path: '/unauthorized' }
  }
  return true
})

export default router
