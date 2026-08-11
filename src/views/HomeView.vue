<template>
  <PageContainer>
    <v-window v-model="mode">
      <!-- Pesquisa rápida: página principal, estilo "hero" -->
      <v-window-item value="quick">
        <div class="hero-section">
          <h1 class="text-h3 font-weight-bold mb-8 text-center">
            Procura os Livros para os Teus Filhos
          </h1>

          <SmartSearchInput @school-prefilled="mode = 'guided'" />

          <div class="hero-icon my-10">
            <v-icon size="160" color="primary">mdi-book-open-page-variant-outline</v-icon>
          </div>

          <p class="text-h6 font-weight-regular text-medium-emphasis text-center hero-text">
            O Book Scraper ajuda-te a encontrar rapidamente os manuais escolares da lista de
            material do teu filho, visualizar preços e acompanhar o histórico de preços de cada
            livro, para escolheres o melhor momento para comprar.
          </p>

          <div class="d-flex justify-center hero-btn-wrap">
            <button type="button" class="pill-btn pill-btn-lg" @click="mode = 'guided'">
              Pesquisa guiada, passo a passo
            </button>
          </div>
        </div>
      </v-window-item>

      <!-- Pesquisa guiada: wizard completo -->
      <v-window-item value="guided">
        <div class="d-flex justify-space-between align-center pb-8">
          <button type="button" class="pill-btn" @click="mode = 'quick'">
            <v-icon icon="mdi-chevron-left" size="20" />
            Voltar à pesquisa rápida
          </button>
          <button v-if="searchDone" type="button" class="pill-btn" @click="restartWizard">
            <v-icon icon="mdi-chevron-left" size="20" />
            Nova pesquisa
          </button>
        </div>

        <SearchWizard v-if="!searchDone" @searched="searchDone = true" />

        <template v-else>
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

<style scoped>
.hero-section {
  padding-block: var(--space-6) var(--space-8);
  max-width: 720px;
  margin-inline: auto;
}

.hero-icon {
  display: flex;
  justify-content: center;
}

.hero-text {
  max-width: 620px;
  margin-inline: auto;
  line-height: 1.6;
}

.pill-btn-lg {
  font-size: 1.05rem;
  padding-block: 14px;
  padding-inline: var(--space-8);
}

.hero-btn-wrap {
  margin-top: var(--space-12);
}
</style>
