import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('@/views/BooksView.vue'),
  },
  {
    path: '/books/:id',
    name: 'book-detail',
    component: () => import('@/views/BookDetailView.vue'),
    props: true,
  },
  {
    path: '/schools',
    name: 'schools',
    component: () => import('@/views/SchoolsView.vue'),
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
