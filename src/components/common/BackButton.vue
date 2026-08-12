<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :type="to ? undefined : 'button'"
    :to="to ?? undefined"
    class="back-btn"
    :class="{ 'back-btn--on-primary': variant === 'on-primary' }"
    @click="onClick"
  >
    <v-icon icon="mdi-chevron-left" size="20" />
    {{ label }}
  </component>
</template>

<script setup>
const props = defineProps({
  // 'primary': border/text in the primary color, for light backgrounds (default).
  // 'on-primary': for use on top of the primary-colored app bar.
  variant: { type: String, default: 'primary' },
  // Text shown next to the chevron. Override for context-specific copy
  // (e.g. "Voltar ao início"), but keep the same visual shape everywhere.
  label: { type: String, default: 'Voltar' },
  // Optional router-link target. When set, the button navigates directly
  // instead of emitting 'click' (used e.g. for "Voltar ao início").
  to: { type: [String, Object], default: null },
})
const emit = defineEmits(['click'])

function onClick(event) {
  if (!props.to) emit('click', event)
}
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 20px;
  border-radius: 999px;
  border: 2px solid rgb(var(--v-theme-primary));
  background: transparent;
  color: rgb(var(--v-theme-primary));
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.back-btn:hover {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.back-btn--on-primary {
  border-color: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-on-primary));
}

.back-btn--on-primary:hover {
  background: rgb(var(--v-theme-on-primary));
  color: rgb(var(--v-theme-primary));
}
</style>
