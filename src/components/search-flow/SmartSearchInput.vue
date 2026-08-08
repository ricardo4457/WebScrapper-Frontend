<template>
  <v-autocomplete
    :model-value="selected"
    v-model:search="query"
    :items="items"
    :loading="loading"
    item-title="label"
    item-value="key"
    return-object
    variant="outlined"
    density="comfortable"
    placeholder="Pesquisar por título ou escola..."
    prepend-inner-icon="mdi-magnify"
    no-filter
    hide-no-data
    clearable
    @update:model-value="onSelect"
  >
    <template #item="{ props: itemProps, item }">
      <v-list-item v-bind="itemProps" :subtitle="typeLabel(item.raw.type)" />
    </template>
  </v-autocomplete>

  <v-alert
    v-if="prefillMessage"
    type="info"
    variant="tonal"
    density="compact"
    class="mt-2"
    closable
    @click:close="prefillMessage = null"
  >
    {{ prefillMessage }}
  </v-alert>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { booksService } from '@/services/books.service.js'
import { schoolsService } from '@/services/schools.service.js'
import { useSearchStore } from '@/stores/search.store.js'
import { useSchoolsStore } from '@/stores/schools.store.js'

const router = useRouter()
const searchStore = useSearchStore()
const schoolsStore = useSchoolsStore()

const query = ref('')
const items = ref([])
const selected = ref(null)
const loading = ref(false)
const prefillMessage = ref(null)

function typeLabel(type) {
  return { book: 'Livro', school: 'Escola' }[type]
}

let debounceTimer = null

watch(query, (text) => {
  clearTimeout(debounceTimer)

  if (!text || text.length < 2) {
    items.value = []
    return
  }

  prefillMessage.value = null

  debounceTimer = setTimeout(() => search(text), 300)
})

async function search(text) {
  loading.value = true

  // allSettled: one failed request doesn't cancel the others.
  const [booksResult, schoolsResult] = await Promise.allSettled([
    booksService.search({ q: text, per_page: 5 }),
    schoolsService.list({ search: text }),
  ])

  let bookMatches = []
  if (booksResult.status === 'fulfilled') {
    const booksData = booksResult.value.data
    bookMatches = (booksData.books?.data ?? booksData.books ?? []).slice(0, 5).map((b) => ({
      key: `book-${b.id}`,
      label: b.title,
      type: 'book',
      raw: b,
    }))
  } else {
    console.warn('SmartSearchInput: falha ao pesquisar livros', booksResult.reason)
  }

  let schoolMatches = []
  if (schoolsResult.status === 'fulfilled') {
    schoolMatches = (schoolsResult.value.data.schools ?? []).slice(0, 5).map((s) => ({
      key: `school-${s.id}`,
      label: s.name,
      type: 'school',
      raw: s,
    }))
  } else {
    console.warn('SmartSearchInput: falha ao pesquisar escolas', schoolsResult.reason)
  }

  items.value = [...bookMatches, ...schoolMatches]
  loading.value = false
}

function onSelect(item) {
  if (!item) return

  if (item.type === 'book') {
    // Title: goes directly to the book, skipping the wizard.
    router.push({ name: 'book-detail', params: { id: item.raw.id } })
  } else if (item.type === 'school') {
    const school = item.raw
    searchStore.setSelection('district', school.district)
    searchStore.setSelection('city', school.city)
    searchStore.setSelection('school', { id: school.id, name: school.name })
    prefillMessage.value = `Escola pré-preenchida: ${school.name}.`
    jumpAfterLocationPrefill()
  }

  selected.value = null
  query.value = ''
  items.value = []
}

// Year and teaching_cycle are always required first, regardless of prefill.
// Only after that does the jump happen. This is only used for 'school',
// so a school is always guaranteed to be selected.

function jumpAfterLocationPrefill() {
  if (!searchStore.selections.year) {
    prefillMessage.value += ' Indica agora o ano de escolaridade para continuar.'
    searchStore.goToStep('year')
  } else if (!searchStore.selections.teachingCycle) {
    prefillMessage.value += ' Indica agora o tipo de ensino para continuar.'
    searchStore.goToStep('teachingCycle')
  } else {
    // School selected + year/cycle set: jump straight to subject.
    // Course (if applicable) is skipped here and can be chosen later if needed.).
    searchStore.goToStep('discipline')
  }
}
</script>
