<template>
  <v-alert type="info" variant="tonal" color="primary" class="mb-4" border="start">
    <div class="d-flex align-center">
      <v-progress-circular indeterminate color="primary" size="20" width="2" class="mr-3" />
      <span>{{ message }}</span>
    </div>
  </v-alert>
</template>

<script setup>
defineProps({
  message: { type: String, default: 'A recolher informação...' },
})
</script>
