"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, Edit, Archive, ArchiveRestore, GripVertical } from "lucide-react"
import Link from "next/link"
import { JobForm } from "@/components/job-form"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { Job, PaginatedResponse } from "@/lib/types"

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [dragOptimisticUpdate, setDragOptimisticUpdate] = useState<Job[] | null>(null)

  const pageSize = 10

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sort: "order",
      })

      const response = await fetch(`/api/jobs?${params}`)
      const data: PaginatedResponse<Job> = await response.json()

      setJobs(data.data)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [searchTerm, statusFilter, currentPage])

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        setIsCreateModalOpen(false)
        fetchJobs()
      }
    } catch (error) {
      console.error("Failed to create job:", error)
    }
  }

  const handleUpdateJob = async (jobData: Partial<Job>) => {
    if (!editingJob) return

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        setEditingJob(null)
        fetchJobs()
      }
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const handleArchiveToggle = async (job: Job) => {
    try {
      const newStatus = job.status === "active" ? "archived" : "active"
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error("Failed to update job status:", error)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) {
      setDragOptimisticUpdate(null)
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) {
      setDragOptimisticUpdate(null)
      return
    }

    const draggedJob = jobs[sourceIndex]
    const fromOrder = draggedJob.order
    const toOrder = jobs[destinationIndex].order

    try {
      const response = await fetch(`/api/jobs/${draggedJob.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOrder, toOrder }),
      })

      if (response.ok) {
        fetchJobs()
      } else {
        // Rollback optimistic update on failure
        setDragOptimisticUpdate(null)
        alert("Failed to reorder jobs. Please try again.")
      }
    } catch (error) {
      setDragOptimisticUpdate(null)
      alert("Failed to reorder jobs. Please try again.")
    }
  }

  const handleDragStart = () => {
    // Create optimistic update
    const reorderedJobs = [...jobs]
    setDragOptimisticUpdate(reorderedJobs)
  }

  const displayJobs = dragOptimisticUpdate || jobs

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Jobs</h2>
            <p className="text-muted-foreground">Manage job postings with drag-and-drop reordering</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>Add a new job posting to your hiring pipeline</DialogDescription>
              </DialogHeader>
              <JobForm onSubmit={handleCreateJob} onCancel={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable droppableId="jobs">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {displayJobs.map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
                          }`}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <Link
                                      href={`/jobs/${job.id}`}
                                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                                    >
                                      {job.title}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={job.status === "active" ? "default" : "secondary"}>
                                      {job.status}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingJob(job)}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleArchiveToggle(job)}>
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
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {job.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{job.location}</span>
                                  <span>{job.type}</span>
                                  <span>Order: {job.order}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Edit Job Modal */}
        <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update job posting details</DialogDescription>
            </DialogHeader>
            {editingJob && (
              <JobForm initialData={editingJob} onSubmit={handleUpdateJob} onCancel={() => setEditingJob(null)} />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
