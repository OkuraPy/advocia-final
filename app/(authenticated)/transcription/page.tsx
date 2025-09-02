'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Mic,
  FileAudio,
  Upload,
  Clock,
  Play,
  Pause,
  Search,
  Filter,
  Calendar,
  Plus,
  Check,
  Loader2,
  MoreVertical,
  Download,
  Trash2,
  Eye
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { RecordModal } from '@/components/transcription/RecordModal'
import { transcriptionService, type TranscriptionRecord } from '@/lib/services/transcription.service'

// Format duration from seconds to mm:ss
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export default function TranscriptionPage() {
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [transcriptions, setTranscriptions] = useState<TranscriptionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showActions, setShowActions] = useState<string | null>(null)

  // Carregar transcrições ao montar o componente
  useEffect(() => {
    loadTranscriptions()
  }, [])

  const loadTranscriptions = async () => {
    try {
      setLoading(true)
      const data = await transcriptionService.getTranscriptions()
      setTranscriptions(data)
    } catch (error) {
      console.error('Error loading transcriptions:', error)
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar as transcrições',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter transcriptions
  const filteredTranscriptions = transcriptions.filter(trans => {
    const matchesSearch = trans.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trans.case_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && trans.status === 'completed') ||
                         (filterStatus === 'processing' && trans.status === 'processing')
    const matchesCategory = filterCategory === 'all' || trans.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Stats
  const stats = {
    total: transcriptions.length,
    completed: transcriptions.filter(t => t.status === 'completed').length,
    processing: transcriptions.filter(t => t.status === 'processing').length,
    totalDuration: transcriptions.reduce((acc, t) => acc + (t.duration_seconds || 0), 0)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Deseja remover esta transcrição?')) {
      try {
        await transcriptionService.deleteTranscription(id)
        setTranscriptions(prev => prev.filter(t => t.id !== id))
        addNotification({
          title: 'Sucesso',
          message: 'Transcrição removida com sucesso',
          type: 'success'
        })
      } catch (error) {
        addNotification({
          title: 'Erro',
          message: 'Não foi possível remover a transcrição',
          type: 'error'
        })
      }
    }
  }

  const handleNewTranscription = () => {
    loadTranscriptions()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Transcrições de Áudio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transcreva e analise gravações com IA
          </p>
        </div>
        <button
          onClick={() => setShowRecordModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Transcrição
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total de Áudios
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Concluídos
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.completed}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Processando
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.processing}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Duração Total
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {Math.floor(stats.totalDuration / 60)}m
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título ou processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
            >
              <option value="all">Todos Status</option>
              <option value="completed">Concluídos</option>
              <option value="processing">Processando</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
            >
              <option value="all">Todas Categorias</option>
              <option value="Depoimento">Depoimento</option>
              <option value="Reunião">Reunião</option>
              <option value="Audiência">Audiência</option>
              <option value="Entrevista">Entrevista</option>
              <option value="Anotação">Anotação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transcriptions List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Carregando transcrições...
            </div>
          </div>
        ) : filteredTranscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <FileAudio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Nenhuma transcrição encontrada com os filtros aplicados'
                : 'Nenhuma transcrição ainda'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
              <button
                onClick={() => setShowRecordModal(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Criar Primeira Transcrição
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTranscriptions.map((transcription, index) => (
              <motion.div
                key={transcription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/transcription/${transcription.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Reference */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium text-slate-900">
                        {transcription.title}
                      </h3>
                      {transcription.status === 'completed' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                          Concluído
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processando
                        </span>
                      )}
                      {transcription.category && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                          {transcription.category}
                        </span>
                      )}
                    </div>

                    {/* Reference and Details */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {transcription.case_reference && (
                        <span>{transcription.case_reference}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(transcription.duration_seconds)}
                      </div>
                      {transcription.audio_file_size && (
                        <span>{formatFileSize(transcription.audio_file_size)}</span>
                      )}
                      {transcription.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transcription.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {/* Summary Preview */}
                    {transcription.summary && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {transcription.summary}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="relative ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowActions(showActions === transcription.id ? null : (transcription.id || null))
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>

                    <AnimatePresence>
                      {showActions === transcription.id && transcription.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/transcription/${transcription.id}`)
                              setShowActions(null)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </button>
                          {transcription.status === 'completed' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                // Download logic here
                                setShowActions(null)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Baixar
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              if (transcription.id) {
                                handleDelete(transcription.id, e)
                                setShowActions(null)
                              }
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Record Modal */}
      {showRecordModal && (
        <RecordModal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          onComplete={handleNewTranscription}
        />
      )}
    </div>
  )
}