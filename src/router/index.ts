import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/video-generation',
    },
    {
      path: '/video-generation',
      name: 'video-generation',
      component: () => import('../views/VideoGenerationView.vue'),
    },
  ],
})

export default router
