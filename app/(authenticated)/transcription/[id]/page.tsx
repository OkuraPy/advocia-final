'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  ArrowRight,
  FileAudio,
  Download,
  Copy,
  Brain,
  Calendar,
  Clock,
  Mic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Languages,
  Folder,
  CheckCircle,
  Loader2,
  Edit,
  Save,
  X,
  MessageSquare,
  Lightbulb,
  Scale,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { transcriptionService, type TranscriptionRecord } from '@/lib/services/transcription.service'
import { aiSummaryService, type AISummaryResponse } from '@/lib/services/ai-summary.service'

// Extended interface to include AI insights
interface ExtendedTranscription extends TranscriptionRecord {
  segments?: Array<{
    start: number
    end: number
    text: string
    confidence: number
  }>
  aiInsights?: AISummaryResponse & {
    synthesis?: string
  }
}

// Format time from seconds
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

// Parse transcript with timestamps
function parseTranscriptSegments(transcript: string): Array<{ time: string; text: string }> {
  const lines = transcript.split('\n').filter(line => line.trim())
  const segments: Array<{ time: string; text: string }> = []
  
  for (const line of lines) {
    const match = line.match(/^\[(\d{2}:\d{2})\]\s*(.+)$/)
    if (match) {
      segments.push({
        time: match[1],
        text: match[2].trim()
      })
    } else if (segments.length > 0 && line.trim()) {
      // Append to previous segment if no timestamp
      segments[segments.length - 1].text += ' ' + line.trim()
    }
  }
  
  return segments
}

// Audio Player Component
const AudioPlayer = ({ transcription }: { transcription: ExtendedTranscription }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio || duration <= 0) return

    const time = Number(e.target.value)
    if (!isNaN(time) && isFinite(time)) {
      audio.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const vol = Number(e.target.value)
    audio.volume = vol / 100
    setVolume(vol)
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime += seconds
  }

  const handleSpeedChange = () => {
    const audio = audioRef.current
    if (!audio) return
    
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newSpeed = speeds[nextIndex]
    
    audio.playbackRate = newSpeed
    setPlaybackRate(newSpeed)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar || duration <= 0) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percentage * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleBuffer = () => setIsBuffering(false)
    const handleWaiting = () => setIsBuffering(true)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('loadeddata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleBuffer)
    audio.addEventListener('waiting', handleWaiting)

    // Try to get duration if already loaded
    if (audio.readyState >= 2) {
      updateDuration()
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('loadeddata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleBuffer)
      audio.removeEventListener('waiting', handleWaiting)
    }
  }, [])

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <audio 
        ref={audioRef} 
        src={transcription.audio_file_url || "/mock-audio.mp3"} 
        preload="metadata"
      />
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative h-2 bg-slate-200 rounded-full cursor-pointer group"
        >
          <div 
            className="absolute h-full bg-slate-900 rounded-full transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rounded-full shadow transition-all opacity-0 group-hover:opacity-100"
            style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            {isBuffering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          
          {/* Skip buttons */}
          <button
            onClick={() => skip(-10)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <SkipBack className="h-4 w-4 text-slate-600" />
          </button>
          
          <button
            onClick={() => skip(10)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <SkipForward className="h-4 w-4 text-slate-600" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-slate-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-slate-600" />
              )}
            </button>
            
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0f172a ${volume}%, #e2e8f0 ${volume}%)`
              }}
            />
          </div>
        </div>

        {/* Speed Control */}
        <button
          onClick={handleSpeedChange}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  )
}

