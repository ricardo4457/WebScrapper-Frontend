<template>
  <div class="list-skeleton">
    <div v-for="n in count" :key="n" class="list-skeleton__item">
      <v-skeleton-loader type="text" class="list-skeleton__line" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 5 },
})
</script>

<style scoped>
.list-skeleton {
  padding: var(--space-2) 0;
}

.list-skeleton__item {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgb(var(#4caf50));
}

.list-skeleton__item:last-child {
  border-bottom: none;
}

.list-skeleton__line {
  width: 70%;
}
</style>
