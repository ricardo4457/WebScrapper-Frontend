<template>
  <v-app-bar color="primary" density="comfortable" elevation="2">
    <v-toolbar-title>
      <router-link to="/" class="app-title-link">
        <v-icon size="26" class="app-title-icon">mdi-book-open-page-variant-outline</v-icon>
        Book Scraper
      </router-link>
    </v-toolbar-title>

    <button
      v-if="showBack"
      type="button"
      class="header-back-btn d-flex d-sm-none"
      aria-label="Voltar"
      @click="searchStore.previousStep()"
    >
      <v-icon size="22">mdi-chevron-left</v-icon>
    </button>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSearchStore } from '@/stores/search.store.js'

const route = useRoute()
const searchStore = useSearchStore()

// Only relevant while stepping through the wizard on the home page —
// BooksDetailView/PriceHistoryView already have their own back buttons.
const showBack = computed(() => route.name === 'home' && searchStore.currentStep > 0)
</script>

<style scoped>
.app-title-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: var(--space-3);
  color: inherit;
  text-decoration: none;
}

.app-title-icon {
  color: inherit;
}

.header-back-btn {
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-on-primary));
  background: transparent;
  color: rgb(var(--v-theme-on-primary));
  cursor: pointer;
  margin-inline-start: auto;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.header-back-btn:hover {
  background: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-primary));
}
</style>
