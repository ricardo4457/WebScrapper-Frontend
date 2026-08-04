<template>
  <div class="error-state text-center py-12">
    <v-icon icon="mdi-alert-circle-outline" size="64" color="error" class="mb-4" />
    <p class="text-h6">{{ message }}</p>
    <v-btn v-if="retryable" color="primary" variant="tonal" class="mt-4" @click="$emit('retry')">
      Tentar novamente
    </v-btn>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: 'Ocorreu um erro. Tenta novamente.' },
  retryable: { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>
