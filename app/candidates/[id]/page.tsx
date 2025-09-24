"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Mail, Phone, Calendar, MessageSquare, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Candidate, Job, CandidateTimelineEvent } from "@/lib/types"

const stageColors = {
  applied: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  screen: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  tech: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  offer: "bg-green-500/10 text-green-500 border-green-500/20",
  hired: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
}

const stages = [
  { value: "applied", label: "Applied" },
  { value: "screen", label: "Screen" },
  { value: "tech", label: "Tech Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

export default function CandidateDetailPage() {
  const params = useParams()
  const candidateId = params.id as string
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [timeline, setTimeline] = useState<CandidateTimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidate
        const candidatesResponse = await fetch("/api/candidates?page=1&pageSize=1000")
        const candidatesData = await candidatesResponse.json()
        const foundCandidate = candidatesData.data.find((c: Candidate) => c.id === candidateId)
        setCandidate(foundCandidate || null)

        if (foundCandidate) {
          // Fetch job details
          const jobsResponse = await fetch("/api/jobs?page=1&pageSize=100")
          const jobsData = await jobsResponse.json()
          const foundJob = jobsData.data.find((j: Job) => j.id === foundCandidate.jobId)
          setJob(foundJob || null)

          // Fetch timeline
          const timelineResponse = await fetch(`/api/candidates/${candidateId}/timeline`)
          const timelineData = await timelineResponse.json()
          setTimeline(timelineData.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [candidateId])

  const handleStageChange = async (newStage: string) => {
    if (!candidate) return

    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      })

      if (response.ok) {
        const updatedCandidate = await response.json()
        setCandidate({ ...candidate, ...updatedCandidate.data })

        // Refresh timeline
        const timelineResponse = await fetch(`/api/candidates/${candidateId}/timeline`)
        const timelineData = await timelineResponse.json()
        setTimeline(timelineData.data || [])
      }
    } catch (error) {
      console.error("Failed to update candidate:", error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !candidate) return

    // In a real app, this would be an API call
    const note = {
      id: `note_${Date.now()}`,
      content: newNote,
      author: "Current User",
      mentions: [],
      createdAt: new Date(),
    }

    setCandidate({
      ...candidate,
      notes: [...candidate.notes, note],
    })

    setNewNote("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Candidate Not Found</h1>
            <p className="text-muted-foreground mb-8">The candidate you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/candidates">Back to Candidates</Link>
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
              <Link href="/candidates" className="text-primary font-medium">
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
            <Link href="/candidates" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Candidates
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{candidate.name}</h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Badge className={stageColors[candidate.stage]}>{candidate.stage}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Applied Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job ? (
                  <div>
                    <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-primary hover:underline">
                      {job.title}
                    </Link>
                    <p className="text-muted-foreground mt-1">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Job information not available</p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < timeline.length - 1 && <div className="w-px h-8 bg-border mt-2"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-foreground">{event.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{event.author}</span>
                          <span>•</span>
                          <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note about this candidate... Use @mentions to reference team members"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      Add Note
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {candidate.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{note.author}</span>
                          <span>•</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stage Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Select value={candidate.stage} onValueChange={handleStageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Move the candidate through different stages of the hiring process
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Applied</label>
                  <p className="text-sm">{new Date(candidate.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">{new Date(candidate.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Candidate ID</label>
                  <p className="text-sm font-mono text-xs bg-muted px-2 py-1 rounded">{candidate.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
