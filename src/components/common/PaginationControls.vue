<template>
  <div v-if="lastPage > 1" class="d-flex flex-column align-center mt-6">
    <v-pagination
      :model-value="page"
      :length="lastPage"
      :total-visible="5"
      density="comfortable"
      @update:model-value="$emit('update:page', $event)"
    />
    <p class="text-caption text-medium-emphasis mt-2">
      {{ total }} {{ total === 1 ? 'resultado' : 'resultados' }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  page: { type: Number, required: true },
  lastPage: { type: Number, required: true },
  total: { type: Number, default: 0 },
})

defineEmits(['update:page'])
</script>
