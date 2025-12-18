import { supabase } from '@repo/supabase/client';
export async function updateSessionPage(sessionId, pageIndex) {
    const { error } = await supabase
        .from('survey_sessions')
        .update({ current_page: pageIndex })
        .eq('id', sessionId);
    if (error)
        throw error;
}
export async function updateSessionEditMode(sessionId, editMode) {
    const { error } = await supabase
        .from('survey_sessions')
        .update({ edit_mode: editMode })
        .eq('id', sessionId);
    if (error)
        throw error;
}
export async function upsertResponse(sessionId, questionId, value) {
    const { error } = await supabase
        .from('survey_responses')
        .upsert({
        session_id: sessionId,
        question_id: questionId,
        value: value
    });
    if (error)
        throw error;
}
export async function createSession(sessionId) {
    const { error } = await supabase
        .from('survey_sessions')
        .insert({
        id: sessionId,
        current_page: 0,
        edit_mode: 'customer_editable'
    });
    if (error)
        throw error;
}
