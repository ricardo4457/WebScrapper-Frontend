<template>
  <div class="empty-state text-center py-12">
    <v-icon :icon="icon" size="64" color="grey-lighten-1" class="mb-4" />
    <p class="text-h6 text-medium-emphasis">{{ title }}</p>
    <p v-if="subtitle" class="text-body-2 text-medium-emphasis">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'mdi-book-search-outline' },
  title: { type: String, default: 'Sem resultados' },
  subtitle: { type: String, default: '' },
})
</script>
