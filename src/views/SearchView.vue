<template>
  <PageContainer>
    <PageTitle text="Pesquisar Livros" />

    <SearchInput
      placeholder="Pesquisar por título..."
      :loading="booksStore.loading"
      @search="handleSearch"
    />

    <div class="mt-6">
      <BookList
        :books="booksStore.items"
        :loading="booksStore.loading"
        :error="booksStore.error"
        @retry="() => handleSearch(lastQuery)"
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
import { useBooksStore } from '@/stores/books.store.js'

const booksStore = useBooksStore()
const lastQuery = ref('')

function handleSearch(query) {
  if (!query || query.trim().length < 2) return
  lastQuery.value = query
  booksStore.searchByTitle(query)
}
</script>
