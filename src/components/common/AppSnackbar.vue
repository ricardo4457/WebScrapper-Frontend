<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000" location="bottom">
    {{ snackbar.message }}

    <template #actions>
      <v-btn variant="text" @click="appStore.hideSnackbar()">Fechar</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app.store.js'

const appStore = useAppStore()
const { snackbar } = storeToRefs(appStore)
</script>
