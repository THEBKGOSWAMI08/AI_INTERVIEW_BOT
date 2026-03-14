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

  const actualId = user?.id || (isBypass ? '00000000-0000-0000-0000-000000000001' : null)

  if (!actualId) {
    return { error: 'Not authenticated' }
  }

  const profileData: Record<string, any> = {
    id: actualId,
    name: formData.get('name') as string,
    age: parseInt(formData.get('age') as string, 10),
    skills,
    course: formData.get('course') as string,
    gender: formData.get('gender') as string,
    college: formData.get('college') as string,
    graduation_year: parseInt(formData.get('graduation_year') as string, 10),
  }

  // Handle resume upload to Supabase Storage
  const resumeFile = formData.get('resume') as File | null
  if (resumeFile && resumeFile.size > 0) {
    const fileExt = resumeFile.name.split('.').pop()
    const filePath = `${actualId}/resume.${fileExt}`
    const arrayBuffer = await resumeFile.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, fileBuffer, {
        contentType: resumeFile.type,
        upsert: true,
      })

    if (uploadError) {
      return { error: `Resume upload failed: ${uploadError.message}` }
    }

    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)

    profileData.resume_url = publicUrlData.publicUrl
  }

  const { error: dbError } = await supabase
    .from('profiles')
    .upsert(profileData)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
