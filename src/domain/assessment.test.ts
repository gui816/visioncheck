import { describe, expect, it } from 'vitest'
import { isAssessmentComplete, type Assessment } from './assessment'

const sample: Assessment = {
  id: 'test-1',
  createdAt: '2026-11-14T19:20:00Z',
  rightEye: { eye: 'right', completed: true },
  leftEye: { eye: 'left', completed: true },
}

describe('isAssessmentComplete', () => {
  it('returns true when both eyes are complete', () => {
    expect(isAssessmentComplete(sample)).toBe(true)
  })

  it('returns false when one eye is incomplete', () => {
    expect(isAssessmentComplete({ ...sample, leftEye: { eye: 'left', completed: false } })).toBe(false)
  })
})
