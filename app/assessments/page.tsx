"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Eye, Edit } from "lucide-react"
import Link from "next/link"
import type { Job, Assessment } from "@/lib/types"

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch("/api/jobs?page=1&pageSize=100")
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.data.filter((job: Job) => job.status === "active"))

        // Fetch assessments for each job
        const assessmentPromises = jobsData.data.map(async (job: Job) => {
          const response = await fetch(`/api/assessments/${job.id}`)
          const data = await response.json()
          return data.data
        })

        const assessmentResults = await Promise.all(assessmentPromises)
        const validAssessments = assessmentResults.filter(Boolean)
        setAssessments(validAssessments)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredAssessments =
    selectedJobId === "all" ? assessments : assessments.filter((a) => a.jobId === selectedJobId)

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    return job?.title || "Unknown Job"
  }

  const getQuestionCount = (assessment: Assessment) => {
    return assessment.sections.reduce((total, section) => total + section.questions.length, 0)
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Assessments</h2>
            <p className="text-muted-foreground">Create and manage job-specific assessments with live preview</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/assessments/builder">
              <Plus className="h-4 w-4" />
              Create Assessment
            </Link>
          </Button>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-foreground">Filter by Job:</label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Assessments Found</h3>
                <p className="text-muted-foreground mb-6">
                  {selectedJobId === "all"
                    ? "Create your first assessment to get started"
                    : "No assessments found for the selected job"}
                </p>
                <Button asChild>
                  <Link href="/assessments/builder">Create Assessment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{assessment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getJobTitle(assessment.jobId)}</p>
                    </div>
                    <Badge variant="secondary">{assessment.sections.length} sections</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{assessment.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getQuestionCount(assessment)} questions</span>
                      <span>Updated {new Date(assessment.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Link href={`/assessments/${assessment.jobId}/preview`} className="gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/assessments/builder?job=${assessment.jobId}`} className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Jobs without assessments */}
        {!loading && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground mb-4">Jobs Without Assessments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs
                .filter((job) => !assessments.some((a) => a.jobId === job.id))
                .map((job) => (
                  <Card key={job.id} className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h4 className="font-medium text-foreground mb-2">{job.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">No assessment created yet</p>
                        <Button asChild size="sm" variant="outline" className="bg-transparent">
                          <Link href={`/assessments/builder?job=${job.id}`}>Create Assessment</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
