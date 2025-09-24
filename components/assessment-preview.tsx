"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload } from "lucide-react"
import type { Assessment, Question } from "@/lib/types"

interface AssessmentPreviewProps {
  assessment: Assessment
}

export function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value })
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors({ ...errors, [questionId]: "" })
    }
  }

  const validateQuestion = (question: Question): string | null => {
    const response = responses[question.id]

    if (question.required && (!response || (Array.isArray(response) && response.length === 0))) {
      return "This field is required"
    }

    if (question.type === "short-text" || question.type === "long-text") {
      if (question.validation?.minLength && response && response.length < question.validation.minLength) {
        return `Minimum ${question.validation.minLength} characters required`
      }
      if (question.validation?.maxLength && response && response.length > question.validation.maxLength) {
        return `Maximum ${question.validation.maxLength} characters allowed`
      }
    }

    if (question.type === "numeric") {
      const numValue = Number(response)
      if (response && isNaN(numValue)) {
        return "Please enter a valid number"
      }
      if (question.validation?.min !== undefined && numValue < question.validation.min) {
        return `Minimum value is ${question.validation.min}`
      }
      if (question.validation?.max !== undefined && numValue > question.validation.max) {
        return `Maximum value is ${question.validation.max}`
      }
    }

    return null
  }

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) return true

    const dependentResponse = responses[question.conditionalLogic.dependsOn]
    const showWhen = question.conditionalLogic.showWhen

    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentResponse)
    }

    return dependentResponse === showWhen
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    assessment.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (shouldShowQuestion(question)) {
          const error = validateQuestion(question)
          if (error) {
            newErrors[question.id] = error
          }
        }
      })
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      alert("Assessment submitted successfully!")
      console.log("Assessment responses:", responses)
    }
  }

  const renderQuestion = (question: Question) => {
    const error = errors[question.id]

    if (!shouldShowQuestion(question)) {
      return null
    }

    return (
      <div key={question.id} className="space-y-3">
        <div className="space-y-1">
          <Label className="text-base font-medium">
            {question.title}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {question.description && <p className="text-sm text-muted-foreground">{question.description}</p>}
        </div>

        {question.type === "single-choice" && (
          <RadioGroup
            value={responses[question.id] || ""}
            onValueChange={(value) => updateResponse(question.id, value)}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "multi-choice" && (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={(responses[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = responses[question.id] || []
                    if (checked) {
                      updateResponse(question.id, [...currentValues, option])
                    } else {
                      updateResponse(
                        question.id,
                        currentValues.filter((v: string) => v !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}

        {question.type === "short-text" && (
          <Input
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your answer..."
            className={error ? "border-destructive" : ""}
          />
        )}

        {question.type === "long-text" && (
          <Textarea
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter your detailed answer..."
            rows={4}
            className={error ? "border-destructive" : ""}
          />
        )}

        {question.type === "numeric" && (
          <Input
            type="number"
            value={responses[question.id] || ""}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Enter a number..."
            min={question.validation?.min}
            max={question.validation?.max}
            className={error ? "border-destructive" : ""}
          />
        )}

        {question.type === "file-upload" && (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {question.validation && (question.type === "short-text" || question.type === "long-text") && (
          <div className="text-xs text-muted-foreground">
            {question.validation.minLength && `Min: ${question.validation.minLength} characters`}
            {question.validation.minLength && question.validation.maxLength && " • "}
            {question.validation.maxLength && `Max: ${question.validation.maxLength} characters`}
            {responses[question.id] && ` • Current: ${responses[question.id].length} characters`}
          </div>
        )}
      </div>
    )
  }

  if (assessment.sections.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Content to Preview</h3>
            <p className="text-muted-foreground">Add sections and questions to see the live preview</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{assessment.title || "Untitled Assessment"}</CardTitle>
            {assessment.description && <p className="text-muted-foreground">{assessment.description}</p>}
            <div className="flex items-center gap-2">
              <Badge variant="outline">{assessment.sections.length} sections</Badge>
              <Badge variant="outline">
                {assessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Sections */}
      {assessment.sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle className="text-xl">{section.title}</CardTitle>
            {section.description && <p className="text-muted-foreground">{section.description}</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            {section.questions.map((question) => renderQuestion(question))}
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <Button onClick={handleSubmit} size="lg" className="px-8">
          Submit Assessment
        </Button>
      </div>
    </div>
  )
}
