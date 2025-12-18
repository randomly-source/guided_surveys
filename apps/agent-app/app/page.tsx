'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRealtimeSession } from '../lib/useRealtimeSession'
import { supabase } from '../lib/supabase'
import { surveyPages } from '../lib/survey-config'

export default function AgentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const existingSessionId = searchParams.get('session')
    if (existingSessionId) {
      setSessionId(existingSessionId)
    } else {
      // Create a new session
      const newSessionId = crypto.randomUUID()
      supabase.from('survey_sessions').insert({
        id: newSessionId,
        current_page: 0,
        edit_mode: 'customer_editable'
      }).then(() => {
        router.push(`?session=${newSessionId}`)
        setSessionId(newSessionId)
      })
    }
  }, [searchParams, router])

  const { session, responses, updateSession } = useRealtimeSession(sessionId!)
  if (!session || !sessionId) return <div>Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Agent Console</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Session Information</h2>
        <div className="mb-4">
          <p><strong>Session ID:</strong> {sessionId}</p>
          <p><strong>Customer Link:</strong></p>
          <code className="bg-gray-100 p-2 rounded text-sm block mt-1">
            http://localhost:3001?session={sessionId}
          </code>
        </div>

        <h2 className="text-lg font-semibold mb-4">Session Controls</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => updateSession({ edit_mode: 'customer_editable' })}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Allow Customer Edit
          </button>

          <button
            onClick={() => updateSession({ edit_mode: 'agent_only' })}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Lock Customer Edit
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => updateSession({ current_page: Math.max(session.current_page - 1, 0) })}
            disabled={session.current_page === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Previous Page
          </button>

          <button
            onClick={() => updateSession({ current_page: Math.min(session.current_page + 1, surveyPages.length - 1) })}
            disabled={session.current_page === surveyPages.length - 1}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next Page
          </button>
        </div>

        <div className="mt-4">
          <p><strong>Current Page:</strong> {surveyPages[session.current_page]?.title} ({session.current_page + 1}/{surveyPages.length})</p>
          <p><strong>Edit Mode:</strong> {session.edit_mode === 'customer_editable' ? 'Customer Can Edit' : 'Agent Only'}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Live Responses</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
          {JSON.stringify(responses, null, 2)}
        </pre>
      </div>
    </div>
  )
}