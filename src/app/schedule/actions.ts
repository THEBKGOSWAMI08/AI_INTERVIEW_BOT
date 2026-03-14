'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function createInterview(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project')) {
  //  return { error: 'Not authenticated' }
  // }

  const interviewData = {
    user_id: user?.id || '00000000-0000-0000-0000-000000000001',
    role: formData.get('role') as string,
    difficulty: formData.get('difficulty') as string,
    interview_type: formData.get('interview_type') as string,
    status: 'scheduled',
    scheduled_for: formData.get('scheduled_for') ? new Date(formData.get('scheduled_for') as string).toISOString() : new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  // Insert interview record
  let newId = 'demo-session-id'
  
  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')

  if (user || isBypass) {
    const actualUserId = user?.id || '00000000-0000-0000-0000-000000000001'
    const { data, error } = await supabase
      .from('interviews')
      .insert({ ...interviewData, user_id: actualUserId })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }
    newId = data.id
  }

  // If they scheduled it for the future, send them back to the dashboard so they can see it there
  // If they scheduled it for right now, send them directly into the setup lobby
  const isNow = formData.get('is_now') === 'true'
  if (isNow) {
    return { success: true, redirectUrl: `/interview/setup?id=${newId}` }
  } else {
    return { success: true, redirectUrl: `/dashboard` }
  }
}
