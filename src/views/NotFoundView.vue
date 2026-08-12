<template>
  <PageContainer>
    <PageTitle text="Página não encontrada" />
    <BackButton label="Voltar ao início" :to="{ name: 'home' }" />
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import BackButton from '@/components/common/BackButton.vue'
</script>
