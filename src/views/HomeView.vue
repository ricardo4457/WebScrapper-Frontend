<template>
  <PageContainer>
    <PageTitle text="Wook Scraper" />
    <p class="text-body-1">Pesquisa manuais escolares e consulta o histórico de preços.</p>

    <v-tabs v-model="mode" class="mt-4" color="primary" grow>
      <v-tab value="quick">Pesquisa rápida</v-tab>
      <v-tab value="guided">Pesquisa guiada</v-tab>
    </v-tabs>

    <v-window v-model="mode" class="mt-4">
      <v-window-item value="quick">
        <SmartSearchInput @school-prefilled="mode = 'guided'" />
      </v-window-item>

      <v-window-item value="guided">
        <SearchWizard v-if="!searchDone" @searched="searchDone = true" />

        <template v-else>
          <v-btn variant="text" class="mb-4" @click="restartWizard"> ← Nova pesquisa </v-btn>
          <AsyncStatusBanner
            v-if="booksStore.stale"
            message="Os resultados apresentados podem estar desatualizados a atualizar dados em segundo plano..."
          />
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
      </v-window-item>
    </v-window>
  </PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import BookList from '@/components/books/BookList.vue'
import PaginationControls from '@/components/common/PaginationControls.vue'
import AsyncStatusBanner from '@/components/common/AsyncStatusBanner.vue'
import SearchWizard from '@/components/search-flow/SearchWizard.vue'
import SmartSearchInput from '@/components/search-flow/SmartSearchInput.vue'
import { useBooksStore } from '@/stores/books.store.js'
import { useSearchStore } from '@/stores/search.store.js'

const booksStore = useBooksStore()
const searchStore = useSearchStore()

const mode = ref('quick')
const searchDone = ref(false)

function restartWizard() {
  searchStore.reset()
  booksStore.reset()
  searchDone.value = false
}
</script>
