'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, ChevronRight, Video, Code2, HeartPulse, Send } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { useRouter } from 'next/navigation'
import { completeInterview } from './actions'

// Mock Questions Database
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: "Can you tell me about a time you had to overcome a significant technical challenge?",
    type: 'behavioral',
    mode: 'text',
  },
  {
    id: 'q2',
    text: "Write a function in JavaScript that checks if a given string is a valid palindrome, ignoring non-alphanumeric characters and case.",
    type: 'technical',
    mode: 'coding',
    initialCode: 'function isPalindrome(str) {\n  // Your code here\n  return false;\n}'
  },
  {
    id: 'q3',
    text: "How do you explain the concept of React Server Components to someone who only knows traditional SPA React?",
    type: 'technical',
    mode: 'text',
  }
]

export default function InterviewClient({ interviewId }: { interviewId: string }) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Fake BPM for demo purposes
  const [bpm, setBpm] = useState(72)
  const [isRecording, setIsRecording] = useState(false)
  const [answerContent, setAnswerContent] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [savedAnswers, setSavedAnswers] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)

  const currentQ = MOCK_QUESTIONS[currentIdx]
  const isLastQ = currentIdx === MOCK_QUESTIONS.length - 1

  useEffect(() => {
    // Start camera for the corner preview
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(mediaStream => {
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      })
      .catch(console.error)

    // Simulate Fake BPM Fluctuations
    const interval = setInterval(() => {
      setBpm(prev => {
        const change = Math.floor(Math.random() * 5) - 2
        const next = prev + change
        return Math.min(Math.max(next, 65), 110)
      })
    }, 2000)

    // Setup Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.isRunning = false   // custom guard flag

      recognition.onresult = (event: any) => {
        let finalText = ''
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalText += transcript + ' '
          } else {
            interimText += transcript
          }
        }
        if (finalText) {
          setAnswerContent(prev => prev + finalText)
        }
        setInterimTranscript(interimText)
      }

      recognition.onerror = (event: any) => {
        // 'aborted' is harmless — it fires when .stop() is called manually or on React StrictMode double-invoke
        if (event.error === 'aborted') return
        console.error('Speech recognition error:', event.error)
        recognition.isRunning = false
        setIsRecording(false)
        setInterimTranscript('')
      }

      recognition.onstart = () => {
        recognition.isRunning = true
      }

      recognition.onend = () => {
        recognition.isRunning = false
        // Auto-restart only if the user deliberately kept recording
        if (recognition.shouldRestart) {
          try { recognition.start() } catch (_) {}
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      clearInterval(interval)
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, []) // eslint-disable-line

  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isRecording) {
      recognition.shouldRestart = false
      if (recognition.isRunning) recognition.stop()
      setIsRecording(false)
      setInterimTranscript('')
    } else {
      if (!recognition.isRunning) {
        recognition.shouldRestart = true
        try {
          recognition.start()
          setIsRecording(true)
        } catch (e) {
          console.warn('Could not start recognition:', e)
        }
      }
    }
  }, [isRecording])

  const handleNext = async () => {
    if (isRecording) toggleRecording()
    setInterimTranscript('')

    const currentAnswer = answerContent.trim() || '(No answer provided)'

    if (isLastQ) {
      const allAnswers = [...savedAnswers, currentAnswer]
      // Calculate a simple mock score based on answer lengths
      const mockScore = Math.min(100, Math.round(
        allAnswers.reduce((sum, a) => sum + Math.min(a.length / 5, 30), 0)
      ))
      await completeInterview(interviewId, allAnswers, mockScore)
      router.push(`/report/${interviewId}`)
    } else {
      setSavedAnswers(prev => [...prev, currentAnswer])
      setCurrentIdx(i => i + 1)
      setAnswerContent(MOCK_QUESTIONS[currentIdx + 1]?.initialCode || '')
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full h-full relative">
      
      {/* Left Panel: Question & Input */}
      <div className="flex-1 flex flex-col p-6 lg:p-8 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col"
          >
            {/* Question Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                  Question {currentIdx + 1} of {MOCK_QUESTIONS.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {currentQ.type}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-medium leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            {/* Answer Area */}
            <div className="flex-1 min-h-[300px] flex flex-col relative w-full glass rounded-2xl overflow-hidden border border-white/10">
              {currentQ.mode === 'coding' ? (
                <div className="h-full w-full flex flex-col">
                  <div className="bg-black/50 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Monaco Editor (JavaScript)</span>
                  </div>
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={answerContent || currentQ.initialCode}
                    onChange={(val) => setAnswerContent(val || '')}
                    options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                  />
                </div>
              ) : (
                <div className="h-full w-full p-4 flex flex-col relative">
                  <textarea
                    className="flex-1 w-full bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/30 text-lg leading-relaxed pb-24"
                    placeholder="Type your answer here, or click the 🎤 mic button to dictate..."
                    value={answerContent}
                    onChange={e => setAnswerContent(e.target.value)}
                  />

                  {/* Interim transcript preview */}
                  {(isRecording || interimTranscript) && (
                    <div className="mt-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary/80 italic">
                      {interimTranscript ? (
                        <span>{interimTranscript}</span>
                      ) : (
                        <span className="animate-pulse">Listening... speak now</span>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <button 
                      onClick={toggleRecording}
                      className={`p-4 rounded-full transition-all flex items-center justify-center gap-2 ${
                        isRecording 
                          ? 'bg-destructive/20 text-destructive ring-2 ring-destructive/50 animate-pulse' 
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                    </button>
                    {isRecording && <span className="text-sm font-medium text-destructive mr-auto ml-4 animate-pulse">🔴 Recording — speak your answer</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-white text-black font-semibold flex items-center gap-2 hover:bg-white/90 transition-all focus:ring-2 focus:ring-white/50"
              >
                {isLastQ ? 'Finish Interview' : 'Submit & Next'}
                {isLastQ ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel: Webcam & Telemetry (Hidden on small screens) */}
      <div className="hidden lg:flex w-80 xl:w-96 border-l border-white/10 bg-black/20 flex-col p-6 space-y-6 shrink-0 relative z-10">
        
        {/* Webcam Pipeline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Video className="w-4 h-4" /> Client-side rPPG Stream
          </div>
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10 shadow-2xl">
             {/* Mirroring video -scale-x-100 */}
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100 opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
             
             {/* Overlay face mesh mock outline for aesthetics */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-32 h-40 border border-white/20 rounded-[40%] dashed-border animate-[spin_10s_linear_infinite]" />
             </div>
          </div>
        </div>

        {/* Telemetry Dashboard */}
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" /> Live Stress Metrics
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-muted-foreground text-xs">Estimated BPM</span>
              <span className={`text-2xl font-bold font-mono ${bpm > 90 ? 'text-yellow-500' : bpm > 105 ? 'text-red-500' : 'text-green-500'}`}>
                {bpm} <span className="text-sm font-medium opacity-50">bpm</span>
              </span>
            </div>
            {/* Mock Graph */}
            <div className="w-full h-12 flex items-end gap-1 opacity-50 pt-2">
               {[...Array(20)].map((_, i) => (
                 <motion.div 
                   key={i}
                   className="flex-1 bg-gradient-to-t from-red-500/20 to-red-500 rounded-t-sm"
                   initial={{ height: '20%' }}
                   animate={{ height: `${Math.max(20, 20 + ((i * 17) % 80))}%` }}
                   transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse', delay: i * 0.1 }}
                 />
               ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Info */}
        <div className="glass rounded-xl p-5 mt-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The AI is continuously evaluating your responses and monitoring your composure using the webcam feed. If elevated stress is detected, the difficulty of the next question will be automatically adjusted.
          </p>
        </div>

      </div>
    </div>
  )
}
