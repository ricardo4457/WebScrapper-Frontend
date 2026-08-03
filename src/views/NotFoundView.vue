<template>
  <PageContainer>
    <PageTitle text="Página não encontrada" />
    <v-btn color="primary" :to="{ name: 'home' }">Voltar ao início</v-btn>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
</script>
