'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, User, GraduationCap, Building, Calendar, Sparkles, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveProfile } from './actions'

interface ProfileData {
  name?: string;
  age?: number;
  gender?: string;
  skills?: string[];
  course?: string;
  college?: string;
  graduation_year?: number;
}

export default function ProfileForm({ initialData }: { initialData?: ProfileData | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await saveProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        router.push('/dashboard')
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="name"
              required
              defaultValue={initialData?.name}
              placeholder="John Doe"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Age</label>
          <input
            name="age"
            type="number"
            min={16}
            max={100}
            required
            defaultValue={initialData?.age}
            placeholder="21"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</label>
          <select
            name="gender"
            required
            defaultValue={initialData?.gender || ""}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
          >
            <option value="" disabled className="bg-background text-muted-foreground">Select Gender</option>
            <option value="male" className="bg-background">Male</option>
            <option value="female" className="bg-background">Female</option>
            <option value="other" className="bg-background">Other</option>
            <option value="prefer_not_to_say" className="bg-background">Prefer not to say</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skills (Comma separated)</label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="skills"
              required
              defaultValue={initialData?.skills?.join(', ')}
              placeholder="React, Python, Machine Learning"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Course / Degree</label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="course"
              required
              defaultValue={initialData?.course}
              placeholder="B.Tech Computer Science"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">College / University</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="college"
              required
              defaultValue={initialData?.college}
              placeholder="University of Technology"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Graduation Year</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              name="graduation_year"
              type="number"
              min={2000}
              max={2100}
              required
              defaultValue={initialData?.graduation_year}
              placeholder="2025"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={loading}
        className="w-full mt-8 bg-primary text-primary-foreground font-medium rounded-xl px-4 py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Save Profile & Continue'
        )}
      </motion.button>
    </form>
  )
}
