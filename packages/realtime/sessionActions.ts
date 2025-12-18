import { supabase } from '@repo/supabase/client'

export async function updateSessionPage(sessionId: string, pageIndex: number) {
  const { error } = await supabase
    .from('survey_sessions')
    .update({ current_page: pageIndex })
    .eq('id', sessionId)

  if (error) throw error
}

export async function updateSessionEditMode(sessionId: string, editMode: 'customer_editable' | 'agent_only') {
  const { error } = await supabase
    .from('survey_sessions')
    .update({ edit_mode: editMode })
    .eq('id', sessionId)

  if (error) throw error
}

export async function upsertResponse(sessionId: string, questionId: string, value: any) {
  const { error } = await supabase
    .from('survey_responses')
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      value: value
    })

  if (error) throw error
}

export async function createSession(sessionId: string) {
  const { error } = await supabase
    .from('survey_sessions')
    .insert({
      id: sessionId,
      current_page: 0,
      edit_mode: 'customer_editable'
    })

  if (error) throw error
}