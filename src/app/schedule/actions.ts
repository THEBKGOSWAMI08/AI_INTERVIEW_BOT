'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createInterview(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project')) {
  //  return { error: 'Not authenticated' }
  // }

  const interviewData = {
    user_id: user?.id || 'dummy-user-id',
    role: formData.get('role') as string,
    difficulty: formData.get('difficulty') as string,
    interview_type: formData.get('interview_type') as string,
    status: 'scheduled',
    created_at: new Date().toISOString(),
  }

  // Insert interview record
  let newId = 'demo-session-id'
  
  if (user) {
    const { data, error } = await supabase
      .from('interviews')
      .insert({ ...interviewData, user_id: user.id })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }
    newId = data.id
  }

  // Redirect to setup page with the new interview ID
  return { success: true, redirectUrl: `/interview/setup?id=${newId}` }
}
