<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSnackbar from '@/components/common/AppSnackbar.vue'
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main>
      <router-view />
    </v-main>
    <AppSnackbar />
  </v-app>
</template>

<style setup></style>
