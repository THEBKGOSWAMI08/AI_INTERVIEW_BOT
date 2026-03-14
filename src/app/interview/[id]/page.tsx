import InterviewClient from './InterviewClient'

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-sm">Recording in progress</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground px-3 py-1 rounded-full bg-white/5">
          Session: {id}
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <InterviewClient interviewId={id} />
      </main>
    </div>
  )
}
