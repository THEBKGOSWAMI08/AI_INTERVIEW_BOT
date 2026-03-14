import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, TrendingUp, MessageSquare, Lightbulb } from 'lucide-react'
import { notFound } from 'next/navigation'

// Mock questions — same as InterviewClient
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: "Can you tell me about a time you had to overcome a significant technical challenge?",
    type: 'behavioral',
    idealAnswer: "A strong answer uses the STAR method (Situation, Task, Action, Result). Describe a specific challenge clearly, explain your systematic approach to diagnosing the problem, highlight the technical skills you applied, and quantify the outcome — e.g., 'reduced load time by 40%'. Showing both technical depth and clear communication is key."
  },
  {
    id: 'q2',
    text: "Write a function in JavaScript that checks if a given string is a valid palindrome, ignoring non-alphanumeric characters and case.",
    type: 'technical',
    idealAnswer: `A clean solution:\n\nfunction isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return clean === clean.split('').reverse().join('');\n}\n\nKey points: use regex to strip non-alphanumeric chars, convert to lowercase, then compare the string against its reverse. Time: O(n), Space: O(n).`
  },
  {
    id: 'q3',
    text: "How do you explain the concept of React Server Components to someone who only knows traditional SPA React?",
    type: 'technical',
    idealAnswer: "React Server Components (RSC) run exclusively on the server and never ship their JavaScript to the browser. Unlike traditional SPA components that run in the browser, RSCs can directly access databases, file systems, or APIs, and send only rendered HTML to the client. This cuts bundle size and eliminates loading states for static content. Client components (with 'use client') still handle interactivity."
  }
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : score >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Practice'
  
  return (
    <div className={`inline-flex flex-col items-center px-8 py-6 rounded-2xl border ${color}`}>
      <span className="text-6xl font-bold font-mono">{score}</span>
      <span className="text-sm font-semibold mt-1 uppercase tracking-widest opacity-80">{label}</span>
      <span className="text-xs opacity-60 mt-0.5">out of 100</span>
    </div>
  )
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isBypass = cookieStore.has('hackathon-bypass')
  const { data: { user } } = await supabase.auth.getUser()
  const actualId = user?.id || (isBypass ? '00000000-0000-0000-0000-000000000001' : null)

  if (!actualId) notFound()

  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .single()

  if (!interview) notFound()

  const userAnswers: string[] = interview.answers || []
  const score: number = interview.score || 0

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Interview Report</h1>
          <p className="text-muted-foreground mt-1">
            {interview.role} • {interview.difficulty} • {interview.interview_type}
          </p>
        </div>
        <ScoreBadge score={score} />
      </div>

      {/* Summary Card */}
      <div className="glass border border-white/10 rounded-2xl p-6 flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
            <p className="text-lg font-bold">{Math.min(userAnswers.length, MOCK_QUESTIONS.length)} / {MOCK_QUESTIONS.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className="text-lg font-bold">{score} / 100</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed On</p>
            <p className="text-lg font-bold">{new Date(interview.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Q&A Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Question-by-Question Breakdown</h2>

        {MOCK_QUESTIONS.map((q, idx) => {
          const userAnswer = userAnswers[idx]
          const hasAnswer = userAnswer && userAnswer !== '(No answer provided)' && userAnswer.trim().length > 0

          return (
            <div key={q.id} className="glass border border-white/10 rounded-2xl overflow-hidden">
              {/* Question Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-start gap-4">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{q.type}</span>
                  <p className="font-semibold text-base mt-1 leading-relaxed">{q.text}</p>
                </div>
              </div>

              {/* Your Answer */}
              <div className="px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  {hasAnswer
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    : <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</span>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${hasAnswer ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {userAnswer || 'No answer was recorded for this question.'}
                </p>
              </div>

              {/* Ideal Answer */}
              <div className="px-6 py-5 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Ideal Answer</span>
                  <span className="ml-auto text-xs text-muted-foreground italic">AI-generated (demo)</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                  {q.idealAnswer}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link
          href="/schedule"
          className="flex-1 text-center py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
        >
          Practice Again
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 text-center py-4 rounded-xl bg-white/10 text-foreground font-semibold hover:bg-white/15 transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
