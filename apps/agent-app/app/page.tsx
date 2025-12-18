'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRealtimeSession } from '../lib/useRealtimeSession'
import { supabase } from '../lib/supabase'
import { surveyPages } from '../lib/survey-config'
import { Card, CardHeader, CardTitle, CardContent } from '../lib/ui/Card'
import { Button } from '../lib/ui/Button'
import { Badge } from '../lib/ui/Badge'
import { 
  Copy, 
  Lock, 
  Unlock, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  FileText,
  Loader2
} from 'lucide-react'

function AgentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
  
  const copyToClipboard = () => {
    const link = `http://localhost:3001?session=${sessionId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!session || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  const currentPage = surveyPages[session.current_page]
  const responseCount = Object.keys(responses).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              Agent Console
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor live survey sessions</p>
          </div>
          <Badge variant={session.edit_mode === 'customer_editable' ? 'success' : 'warning'}>
            {session.edit_mode === 'customer_editable' ? 'Customer Can Edit' : 'Locked'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Session ID
                  </label>
                  <code className="block bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-800 border border-gray-200">
                    {sessionId}
                  </code>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer Survey Link
                  </label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-gray-50 p-3 rounded-lg text-sm font-mono text-gray-800 border border-gray-200 truncate">
                      http://localhost:3001?session={sessionId}
                    </code>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={copyToClipboard}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Current Page</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentPage?.title || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Page {session.current_page + 1} of {surveyPages.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => updateSession({ current_page: Math.max(session.current_page - 1, 0) })}
                      disabled={session.current_page === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => updateSession({ current_page: Math.min(session.current_page + 1, surveyPages.length - 1) })}
                      disabled={session.current_page === surveyPages.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="success"
                    size="md"
                    onClick={() => updateSession({ edit_mode: 'customer_editable' })}
                    className="flex-1"
                    disabled={session.edit_mode === 'customer_editable'}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Allow Editing
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => updateSession({ edit_mode: 'agent_only' })}
                    className="flex-1"
                    disabled={session.edit_mode === 'agent_only'}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Editing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Responses */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Live Responses
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {responseCount} {responseCount === 1 ? 'response' : 'responses'}
                </p>
              </CardHeader>
              <CardContent>
                {responseCount > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto">
                    <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(responses, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No responses yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AgentPageContent />
    </Suspense>
  )
}