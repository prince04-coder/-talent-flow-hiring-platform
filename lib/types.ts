export interface Job {
  id: string
  title: string
  slug: string
  status: "active" | "archived"
  tags: string[]
  order: number
  description?: string
  requirements?: string[]
  location?: string
  type?: "full-time" | "part-time" | "contract" | "internship"
  createdAt: Date
  updatedAt: Date
}

export interface Candidate {
  id: string
  name: string
  email: string
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
  jobId: string
  phone?: string
  resume?: string
  notes: CandidateNote[]
  createdAt: Date
  updatedAt: Date
}

export interface CandidateNote {
  id: string
  content: string
  author: string
  mentions: string[]
  createdAt: Date
}

export interface CandidateTimelineEvent {
  id: string
  candidateId: string
  type: "stage_change" | "note_added" | "assessment_completed"
  description: string
  fromStage?: string
  toStage?: string
  createdAt: Date
  author: string
}

export interface Assessment {
  id: string
  jobId: string
  title: string
  description?: string
  sections: AssessmentSection[]
  createdAt: Date
  updatedAt: Date
}

export interface AssessmentSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  order: number
}

export interface Question {
  id: string
  type: "single-choice" | "multi-choice" | "short-text" | "long-text" | "numeric" | "file-upload"
  title: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditionalLogic?: {
    dependsOn: string
    showWhen: string | string[]
  }
  order: number
}

export interface AssessmentResponse {
  id: string
  assessmentId: string
  candidateId: string
  responses: Record<string, any>
  completedAt?: Date
  createdAt: Date
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
