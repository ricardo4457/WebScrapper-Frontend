<template>
  <h1 class="text-h5 font-weight-bold mb-4">{{ text }}</h1>
</template>

<script setup>
defineProps({
  text: { type: String, required: true },
})
</script>
