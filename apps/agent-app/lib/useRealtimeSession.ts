'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { loadHouseholdData } from '@repo/realtime'

export function useRealtimeSession(sessionId: string) {
  const [session, setSession] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!sessionId) return

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
          // Only log actual errors, not expected scenarios
          if (sessionError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected initially
            console.error('Session load error:', sessionError)
          }
        } else {
          setSession(sessionData)

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
            
            // If session has household_id, load and merge household data
            if (sessionData?.household_id) {
              try {
                const householdData = await loadHouseholdData(sessionData.household_id)
                // Merge household data, but session responses take precedence if they exist
                // Use Promise.all to handle all upserts properly
                const upsertPromises = Object.keys(householdData).map(async (questionId) => {
                  // Only use household data if session doesn't have a response for this question
                  if (!map[questionId]) {
                    map[questionId] = householdData[questionId]
                    // Also save to session responses so it's synced
                    try {
                      await supabase.from('survey_responses').upsert({
                        session_id: sessionId,
                        question_id: questionId,
                        value: householdData[questionId]
                      })
                    } catch (error) {
                      console.error(`Error upserting response for ${questionId}:`, error)
                    }
                  }
                })
                // Fire and forget - don't wait for all upserts to complete
                Promise.all(upsertPromises).catch(console.error)
              } catch (error) {
                console.error('Error loading household data:', error)
              }
            }
            
            setResponses(map)
          }
        }

        // Set up realtime - listen to all changes and filter by sessionId in callback
        channel = supabase
          .channel(`session-${sessionId}`, {
            config: {
              broadcast: { self: true }
            }
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'survey_sessions'
          }, (payload: any) => {
            // Filter by sessionId in callback (more reliable than filter syntax)
            if (payload.new && payload.new.id === sessionId) {
              setSession(payload.new)
            }
          })
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'survey_sessions'
          }, (payload: any) => {
            if (payload.new && payload.new.id === sessionId) {
              setSession(payload.new)
            }
          })
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'survey_responses'
          }, (payload: any) => {
            // Filter by session_id in callback
            const relevantSessionId = payload.new?.session_id || payload.old?.session_id
            if (relevantSessionId === sessionId) {
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
      }
    } catch (error) {
      console.error('Update session error:', error)
    }
  }

  return { session, responses, updateSession }
}