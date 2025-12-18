'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRealtimeSession } from '../lib/useRealtimeSession'
import { surveyPages } from '../lib/survey-config'
import { SurveyRenderer } from '../lib/SurveyRenderer'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

function CustomerPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')

  // Get current URL for example (dynamic)
  const getExampleUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?session=123e4567-e89b-12d3-a456-426614174000`
    }
    return 'https://your-customer-app-url.com?session=123e4567-e89b-12d3-a456-426614174000'
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-2xl w-full text-center animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">Customer Survey</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Please ask your agent for the survey link. The link should include a session parameter.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Example URL:</p>
            <code className="text-xs sm:text-sm font-mono text-gray-700 break-all">
              {getExampleUrl()}
            </code>
          </div>
        </div>
      </div>
    )
  }

  const { session, responses, updateResponse } = useRealtimeSession(sessionId)
  const [localResponses, setLocalResponses] = useState<Record<string, any>>({})
  const [sessionNotFound, setSessionNotFound] = useState(false)

  // Check if session exists after a reasonable timeout
  useEffect(() => {
    if (!session && sessionId) {
      const timeout = setTimeout(() => {
        // If session still doesn't exist after 5 seconds, it might not exist
        setSessionNotFound(true)
      }, 5000)

      return () => clearTimeout(timeout)
    } else if (session) {
      setSessionNotFound(false)
    }
  }, [session, sessionId])

  // Initialize local responses with remote data on mount
  useEffect(() => {
    setLocalResponses(responses)
  }, []) // Only run once on mount

  // Update local responses when remote responses change (from other sources)
  useEffect(() => {
    setLocalResponses(prev => ({ ...prev, ...responses }))
  }, [responses])

  // Track session changes for page updates (must be before conditional return)
  useEffect(() => {
    // Session changes are handled by the useRealtimeSession hook
    // This effect ensures the component re-renders when session changes
  }, [session?.current_page, session])

  // #region debug log
  useEffect(() => {
    if (typeof window !== 'undefined' && session) {
      setTimeout(() => {
        const mainDiv = document.querySelector('.min-h-screen.bg-white');
        const titleH1 = document.querySelector('h1');
        const computedStyles = titleH1 ? window.getComputedStyle(titleH1 as Element) : null;
        const stylesheets = Array.from(document.styleSheets);
        const cssText = Array.from(stylesheets).map(s => {
          try { return Array.from(s.cssRules || []).slice(0, 5).map(r => r.cssText).join(' '); } catch { return ''; }
        }).join(' ');
        const hasText4xl = cssText.includes('text-4xl') || cssText.includes('font-size:2.25rem');
        const hasText5xl = cssText.includes('text-5xl') || cssText.includes('font-size:3rem');
        const hasFontLight = cssText.includes('font-light') || cssText.includes('font-weight:300');
        const page = session ? surveyPages[session.current_page] : null;
        fetch('http://127.0.0.1:7242/ingest/20201c68-e8ed-4862-870b-3581860b6715',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:48',message:'UI Debug - Full CSS check',data:{hasMainDiv:!!mainDiv,hasTitle:!!titleH1,titleClasses:titleH1?.className,titleFontSize:computedStyles?.fontSize,titleFontWeight:computedStyles?.fontWeight,titleColor:computedStyles?.color,stylesheetCount:stylesheets.length,cssHasText4xl:hasText4xl,cssHasText5xl:hasText5xl,cssHasFontLight:hasFontLight,titleHasText5xl:titleH1?.className?.includes('text-5xl'),hasSession:!!session,currentPage:session?.current_page},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
      }, 1000);
    }
  }, [session, session?.current_page]);
  // #endregion

  if (!session) {
    if (sessionNotFound) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">Session Not Found</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              The survey session with ID <code className="bg-gray-100 px-2 py-1 rounded text-sm">{sessionId}</code> could not be found.
            </p>
            <p className="text-sm text-gray-500">
              Please check with your agent to ensure you have the correct survey link.
            </p>
          </div>
        </div>
      )
    }
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  const page = surveyPages[session.current_page]
  const canEdit = session.edit_mode === 'customer_editable'

  const handleResponseChange = (questionId: string, value: any) => {
    // Update local state immediately for responsive UI
    setLocalResponses(prev => ({ ...prev, [questionId]: value }))
    // Sync to database
    updateResponse(questionId, value)
  }

  const progressPercentage = ((session.current_page + 1) / surveyPages.length) * 100

  return (
    <div className="min-h-screen bg-white" key={`page-${session.current_page}`}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 animate-fadeIn">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3 sm:mb-4 leading-tight">{page?.title || 'Loading...'}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-500">
            <span>Page {session.current_page + 1} of {surveyPages.length}</span>
            {!canEdit && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Agent is controlling</span>
              </span>
            )}
          </div>
        </div>

        {/* Locked Notice */}
        {!canEdit && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex items-start gap-2 sm:gap-3 animate-slideUp">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-medium text-xs sm:text-sm mb-1">Survey is locked</p>
              <p className="text-amber-700 text-xs sm:text-sm">
                The agent is currently navigating the survey. Please wait for them to unlock editing or move to the next section.
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        <form className="space-y-10 sm:space-y-12 md:space-y-16">
          {page?.questions.map((q: any, index: number) => (
            <div key={q.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
              <SurveyRenderer
                question={q}
                value={localResponses[q.id]}
                onChange={(value) => handleResponseChange(q.id, value)}
                disabled={!canEdit}
              />
            </div>
          ))}
        </form>
      </div>
    </div>
  )
}

export default function CustomerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-gray-600">Loading survey...</p>
        </div>
      </div>
    }>
      <CustomerPageContent />
    </Suspense>
  )
}