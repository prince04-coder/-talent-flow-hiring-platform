import Dexie, { type Table } from "dexie"
import type { Job, Candidate, Assessment, CandidateTimelineEvent, AssessmentResponse } from "./types"

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>
  candidates!: Table<Candidate>
  assessments!: Table<Assessment>
  timelineEvents!: Table<CandidateTimelineEvent>
  assessmentResponses!: Table<AssessmentResponse>

  constructor() {
    super("TalentFlowDB")
    this.version(1).stores({
      jobs: "id, title, status, order, createdAt",
      candidates: "id, name, email, stage, jobId, createdAt",
      assessments: "id, jobId, createdAt",
      timelineEvents: "id, candidateId, type, createdAt",
      assessmentResponses: "id, assessmentId, candidateId, createdAt",
    })
  }
}

export const db = new TalentFlowDB()

export async function initializeDatabase(): Promise<void> {
  try {
    console.log("[v0] Checking database initialization...")

    const jobCount = await db.jobs.count()
    const candidateCount = await db.candidates.count()
    const assessmentCount = await db.assessments.count()

    if (jobCount === 0 || candidateCount === 0 || assessmentCount === 0) {
      console.log("[v0] Database empty, initializing with seed data...")

      const { generateSeedData } = await import("./seed-data")
      const { jobs, candidates, assessments, timelineEvents } = generateSeedData()

      // Clear existing data to ensure clean state
      await db.transaction("rw", [db.jobs, db.candidates, db.assessments, db.timelineEvents], async () => {
        await db.jobs.clear()
        await db.candidates.clear()
        await db.assessments.clear()
        await db.timelineEvents.clear()

        // Bulk insert with progress logging
        console.log("[v0] Inserting jobs...")
        await db.jobs.bulkAdd(jobs)

        console.log("[v0] Inserting candidates...")
        await db.candidates.bulkAdd(candidates)

        console.log("[v0] Inserting assessments...")
        await db.assessments.bulkAdd(assessments)

        console.log("[v0] Inserting timeline events...")
        await db.timelineEvents.bulkAdd(timelineEvents)
      })

      console.log(
        `[v0] Database initialized successfully with ${jobs.length} jobs, ${candidates.length} candidates, ${assessments.length} assessments, and ${timelineEvents.length} timeline events`,
      )
    } else {
      console.log(
        `[v0] Database already initialized with ${jobCount} jobs, ${candidateCount} candidates, ${assessmentCount} assessments`,
      )
    }
  } catch (error) {
    console.error("[v0] Failed to initialize database:", error)
    throw new Error("Database initialization failed")
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await db.transaction(
      "rw",
      [db.jobs, db.candidates, db.assessments, db.timelineEvents, db.assessmentResponses],
      async () => {
        await db.jobs.clear()
        await db.candidates.clear()
        await db.assessments.clear()
        await db.timelineEvents.clear()
        await db.assessmentResponses.clear()
      },
    )
    console.log("[v0] All data cleared successfully")
  } catch (error) {
    console.error("[v0] Failed to clear data:", error)
    throw error
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    await clearAllData()
    await initializeDatabase()
    console.log("[v0] Database reset successfully")
  } catch (error) {
    console.error("[v0] Failed to reset database:", error)
    throw error
  }
}

export async function getDatabaseStats() {
  try {
    const [jobCount, candidateCount, assessmentCount, timelineEventCount, responseCount] = await Promise.all([
      db.jobs.count(),
      db.candidates.count(),
      db.assessments.count(),
      db.timelineEvents.count(),
      db.assessmentResponses.count(),
    ])

    return {
      jobs: jobCount,
      candidates: candidateCount,
      assessments: assessmentCount,
      timelineEvents: timelineEventCount,
      assessmentResponses: responseCount,
    }
  } catch (error) {
    console.error("[v0] Failed to get database stats:", error)
    return {
      jobs: 0,
      candidates: 0,
      assessments: 0,
      timelineEvents: 0,
      assessmentResponses: 0,
    }
  }
}

export async function exportData() {
  try {
    const [jobs, candidates, assessments, timelineEvents, assessmentResponses] = await Promise.all([
      db.jobs.toArray(),
      db.candidates.toArray(),
      db.assessments.toArray(),
      db.timelineEvents.toArray(),
      db.assessmentResponses.toArray(),
    ])

    return {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        jobs,
        candidates,
        assessments,
        timelineEvents,
        assessmentResponses,
      },
    }
  } catch (error) {
    console.error("[v0] Failed to export data:", error)
    throw error
  }
}

export async function importData(exportedData: any): Promise<void> {
  try {
    if (!exportedData.data) {
      throw new Error("Invalid export data format")
    }

    const { jobs, candidates, assessments, timelineEvents, assessmentResponses } = exportedData.data

    await db.transaction(
      "rw",
      [db.jobs, db.candidates, db.assessments, db.timelineEvents, db.assessmentResponses],
      async () => {
        // Clear existing data
        await db.jobs.clear()
        await db.candidates.clear()
        await db.assessments.clear()
        await db.timelineEvents.clear()
        await db.assessmentResponses.clear()

        // Import new data
        if (jobs?.length) await db.jobs.bulkAdd(jobs)
        if (candidates?.length) await db.candidates.bulkAdd(candidates)
        if (assessments?.length) await db.assessments.bulkAdd(assessments)
        if (timelineEvents?.length) await db.timelineEvents.bulkAdd(timelineEvents)
        if (assessmentResponses?.length) await db.assessmentResponses.bulkAdd(assessmentResponses)
      },
    )

    console.log("[v0] Data imported successfully")
  } catch (error) {
    console.error("[v0] Failed to import data:", error)
    throw error
  }
}
