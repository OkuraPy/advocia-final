'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Download,
  Share2,
  Copy,
  Eye,
  Upload,
  PenTool,
  Brain,
  Sparkles,
  FolderOpen,
  ChevronRight,
  Grid,
  List,
  Star,
  Tag,
  User,
  Building,
  Scale,
  Briefcase,
  ScrollText,
  FileSignature,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Tipos de documentos
type DocumentType = 'petition' | 'contract' | 'appeal' | 'brief' | 'motion' | 'other'
type DocumentStatus = 'draft' | 'reviewing' | 'completed' | 'archived'

interface Document {
  id: string
  title: string
  type: DocumentType
  status: DocumentStatus
  createdAt: Date
  updatedAt: Date
  client?: string
  case?: string
  wordCount: number
  aiEdits: number
  starred: boolean
  tags: string[]
  preview: string
}

// Dados mockados
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Petição Inicial - Ação Trabalhista Silva vs ABC Ltda',
    type: 'petition',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    client: 'João Silva',
    case: '0001234-56.2024',
    wordCount: 2543,
    aiEdits: 12,
    starred: true,
    tags: ['trabalhista', 'urgente'],
    preview: 'EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO DA 15ª VARA DO TRABALHO DE SÃO PAULO...'
  },
  {
    id: '2',
    title: 'Contestação - Processo 0005678-90.2024',
    type: 'brief',
    status: 'reviewing',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    client: 'Maria Santos',
    case: '0005678-90.2024',
    wordCount: 1876,
    aiEdits: 8,
    starred: false,
    tags: ['cível', 'revisão'],
    preview: 'MM. Juiz, a parte ré vem, respeitosamente, apresentar sua contestação...'
  },
  {
    id: '3',
    title: 'Recurso de Apelação - Caso Oliveira',
    type: 'appeal',
    status: 'draft',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    client: 'Pedro Oliveira',
    case: '0009876-54.2023',
    wordCount: 3210,
    aiEdits: 15,
    starred: true,
    tags: ['recurso', 'prioridade'],
    preview: 'EGRÉGIO TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO...'
  }
]

