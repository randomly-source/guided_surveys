'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRealtimeSession } from '../lib/useRealtimeSession'
import { supabase } from '../lib/supabase'
import { surveyPages } from '../lib/survey-config'
import { SurveyRenderer } from '../lib/SurveyRenderer'

export default function CustomerPage() {
  const sessionId = useSearchParams().get('session')!

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Survey</h1>
          <p className="text-gray-600 mb-4">
            Please ask your agent for the survey link. The link should include a session parameter.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>http://localhost:3001?session=123e4567-e89b-12d3-a456-426614174000</code>
          </p>
        </div>
      </div>
    )
  }

  const { session, responses, updateResponse } = useRealtimeSession(sessionId)
  const [localResponses, setLocalResponses] = useState<Record<string, any>>({})

  // Initialize local responses with remote data on mount
  useEffect(() => {
    setLocalResponses(responses)
  }, []) // Only run once on mount

  // Update local responses when remote responses change (from other sources)
  useEffect(() => {
    setLocalResponses(prev => ({ ...prev, ...responses }))
  }, [responses])

  if (!session) return <div className="p-6">Loading survey...</div>

  const page = surveyPages[session.current_page]
  const canEdit = session.edit_mode === 'customer_editable'

  const handleResponseChange = (questionId: string, value: any) => {
    // Update local state immediately for responsive UI
    setLocalResponses(prev => ({ ...prev, [questionId]: value }))
    // Sync to database
    updateResponse(questionId, value)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>Page {session.current_page + 1} of {surveyPages.length}</span>
            {!canEdit && (
              <span className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Agent is controlling the survey
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            {page.questions.map(q => (
              <SurveyRenderer
                key={q.id}
                question={q}
                value={localResponses[q.id]}
                onChange={(value) => handleResponseChange(q.id, value)}
                disabled={!canEdit}
              />
            ))}
          </form>

          {!canEdit && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                The agent is currently navigating the survey. Please wait for them to unlock editing or move to the next section.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}