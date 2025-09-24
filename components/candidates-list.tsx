"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"
import type { Candidate, Job } from "@/lib/types"

interface CandidatesListProps {
  candidates: Candidate[]
  jobs: Job[]
  loading: boolean
  onCandidateUpdate: (candidateId: string, updates: Partial<Candidate>) => void
}

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
  { value: "tech", label: "Tech" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
]

export function CandidatesList({ candidates, jobs, loading, onCandidateUpdate }: CandidatesListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const jobsMap = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc[job.id] = job
        return acc
      },
      {} as Record<string, Job>,
    )
  }, [jobs])

  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 10,
  })

  const handleStageChange = (candidateId: string, newStage: string) => {
    onCandidateUpdate(candidateId, { stage: newStage as any })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const candidate = candidates[virtualItem.index]
          const job = jobsMap[candidate.jobId]

          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Card className="mx-1 my-2">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{candidate.name}</h3>
                        <Badge className={stageColors[candidate.stage]}>{candidate.stage}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Applied to: <span className="text-foreground">{job?.title || "Unknown Job"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/candidates/${candidate.id}`} className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {stages.map((stage) => (
                            <DropdownMenuItem
                              key={stage.value}
                              onClick={() => handleStageChange(candidate.id, stage.value)}
                              disabled={candidate.stage === stage.value}
                            >
                              Move to {stage.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
