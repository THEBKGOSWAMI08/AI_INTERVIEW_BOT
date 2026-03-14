'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BarChart, Code2, PlayCircle, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createInterview } from './actions'

export default function ScheduleForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Local state for interactive UI
  const [difficulty, setDifficulty] = useState('Medium')
  const [type, setType] = useState('Technical')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('difficulty', difficulty)
    formData.set('interview_type', type)
    
    try {
      const result = await createInterview(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result.redirectUrl) {
        router.push(result.redirectUrl)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Role */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Target Job Role <span className="text-destructive">*</span></label>
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            name="role"
            required
            placeholder="e.g. Senior Frontend Developer"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <p className="text-xs text-muted-foreground ml-1">The AI will configure questions specific to this role.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Difficulty */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Initial Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  difficulty === level 
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }`}
              >
                <BarChart className={`w-4 h-4 ${difficulty === level ? 'text-primary' : ''}`} />
                <span className="text-xs font-semibold">{level}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground ml-1">Difficulty adapts based on your performance and stress levels.</p>
        </div>

        {/* Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Interview Type</label>
          <div className="grid grid-cols-2 gap-2">
            {['HR', 'Technical'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  type === t 
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }`}
              >
                {t === 'Technical' ? <Code2 className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                <span className="text-xs font-semibold">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={loading}
        className="w-full mt-8 bg-white text-black font-semibold rounded-xl px-4 py-4 text-base flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-black" />
        ) : (
          <>
            Continue to Device Setup
            <PlayCircle className="w-5 h-5 fill-black text-white" />
          </>
        )}
      </motion.button>
    </form>
  )
}
