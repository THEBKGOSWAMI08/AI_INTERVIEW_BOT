'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { login, signup } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = isLogin ? await login(formData) : await signup(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/profile')
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 ring-1 ring-primary/30"
        >
          <BrainCircuit className="w-8 h-8" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-gradient">AI Interviewer</h1>
        <p className="text-muted-foreground text-sm">Practice makes perfect. Ace your next technical interview.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 relative overflow-hidden"
      >
        {/* Decorative blur in background of the card */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        
        <div className="flex gap-4 mb-8 relative z-10">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${isLogin ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${!isLogin ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4 relative z-10"
          >
            {error && (
              <div className="p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pointer-events-none">
                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full mt-4 bg-primary text-primary-foreground font-medium rounded-xl px-4 py-3 text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In to continue' : 'Create Free Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
