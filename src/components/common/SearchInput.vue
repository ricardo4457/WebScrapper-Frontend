<template>
  <v-text-field
    v-model="query"
    :placeholder="placeholder"
    variant="outlined"
    density="comfortable"
    hide-details
    clearable
    prepend-inner-icon="mdi-magnify"
    @keyup.enter="emitSearch"
    @click:clear="emitClear"
  >
    <template #append>
      <v-btn color="primary" :loading="loading" @click="emitSearch">
        Pesquisar
      </v-btn>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: 'Pesquisar...' },
  loading: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const query = ref(props.modelValue)

function emitSearch() {
  emit('update:modelValue', query.value)
  emit('search', query.value)
}

function emitClear() {
  query.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>
