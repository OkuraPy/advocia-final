'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  FileSearch,
  Sparkles,
  FolderOpen,
  FileCheck,
  Loader2,
  Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { UploadModal } from '@/components/documents/UploadModal'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: Date
  status: 'processing' | 'analyzed' | 'pending'
  client?: string
  case?: string
  aiSummary?: string
  aiInsights?: {
    summary: string
    keyPoints: string[]
    risks?: string[]
    recommendations?: string[]
  }
}

export default function DocumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addNotification } = useAppStore()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    // Check if we should open upload modal
    if (searchParams.get('action') === 'upload') {
      setShowUploadModal(true)
    }
    loadDocuments()
  }, [searchParams])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to load documents')
      }
      
      const data = await response.json()
      
      // Transform API data to component format
      const transformedDocs = data.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.title || doc.file_name, // Usa title se disponível, senão usa file_name
        type: doc.document_type || 'Outros',
        size: `${(doc.file_size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date(doc.created_at),
        status: doc.status,
        client: doc.client?.name,
        case: doc.case_reference,
        aiSummary: doc.ai_summary,
        aiInsights: doc.ai_key_points || doc.ai_recommendations || doc.ai_risks ? {
          summary: doc.ai_summary || '',
          keyPoints: doc.ai_key_points || [],
          risks: doc.ai_risks || [],
          recommendations: doc.ai_recommendations || []
        } : undefined
      }))
      
      setDocuments(transformedDocs)
      setLoading(false)
    } catch (error) {
      console.error('Error loading documents:', error)
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar os documentos',
        type: 'error'
      })
      setLoading(false)
    }
  }

  const handleUploadComplete = (newDoc: any) => {
    addNotification({
      title: 'Upload Concluído',
      message: `${newDoc.name} foi enviado com sucesso`,
      type: 'success'
    })
    
    // Reload documents list
    loadDocuments()
    
    // TODO: If AI analysis is enabled, we'll need to implement the analysis endpoint
    if (newDoc.aiAnalysis) {
      addNotification({
        title: 'Análise com IA',
        message: 'A análise do documento será realizada em breve',
        type: 'info'
      })
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.case?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: documents.length,
    analyzed: documents.filter(d => d.status === 'analyzed').length,
    processing: documents.filter(d => d.status === 'processing').length,
    thisMonth: documents.filter(d => {
      const date = new Date(d.uploadedAt)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length
  }

  const documentTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'Contrato', label: 'Contratos' },
    { value: 'Petição', label: 'Petições' },
    { value: 'Procuração', label: 'Procurações' },
    { value: 'Outros', label: 'Outros' }
  ]

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Deseja remover este documento?')) {
      try {
        const response = await fetch(`/api/documents/${docId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        
        if (response.ok) {
          setDocuments(prev => prev.filter(d => d.id !== docId))
          addNotification({
            title: 'Sucesso',
            message: 'Documento removido com sucesso',
            type: 'success'
          })
        }
      } catch (error) {
        addNotification({
          title: 'Erro',
          message: 'Não foi possível remover o documento',
          type: 'error'
        })
      }
    }
  }

  const handleDownload = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement download
    addNotification({
      title: 'Download',
      message: 'Funcionalidade em desenvolvimento',
      type: 'info'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Documentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e analise documentos jurídicos com IA
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload de Documento
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total de Documentos
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <FolderOpen className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Analisados com IA
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {stats.analyzed}
              </p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Em Processamento
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {stats.processing}
              </p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Este Mês
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {stats.thisMonth}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-medium text-slate-900">
                Biblioteca de Documentos
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {filteredDocuments.length} documentos encontrados
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto" />
                  <p className="mt-4 text-sm text-slate-600">Carregando documentos...</p>
                </div>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Nenhum documento encontrado
              </p>
              {documents.length === 0 && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Fazer Upload do Primeiro Documento
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
                          {doc.name}
                        </h3>
                        
                        <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                          </span>
                          {doc.client && (
                            <>
                              <span>•</span>
                              <span>{doc.client}</span>
                            </>
                          )}
                        </div>
                        
                        {doc.aiSummary && (
                          <div className="mt-2 flex items-start gap-2">
                            <Sparkles className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-600 italic line-clamp-2">
                              {doc.status === 'processing' ? (
                                <span className="animate-pulse">Analisando documento com IA...</span>
                              ) : (
                                doc.aiSummary
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {doc.status === 'analyzed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Analisado
                        </span>
                      )}
                      {doc.status === 'processing' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Clock className="h-3 w-3 mr-1 animate-spin" />
                          Processando
                        </span>
                      )}
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/documents/${doc.id}`)
                          }}
                          className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(doc, e)}
                          className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                        >
                          <Download className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal - Mantido sem alterações */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  )
}