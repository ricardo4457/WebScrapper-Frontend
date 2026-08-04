<template>
  <v-bottom-navigation :model-value="active" color="primary" grow fixed>
    <v-btn v-for="item in navItems" :key="item.to" :to="item.to" :value="item.to">
      <v-icon>{{ item.icon }}</v-icon>
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { title: 'Início', to: '/', icon: 'mdi-home' },
  { title: 'Pesquisar', to: '/search', icon: 'mdi-magnify' },
  { title: 'Livros', to: '/books', icon: 'mdi-book-open-variant' },
  { title: 'Escolas', to: '/schools', icon: 'mdi-school' },
]

const active = computed(() => route.path)
</script>
