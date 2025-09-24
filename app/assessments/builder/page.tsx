"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AssessmentBuilder } from "@/components/assessment-builder"
import { AssessmentPreview } from "@/components/assessment-preview"
import type { Job, Assessment } from "@/lib/types"

export default function AssessmentBuilderPage() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("job")

  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || "")
  const [assessment, setAssessment] = useState<Assessment>({
    id: "",
    jobId: "",
    title: "",
    description: "",
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch("/api/jobs?page=1&pageSize=100")
        const jobsData = await jobsResponse.json()
        const activeJobs = jobsData.data.filter((job: Job) => job.status === "active")
        setJobs(activeJobs)

        // If jobId is provided, fetch existing assessment
        if (jobId) {
          const assessmentResponse = await fetch(`/api/assessments/${jobId}`)
          const assessmentData = await assessmentResponse.json()

          if (assessmentData.data) {
            setAssessment(assessmentData.data)
          } else {
            // Create new assessment for this job
            const job = activeJobs.find((j: Job) => j.id === jobId)
            if (job) {
              setAssessment({
                id: "",
                jobId: job.id,
                title: `${job.title} Assessment`,
                description: `Technical assessment for ${job.title} position`,
                sections: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            }
          }
          setSelectedJobId(jobId)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId])

  const handleJobChange = (newJobId: string) => {
    setSelectedJobId(newJobId)
    const job = jobs.find((j) => j.id === newJobId)
    if (job) {
      setAssessment({
        ...assessment,
        jobId: newJobId,
        title: assessment.title || `${job.title} Assessment`,
        description: assessment.description || `Technical assessment for ${job.title} position`,
      })
    }
  }

  const handleSave = async () => {
    if (!selectedJobId || !assessment.title.trim()) {
      alert("Please select a job and provide a title")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/assessments/${selectedJobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assessment.title,
          description: assessment.description,
          sections: assessment.sections,
        }),
      })

      if (response.ok) {
        alert("Assessment saved successfully!")
      } else {
        alert("Failed to save assessment")
      }
    } catch (error) {
      console.error("Failed to save assessment:", error)
      alert("Failed to save assessment")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <Card>
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Assessment Builder</h2>
              <p className="text-muted-foreground">Create custom assessments with live preview</p>
            </div>
            <Button onClick={handleSave} disabled={saving || !selectedJobId} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Assessment"}
            </Button>
          </div>
        </div>

        {/* Assessment Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job">Job Position *</Label>
                <Select value={selectedJobId} onValueChange={handleJobChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={assessment.title}
                  onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                  placeholder="e.g. Frontend Developer Assessment"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={assessment.description}
                onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                placeholder="Describe what this assessment evaluates..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Builder Interface */}
        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <AssessmentBuilder assessment={assessment} onAssessmentChange={setAssessment} />
          </TabsContent>

          <TabsContent value="preview">
            <AssessmentPreview assessment={assessment} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
