import { setupWorker, rest } from "msw"
import type { Job } from "./types"
import { generateSeedData } from "./seed-data"

// Initialize seed data
const { jobs, candidates, assessments, timelineEvents } = generateSeedData()

// Simulate network latency and errors
const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 200))

const simulateError = () => Math.random() < 0.08 // 8% error rate

const handlers = [
  // Jobs endpoints
  rest.get("/api/jobs", async (req, res, ctx) => {
    await simulateLatency()

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const status = url.searchParams.get("status") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "10")
    const sort = url.searchParams.get("sort") || "order"

    const filteredJobs = jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = !status || job.status === status
      return matchesSearch && matchesStatus
    })

    // Sort jobs
    filteredJobs.sort((a, b) => {
      if (sort === "order") return a.order - b.order
      if (sort === "title") return a.title.localeCompare(b.title)
      if (sort === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return 0
    })

    const total = filteredJobs.length
    const startIndex = (page - 1) * pageSize
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + pageSize)

    return res(
      ctx.json({
        data: paginatedJobs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }),
    )
  }),

  rest.post("/api/jobs", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Server error" }))

    const jobData = await req.json()
    const newJob: Job = {
      id: `job_${Date.now()}`,
      ...jobData,
      order: jobs.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    jobs.push(newJob)
    return res(ctx.json({ data: newJob, success: true }))
  }),

  rest.patch("/api/jobs/:id", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Server error" }))

    const { id } = req.params
    const updates = await req.json()
    const jobIndex = jobs.findIndex((job) => job.id === id)

    if (jobIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: "Job not found" }))
    }

    jobs[jobIndex] = { ...jobs[jobIndex], ...updates, updatedAt: new Date() }
    return res(ctx.json({ data: jobs[jobIndex], success: true }))
  }),

  rest.patch("/api/jobs/:id/reorder", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Reorder failed" }))

    const { id } = req.params
    const { fromOrder, toOrder } = await req.json()

    const job = jobs.find((j) => j.id === id)
    if (!job) return res(ctx.status(404), ctx.json({ error: "Job not found" }))

    // Update order for affected jobs
    jobs.forEach((j) => {
      if (j.id === id) {
        j.order = toOrder
      } else if (fromOrder < toOrder && j.order > fromOrder && j.order <= toOrder) {
        j.order -= 1
      } else if (fromOrder > toOrder && j.order >= toOrder && j.order < fromOrder) {
        j.order += 1
      }
    })

    return res(ctx.json({ success: true }))
  }),

  // Candidates endpoints
  rest.get("/api/candidates", async (req, res, ctx) => {
    await simulateLatency()

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const stage = url.searchParams.get("stage") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "50")

    const filteredCandidates = candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      const matchesStage = !stage || candidate.stage === stage
      return matchesSearch && matchesStage
    })

    const total = filteredCandidates.length
    const startIndex = (page - 1) * pageSize
    const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + pageSize)

    return res(
      ctx.json({
        data: paginatedCandidates,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }),
    )
  }),

  rest.patch("/api/candidates/:id", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Server error" }))

    const { id } = req.params
    const updates = await req.json()
    const candidateIndex = candidates.findIndex((c) => c.id === id)

    if (candidateIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: "Candidate not found" }))
    }

    const oldStage = candidates[candidateIndex].stage
    candidates[candidateIndex] = { ...candidates[candidateIndex], ...updates, updatedAt: new Date() }

    // Add timeline event for stage changes
    if (updates.stage && updates.stage !== oldStage) {
      timelineEvents.push({
        id: `event_${Date.now()}`,
        candidateId: id as string,
        type: "stage_change",
        description: `Stage changed from ${oldStage} to ${updates.stage}`,
        fromStage: oldStage,
        toStage: updates.stage,
        createdAt: new Date(),
        author: "System",
      })
    }

    return res(ctx.json({ data: candidates[candidateIndex], success: true }))
  }),

  rest.get("/api/candidates/:id/timeline", async (req, res, ctx) => {
    await simulateLatency()

    const { id } = req.params
    const candidateEvents = timelineEvents
      .filter((event) => event.candidateId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return res(ctx.json({ data: candidateEvents, success: true }))
  }),

  // Assessments endpoints
  rest.get("/api/assessments/:jobId", async (req, res, ctx) => {
    await simulateLatency()

    const { jobId } = req.params
    const assessment = assessments.find((a) => a.jobId === jobId)

    return res(ctx.json({ data: assessment || null, success: true }))
  }),

  rest.put("/api/assessments/:jobId", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Server error" }))

    const { jobId } = req.params
    const assessmentData = await req.json()

    const existingIndex = assessments.findIndex((a) => a.jobId === jobId)
    const assessment = {
      id: existingIndex >= 0 ? assessments[existingIndex].id : `assessment_${Date.now()}`,
      jobId: jobId as string,
      ...assessmentData,
      createdAt: existingIndex >= 0 ? assessments[existingIndex].createdAt : new Date(),
      updatedAt: new Date(),
    }

    if (existingIndex >= 0) {
      assessments[existingIndex] = assessment
    } else {
      assessments.push(assessment)
    }

    return res(ctx.json({ data: assessment, success: true }))
  }),

  rest.post("/api/assessments/:jobId/submit", async (req, res, ctx) => {
    await simulateLatency()
    if (simulateError()) return res(ctx.status(500), ctx.json({ error: "Server error" }))

    const responseData = await req.json()
    // In a real app, this would save to a database
    // For now, we'll just simulate success
    return res(ctx.json({ success: true }))
  }),
]

export const worker = setupWorker(...handlers)
