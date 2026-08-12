<template>
  <div class="wizard-step">
    <div class="wizard-step__header">
      <BackButton v-if="showBack && !smAndUp" @click="$emit('back')" />
      <ProgressStepBar
        :current="searchStore.currentStep + 1"
        :total="searchStore.activeSteps.length"
        class="wizard-step__progress"
      />
    </div>
    <h2 class="text-h6 mb-6">{{ title }}</h2>
    <slot />
    <div class="wizard-step__actions pt-8">
      <BackButton v-if="showBack && smAndUp" @click="$emit('back')" />
      <v-spacer v-else-if="smAndUp" />

      <div class="wizard-step__primary">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import ProgressStepBar from '@/components/common/ProgressStepBar.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useSearchStore } from '@/stores/search.store.js'

defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: true },
})
defineEmits(['back'])

const searchStore = useSearchStore()
const { smAndUp } = useDisplay()
</script>

<style scoped>
.wizard-step__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.wizard-step__progress {
  flex: 1;
}

.wizard-step__progress :deep(.pill-progress) {
  margin-bottom: 0;
}

.wizard-step__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.wizard-step__primary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline-start: auto;
}
</style>
