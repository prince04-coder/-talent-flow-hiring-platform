import type { Job, Candidate, Assessment, CandidateTimelineEvent } from "./types"

const jobTitles = [
  "Senior Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "Mobile Developer",
  "QA Engineer",
  "Technical Lead",
  "Software Architect",
  "Site Reliability Engineer",
  "Security Engineer",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Database Administrator",
  "UI Designer",
  "Scrum Master",
  "Business Analyst",
  "Technical Writer",
  "Sales Engineer",
  "Customer Success Manager",
  "Marketing Manager",
  "HR Specialist",
  "Finance Analyst",
]

const techTags = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "Jenkins",
  "Git",
  "Agile",
  "Scrum",
  "TDD",
  "Microservices",
  "REST API",
  "Machine Learning",
  "AI",
  "Blockchain",
  "Vue.js",
  "Angular",
  "Java",
  "C#",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
]

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Sage",
  "River",
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Ethan",
  "Sophia",
  "Mason",
  "Isabella",
  "William",
  "Mia",
  "James",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Harper",
  "Henry",
  "Evelyn",
  "Alexander",
]

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
]

const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"] as const

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generateJobs(): Job[] {
  return Array.from({ length: 25 }, (_, i) => {
    const title = randomChoice(jobTitles)
    const slug = title.toLowerCase().replace(/\s+/g, "-") + `-${i + 1}`
    const status = Math.random() > 0.3 ? "active" : "archived"
    const tags = randomChoices(techTags, Math.floor(Math.random() * 5) + 2)

    return {
      id: `job_${i + 1}`,
      title,
      slug,
      status,
      tags,
      order: i + 1,
      description: `We are looking for a talented ${title} to join our growing team.`,
      requirements: [
        `3+ years of experience in ${randomChoice(tags)}`,
        `Strong knowledge of ${randomChoice(tags)}`,
        "Excellent communication skills",
        "Bachelor's degree in Computer Science or related field",
      ],
      location: randomChoice(["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA"]),
      type: randomChoice(["full-time", "part-time", "contract", "internship"]),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }
  })
}

function generateCandidates(jobs: Job[]): Candidate[] {
  return Array.from({ length: 1000 }, (_, i) => {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const name = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`
    const jobId = randomChoice(jobs).id
    const stage = randomChoice(stages)

    return {
      id: `candidate_${i + 1}`,
      name,
      email,
      stage,
      jobId,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      notes: [],
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }
  })
}

function generateAssessments(jobs: Job[]): Assessment[] {
  const sampleJobs = jobs.slice(0, 3) // Create assessments for first 3 jobs

  return sampleJobs.map((job, i) => ({
    id: `assessment_${i + 1}`,
    jobId: job.id,
    title: `${job.title} Assessment`,
    description: `Technical assessment for ${job.title} position`,
    sections: [
      {
        id: `section_${i + 1}_1`,
        title: "Technical Skills",
        description: "Evaluate technical competency",
        order: 1,
        questions: [
          {
            id: `q_${i + 1}_1`,
            type: "single-choice",
            title: "How many years of experience do you have with React?",
            required: true,
            options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
            order: 1,
          },
          {
            id: `q_${i + 1}_2`,
            type: "multi-choice",
            title: "Which of the following technologies have you worked with?",
            required: true,
            options: job.tags,
            order: 2,
          },
          {
            id: `q_${i + 1}_3`,
            type: "long-text",
            title: "Describe a challenging technical problem you solved recently.",
            required: true,
            validation: { minLength: 100, maxLength: 1000 },
            order: 3,
          },
        ],
      },
      {
        id: `section_${i + 1}_2`,
        title: "Experience & Background",
        order: 2,
        questions: [
          {
            id: `q_${i + 1}_4`,
            type: "short-text",
            title: "What is your current job title?",
            required: true,
            validation: { maxLength: 100 },
            order: 1,
          },
          {
            id: `q_${i + 1}_5`,
            type: "numeric",
            title: "What is your expected salary range (in thousands)?",
            required: false,
            validation: { min: 50, max: 300 },
            order: 2,
          },
          {
            id: `q_${i + 1}_6`,
            type: "single-choice",
            title: "Are you available for remote work?",
            required: true,
            options: ["Yes", "No", "Hybrid preferred"],
            order: 3,
          },
          {
            id: `q_${i + 1}_7`,
            type: "long-text",
            title: "Why are you interested in this position?",
            required: true,
            conditionalLogic: {
              dependsOn: `q_${i + 1}_6`,
              showWhen: "Yes",
            },
            validation: { minLength: 50, maxLength: 500 },
            order: 4,
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }))
}

function generateTimelineEvents(candidates: Candidate[]): CandidateTimelineEvent[] {
  const events: CandidateTimelineEvent[] = []

  candidates.forEach((candidate) => {
    // Add initial application event
    events.push({
      id: `event_${candidate.id}_1`,
      candidateId: candidate.id,
      type: "stage_change",
      description: "Application submitted",
      toStage: "applied",
      createdAt: candidate.createdAt,
      author: "System",
    })

    // Add random stage progression events
    const stageProgression = ["applied", "screen", "tech", "offer"]
    const currentStageIndex = stageProgression.indexOf(candidate.stage)

    for (let i = 1; i <= currentStageIndex; i++) {
      events.push({
        id: `event_${candidate.id}_${i + 1}`,
        candidateId: candidate.id,
        type: "stage_change",
        description: `Moved to ${stageProgression[i]} stage`,
        fromStage: stageProgression[i - 1],
        toStage: stageProgression[i],
        createdAt: new Date(candidate.createdAt.getTime() + i * 2 * 24 * 60 * 60 * 1000),
        author: randomChoice(["John Doe", "Jane Smith", "Mike Johnson"]),
      })
    }
  })

  return events
}

export function generateSeedData() {
  const jobs = generateJobs()
  const candidates = generateCandidates(jobs)
  const assessments = generateAssessments(jobs)
  const timelineEvents = generateTimelineEvents(candidates)

  return {
    jobs,
    candidates,
    assessments,
    timelineEvents,
  }
}
