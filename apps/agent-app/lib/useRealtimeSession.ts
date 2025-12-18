'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    let channel: any = null

    const setupRealtime = async () => {
      try {
        // Load initial data
        const { data: sessionData, error: sessionError } = await supabase
          .from('survey_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionError) {
          console.error('Session load error:', sessionError)
        } else {
          console.log('Session loaded:', sessionData)
          setSession(sessionData)
        }

        const { data: responsesData, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('session_id', sessionId)

        if (responsesError) {
          console.error('Responses load error:', responsesError)
        } else {
          const map: Record<string, any> = {}
          responsesData?.forEach((r: any) => (map[r.question_id] = r.value))
          console.log('Responses loaded:', map)
          setResponses(map)
        }

        // Set up realtime
        channel = supabase
          .channel(`session-${sessionId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_sessions', filter: `id=eq.${sessionId}` }, (payload: any) => {
            console.log('Session change:', payload)
            setSession(payload.new)
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
            console.log('Response change:', payload)
            setResponses((prev: any) => ({
              ...prev,
              [payload.new.question_id]: payload.new.value
            }))
          })
          .subscribe((status) => {
            console.log('Subscription status:', status)
          })
      } catch (error) {
        console.error('Setup error:', error)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        console.log('Cleaning up channel')
        supabase.removeChannel(channel)
      }
    }
  }, [sessionId])

  const updateSession = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('survey_sessions')
        .update(updates)
        .eq('id', sessionId)

      if (error) {
        console.error('Update session error:', error)
      } else {
        console.log('Session updated:', updates)
      }
    } catch (error) {
        console.error('Update session error:', error)
    }
  }

  return { session, responses, updateSession }
}