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
      redirect: () => ({ path: '/index' }),
      children: [
        { path: 'index', component: () => import('@/views/index.vue')},
        { path: 'index1', component: () => import('@/views/index1.vue')},
      ]
    }
  ]
})
console.log(router, 9988)
router.beforeEach(async (to, from, next) => {
  if (!(await auth())) {
    return { path: '/403' }
  }
  next()
})
export default router