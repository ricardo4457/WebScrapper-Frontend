import teachingCycles from '@/data/teaching-cycles.json'

// Small static array, plain find() is fine.
function findCycleByYear(ano) {
  return teachingCycles.find((cycle) => cycle.anos.includes(ano))
}

// Returns all available years from the static JSON.
export function getYears() {
  return [...new Set(teachingCycles.flatMap((cycle) => cycle.anos))]
}

// Returns [] if the year isn't mapped, instead of throwing.
export function getTeachingTypesByYear(ano) {
  const cycle = findCycleByYear(ano)
  return cycle?.tipos_ensino ?? []
}

// True only when the year has more than one possible teaching type.
export function shouldShowTeachingTypeStep(ano) {
  return getTeachingTypesByYear(ano).length > 1
}
