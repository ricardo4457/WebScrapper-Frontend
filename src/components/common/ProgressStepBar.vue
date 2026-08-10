<template>
  <div class="progress-step-bar mb-4">
    <v-progress-linear
      :model-value="percent"
      color="primary"
      bg-color="surface"
      height="6"
      rounded
    />
    <p class="text-caption text-medium-emphasis mt-1">Passo {{ current }} de {{ total }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true }, // 1-based
  total: { type: Number, required: true },
})

const percent = computed(() => (props.total > 0 ? (props.current / props.total) * 100 : 0))
</script>
