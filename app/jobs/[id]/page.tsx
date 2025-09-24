"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Archive, ArchiveRestore, Users, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Job } from "@/lib/types"

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs?search=&status=&page=1&pageSize=100`)
        const data = await response.json()
        const foundJob = data.data.find((j: Job) => j.id === jobId)
        setJob(foundJob || null)
      } catch (error) {
        console.error("Failed to fetch job:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <Card>
              <CardContent className="pt-6">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/jobs">Back to Jobs</Link>
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
              <Link href="/jobs" className="text-primary font-medium">
                Jobs
              </Link>
              <Link href="/candidates" className="text-muted-foreground hover:text-foreground transition-colors">
                Candidates
              </Link>
              <Link href="/assessments" className="text-muted-foreground hover:text-foreground transition-colors">
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
            <Link href="/jobs" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{job.title}</h2>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span>{job.location}</span>
                <span>{job.type}</span>
                <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                {job.status === "active" ? (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements?.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/candidates?job=${job.id}`} className="gap-2">
                    <Users className="h-4 w-4" />
                    View Candidates
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/assessments?job=${job.id}`} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Manage Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{new Date(job.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order</label>
                  <p className="text-sm">{job.order}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-mono text-xs bg-muted px-2 py-1 rounded">{job.slug}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
