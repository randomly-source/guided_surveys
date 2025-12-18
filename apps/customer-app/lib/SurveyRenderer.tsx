'use client'

import React from 'react'
import { cn } from './utils'

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
        <div className="mb-10 sm:mb-12 md:mb-16">
          <label className="block text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-5 sm:mb-6 md:mb-8 leading-tight">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={question.type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "w-full text-lg sm:text-xl md:text-2xl py-4 sm:py-5 md:py-6 px-0 border-0 border-b-2 sm:border-b-3 transition-all duration-300",
              "focus:outline-none focus:border-purple-500",
              "disabled:bg-transparent disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200",
              "placeholder:text-gray-400 placeholder:font-light",
              disabled ? "border-gray-200" : "border-gray-300 bg-transparent hover:border-gray-400"
            )}
            required={question.required}
            placeholder="Type your answer here..."
          />
        </div>
      )

    case 'number':
      return (
        <div className="mb-10 sm:mb-12 md:mb-16">
          <label className="block text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-5 sm:mb-6 md:mb-8 leading-tight">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              "w-full text-lg sm:text-xl md:text-2xl py-4 sm:py-5 md:py-6 px-0 border-0 border-b-2 sm:border-b-3 transition-all duration-300",
              "focus:outline-none focus:border-purple-500",
              "disabled:bg-transparent disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200",
              "placeholder:text-gray-400 placeholder:font-light",
              disabled ? "border-gray-200" : "border-gray-300 bg-transparent hover:border-gray-400"
            )}
            required={question.required}
            placeholder="Enter a number..."
          />
        </div>
      )

    case 'yesno':
      return (
        <div className="mb-10 sm:mb-12 md:mb-16">
          <label className="block text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 sm:mb-8 md:mb-10 leading-tight">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6">
            <label className={cn(
              "flex items-center justify-center min-h-14 sm:min-h-16 md:min-h-20 flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300",
              "shadow-sm active:shadow-md active:scale-[0.98] sm:hover:shadow-md sm:hover:scale-[1.02]",
              value === 'yes' 
                ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md" 
                : "border-gray-200 bg-white sm:hover:border-purple-200",
              disabled && "opacity-50 cursor-not-allowed active:scale-100 sm:hover:scale-100"
            )}>
              <div className={cn(
                "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 transition-all duration-200 shrink-0",
                value === 'yes'
                  ? "border-purple-600 bg-white"
                  : "bg-white border-gray-300"
              )}>
                {value === 'yes' && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-600" />
                )}
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-normal text-gray-900">Yes</span>
              <input
                type="radio"
                name={question.id}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="sr-only"
              />
            </label>
            <label className={cn(
              "flex items-center justify-center min-h-14 sm:min-h-16 md:min-h-20 flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300",
              "shadow-sm active:shadow-md active:scale-[0.98] sm:hover:shadow-md sm:hover:scale-[1.02]",
              value === 'no' 
                ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md" 
                : "border-gray-200 bg-white sm:hover:border-purple-200",
              disabled && "opacity-50 cursor-not-allowed active:scale-100 sm:hover:scale-100"
            )}>
              <div className={cn(
                "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 transition-all duration-200 shrink-0",
                value === 'no'
                  ? "border-purple-600 bg-white"
                  : "bg-white border-gray-300"
              )}>
                {value === 'no' && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-600" />
                )}
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-normal text-gray-900">No</span>
              <input
                type="radio"
                name={question.id}
                value="no"
                checked={value === 'no'}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      )

    case 'single':
      const singleQuestion = question as SingleSelectQuestion
      return (
        <div className="mb-10 sm:mb-12 md:mb-16">
          <label className="block text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 sm:mb-8 md:mb-10 leading-tight">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-3 sm:space-y-4">
            {singleQuestion.options?.map((option: string) => (
              <label
                key={option}
                className={cn(
                  "flex items-center min-h-14 sm:min-h-16 px-4 sm:px-6 md:px-8 py-4 sm:py-5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300",
                  "border-2 shadow-sm",
                  "active:shadow-md active:scale-[0.98] sm:hover:shadow-md sm:hover:scale-[1.01]",
                  value === option 
                    ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md" 
                    : "border-gray-200 bg-white sm:hover:border-purple-200",
                  disabled && "opacity-50 cursor-not-allowed active:scale-100 sm:hover:scale-100"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 md:mr-5 transition-all duration-200 shrink-0",
                  value === option
                    ? "border-purple-600 bg-white"
                    : "bg-white border-gray-300"
                )}>
                  {value === option && (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-600" />
                  )}
                </div>
                <span className="text-base sm:text-lg md:text-xl font-normal text-gray-900 flex-1 break-words">{option}</span>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(e.target.value)}
                  disabled={disabled}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>
      )

    case 'multi':
      const multiQuestion = question as MultiSelectQuestion
      const selectedValues = Array.isArray(value) ? value : []
      // #region debug log
      if (typeof window !== 'undefined' && multiQuestion.options?.length) {
        const firstOption = document.querySelector(`label[class*="min-h-"]`);
        const computed = firstOption ? window.getComputedStyle(firstOption as Element) : null;
        fetch('http://127.0.0.1:7242/ingest/20201c68-e8ed-4862-870b-3581860b6715',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SurveyRenderer.tsx:252',message:'Multi-select option styling check',data:{hasFirstOption:!!firstOption,optionClasses:firstOption?.className,minHeight:computed?.minHeight,fontSize:computed?.fontSize,padding:computed?.padding},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
      }
      // #endregion
      return (
        <div className="mb-10 sm:mb-12 md:mb-16">
          <label className="block text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mb-6 sm:mb-8 md:mb-10 leading-tight">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-3 sm:space-y-4">
            {multiQuestion.options?.map((option: string) => (
              <label
                key={option}
                className={cn(
                  "flex items-center min-h-14 sm:min-h-16 px-4 sm:px-6 md:px-8 py-4 sm:py-5 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300",
                  "border-2 shadow-sm",
                  "active:shadow-md active:scale-[0.98] sm:hover:shadow-md sm:hover:scale-[1.01]",
                  selectedValues.includes(option) 
                    ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md" 
                    : "border-gray-200 bg-white sm:hover:border-purple-200",
                  disabled && "opacity-50 cursor-not-allowed active:scale-100 sm:hover:scale-100"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded border-2 mr-3 sm:mr-4 md:mr-5 transition-all duration-200 shrink-0",
                  selectedValues.includes(option)
                    ? "bg-purple-600 border-purple-600"
                    : "bg-white border-gray-300"
                )}>
                  {selectedValues.includes(option) && (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-base sm:text-lg md:text-xl font-normal text-gray-900 flex-1 break-words">{option}</span>
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
                  className="sr-only"
                />
              </label>
            ))}
          </div>
        </div>
      )

    case 'group':
      const groupQuestion = question as GroupQuestion
      const groupValue = value || {}
      return (
        <div className="mb-8 sm:mb-10">
          <label className="block text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-5 sm:mb-6 md:mb-8">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="border border-gray-200 p-4 sm:p-6 md:p-8 rounded-lg bg-gray-50/50">
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
        <div className="mb-8 sm:mb-10">
          <label className="block text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-5 sm:mb-6 md:mb-8">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-4 sm:space-y-6">
            {repeatableValue.map((item: any, index: number) => (
              <div key={index} className="border border-gray-200 p-4 sm:p-6 rounded-lg bg-gray-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                  <span className="text-base sm:text-lg font-medium text-gray-700">Item {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = repeatableValue.filter((_: any, i: number) => i !== index)
                      handleChange(newValue)
                    }}
                    disabled={disabled}
                    className={cn(
                      "px-4 py-2.5 sm:py-2 text-sm font-medium text-red-600 active:text-red-700 sm:hover:text-red-700",
                      "active:bg-red-50 sm:hover:bg-red-50 rounded-lg transition-all duration-200 min-h-[44px] sm:min-h-0",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
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
          </div>
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
            className={cn(
              "w-full mt-4 sm:mt-6 px-4 sm:px-6 py-3.5 sm:py-4 bg-purple-600 text-white rounded-lg text-base sm:text-lg font-medium",
              "active:bg-purple-700 sm:hover:bg-purple-700 transition-all duration-200 shadow-sm active:shadow-md sm:hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-h-[44px] sm:min-h-0",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            + Add {question.label}
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