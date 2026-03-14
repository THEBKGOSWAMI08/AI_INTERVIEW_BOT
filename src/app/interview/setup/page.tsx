import { Sidebar } from '@/components/layout/Sidebar'
import SetupClient from './SetupClient'

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>
}) {
  const { id } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full max-w-5xl mx-auto flex flex-col justify-center">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight">System Check</h1>
            <p className="text-muted-foreground mt-2">Ensure your camera and microphone are working properly before starting the interview.</p>
          </div>
          
          <SetupClient interviewId={id} />
        </main>
      </div>
    </div>
  )
}
