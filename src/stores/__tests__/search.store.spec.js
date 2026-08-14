import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '@/stores/search.store.js'

const BASE_STEPS = [
  'year',
  'teachingCycle',
  'district',
  'city',
  'school',
  'course',
  'discipline',
  'confirmation',
]

describe('search.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts on the first step with the full base flow active', () => {
    const store = useSearchStore()

    expect(store.currentStep).toBe(0)
    expect(store.activeSteps).toEqual(BASE_STEPS)
    expect(store.currentStepName).toBe('year')
    expect(store.isLastStep).toBe(false)
  })

  it('setSelection() writes into the selections object by key', () => {
    const store = useSearchStore()

    store.setSelection('district', 'Porto')
    store.setSelection('year', 7)

    expect(store.selections.district).toBe('Porto')
    expect(store.selections.year).toBe(7)
  })

  describe('nextStep() / previousStep()', () => {
    it('nextStep() advances currentStep by one', () => {
      const store = useSearchStore()

      store.nextStep()

      expect(store.currentStep).toBe(1)
      expect(store.currentStepName).toBe('teachingCycle')
    })

    it('nextStep() does not advance past the last step', () => {
      const store = useSearchStore()
      store.currentStep = store.activeSteps.length - 1

      store.nextStep()

      expect(store.currentStep).toBe(store.activeSteps.length - 1)
      expect(store.isLastStep).toBe(true)
    })

    it('previousStep() moves currentStep back by one', () => {
      const store = useSearchStore()
      store.currentStep = 2

      store.previousStep()

      expect(store.currentStep).toBe(1)
    })

    it('previousStep() does not go below step 0', () => {
      const store = useSearchStore()

      store.previousStep()

      expect(store.currentStep).toBe(0)
    })
  })

  describe('goToStep()', () => {
    it('jumps to a named step that exists in activeSteps', () => {
      const store = useSearchStore()

      store.goToStep('school')

      expect(store.currentStepName).toBe('school')
    })

    it('is a no-op when the step name is not in activeSteps', () => {
      const store = useSearchStore()
      store.removeStep('course')
      const before = store.currentStep

      store.goToStep('course')

      expect(store.currentStep).toBe(before)
    })
  })

  describe('removeStep() / restoreStep()', () => {
    it('removeStep() drops the step from activeSteps', () => {
      const store = useSearchStore()

      store.removeStep('course')

      expect(store.activeSteps).not.toContain('course')
      expect(store.activeSteps.length).toBe(BASE_STEPS.length - 1)
    })

    it('restoreStep() re-inserts a removed step at its original position', () => {
      const store = useSearchStore()
      store.removeStep('course')

      store.restoreStep('course')

      expect(store.activeSteps).toEqual(BASE_STEPS)
    })

    it('restoreStep() is a no-op when the step is already active', () => {
      const store = useSearchStore()

      store.restoreStep('course')

      expect(store.activeSteps).toEqual(BASE_STEPS)
    })

    it('restoreStep() inserts relative to the other currently-active steps, not the removed ones', () => {
      const store = useSearchStore()
      // Remove two steps so the insert position has to be recomputed against
      // what's actually left in activeSteps, not BASE_STEPS.
      store.removeStep('city')
      store.removeStep('course')

      store.restoreStep('course')

      expect(store.activeSteps).toEqual([
        'year',
        'teachingCycle',
        'district',
        'school',
        'course',
        'discipline',
        'confirmation',
      ])
    })
  })

  describe('isComplete', () => {
    it('is false while required selections are missing', () => {
      const store = useSearchStore()

      expect(store.isComplete).toBe(false)
    })

    it('ignores the course step, since it is optional even when active', () => {
      const store = useSearchStore()

      store.setSelection('year', 7)
      store.setSelection('teachingCycle', '3-ciclo')
      store.setSelection('district', 'Porto')
      store.setSelection('city', 'Porto')
      store.setSelection('school', { id: 1, name: 'Escola X' })
      store.setSelection('discipline', 'Matemática')
      // course intentionally left null

      expect(store.isComplete).toBe(true)
    })

    it('is false when school was never selected', () => {
      const store = useSearchStore()

      store.setSelection('year', 7)
      store.setSelection('teachingCycle', '3-ciclo')
      store.setSelection('district', 'Porto')
      store.setSelection('city', 'Porto')
      store.setSelection('discipline', 'Matemática')

      expect(store.isComplete).toBe(false)
    })

    it('ignores steps that were removed from the active flow', () => {
      const store = useSearchStore()
      store.removeStep('city')

      store.setSelection('year', 7)
      store.setSelection('teachingCycle', '3-ciclo')
      store.setSelection('district', 'Porto')
      store.setSelection('school', { id: 1, name: 'Escola X' })
      store.setSelection('discipline', 'Matemática')
      // city left null, but the step was removed so it should not block completion

      expect(store.isComplete).toBe(true)
    })
  })

  describe('reset()', () => {
    it('restores currentStep, activeSteps and selections to their initial state', () => {
      const store = useSearchStore()
      store.setSelection('district', 'Porto')
      store.removeStep('course')
      store.nextStep()
      store.error = 'algum erro'

      store.reset()

      expect(store.currentStep).toBe(0)
      expect(store.activeSteps).toEqual(BASE_STEPS)
      expect(store.selections).toEqual({
        district: null,
        city: null,
        school: null,
        year: null,
        teachingCycle: null,
        course: null,
        discipline: null,
      })
      expect(store.error).toBe(null)
    })
  })
})
