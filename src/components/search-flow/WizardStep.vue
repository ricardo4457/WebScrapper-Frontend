<template>
  <div class="wizard-step">
    <ProgressStepBar
      :current="searchStore.currentStep + 1"
      :total="searchStore.activeSteps.length"
    />
    <h2 class="text-h6 mb-4">{{ title }}</h2>
    <slot />
    <div class="d-flex justify-space-between mt-6">
      <v-btn v-if="showBack" variant="text" @click="$emit('back')">Voltar</v-btn>
      <v-spacer v-else />
    </div>
  </div>
</template>

<script setup>
import ProgressStepBar from '@/components/common/ProgressStepBar.vue'
import { useSearchStore } from '@/stores/search.store.js'

defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: true },
})
defineEmits(['back'])

const searchStore = useSearchStore()
</script>
