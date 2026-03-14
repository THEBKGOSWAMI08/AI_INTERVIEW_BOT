'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mic, Play, AlertCircle, CheckCircle2, VideoOff, MicOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SetupClient({ interviewId }: { interviewId: string }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [micStatus, setMicStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [audioLevel, setAudioLevel] = useState(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setStream(mediaStream)
      setCameraStatus('success')
      setMicStatus('success')

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      // Setup audio level meter
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(mediaStream)
      source.connect(analyserRef.current)
      
      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const sum = dataArray.reduce((acc, val) => acc + val, 0)
        const average = sum / bufferLength
        
        // Normalize 0-100 for progress bar
        const level = Math.min(100, Math.round((average / 255) * 100 * 2))
        setAudioLevel(level)
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
      
      updateAudioLevel()

    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
          setCameraStatus('error')
          setMicStatus('error')
        }
      }
    }
  }

  useEffect(() => {
    // Wrap in void to avoid returning promise from async function
    void requestPermissions()

    return () => {
      // Cleanup
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, []) // eslint-disable-line

  const handleFixPermissions = () => {
    setCameraStatus('pending')
    setMicStatus('pending')
    requestPermissions()
  }

  const allClear = cameraStatus === 'success' && micStatus === 'success'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Video Preview */}
      <div className="space-y-4">
        <div className="relative aspect-video glass-card rounded-2xl overflow-hidden flex items-center justify-center bg-black">
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover -scale-x-100" // mirror the video
            />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground gap-3">
              <VideoOff className="w-10 h-10" />
              <p className="text-sm font-medium">Camera preview not available</p>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          {allClear && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-green-400 border border-green-500/20 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          )}
        </div>

        {/* Audio Meter */}
        <div className="glass p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2 text-muted-foreground"><Mic className="w-4 h-4" /> Microphone Level</span>
            <span className={audioLevel > 5 ? "text-green-400" : "text-muted-foreground"}>{audioLevel}%</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              animate={{ width: `${audioLevel}%` }}
              transition={{ type: "tween", duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="flex flex-col">
        <div className="glass-card p-6 md:p-8 space-y-6 flex-1">
          <h3 className="text-xl font-bold">Permissions Checklist</h3>
          
          <div className="space-y-4">
            {/* Camera Check */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className={`p-3 rounded-lg ${cameraStatus === 'success' ? 'bg-green-500/20 text-green-400' : cameraStatus === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                {cameraStatus === 'success' ? <Camera className="w-5 h-5" /> : cameraStatus === 'error' ? <VideoOff className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Camera Access</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Required for rPPG stress detection</p>
              </div>
              {cameraStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {cameraStatus === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
            </div>

            {/* Mic Check */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className={`p-3 rounded-lg ${micStatus === 'success' ? 'bg-green-500/20 text-green-400' : micStatus === 'error' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                {micStatus === 'success' ? <Mic className="w-5 h-5" /> : micStatus === 'error' ? <MicOff className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">Microphone Access</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Required for verbal answers</p>
              </div>
              {micStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {micStatus === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
            </div>
          </div>

          {!allClear && (cameraStatus === 'error' || micStatus === 'error') && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mt-4">
              <p className="text-sm text-destructive">
                Please allow camera and microphone access in your browser settings, then click below to re-check.
              </p>
              <button 
                onClick={handleFixPermissions}
                className="mt-3 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg text-sm font-medium transition-colors"
               >
                 Re-check Permissions
              </button>
            </div>
          )}
        </div>

        <motion.button
          whileHover={allClear ? { scale: 1.01 } : {}}
          whileTap={allClear ? { scale: 0.99 } : {}}
          disabled={!allClear}
          onClick={() => router.push(`/interview/${interviewId}`)}
          className={`w-full mt-6 font-semibold rounded-xl px-4 py-4 text-base flex items-center justify-center gap-2 transition-all ${
            allClear 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'bg-white/10 text-muted-foreground cursor-not-allowed'
          }`}
        >
          {allClear ? (
            <>
              Enter Interview Room
              <Play className="w-5 h-5 fill-current" />
            </>
          ) : (
            'Waiting for Permissions...'
          )}
        </motion.button>
      </div>
    </div>
  )
}
