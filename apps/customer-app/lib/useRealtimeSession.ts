'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    let channel: any = null
    let pollInterval: NodeJS.Timeout | null = null

    const setupRealtime = async () => {
      try {
        // Load initial data
        const loadSessionData = async () => {
          const { data: sessionData, error: sessionError } = await supabase
            .from('survey_sessions')
            .select('*')
            .eq('id', sessionId)
            .single()

          if (sessionError) {
            // Only log actual errors, not expected scenarios
            if (sessionError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected initially
              console.error('Session load error:', sessionError)
            }
          } else {
            setSession((prev: any) => {
              // Only update if something actually changed
              if (!prev || JSON.stringify(prev) !== JSON.stringify(sessionData)) {
                return sessionData
              }
              return prev
            })
          }
        }

        const loadResponsesData = async () => {
          const { data: responsesData, error: responsesError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('session_id', sessionId)

          if (responsesError) {
            // Only log actual errors
            console.error('Responses load error:', responsesError)
          } else {
            const map: Record<string, any> = {}
            responsesData?.forEach((r: any) => (map[r.question_id] = r.value))
            setResponses(map)
          }
        }

        // Load initial data
        await loadSessionData()
        await loadResponsesData()

        // Set up polling as fallback (every 2 seconds)
        pollInterval = setInterval(async () => {
          await loadSessionData()
        }, 2000)

        // Set up realtime - try with filter first, fallback to callback filtering
        channel = supabase
          .channel(`session-${sessionId}`, {
            config: {
              broadcast: { self: true }
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'survey_sessions',
            filter: `id=eq.${sessionId}`
          }, (payload: any) => {
            if (payload.new) {
              setSession(payload.new)
            }
          })
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'survey_sessions',
            filter: `id=eq.${sessionId}`
          }, (payload: any) => {
            if (payload.new) {
              setSession(payload.new)
            }
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'survey_responses',
            filter: `session_id=eq.${sessionId}`
          }, (payload: any) => {
            if (payload.new) {
              setResponses((prev: any) => ({
                ...prev,
                [payload.new.question_id]: payload.new.value
              }))
            } else if (payload.old) {
              // Handle DELETE
              setResponses((prev: any) => {
                const updated = { ...prev }
                delete updated[payload.old.question_id]
                return updated
              })
            }
          })
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to realtime updates')
            } else if (status === 'CHANNEL_ERROR') {
              // Only log if there's an actual error object, not just status change
              if (err) {
                console.warn('⚠️ Realtime subscription error (this is normal if Realtime is not enabled):', err.message || err)
              }
            } else if (status === 'TIMED_OUT') {
              console.warn('⚠️ Realtime subscription timed out (falling back to polling)')
            } else if (status === 'CLOSED') {
              // Don't log closed status - it's expected during cleanup
            }
          })
      } catch (error) {
        console.error('Setup error:', error)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [sessionId])

  const updateResponse = async (questionId: string, value: any) => {
    try {
      const { error } = await supabase
        .from('survey_responses')
        .upsert({
          session_id: sessionId,
          question_id: questionId,
          value: value
        }, {
          onConflict: 'session_id,question_id'
        })

      if (error) {
        console.error('Update response error:', error)
      }
    } catch (error) {
      console.error('Update response error:', error)
    }
  }

  return { session, responses, updateResponse }
}