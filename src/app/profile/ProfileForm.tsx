'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2, User, GraduationCap, Building, Calendar, Sparkles, AlertCircle, FileText, UploadCloud, CheckCircle2 } from 'lucide-react'
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
  resume_url?: string;
}

export default function ProfileForm({ initialData }: { initialData?: ProfileData | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    // Attach the selected file manually to formData
    if (resumeFile) {
      formData.set('resume', resumeFile)
    }
    
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

      {/* Resume Upload */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resume (PDF or DOCX)</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full cursor-pointer border border-dashed border-white/20 rounded-xl px-4 py-5 flex items-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
            {resumeFile ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <UploadCloud className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="min-w-0">
            {resumeFile ? (
              <p className="text-sm font-medium text-green-400 truncate">{resumeFile.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium">{initialData?.resume_url ? 'Replace existing resume' : 'Upload your resume'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">PDF or DOCX, max 5MB</p>
              </>
            )}
          </div>
          {initialData?.resume_url && !resumeFile && (
            <a
              href={initialData.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="ml-auto shrink-0 flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <FileText className="w-3.5 h-3.5" /> View current
            </a>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={e => setResumeFile(e.target.files?.[0] ?? null)}
        />
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
