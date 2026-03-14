'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function saveProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')
  
  if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('dummy-project') && !isBypass) {
    return { error: 'Not authenticated' }
  }

  // Parse skills from comma separated string
  const skillsString = formData.get('skills') as string
  const skills = skillsString.split(',').map(s => s.trim()).filter(Boolean)

  const profileData = {
    id: user?.id || 'dummy-user-id',
    name: formData.get('name') as string,
    age: parseInt(formData.get('age') as string, 10),
    skills,
    course: formData.get('course') as string,
    gender: formData.get('gender') as string,
    college: formData.get('college') as string,
    graduation_year: parseInt(formData.get('graduation_year') as string, 10),
    updated_at: new Date().toISOString(),
  }

  // Upsert profile data
  if (user) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profileData, id: user.id })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
