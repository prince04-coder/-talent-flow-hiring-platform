"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, Settings } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import type { Assessment, AssessmentSection, Question } from "@/lib/types"

interface AssessmentBuilderProps {
  assessment: Assessment
  onAssessmentChange: (assessment: Assessment) => void
}

const questionTypes = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multi-choice", label: "Multiple Choice" },
  { value: "short-text", label: "Short Text" },
  { value: "long-text", label: "Long Text" },
  { value: "numeric", label: "Numeric" },
  { value: "file-upload", label: "File Upload" },
]

export function AssessmentBuilder({ assessment, onAssessmentChange }: AssessmentBuilderProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      description: "",
      questions: [],
      order: assessment.sections.length + 1,
    }

    onAssessmentChange({
      ...assessment,
      sections: [...assessment.sections, newSection],
    })
    setExpandedSection(newSection.id)
  }

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    onAssessmentChange({
      ...assessment,
      sections: assessment.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    })
  }

  const deleteSection = (sectionId: string) => {
    onAssessmentChange({
      ...assessment,
      sections: assessment.sections.filter((section) => section.id !== sectionId),
    })
  }

  const addQuestion = (sectionId: string) => {
    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type: "short-text",
      title: "New Question",
      description: "",
      required: false,
      order: section.questions.length + 1,
    }

    updateSection(sectionId, {
      questions: [...section.questions, newQuestion],
    })
    setExpandedQuestion(newQuestion.id)
  }

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      questions: section.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    })
  }

  const deleteQuestion = (sectionId: string, questionId: string) => {
    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    updateSection(sectionId, {
      questions: section.questions.filter((question) => question.id !== questionId),
    })
  }

  const handleSectionDragEnd = (result: any) => {
    if (!result.destination) return

    const sections = Array.from(assessment.sections)
    const [reorderedSection] = sections.splice(result.source.index, 1)
    sections.splice(result.destination.index, 0, reorderedSection)

    // Update order numbers
    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index + 1,
    }))

    onAssessmentChange({
      ...assessment,
      sections: updatedSections,
    })
  }

  const handleQuestionDragEnd = (result: any, sectionId: string) => {
    if (!result.destination) return

    const section = assessment.sections.find((s) => s.id === sectionId)
    if (!section) return

    const questions = Array.from(section.questions)
    const [reorderedQuestion] = questions.splice(result.source.index, 1)
    questions.splice(result.destination.index, 0, reorderedQuestion)

    // Update order numbers
    const updatedQuestions = questions.map((question, index) => ({
      ...question,
      order: index + 1,
    }))

    updateSection(sectionId, { questions: updatedQuestions })
  }

  return (
    <div className="space-y-6">
      {assessment.sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Sections Yet</h3>
              <p className="text-muted-foreground mb-6">Start building your assessment by adding sections</p>
              <Button onClick={addSection} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Section
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleSectionDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {assessment.sections.map((section, sectionIndex) => (
                  <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : ""}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">Section {section.order}</CardTitle>
                                  <Badge variant="secondary">{section.questions.length} questions</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setExpandedSection(expandedSection === section.id ? null : section.id)
                                    }
                                  >
                                    {expandedSection === section.id ? "Collapse" : "Expand"}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {expandedSection === section.id && (
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                  placeholder="Section title"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={section.description || ""}
                                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                                placeholder="Optional section description"
                                rows={2}
                              />
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">Questions</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addQuestion(section.id)}
                                  className="gap-2 bg-transparent"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Question
                                </Button>
                              </div>

                              <DragDropContext onDragEnd={(result) => handleQuestionDragEnd(result, section.id)}>
                                <Droppable droppableId={`questions-${section.id}`}>
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                      {section.questions.map((question, questionIndex) => (
                                        <Draggable key={question.id} draggableId={question.id} index={questionIndex}>
                                          {(provided, snapshot) => (
                                            <Card
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`border-l-4 border-l-primary/20 ${
                                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
                                              }`}
                                            >
                                              <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab active:cursor-grabbing mt-1"
                                                  >
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                  </div>
                                                  <div className="flex-1 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-muted-foreground">
                                                        Question {question.order}
                                                      </span>
                                                      <div className="flex items-center gap-2">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() =>
                                                            setExpandedQuestion(
                                                              expandedQuestion === question.id ? null : question.id,
                                                            )
                                                          }
                                                        >
                                                          {expandedQuestion === question.id ? "Collapse" : "Expand"}
                                                        </Button>
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => deleteQuestion(section.id, question.id)}
                                                        >
                                                          <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                      </div>
                                                    </div>

                                                    {expandedQuestion === question.id && (
                                                      <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                          <div className="space-y-2">
                                                            <Label>Question Type</Label>
                                                            <Select
                                                              value={question.type}
                                                              onValueChange={(value) =>
                                                                updateQuestion(section.id, question.id, {
                                                                  type: value as any,
                                                                })
                                                              }
                                                            >
                                                              <SelectTrigger>
                                                                <SelectValue />
                                                              </SelectTrigger>
                                                              <SelectContent>
                                                                {questionTypes.map((type) => (
                                                                  <SelectItem key={type.value} value={type.value}>
                                                                    {type.label}
                                                                  </SelectItem>
                                                                ))}
                                                              </SelectContent>
                                                            </Select>
                                                          </div>
                                                          <div className="flex items-center space-x-2 pt-6">
                                                            <Checkbox
                                                              id={`required-${question.id}`}
                                                              checked={question.required}
                                                              onCheckedChange={(checked) =>
                                                                updateQuestion(section.id, question.id, {
                                                                  required: !!checked,
                                                                })
                                                              }
                                                            />
                                                            <Label htmlFor={`required-${question.id}`}>Required</Label>
                                                          </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                          <Label>Question Title</Label>
                                                          <Input
                                                            value={question.title}
                                                            onChange={(e) =>
                                                              updateQuestion(section.id, question.id, {
                                                                title: e.target.value,
                                                              })
                                                            }
                                                            placeholder="Enter your question"
                                                          />
                                                        </div>

                                                        <div className="space-y-2">
                                                          <Label>Description (Optional)</Label>
                                                          <Textarea
                                                            value={question.description || ""}
                                                            onChange={(e) =>
                                                              updateQuestion(section.id, question.id, {
                                                                description: e.target.value,
                                                              })
                                                            }
                                                            placeholder="Additional context or instructions"
                                                            rows={2}
                                                          />
                                                        </div>

                                                        {/* Question-specific options */}
                                                        {(question.type === "single-choice" ||
                                                          question.type === "multi-choice") && (
                                                          <div className="space-y-2">
                                                            <Label>Options</Label>
                                                            <div className="space-y-2">
                                                              {(question.options || []).map((option, index) => (
                                                                <div key={index} className="flex gap-2">
                                                                  <Input
                                                                    value={option}
                                                                    onChange={(e) => {
                                                                      const newOptions = [...(question.options || [])]
                                                                      newOptions[index] = e.target.value
                                                                      updateQuestion(section.id, question.id, {
                                                                        options: newOptions,
                                                                      })
                                                                    }}
                                                                    placeholder={`Option ${index + 1}`}
                                                                  />
                                                                  <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                      const newOptions = [...(question.options || [])]
                                                                      newOptions.splice(index, 1)
                                                                      updateQuestion(section.id, question.id, {
                                                                        options: newOptions,
                                                                      })
                                                                    }}
                                                                  >
                                                                    <Trash2 className="h-4 w-4" />
                                                                  </Button>
                                                                </div>
                                                              ))}
                                                              <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                  const newOptions = [...(question.options || []), ""]
                                                                  updateQuestion(section.id, question.id, {
                                                                    options: newOptions,
                                                                  })
                                                                }}
                                                                className="gap-2 bg-transparent"
                                                              >
                                                                <Plus className="h-4 w-4" />
                                                                Add Option
                                                              </Button>
                                                            </div>
                                                          </div>
                                                        )}

                                                        {question.type === "numeric" && (
                                                          <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                              <Label>Minimum Value</Label>
                                                              <Input
                                                                type="number"
                                                                value={question.validation?.min || ""}
                                                                onChange={(e) =>
                                                                  updateQuestion(section.id, question.id, {
                                                                    validation: {
                                                                      ...question.validation,
                                                                      min: Number(e.target.value),
                                                                    },
                                                                  })
                                                                }
                                                                placeholder="Min value"
                                                              />
                                                            </div>
                                                            <div className="space-y-2">
                                                              <Label>Maximum Value</Label>
                                                              <Input
                                                                type="number"
                                                                value={question.validation?.max || ""}
                                                                onChange={(e) =>
                                                                  updateQuestion(section.id, question.id, {
                                                                    validation: {
                                                                      ...question.validation,
                                                                      max: Number(e.target.value),
                                                                    },
                                                                  })
                                                                }
                                                                placeholder="Max value"
                                                              />
                                                            </div>
                                                          </div>
                                                        )}

                                                        {(question.type === "short-text" ||
                                                          question.type === "long-text") && (
                                                          <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                              <Label>Minimum Length</Label>
                                                              <Input
                                                                type="number"
                                                                value={question.validation?.minLength || ""}
                                                                onChange={(e) =>
                                                                  updateQuestion(section.id, question.id, {
                                                                    validation: {
                                                                      ...question.validation,
                                                                      minLength: Number(e.target.value),
                                                                    },
                                                                  })
                                                                }
                                                                placeholder="Min characters"
                                                              />
                                                            </div>
                                                            <div className="space-y-2">
                                                              <Label>Maximum Length</Label>
                                                              <Input
                                                                type="number"
                                                                value={question.validation?.maxLength || ""}
                                                                onChange={(e) =>
                                                                  updateQuestion(section.id, question.id, {
                                                                    validation: {
                                                                      ...question.validation,
                                                                      maxLength: Number(e.target.value),
                                                                    },
                                                                  })
                                                                }
                                                                placeholder="Max characters"
                                                              />
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
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
                            </div>
                          </CardContent>
                        )}
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

      <div className="flex justify-center">
        <Button onClick={addSection} variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>
    </div>
  )
}
