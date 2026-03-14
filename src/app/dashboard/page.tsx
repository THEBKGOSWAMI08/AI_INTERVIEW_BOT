import Link from 'next/link'
import { CalendarPlus, Clock, PlayCircle, BarChart3, ArrowRight, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')
  const actualUserId = user?.id || (isBypass ? '00000000-0000-0000-0000-000000000001' : null)

  let upcomingInterviews: any[] = []
  let pastInterviews: any[] = []

  if (actualUserId) {
    const { data: interviews } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', actualUserId)
      .order('created_at', { ascending: false })

    if (interviews) {
      upcomingInterviews = interviews.filter(i => i.status === 'scheduled')
      pastInterviews = interviews.filter(i => i.status === 'completed')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your interview progress.</p>
        </div>
        <Link 
          href="/schedule" 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all focus:ring-2 focus:ring-primary/50"
        >
          <CalendarPlus className="w-4 h-4" />
          Schedule Practice
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Up Next</h2>
          {upcomingInterviews.length > 0 && (
            <span className="text-sm text-muted-foreground">{upcomingInterviews.length} pending</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Interviews List */}
          <div className="md:col-span-2 glass border border-white/10 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            {upcomingInterviews.length > 0 ? (
              <div className="relative z-10 max-h-72 overflow-y-auto divide-y divide-white/5">
                {upcomingInterviews.map((interview, idx) => (
                  <div key={interview.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{interview.role}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {interview.difficulty} • {interview.interview_type} •{' '}
                          {interview.scheduled_for 
                            ? new Date(interview.scheduled_for).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) 
                            : 'Ready now'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/interview/setup?id=${interview.id}`}
                      className="ml-4 shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-semibold hover:bg-primary/30 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <CalendarPlus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No interviews scheduled</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Schedule one to start practicing!</p>
                <Link 
                  href="/schedule" 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Schedule Now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">Scheduled</h3>
              <p className="text-4xl font-bold mt-2">{upcomingInterviews.length}<span className="text-lg text-muted-foreground font-normal"> sessions</span></p>
            </div>
            <div className="mt-6 text-sm text-primary font-medium">
              Keep practicing! 💪
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Interviews</h2>
          <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pastInterviews.length > 0 ? (
            pastInterviews.map((interview) => (
              <Link key={interview.id} href={`/report/${interview.id}`} className="block group">
                <div className="glass border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-white/5">
                      <History className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      interview.score >= 80 ? 'bg-green-500/20 text-green-400' : 
                      interview.score >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {interview.score} Score
                    </div>
                  </div>
                  
                  <h4 className="font-medium group-hover:text-primary transition-colors">{interview.role}</h4>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                    <span>{interview.score || '0'} Points</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl glass">
              <p className="text-muted-foreground">You haven't completed any interviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
