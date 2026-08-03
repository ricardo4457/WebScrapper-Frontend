import teachingCycles from '@/data/teaching-cycles.json'

/**
 * Devolve o ciclo (objeto { anos, tipos_ensino }) que contém o ano indicado.

 */
export function getCycleByYear(ano) {
  return teachingCycles.find((cycle) => cycle.anos.includes(ano)) ?? null
}

/**
 * Devolve os tipos de ensino disponíveis para um dado ano.
 */
export function getTeachingTypesByYear(ano) {
  return getCycleByYear(ano)?.tipos_ensino ?? []
}

/**
 * Indica se o seletor de tipo de ensino deve ser mostrado —
 * só quando há mais de uma opção para o ano escolhido
 * (aplica-se a 7º-9º Ano e 10º-12º Ano).

 */
export function shouldShowTeachingTypeStep(ano) {
  return getTeachingTypesByYear(ano).length > 1
}

/**
 * Lista plana de todos os anos disponíveis, na ordem do JSON.
 * Útil para popular o DistrictStep/SchoolStep sem duplicar lógica.
  */
export function getAllYears() {
  return teachingCycles.flatMap((cycle) => cycle.anos)
}
