import { Sidebar } from '@/components/layout/Sidebar'
import ScheduleForm from './ScheduleForm'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full max-w-3xl mx-auto flex flex-col justify-center">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Schedule Practice Session</h1>
            <p className="text-muted-foreground mt-2">Configure your upcoming interview scenario. The AI will adapt its questions based on these settings.</p>
          </div>
          
          <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ScheduleForm />
          </div>
        </main>
      </div>
    </div>
  )
}
