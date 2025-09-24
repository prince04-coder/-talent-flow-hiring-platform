"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AssessmentPreview } from "@/components/assessment-preview"
import type { Assessment } from "@/lib/types"

export default function AssessmentPreviewPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/assessments/${jobId}`)
        const data = await response.json()
        setAssessment(data.data)
      } catch (error) {
        console.error("Failed to fetch assessment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Assessment Not Found</h1>
            <p className="text-muted-foreground mb-8">The assessment you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/assessments">Back to Assessments</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">TF</span>
                </div>
                <h1 className="text-xl font-semibold text-foreground">TalentFlow</h1>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                Jobs
              </Link>
              <Link href="/candidates" className="text-muted-foreground hover:text-foreground transition-colors">
                Candidates
              </Link>
              <Link href="/assessments" className="text-primary font-medium">
                Assessments
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/assessments" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Assessments
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Assessment Preview</h2>
            <p className="text-muted-foreground">Preview how candidates will see this assessment</p>
          </div>
        </div>

        <AssessmentPreview assessment={assessment} />
      </main>
    </div>
  )
}
