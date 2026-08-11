<template>
  <div class="pill-progress mb-6" :style="{ '--percent': percent + '%' }">
    <div class="pill-progress__fill" :style="{ width: percent + '%' }" />
    <span class="pill-progress__label" :class="{ 'pill-progress__label--on-fill': percent >= 88 }">
      {{ Math.round(percent) }}%
    </span>
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

<style scoped>
.pill-progress {
  position: relative;
  width: 100%;
  height: 44px;
  border-radius: 999px;
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-surface));
  overflow: hidden;
}

.pill-progress__fill {
  position: absolute;
  inset: 0;
  right: auto;
  background: rgb(var(--v-theme-primary));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.pill-progress__label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline-end: 18px;
  font-size: 16px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  transition: color 0.3s ease;
}

.pill-progress__label--on-fill {
  color: rgb(var(--v-theme-on-primary));
}
</style>