export default function EditorIAPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | DocumentType>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | DocumentStatus>('all')
  const [showOnlyStarred, setShowOnlyStarred] = useState(false)

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    if (showOnlyStarred && !doc.starred) return false
    if (filterType !== 'all' && doc.type !== filterType) return false
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return doc.title.toLowerCase().includes(query) ||
             doc.client?.toLowerCase().includes(query) ||
             doc.tags.some(tag => tag.toLowerCase().includes(query))
    }
    return true
  })

  // Stats
  const stats = {
    total: documents.length,
    drafts: documents.filter(d => d.status === 'draft').length,
    completed: documents.filter(d => d.status === 'completed').length,
    aiEdits: documents.reduce((sum, d) => sum + d.aiEdits, 0)
  }

  const handleCreateNew = () => {
    // Criar novo documento e redirecionar para o editor
    const newId = 'doc-' + Date.now()
    
    // Salvar dados do novo documento no localStorage
    const newDocumentData = {
      id: newId,
      template: { name: 'Novo Documento' },
      description: 'Documento criado no Editor IA',
      jurisprudences: [],
      formData: {
        clientName: '',
        clientCPF: '',
        clientAddress: '',
        defendantName: '',
        defendantCNPJ: '',
        defendantAddress: ''
      },
      createdAt: new Date().toISOString(),
      content: '<h1>Novo Documento</h1>\n<p>Comece a editar seu documento aqui...</p>'
    }
    localStorage.setItem('currentPetition', JSON.stringify(newDocumentData))
    
    router.push(`/editor-ia/editor/${newId}`)
  }

  const handleOpenDocument = (id: string) => {
    // Encontrar o documento pelo ID
    const document = documents.find(doc => doc.id === id)
    if (document) {
      // Salvar dados do documento no localStorage
      let content = ''
      
      // Gerar conteúdo baseado no tipo do documento
      if (document.type === 'petition') {
        content = `
          <h1>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO</h1>
          
          <p><strong>${document.client || 'RECLAMANTE'}</strong>, já qualificado nos autos, vem respeitosamente à presença de Vossa Excelência expor e requerer o que segue:</p>
          
          <h2>DOS FATOS</h2>
          
          <p>${document.preview}</p>
          
          <p>O reclamante trabalhou para a reclamada no período compreendido entre janeiro de 2020 e dezembro de 2023, exercendo a função de analista de sistemas.</p>
          
          <h2>DO DIREITO</h2>
          
          <p>Conforme estabelece a CLT em seus artigos pertinentes, são devidos ao trabalhador todos os direitos trabalhistas quando comprovado o vínculo empregatício.</p>
          
          <h2>DOS PEDIDOS</h2>
          
          <p>Diante do exposto, requer:</p>
          <p>a) O pagamento das verbas rescisórias;</p>
          <p>b) O pagamento de horas extras;</p>
          <p>c) A condenação em honorários advocatícios.</p>
        `
      } else if (document.type === 'brief') {
        content = `
          <h1>CONTESTAÇÃO</h1>
          
          <p><strong>Processo nº ${document.case || '0000000-00.0000'}</strong></p>
          
          <p>${document.preview}</p>
          
          <h2>DOS FATOS</h2>
          
          <p>A parte ré contesta os fatos alegados pelo autor, apresentando sua versão dos acontecimentos.</p>
          
          <h2>DAS PRELIMINARES</h2>
          
          <p>Preliminarmente, arguimos a incompetência territorial deste juízo para processar e julgar a presente demanda.</p>
          
          <h2>DO MÉRITO</h2>
          
          <p>No mérito, demonstraremos que os fatos narrados pelo autor não correspondem à realidade.</p>
        `
      } else if (document.type === 'appeal') {
        content = `
          <h1>RECURSO DE APELAÇÃO</h1>
          
          <p><strong>EGRÉGIO TRIBUNAL</strong></p>
          
          <p>${document.preview}</p>
          
          <h2>DAS RAZÕES RECURSAIS</h2>
          
          <p>O recorrente, inconformado com a r. sentença proferida, vem interpor o presente recurso de apelação.</p>
          
          <h2>DOS FUNDAMENTOS</h2>
          
          <p>A decisão recorrida merece reforma pelos fundamentos que passamos a expor.</p>
          
          <h2>DO PEDIDO</h2>
          
          <p>Ante o exposto, requer o conhecimento e provimento do presente recurso.</p>
        `
      } else {
        content = `<h1>${document.title}</h1>\n<p>${document.preview}</p>`
      }
      
      const petitionData = {
        id: document.id,
        template: { name: document.title },
        description: document.preview,
        jurisprudences: [],
        formData: {
          clientName: document.client || '',
          clientCPF: '',
          clientAddress: '',
          defendantName: '',
          defendantCNPJ: '',
          defendantAddress: ''
        },
        createdAt: document.createdAt.toISOString(),
        content: content.trim()
      }
      localStorage.setItem('currentPetition', JSON.stringify(petitionData))
    }
    router.push(`/editor-ia/editor/${id}`)
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      setDocuments(prev => prev.filter(d => d.id !== id))
    }
  }

  const toggleStar = (id: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, starred: !doc.starred } : doc
    ))
  }

  const getTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'petition': return ScrollText
      case 'contract': return FileSignature
      case 'appeal': return Scale
      case 'brief': return FileText
      case 'motion': return Briefcase
      default: return FileText
    }
  }

  const getTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'petition': return 'Petição'
      case 'contract': return 'Contrato'
      case 'appeal': return 'Recurso'
      case 'brief': return 'Contestação'
      case 'motion': return 'Moção'
      default: return 'Outro'
    }
  }

  const getStatusConfig = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Rascunho', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: Edit3 }
      case 'reviewing':
        return { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Eye }
      case 'completed':
        return { label: 'Concluído', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle }
      case 'archived':
        return { label: 'Arquivado', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icon: FolderOpen }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              Editor IA
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Crie e edite documentos jurídicos com inteligência artificial
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Documento
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total de Documentos</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Edit3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.drafts}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Em Rascunho</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Concluídos</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiEdits}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Edições com IA</p>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="petition">Petições</option>
              <option value="brief">Contestações</option>
              <option value="appeal">Recursos</option>
              <option value="contract">Contratos</option>
              <option value="motion">Moções</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="reviewing">Em Revisão</option>
              <option value="completed">Concluído</option>
              <option value="archived">Arquivado</option>
            </select>

            <button
              onClick={() => setShowOnlyStarred(!showOnlyStarred)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                showOnlyStarred
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <Star className={cn("h-4 w-4", showOnlyStarred && "fill-current")} />
            </button>

            <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'grid'
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-all",
                  viewMode === 'list'
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Documents Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredDocuments.map((doc, index) => {
              const TypeIcon = getTypeIcon(doc.type)
              const statusConfig = getStatusConfig(doc.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleOpenDocument(doc.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:shadow-lg transition-all">
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTypeLabel(doc.type)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                              statusConfig.color
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(doc.id)
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          doc.starred
                            ? "text-amber-500"
                            : "text-gray-300 hover:text-amber-500"
                        )}
                      >
                        <Star className={cn("h-4 w-4", doc.starred && "fill-current")} />
                      </button>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {doc.preview}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {doc.client && (
                        <>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.client}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {doc.updatedAt.toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{doc.wordCount} palavras</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {doc.aiEdits} edições IA
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDocument(doc.id)
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Implementar compartilhamento
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {filteredDocuments.map((doc, index) => {
              const TypeIcon = getTypeIcon(doc.type)
              const statusConfig = getStatusConfig(doc.status)
              const StatusIcon = statusConfig.icon
              
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleOpenDocument(doc.id)}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:shadow-lg transition-all">
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {doc.title}
                        </h3>
                        {doc.starred && (
                          <Star className="h-4 w-4 text-amber-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {doc.client && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.client}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.updatedAt.toLocaleDateString('pt-BR')}
                        </span>
                        <span>{doc.wordCount} palavras</span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {doc.aiEdits} edições IA
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5",
                        statusConfig.color
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDocument(doc.id)
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDocument(doc.id)
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro documento'}
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar Novo Documento
          </button>
        </motion.div>
      )}

      {/* Floating Action Button for Upload */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-2xl flex items-center justify-center group"
        title="Fazer upload de documento"
      >
        <Upload className="h-6 w-6" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Upload de Documento
        </span>
      </motion.button>
    </div>
  )
}