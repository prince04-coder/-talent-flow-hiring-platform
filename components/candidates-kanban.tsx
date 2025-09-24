"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { Candidate, Job } from "@/lib/types"

interface CandidatesKanbanProps {
  candidates: Candidate[]
  jobs: Job[]
  loading: boolean
  onCandidateUpdate: (candidateId: string, updates: Partial<Candidate>) => void
}

const stages = [
  { id: "applied", title: "Applied", color: "border-blue-500" },
  { id: "screen", title: "Screen", color: "border-yellow-500" },
  { id: "tech", title: "Tech Interview", color: "border-purple-500" },
  { id: "offer", title: "Offer", color: "border-green-500" },
  { id: "hired", title: "Hired", color: "border-emerald-500" },
  { id: "rejected", title: "Rejected", color: "border-red-500" },
]

export function CandidatesKanban({ candidates, jobs, loading, onCandidateUpdate }: CandidatesKanbanProps) {
  const jobsMap = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc[job.id] = job
        return acc
      },
      {} as Record<string, Job>,
    )
  }, [jobs])

  const candidatesByStage = useMemo(() => {
    const grouped = stages.reduce(
      (acc, stage) => {
        acc[stage.id] = []
        return acc
      },
      {} as Record<string, Candidate[]>,
    )

    candidates.forEach((candidate) => {
      if (grouped[candidate.stage]) {
        grouped[candidate.stage].push(candidate)
      }
    })

    return grouped
  }, [candidates])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) return

    const candidateId = draggableId
    const newStage = destination.droppableId

    onCandidateUpdate(candidateId, { stage: newStage as any })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className="h-96">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.id} className={`border-t-4 ${stage.color}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{stage.title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {candidatesByStage[stage.id]?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[400px] space-y-3 ${snapshot.isDraggingOver ? "bg-accent/50 rounded-lg" : ""}`}
                  >
                    {candidatesByStage[stage.id]?.map((candidate, index) => {
                      const job = jobsMap[candidate.jobId]
                      return (
                        <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary font-semibold text-xs">
                                        {candidate.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-medium text-sm text-foreground truncate">{candidate.name}</h4>
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{candidate.email}</span>
                                    </div>
                                    {candidate.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{candidate.phone}</span>
                                      </div>
                                    )}
                                    <div className="text-xs">
                                      <span className="text-foreground font-medium">{job?.title || "Unknown Job"}</span>
                                    </div>
                                  </div>

                                  <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                                    <Link href={`/candidates/${candidate.id}`} className="gap-2">
                                      <Eye className="h-3 w-3" />
                                      View Profile
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </div>
    </DragDropContext>
  )
}
