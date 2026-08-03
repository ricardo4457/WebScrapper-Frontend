<template>
  <v-container class="page-container" fluid>
    <slot />
  </v-container>
</template>

<style scoped>
.page-container {
  padding-bottom: 72px; /* espaço para a BottomNavigation fixa */
}
</style>
