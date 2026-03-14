import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient() 
  const { data: { user } } = await supabase.auth.getUser()

  // Removed route guard for hackathon backdoor usage
  // if (!user) {
  //   redirect('/login')
  // }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
