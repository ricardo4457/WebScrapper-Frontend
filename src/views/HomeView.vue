<template>
  <PageContainer>
    <PageTitle text="Wook Scraper" />
    <p class="text-body-1">Pesquisa manuais escolares e consulta o histórico de preços.</p>
  </PageContainer>
</template>

<script setup>
import PageContainer from '@/components/layout/PageContainer.vue'
import PageTitle from '@/components/layout/PageTitle.vue'
import { schoolsService } from '@/services/schools.service.js'
import { locationsService } from '@/services/locations.service.js'
import { booksService } from '@/services/books.service.js'
import { onMounted } from 'vue'

// onMounted(async () => {
//   try {
//     // Sem parâmetros — válido, filtros opcionais
//     const schools = await schoolsService.list(
//       schoolsService.list({ district: 'Porto', city: 'Maia' }),
//     )
//     console.log('Schools (sem filtro):', schools.data)

//     // Com parâmetro
//     const districts = await locationsService.getLocations()
//     console.log('Districts:', districts.data)

//     // books/search PRECISA de parâmetros — testa com um termo real
//     try {
//       // Modo "q" — nunca dispara scraping, DB-only
//       const byTitle = await booksService.search({ q: 'matemática' })
//       console.log('Por título:', byTitle.data)

//       // Modo "city" — se não houver cache, deve devolver 202 + run_id
//       const byCity = await booksService.search({
//         city: 'Maia',
//         year: '7º Ano',
//       })
//       console.log('Por cidade:', byCity.status, byCity.data)

//       // Se vier 202, isto teria de estar dentro do catch (axios trata 4xx/5xx como erro,
//       // mas 202 é sucesso — vem aqui no try normalmente)
//     } catch (error) {
//       console.error('Erro:', error.response?.status, error.response?.data ?? error.message)
//     }
//   } catch (error) {
//     console.error('Erro:', error.response?.status, error.response?.data ?? error.message)
//   }
// })
</script>
