import Link from 'next/link'
import { CalendarPlus, Clock, PlayCircle, BarChart3, ArrowRight, History } from 'lucide-react'

// Mock Data for now
const upcomingInterviews = [
  { id: '1', role: 'Frontend Developer', difficulty: 'Medium', date: 'Tomorrow, 2:00 PM' }
]

const pastInterviews = [
  { id: '2', role: 'React Engineer', score: 85, date: 'Oct 12, 2024', duration: '45m' },
  { id: '3', role: 'Fullstack Dev', score: 72, date: 'Oct 5, 2024', duration: '60m' },
]

export default function DashboardPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Interview Card */}
        <div className="md:col-span-2 glass border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                Up Next
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold">{upcomingInterviews[0].role}</h3>
                <p className="text-muted-foreground mt-1">{upcomingInterviews[0].difficulty} • {upcomingInterviews[0].date}</p>
              </div>

              <Link 
                href={`/interview/setup?id=${upcomingInterviews[0].id}`}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
               >
                 <PlayCircle className="w-4 h-4" />
                 Start Session Now
               </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="glass border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
            <p className="text-4xl font-bold mt-2">78<span className="text-lg text-muted-foreground font-normal">/100</span></p>
          </div>
          <div className="mt-6 text-sm text-green-400 font-medium">
            +5% from last week
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
          {pastInterviews.map((interview) => (
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
                  <span>{interview.date}</span>
                  <span>{interview.duration}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
