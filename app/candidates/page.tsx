"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users } from "lucide-react"
import Link from "next/link"
import { CandidatesList } from "@/components/candidates-list"
import { CandidatesKanban } from "@/components/candidates-kanban"
import type { Candidate, Job } from "@/lib/types"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [jobFilter, setJobFilter] = useState<string>("all")
  const [view, setView] = useState<"list" | "kanban">("list")

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all candidates
      const candidatesResponse = await fetch("/api/candidates?page=1&pageSize=1000")
      const candidatesData = await candidatesResponse.json()
      setCandidates(candidatesData.data)

      // Fetch all jobs for filtering
      const jobsResponse = await fetch("/api/jobs?page=1&pageSize=100")
      const jobsData = await jobsResponse.json()
      setJobs(jobsData.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStage = stageFilter === "all" || candidate.stage === stageFilter
      const matchesJob = jobFilter === "all" || candidate.jobId === jobFilter
      return matchesSearch && matchesStage && matchesJob
    })
  }, [candidates, searchTerm, stageFilter, jobFilter])

  const handleCandidateUpdate = async (candidateId: string, updates: Partial<Candidate>) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedCandidate = await response.json()
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, ...updatedCandidate.data } : c)))
      }
    } catch (error) {
      console.error("Failed to update candidate:", error)
    }
  }

  const stageCounts = useMemo(() => {
    const counts = {
      applied: 0,
      screen: 0,
      tech: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    }
    filteredCandidates.forEach((candidate) => {
      counts[candidate.stage]++
    })
    return counts
  }, [filteredCandidates])

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Candidates</h2>
            <p className="text-muted-foreground">Manage candidates through your hiring pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              {filteredCandidates.length} candidates
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="applied">Applied ({stageCounts.applied})</SelectItem>
                  <SelectItem value="screen">Screen ({stageCounts.screen})</SelectItem>
                  <SelectItem value="tech">Tech ({stageCounts.tech})</SelectItem>
                  <SelectItem value="offer">Offer ({stageCounts.offer})</SelectItem>
                  <SelectItem value="hired">Hired ({stageCounts.hired})</SelectItem>
                  <SelectItem value="rejected">Rejected ({stageCounts.rejected})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Filter by job" />
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

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(value) => setView(value as "list" | "kanban")} className="mb-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <CandidatesList
              candidates={filteredCandidates}
              jobs={jobs}
              loading={loading}
              onCandidateUpdate={handleCandidateUpdate}
            />
          </TabsContent>

          <TabsContent value="kanban" className="mt-6">
            <CandidatesKanban
              candidates={filteredCandidates}
              jobs={jobs}
              loading={loading}
              onCandidateUpdate={handleCandidateUpdate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