export default function TranscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [transcription, setTranscription] = useState<ExtendedTranscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTranscript, setEditedTranscript] = useState('')
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary'>('transcript')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [generationStep, setGenerationStep] = useState<'idle' | 'analyzing' | 'extracting' | 'generating' | 'finalizing'>('idle')
  const [generationProgress, setGenerationProgress] = useState(0)

  useEffect(() => {
    const loadTranscription = async () => {
      try {
        setLoading(true)
        const data = await transcriptionService.getTranscription(params.id as string)
        
        if (data) {
          setTranscription(data)
          if (data.transcript) {
            setEditedTranscript(data.transcript)
          }
          
          // Check if summary exists
          if (data.status === 'completed' && data.id) {
            const summary = await aiSummaryService.getSummary(data.id)
            if (summary) {
              setTranscription(prev => prev ? {
                ...prev,
                aiInsights: {
                  synthesis: summary.synthesis,
                  summary: summary.summary,
                  keyPoints: summary.key_points,
                  actionItems: summary.action_items,
                  legalReferences: summary.legal_references
                }
              } : null)
            }
          }
        }
      } catch (error) {
        console.error('Error loading transcription:', error)
        addNotification({
          title: 'Erro',
          message: 'Não foi possível carregar a transcrição',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    loadTranscription()
  }, [params.id, addNotification])

  const handleSaveTranscript = async () => {
    if (transcription && transcription.id) {
      try {
        const updated = await transcriptionService.updateTranscription(transcription.id, {
          transcript: editedTranscript
        })
        
        if (updated) {
          const extendedData: ExtendedTranscription = {
            ...updated,
            aiInsights: transcription.aiInsights
          }
          setTranscription(extendedData)
          setIsEditing(false)
          addNotification({
            title: 'Transcrição Salva',
            message: 'As alterações foram salvas com sucesso',
            type: 'success'
          })
        }
      } catch (error) {
        console.error('Error saving transcription:', error)
        addNotification({
          title: 'Erro',
          message: 'Não foi possível salvar as alterações',
          type: 'error'
        })
      }
    }
  }

  const handleCopyTranscript = () => {
    if (activeTab === 'transcript' && transcription?.transcript) {
      navigator.clipboard.writeText(transcription.transcript)
      addNotification({
        title: 'Texto Copiado',
        message: 'A transcrição foi copiada para a área de transferência',
        type: 'success'
      })
    } else if (activeTab === 'summary' && transcription?.aiInsights?.summary) {
      const summaryText = `RESUMO EXECUTIVO\n\n${transcription.aiInsights.summary}\n\nPONTOS PRINCIPAIS:\n${transcription.aiInsights.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      navigator.clipboard.writeText(summaryText)
      addNotification({
        title: 'Resumo Copiado',
        message: 'O resumo foi copiado para a área de transferência',
        type: 'success'
      })
    }
  }

  const handleDownloadAudio = () => {
    if (transcription?.audio_file_url) {
      const link = document.createElement('a')
      link.href = transcription.audio_file_url
      link.download = transcription.audio_file_name || 'audio.mp3'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      addNotification({
        title: 'Download Iniciado',
        message: 'O download do áudio foi iniciado',
        type: 'success'
      })
    }
  }

  const handleGenerateSummary = async () => {
    if (!transcription?.id || !transcription?.transcript || !transcription?.category) return

    setIsGeneratingSummary(true)
    setGenerationStep('analyzing')
    setGenerationProgress(0)
    
    try {
      // Start progress animation with smoother intervals
      let actualProgress = 0
      let currentStep = 0
      
      // Smooth progress animation (total ~40 seconds minimum)
      const smoothProgressInterval = setInterval(() => {
        // Progress increments more slowly and evenly
        if (actualProgress < 20) {
          actualProgress += 2  // 0-20% in first 10 seconds (analyzing)
        } else if (actualProgress < 40) {
          actualProgress += 2  // 20-40% in next 10 seconds (extracting)
        } else if (actualProgress < 60) {
          actualProgress += 2  // 40-60% in next 10 seconds (generating)
        } else if (actualProgress < 85) {
          actualProgress += 2.5  // 60-85% in next 10 seconds (finalizing)
        } else if (actualProgress < 90) {
          actualProgress += 0.5  // 85-90% slowly while waiting for real completion
        }
        setGenerationProgress(Math.min(actualProgress, 90))
      }, 1000)
      
      // Step transitions with better timing
      setTimeout(() => setGenerationStep('analyzing'), 0)
      setTimeout(() => setGenerationStep('extracting'), 10000)  // After 10 seconds
      setTimeout(() => setGenerationStep('generating'), 20000)  // After 20 seconds
      setTimeout(() => setGenerationStep('finalizing'), 30000)  // After 30 seconds
      
      const success = await aiSummaryService.processTranscription(
        transcription.id,
        transcription.transcript,
        transcription.category
      )
      
      clearInterval(smoothProgressInterval)
      setGenerationProgress(100)

      if (success) {
        // Reload summary
        const summary = await aiSummaryService.getSummary(transcription.id)
        if (summary) {
          setTranscription(prev => prev ? {
            ...prev,
            aiInsights: {
              synthesis: summary.synthesis,
              summary: summary.summary,
              keyPoints: summary.key_points,
              actionItems: summary.action_items,
              legalReferences: summary.legal_references
            }
          } : null)
        }
        
        addNotification({
          title: 'Resumo Gerado',
          message: 'O resumo foi gerado com sucesso pela IA',
          type: 'success'
        })
      } else {
        addNotification({
          title: 'Erro ao Gerar Resumo',
          message: 'Não foi possível gerar o resumo. Tente novamente.',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      addNotification({
        title: 'Erro',
        message: 'Ocorreu um erro ao gerar o resumo',
        type: 'error'
      })
    } finally {
      setIsGeneratingSummary(false)
      setGenerationStep('idle')
      setGenerationProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando transcrição...</p>
        </div>
      </div>
    )
  }

  if (!transcription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Transcrição não encontrada</h2>
          <button 
            onClick={() => router.push('/transcription')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Voltar para Transcrições
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/transcription')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                {transcription.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(transcription.created_at || '').toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor((transcription.duration_seconds || 0) / 60)}min
                </div>
                <div className="flex items-center gap-1">
                  <FileAudio className="h-4 w-4" />
                  {formatFileSize(transcription.audio_file_size)}
                </div>
                <div className="flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  {transcription.language || 'pt-BR'}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                  {transcription.category}
                </span>
                {transcription.case_reference && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                    {transcription.case_reference}
                  </span>
                )}
                {transcription.confidence_score && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    {transcription.confidence_score}% precisão
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            onClick={handleDownloadAudio}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar Áudio
          </button>
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer transcription={transcription} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript with Tabs */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {/* Tabs Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={cn(
                      "text-sm font-medium pb-2 border-b-2 transition-colors",
                      activeTab === 'transcript'
                        ? "text-slate-900 border-slate-900"
                        : "text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    Transcrição
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={cn(
                      "text-sm font-medium pb-2 border-b-2 transition-colors",
                      activeTab === 'summary'
                        ? "text-slate-900 border-slate-900"
                        : "text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    Resumo
                  </button>
                </div>
                <div className="flex gap-2">
                  {activeTab === 'transcript' && isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveTranscript}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Salvar
                      </button>
                    </>
                  ) : activeTab === 'transcript' ? (
                    <>
                      <button 
                        onClick={handleCopyTranscript}
                        className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {transcription.status === 'processing' ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600">Processando transcrição...</p>
                </div>
              ) : activeTab === 'transcript' ? (
                isEditing ? (
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    className="w-full h-96 p-4 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                ) : (
                  <div className="space-y-4">
                    {transcription.transcript && parseTranscriptSegments(transcription.transcript).length > 0 ? (
                      parseTranscriptSegments(transcription.transcript).map((segment, index) => (
                        <div key={index} className="flex gap-4 group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                          <div className="flex-shrink-0 w-16">
                            <span className="text-xs font-mono text-slate-500">
                              {segment.time}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              {segment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                        {transcription.transcript || 'Transcrição não disponível'}
                      </pre>
                    )}
                  </div>
                )
              ) : (
                // Summary Tab
                <div>
                  {transcription.aiInsights ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium text-slate-900 mb-3">Resumo Executivo</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {transcription.aiInsights.summary}
                        </p>
                      </div>
                      
                      <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-base font-medium text-slate-900 mb-3">Pontos Principais</h3>
                        <div className="space-y-2">
                          {transcription.aiInsights.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <p className="text-sm text-slate-700">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      {isGeneratingSummary ? (
                        <div>
                          <Brain className="h-12 w-12 text-slate-400 animate-pulse mx-auto mb-4" />
                          <h3 className="text-base font-medium text-slate-900 mb-2">
                            Gerando Resumo com IA
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">
                            {generationStep === 'analyzing' && 'Analisando o conteúdo...'}
                            {generationStep === 'extracting' && 'Extraindo pontos principais...'}
                            {generationStep === 'generating' && 'Gerando resumo...'}
                            {generationStep === 'finalizing' && 'Finalizando...'}
                          </p>
                          <div className="w-full max-w-xs mx-auto">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-slate-900"
                                initial={{ width: '0%' }}
                                animate={{ width: `${generationProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{generationProgress}%</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-base font-medium text-slate-900 mb-2">
                            Gerar Resumo com IA
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">
                            Nossa IA analisará a transcrição e criará um resumo detalhado
                          </p>
                          <button
                            onClick={handleGenerateSummary}
                            disabled={transcription.status !== 'completed'}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Gerar Resumo
                          </button>
                          {transcription.status !== 'completed' && (
                            <p className="text-xs text-amber-600 mt-3">
                              O resumo só pode ser gerado após a conclusão da transcrição
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div>
          <div className="bg-white border border-slate-200 rounded-lg">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-900">Insights da IA</h2>
            </div>
            
            <div className="p-6">
              {transcription.status === 'completed' && transcription.aiInsights ? (
                <div className="space-y-6">
                  {/* Synthesis */}
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Síntese
                    </h3>
                    <p className="text-sm text-slate-600">
                      {transcription.aiInsights.synthesis || transcription.aiInsights.summary.substring(0, 150) + '...'}
                    </p>
                  </div>
                  
                  {/* Action Items */}
                  {transcription.aiInsights.actionItems && transcription.aiInsights.actionItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Próximos Passos
                      </h3>
                      <ul className="space-y-2">
                        {transcription.aiInsights.actionItems.slice(0, 3).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span className="text-sm text-slate-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Legal References */}
                  {transcription.aiInsights.legalReferences && transcription.aiInsights.legalReferences.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Base Legal
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {transcription.aiInsights.legalReferences.map((ref, index) => (
                          <span key={index} className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                            {ref.split(' - ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    Análise com IA será exibida aqui após o processamento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}