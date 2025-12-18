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
export async function createSessionWithHousehold(sessionId, householdId) {
    const { error } = await supabase
        .from('survey_sessions')
        .insert({
        id: sessionId,
        household_id: householdId,
        current_page: 0,
        edit_mode: 'customer_editable',
        status: 'active'
    });
    if (error)
        throw error;
}
export async function loadHouseholdData(householdId) {
    const { data, error } = await supabase
        .from('household_data')
        .select('question_id, value')
        .eq('household_id', householdId);
    if (error) {
        console.error('Error loading household data:', error);
        return {};
    }
    const map = {};
    data === null || data === void 0 ? void 0 : data.forEach((row) => {
        map[row.question_id] = row.value;
    });
    return map;
}
export async function submitToHousehold(sessionId, householdId) {
    // First, get all responses for this session
    const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('question_id, value')
        .eq('session_id', sessionId);
    if (responsesError) {
        throw new Error(`Failed to load session responses: ${responsesError.message}`);
    }
    if (!responses || responses.length === 0) {
        throw new Error('No responses to submit');
    }
    // Prepare data for household_data table
    const householdDataRows = responses.map((response) => ({
        household_id: householdId,
        question_id: response.question_id,
        value: response.value,
        updated_at: new Date().toISOString()
    }));
    // Upsert all responses to household_data
    const { error: upsertError } = await supabase
        .from('household_data')
        .upsert(householdDataRows, {
        onConflict: 'household_id,question_id'
    });
    if (upsertError) {
        throw new Error(`Failed to submit to household: ${upsertError.message}`);
    }
    // Update session status to completed
    const { error: updateError } = await supabase
        .from('survey_sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);
    if (updateError) {
        throw new Error(`Failed to update session status: ${updateError.message}`);
    }
}
