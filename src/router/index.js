import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('@/views/BooksView.vue'),
  },
  {
    path: '/scraper',
    name: 'scraper',
    component: () => import('@/views/ScraperView.vue'),
  },
  {
    path: '/schools',
    name: 'schools',
    component: () => import('@/views/SchoolsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
