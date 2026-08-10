<template>
  <span :class="['text-primary font-weight-medium', sizeClass]">{{ formattedPrice }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  price: { type: [Number, String], default: null },
  size: { type: String, default: 'h6' },
})

const currencyFormatter = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

const formattedPrice = computed(() => {
  if (props.price == null) return '—'
  return currencyFormatter.format(props.price)
})

const sizeClass = computed(() => `text-${props.size}`)
</script>
