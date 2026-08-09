<template>
  <PageContainer>
    <PageTitle text="Pesquisar Livros" />

    <SmartSearchInput />

    <v-divider class="my-6">
      <span class="text-caption text-medium-emphasis px-2">ou percorre o assistente</span>
    </v-divider>

    <SearchWizard v-if="!searchDone" @searched="searchDone = true" />

    <template v-else>
      <v-btn variant="text" class="mb-4" @click="restartWizard"> ← Nova pesquisa </v-btn>
      <BookList
        :books="booksStore.items"
        :loading="booksStore.searchLoading"
        :error="booksStore.searchError"
        @retry="restartWizard"
      />
      <PaginationControls
        :page="booksStore.pagination.currentPage"
        :last-page="booksStore.pagination.lastPage"
        :total="booksStore.pagination.total"
        @update:page="(page) => booksStore.goToPage(page)"
      />
    </template>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import BookList from '@/components/books/BookList.vue'
import PaginationControls from '@/components/common/PaginationControls.vue'
import SearchWizard from '@/components/search-flow/SearchWizard.vue'
import SmartSearchInput from '@/components/search-flow/SmartSearchInput.vue'
import { useBooksStore } from '@/stores/books.store.js'
import { useSearchStore } from '@/stores/search.store.js'
import { ref } from 'vue'

const booksStore = useBooksStore()
const searchStore = useSearchStore()

const searchDone = ref(false)

function restartWizard() {
  searchStore.reset()
  booksStore.reset()
  searchDone.value = false
}
</script>
