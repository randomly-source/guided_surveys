'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@repo/supabase/client'

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    let channel: any = null

    const setupRealtime = async () => {
      // Load initial data
      const { data: sessionData } = await supabase
        .from('survey_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      setSession(sessionData)

      const { data: responsesData } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('session_id', sessionId)
      const map: Record<string, any> = {}
      responsesData?.forEach((r: any) => (map[r.question_id] = r.value))
      setResponses(map)

      // Set up realtime
      channel = supabase
        .channel(`session-${sessionId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_sessions', filter: `id=eq.${sessionId}` }, (payload: any) => {
          setSession(payload.new)
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
          setResponses((prev: any) => ({
            ...prev,
            [payload.new.question_id]: payload.new.value
          }))
        })
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [sessionId])

  return { session, responses }
}