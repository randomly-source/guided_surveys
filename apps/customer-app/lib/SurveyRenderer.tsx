'use client'

import React from 'react'

type QuestionType = 'text' | 'email' | 'phone' | 'number' | 'yesno' | 'single' | 'multi' | 'group' | 'repeatable'

interface BaseQuestion {
  id: string
  type: QuestionType
  label: string
  required?: boolean
  showIf?: Record<string, any>
}

interface TextQuestion extends BaseQuestion {
  type: 'text' | 'email' | 'phone'
}

interface NumberQuestion extends BaseQuestion {
  type: 'number'
}

interface YesNoQuestion extends BaseQuestion {
  type: 'yesno'
}

interface SingleSelectQuestion extends BaseQuestion {
  type: 'single'
  options: string[]
}

interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi'
  options: string[]
}

interface GroupQuestion extends BaseQuestion {
  type: 'group'
  fields: Question[]
}

interface RepeatableQuestion extends BaseQuestion {
  type: 'repeatable'
  fields: Question[]
}

type Question =
  | TextQuestion
  | NumberQuestion
  | YesNoQuestion
  | SingleSelectQuestion
  | MultiSelectQuestion
  | GroupQuestion
  | RepeatableQuestion

interface SurveyRendererProps {
  question: Question
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function SurveyRenderer({ question, value, onChange, disabled }: SurveyRendererProps) {
  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  switch (question.type) {
    case 'text':
    case 'email':
    case 'phone':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={question.type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="w-full p-2 border rounded"
            required={question.required}
          />
        </div>
      )

    case 'number':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full p-2 border rounded"
            required={question.required}
          />
        </div>
      )

    case 'yesno':
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="mr-1"
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={value === 'no'}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="mr-1"
              />
              No
            </label>
          </div>
        </div>
      )

    case 'single':
      const singleQuestion = question as SingleSelectQuestion
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className="w-full p-2 border rounded"
            required={question.required}
          >
            <option value="">Select an option</option>
            {singleQuestion.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )

    case 'multi':
      const multiQuestion = question as MultiSelectQuestion
      const selectedValues = Array.isArray(value) ? value : []
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {multiQuestion.options?.map((option: string) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange([...selectedValues, option])
                    } else {
                      handleChange(selectedValues.filter((v: string) => v !== option))
                    }
                  }}
                  disabled={disabled}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )

    case 'group':
      const groupQuestion = question as GroupQuestion
      const groupValue = value || {}
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          <div className="border p-4 rounded bg-gray-50">
            {groupQuestion.fields?.map((field: Question) => (
              <SurveyRenderer
                key={field.id}
                question={{ ...field, id: `${question.id}.${field.id}` }}
                value={groupValue[field.id]}
                onChange={(fieldValue) =>
                  handleChange({ ...groupValue, [field.id]: fieldValue })
                }
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )

    case 'repeatable':
      const repeatableQuestion = question as RepeatableQuestion
      const repeatableValue = Array.isArray(value) ? value : []
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {question.label}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          {repeatableValue.map((item: any, index: number) => (
            <div key={index} className="border p-4 rounded mb-2 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Item {index + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = repeatableValue.filter((_: any, i: number) => i !== index)
                    handleChange(newValue)
                  }}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              {repeatableQuestion.fields?.map((field: Question) => (
                <SurveyRenderer
                  key={field.id}
                  question={{ ...field, id: `${question.id}.${index}.${field.id}` }}
                  value={item[field.id]}
                  onChange={(fieldValue) => {
                    const newItem = { ...item, [field.id]: fieldValue }
                    const newValue = [...repeatableValue]
                    newValue[index] = newItem
                    handleChange(newValue)
                  }}
                  disabled={disabled}
                />
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newItem = repeatableQuestion.fields?.reduce((acc: any, field: Question) => {
                acc[field.id] = ''
                return acc
              }, {})
              handleChange([...repeatableValue, newItem])
            }}
            disabled={disabled}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add {question.label}
          </button>
        </div>
      )

    default:
      return (
        <div className="mb-4">
          <p>Unsupported question type: {(question as any).type}</p>
        </div>
      )
  }
}