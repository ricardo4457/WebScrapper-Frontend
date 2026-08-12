<template>
  <v-app-bar color="primary" density="comfortable" elevation="2">
    <v-toolbar-title>
      <router-link to="/" class="app-title-link">
        <v-icon size="26" class="app-title-icon">mdi-book-open-page-variant-outline</v-icon>
        Book Scraper
      </router-link>
    </v-toolbar-title>
  </v-app-bar>
</template>

<script setup></script>

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
</style>
