const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  'https://zwkempemmltqcztsyhzo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3a2VtcGVtbWx0cWN6dHN5aHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzE1NjQsImV4cCI6MjA4MTYwNzU2NH0.9gkuS9goR95NObOf4-z1YyN3aQaCrdwHiu9sLt6SM0E'
);

async function test() {
  console.log('Testing session creation...');
  const sessionId = crypto.randomUUID();
  console.log('Generated UUID:', sessionId);
  const result = await supabase.from('survey_sessions').insert({
    id: sessionId,
    current_page: 0,
    edit_mode: 'customer_editable'
  });
  console.log('Insert result:', JSON.stringify(result, null, 2));

  if (!result.error) {
    const selectResult = await supabase.from('survey_sessions').select('*').eq('id', sessionId);
    console.log('Select result:', JSON.stringify(selectResult, null, 2));

    // Test inserting a response
    console.log('Testing response insertion...');
    const responseResult = await supabase.from('survey_responses').insert({
      session_id: sessionId,
      question_id: 'full_name',
      value: 'Test User'
    });
    console.log('Response insert result:', JSON.stringify(responseResult, null, 2));

    if (!responseResult.error) {
      const responseSelect = await supabase.from('survey_responses').select('*').eq('session_id', sessionId);
      console.log('Response select result:', JSON.stringify(responseSelect, null, 2));
    }
  }
}

test().catch(console.error);