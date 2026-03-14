'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function completeInterview(interviewId: string, answers: string[] = [], score: number = 0) {
  // Don't update demo sessions that were never saved
  if (interviewId === 'demo-session-id') {
    return { success: true }
  }

  const supabase = await createClient()
  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isBypass) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('interviews')
    .update({ status: 'completed', answers, score })
    .eq('id', interviewId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

