<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNavigation from '@/components/layout/BottomNavigation.vue'
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main>
      <router-view />
    </v-main>
    <BottomNavigation />
  </v-app>
</template>

<style setup></style>
