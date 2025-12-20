'use server'

import { createClient } from '@/lib/utils/supabase/server'

export interface CreateSessionResult {
  success: boolean
  error?: string
  sessionId?: string
}

export async function createSessionWithHousehold(
  sessionId: string,
  householdId: string
): Promise<CreateSessionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('survey_sessions')
      .insert({
        id: sessionId,
        household_id: householdId.trim(),
        current_page: 0,
        edit_mode: 'customer_editable',
        status: 'active'
      })

    if (error) {
      // Check for specific error types
      if (error.message?.includes('database') || error.message?.includes('paused')) {
        return {
          success: false,
          error: 'Database is currently unavailable. Please try again later.'
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to create session'
      }
    }

    return {
      success: true,
      sessionId
    }
  } catch (error: any) {
    // Handle network errors, database connection issues, etc.
    console.error('Server action error:', error)
    
    if (error.message?.includes('database') || error.message?.includes('paused')) {
      return {
        success: false,
        error: 'Database is currently unavailable. Please try again later.'
      }
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while creating the session'
    }
  }
}

