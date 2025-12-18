'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@repo/supabase/client';
export function useRealtimeSession(sessionId) {
    const [session, setSession] = useState(null);
    const [responses, setResponses] = useState({});
    useEffect(() => {
        let channel = null;
        const setupRealtime = async () => {
            // Load initial data
            const { data: sessionData } = await supabase
                .from('survey_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();
            setSession(sessionData);
            const { data: responsesData } = await supabase
                .from('survey_responses')
                .select('*')
                .eq('session_id', sessionId);
            const map = {};
            responsesData === null || responsesData === void 0 ? void 0 : responsesData.forEach((r) => (map[r.question_id] = r.value));
            setResponses(map);
            // Set up realtime
            channel = supabase
                .channel(`session-${sessionId}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_sessions', filter: `id=eq.${sessionId}` }, (payload) => {
                setSession(payload.new);
            })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'survey_responses', filter: `session_id=eq.${sessionId}` }, (payload) => {
                setResponses((prev) => (Object.assign(Object.assign({}, prev), { [payload.new.question_id]: payload.new.value })));
            })
                .subscribe();
        };
        setupRealtime();
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [sessionId]);
    return { session, responses };
}
