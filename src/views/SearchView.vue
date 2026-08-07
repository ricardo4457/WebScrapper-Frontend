<template>
  <PageContainer>
    <PageTitle text="Pesquisar Livros" />

    <SearchInput
      placeholder="Pesquisar por título..."
      :loading="booksStore.loading"
      @search="handleTitleSearch"
    />

    <v-divider class="my-6">
      <span class="text-caption text-medium-emphasis px-2">ou pesquisa por escola</span>
    </v-divider>

    <SearchWizard v-if="!searchDone" @searched="searchDone = true" />

    <template v-else>
      <v-btn variant="text" class="mb-4" @click="restartWizard">
        ← Nova pesquisa por escola
      </v-btn>
      <BookList
        :books="booksStore.items"
        :loading="booksStore.searchLoading"
        :error="booksStore.searchError"
        @retry="restartWizard"
      />
    </template>

    <div v-if="titleSearched" class="mt-6">
      <BookList
        :books="booksStore.items"
        :loading="booksStore.loading"
        :error="booksStore.error"
        @retry="() => handleTitleSearch(lastQuery)"
      />
    </div>
  </PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import BookList from '@/components/books/BookList.vue'
import SearchWizard from '@/components/search-flow/SearchWizard.vue'
import { useBooksStore } from '@/stores/books.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const booksStore = useBooksStore()
const searchStore = useSearchStore()

const lastQuery = ref('')
const titleSearched = ref(false)
const searchDone = ref(false)

function handleTitleSearch(query) {
  if (!query || query.trim().length < 2) return
  lastQuery.value = query
  titleSearched.value = true
  booksStore.searchByTitle(query)
}

function restartWizard() {
  searchStore.reset()
  booksStore.reset()
  searchDone.value = false
}
</script>
