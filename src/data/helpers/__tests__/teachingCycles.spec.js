import { describe, it, expect } from 'vitest'
import {
  getYears,
  getTeachingTypesByYear,
  shouldShowTeachingTypeStep,
} from '@/data/helpers/teachingCycles.js'
import teachingCycles from '@/data/teaching-cycles.json'

describe('teachingCycles helper', () => {
  it('getYears() returns every distinct year from the static JSON, no duplicates', () => {
    const years = getYears()
    const expected = [...new Set(teachingCycles.flatMap((cycle) => cycle.anos))]

    expect(years).toEqual(expected)
    expect(new Set(years).size).toBe(years.length)
  })

  it('getTeachingTypesByYear() returns the teaching types for a known year', () => {
    const [firstCycle] = teachingCycles
    const [knownYear] = firstCycle.anos

    expect(getTeachingTypesByYear(knownYear)).toEqual(firstCycle.tipos_ensino)
  })

  it('getTeachingTypesByYear() returns [] for a year not present in any cycle', () => {
    expect(getTeachingTypesByYear(9999)).toEqual([])
  })

  it('shouldShowTeachingTypeStep() is true only when a year maps to more than one teaching type', () => {
    const multiTypeCycle = teachingCycles.find((c) => c.tipos_ensino.length > 1)
    const singleTypeCycle = teachingCycles.find((c) => c.tipos_ensino.length === 1)

    if (multiTypeCycle) {
      expect(shouldShowTeachingTypeStep(multiTypeCycle.anos[0])).toBe(true)
    }
    if (singleTypeCycle) {
      expect(shouldShowTeachingTypeStep(singleTypeCycle.anos[0])).toBe(false)
    }
  })

  it('shouldShowTeachingTypeStep() is false for an unknown year', () => {
    expect(shouldShowTeachingTypeStep(9999)).toBe(false)
  })
})
