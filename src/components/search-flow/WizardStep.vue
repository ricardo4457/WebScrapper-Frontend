<template>
  <div class="wizard-step">
    <ProgressStepBar
      :current="searchStore.currentStep + 1"
      :total="searchStore.activeSteps.length"
    />
    <h2 class="text-h6 mb-4">{{ title }}</h2>
    <slot />
    <div class="wizard-step__actions mt-8">
      <button
        v-if="showBack"
        type="button"
        class="back-circle-btn ms-1 d-none d-sm-flex"
        aria-label="Voltar"
        @click="$emit('back')"
      >
        <v-icon size="22">mdi-chevron-left</v-icon>
      </button>
      <v-spacer v-else class="d-none d-sm-flex" />

      <div class="wizard-step__primary">
        <slot name="actions" />
      </div>
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

<style scoped>
.wizard-step__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.wizard-step__primary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: auto;
}

.back-circle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-primary));
  background: transparent;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.back-circle-btn:hover {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
