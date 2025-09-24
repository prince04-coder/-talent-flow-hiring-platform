"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, FileText, TrendingUp, Database, Download, Upload, RotateCcw } from "lucide-react"
import Link from "next/link"
import { initializeDatabase, getDatabaseStats, resetDatabase, exportData, importData } from "@/lib/storage"

export default function Dashboard() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    assessments: 0,
    timelineEvents: 0,
    assessmentResponses: 0,
  })

  useEffect(() => {
    async function initialize() {
      try {
        setIsInitializing(true)

        // Initialize MSW
        if (typeof window !== "undefined") {
          const { worker } = await import("@/lib/mock-api")
          await worker.start({ onUnhandledRequest: "bypass" })
          console.log("[v0] MSW initialized")
        }

        // Initialize database
        await initializeDatabase()

        // Get current stats
        const currentStats = await getDatabaseStats()
        setStats(currentStats)

        console.log("[v0] Application initialized successfully")
      } catch (error) {
        console.error("[v0] Initialization failed:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      try {
        setIsInitializing(true)
        await resetDatabase()
        const newStats = await getDatabaseStats()
        setStats(newStats)
        alert("Database reset successfully!")
      } catch (error) {
        console.error("[v0] Reset failed:", error)
        alert("Failed to reset database")
      } finally {
        setIsInitializing(false)
      }
    }
  }

  const handleExport = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `talentflow-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Export failed:", error)
      alert("Failed to export data")
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (confirm("Are you sure you want to import this data? This will replace all existing data.")) {
        setIsInitializing(true)
        await importData(data)
        const newStats = await getDatabaseStats()
        setStats(newStats)
        alert("Data imported successfully!")
      }
    } catch (error) {
      console.error("[v0] Import failed:", error)
      alert("Failed to import data")
    } finally {
      setIsInitializing(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const dashboardStats = [
    { title: "Active Jobs", value: stats.jobs.toString(), change: "+2", icon: Briefcase, color: "text-primary" },
    {
      title: "Total Candidates",
      value: stats.candidates.toLocaleString(),
      change: "+89",
      icon: Users,
      color: "text-success",
    },
    { title: "Assessments", value: stats.assessments.toString(), change: "+1", icon: FileText, color: "text-info" },
    {
      title: "Timeline Events",
      value: stats.timelineEvents.toLocaleString(),
      change: "+12",
      icon: TrendingUp,
      color: "text-warning",
    },
  ]

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Initializing TalentFlow</h2>
          <p className="text-muted-foreground">Setting up your hiring platform...</p>
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
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">TalentFlow</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to TalentFlow - your comprehensive hiring platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-success">
                    {stat.change}
                  </Badge>
                  <span>from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Job Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                Create, edit, and manage job postings with drag-and-drop reordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/jobs">Manage Jobs</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Candidate Pipeline</CardTitle>
              <CardDescription className="text-muted-foreground">
                Track candidates through stages with kanban board and timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/candidates">View Candidates</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Assessment Builder</CardTitle>
              <CardDescription className="text-muted-foreground">
                Create custom assessments with live preview and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/assessments">Build Assessments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage your TalentFlow database with backup, restore, and reset options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
              <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
