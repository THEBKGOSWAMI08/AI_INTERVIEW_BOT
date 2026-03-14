import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')
  const actualId = user?.id || (isBypass ? '00000000-0000-0000-0000-000000000001' : null)

  if (!actualId) {
    redirect('/login')
  }

  // Fetch existing profile using the resolved user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', actualId)
    .single()

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-gradient">Complete Your Profile</h1>
        <p className="text-muted-foreground">Help the AI tailor the interview questions specifically to your background.</p>
      </div>
      
      <div className="w-full max-w-2xl glass-card p-8">
        <ProfileForm initialData={profile} />
      </div>
    </div>
  )
}
