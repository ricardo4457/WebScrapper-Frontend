import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/search',
    redirect: '/',
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: () => import('@/views/books/BooksDetailView.vue'),
    props: true,
  },
  {
    path: '/books/:id/price-history',
    name: 'book-price-history',
    component: () => import('@/views/books/PriceHistoryView.vue'),
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
