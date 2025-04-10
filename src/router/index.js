import { createRouter, createWebHashHistory } from "vue-router"
import Layout from '@/Layout/index.vue'

// 权限验证
function auth() {
  return true
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: () => ({ path: '/calendar' }),
      children: [
        { path: 'calendar', component: () => import('@/views/Calendar/index.vue')},
        { path: 'loop', component: () => import('@/views/Loop/index.vue')},
        { path: 'table', component: () => import('@/views/Table/index.vue')},
      ]
    }
  ]
})
router.beforeEach(async (to, from, next) => {
  if (!(await auth())) {
    return { path: '/403' }
  }
  next()
})
export default router