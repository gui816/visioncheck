export type Eye = 'right' | 'left'

export interface EyeAssessment {
  eye: Eye
  visualAcuity?: number
  completed: boolean
}

export interface Assessment {
  id: string
  createdAt: string
  rightEye: EyeAssessment
  leftEye: EyeAssessment
}

export function isAssessmentComplete(assessment: Assessment): boolean {
  return assessment.rightEye.completed && assessment.leftEye.completed
}
