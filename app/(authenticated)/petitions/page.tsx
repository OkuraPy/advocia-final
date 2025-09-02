'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Star,
  FileText,
  Clock,
  Calendar,
  MoreVertical,
  Edit3,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  TrendingUp,
  Sparkles,
  Upload,
  Briefcase,
  Scale,
  Shield,
  Users,
  Gavel,
  Check,
  Eye,
  Trash2,
  Download,
  ChevronDown,
  BarChart3,
  FolderOpen,
  Archive,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const PetitionWizardV2 = dynamic(() => import('@/components/petitions/PetitionWizardV2'), {
  ssr: false
})

interface Petition {
  id: string
  title: string
  type: string
  status: 'draft' | 'in_progress' | 'review' | 'completed'
  date: Date
  client?: string
  isFavorite: boolean
}

const mockPetitions: Petition[] = [
  {
    id: '1',
    title: 'Petição Inicial - Ação de Cobrança',
    type: 'Petição Inicial',
    status: 'completed',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    client: 'João Silva',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Contestação - Processo 0001234-56.2024',
    type: 'Contestação',
    status: 'in_progress',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    client: 'Maria Santos',
    isFavorite: false
  },
  {
    id: '3',
    title: 'Recurso de Apelação - Caso Oliveira',
    type: 'Apelação',
    status: 'review',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    client: 'Pedro Oliveira',
    isFavorite: true
  },
  {
    id: '4',
    title: 'Embargos de Declaração',
    type: 'Embargos',
    status: 'draft',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    client: 'Ana Costa',
    isFavorite: false
  },
  {
    id: '5',
    title: 'Habeas Corpus - Urgente',
    type: 'Habeas Corpus',
    status: 'completed',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    client: 'Carlos Mendes',
    isFavorite: false
  }
]

const popularTemplates = [
  { name: 'Petição Inicial', icon: FileText, color: 'blue' },
  { name: 'Contestação', icon: FileText, color: 'purple' },
  { name: 'Recurso', icon: FileText, color: 'green' }
]

export default function PetitionsPage() {
  const [petitions] = useState<Petition[]>(mockPetitions)
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites' | 'templates'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredPetitions = petitions.filter(petition => {
    if (activeTab === 'favorites' && !petition.isFavorite) return false
    if (activeTab === 'recent') {
      const daysDiff = (Date.now() - petition.date.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 7) return false
    }
    if (searchQuery) {
      return petition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             petition.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
             petition.client?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const totalPages = Math.ceil(filteredPetitions.length / itemsPerPage)
  const paginatedPetitions = filteredPetitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status: Petition['status']) => {
    const config = {
      draft: { label: 'Rascunho', className: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700' },
      review: { label: 'Em revisão', className: 'bg-amber-100 text-amber-700' },
      completed: { label: 'Concluído', className: 'bg-emerald-100 text-emerald-700' }
    }
    return config[status]
  }

  const recentPetitions = petitions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3)

  const favoritePetitions = petitions.filter(p => p.isFavorite).slice(0, 3)

  // Stats
  const stats = {
    total: petitions.length,
    completed: petitions.filter(p => p.status === 'completed').length,
    inProgress: petitions.filter(p => p.status === 'in_progress' || p.status === 'review').length,
    drafts: petitions.filter(p => p.status === 'draft').length
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Filter */}
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-0 space-y-4">
            {/* Create New Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Nova Petição</span>
            </button>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Resumo
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total</span>
                  <span className="text-sm font-semibold text-slate-900">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Concluídas</span>
                  <span className="text-sm font-semibold text-slate-900">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Em andamento</span>
                  <span className="text-sm font-semibold text-slate-900">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rascunhos</span>
                  <span className="text-sm font-semibold text-slate-900">{stats.drafts}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Taxa de conclusão</span>
                  <span className="text-xs font-medium text-slate-700">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Categories */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Categorias
                </h3>
              </div>
              <div className="p-2">
                {(['all', 'recent', 'favorites'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all',
                      activeTab === tab
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {tab === 'all' && <FolderOpen className="h-4 w-4" />}
                    {tab === 'recent' && <Clock className="h-4 w-4" />}
                    {tab === 'favorites' && <Star className="h-4 w-4" />}
                    
                    <span className="flex-1 text-left">
                      {tab === 'all' && 'Todas as Petições'}
                      {tab === 'recent' && 'Recentes'}
                      {tab === 'favorites' && 'Favoritas'}
                    </span>
                    
                    <span className="text-xs text-slate-400">
                      {tab === 'all' && filteredPetitions.length}
                      {tab === 'recent' && petitions.filter(p => {
                        const daysDiff = (Date.now() - p.date.getTime()) / (1000 * 60 * 60 * 24)
                        return daysDiff <= 7
                      }).length}
                      {tab === 'favorites' && petitions.filter(p => p.isFavorite).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('templates')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  Ver Modelos
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  Relatórios
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Header with Search */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Petições Jurídicas
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              Gerencie suas petições e documentos processuais
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por título, cliente ou tipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-slate-400 focus:outline-none transition-colors"
                />
              </div>
              
              <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Filter className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          {activeTab !== 'templates' ? (
            <>
              {paginatedPetitions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12">
                  <div className="text-center">
                    <div className="inline-flex p-3 bg-slate-50 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Nenhuma petição encontrada
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {searchQuery ? 'Tente ajustar sua busca' : 'Comece criando sua primeira petição'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Primeira Petição
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedPetitions.map((petition, index) => {
                    const statusConfig = getStatusBadge(petition.status)
                    return (
                      <motion.div
                        key={petition.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all cursor-pointer group"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Status Indicator */}
                            <div className={cn(
                              "w-1 h-12 rounded-full shrink-0",
                              petition.status === 'completed' && "bg-slate-500",
                              petition.status === 'in_progress' && "bg-slate-300",
                              petition.status === 'review' && "bg-slate-400",
                              petition.status === 'draft' && "bg-slate-200"
                            )} />
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                      {petition.title}
                                    </h3>
                                    {petition.isFavorite && (
                                      <Star className="h-3.5 w-3.5 text-slate-400 fill-current shrink-0" />
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">
                                      {petition.type}
                                    </span>
                                    {petition.client && (
                                      <>
                                        <span>•</span>
                                        <span>{petition.client}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>{petition.date.toLocaleDateString('pt-BR')}</span>
                                  </div>
                                </div>
                                
                                {/* Status Badge */}
                                <div className="shrink-0">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md",
                                    petition.status === 'completed' && "bg-slate-100 text-slate-700",
                                    petition.status === 'in_progress' && "bg-slate-50 text-slate-600",
                                    petition.status === 'review' && "bg-slate-50 text-slate-600",
                                    petition.status === 'draft' && "bg-slate-50 text-slate-500"
                                  )}>
                                    {statusConfig.label}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                  Baixar
                                </button>
                                <button 
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                  Duplicar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                  
                  {/* Pagination */}
                  {filteredPetitions.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-slate-500">
                        Exibindo {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPetitions.length)} de {filteredPetitions.length}
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Primeira
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-600" />
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={cn(
                                  "w-8 h-8 text-sm rounded transition-colors",
                                  currentPage === pageNum
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                                )}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Última
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Templates Tab */
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Biblioteca de Modelos</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Modelos otimizados para criação rápida de petições
                    </p>
                  </div>
                  <button className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                    <Upload className="h-4 w-4 inline mr-2" />
                    Importar Modelo
                  </button>
                </div>
                
                {/* Categories Filter */}
                <div className="flex gap-2 flex-wrap">
                  {['Todos', 'Cível', 'Trabalhista', 'Criminal', 'Família', 'Constitucional'].map((cat) => (
                    <button
                      key={cat}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: Briefcase, title: 'Reclamação Trabalhista', type: 'Trabalhista', description: 'Modelo para ações trabalhistas com cálculos automáticos', uses: 1250 },
                  { icon: Scale, title: 'Petição Inicial Cível', type: 'Cível', description: 'Template para ações cíveis com jurisprudência integrada', uses: 980 },
                  { icon: Shield, title: 'Mandado de Segurança', type: 'Constitucional', description: 'Estrutura completa para impetração de MS', uses: 450 },
                  { icon: Users, title: 'Ação de Alimentos', type: 'Família', description: 'Modelo especializado para direito de família', uses: 670 },
                  { icon: Gavel, title: 'Habeas Corpus', type: 'Criminal', description: 'Template urgente para HC preventivo e liberatório', uses: 320 },
                  { icon: FileText, title: 'Agravo de Instrumento', type: 'Recurso', description: 'Estrutura recursal com análise de requisitos', uses: 520 }
                ].map((template, index) => {
                  const Icon = template.icon
                  return (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 transition-all cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {template.title}
                          </h3>
                          <p className="text-xs text-slate-500 mb-2">{template.type}</p>
                          <p className="text-sm text-slate-600 mb-3">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              {template.uses} utilizações
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
                              className="text-xs font-medium text-slate-700 hover:text-slate-900"
                            >
                              Usar modelo →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="font-medium mb-1">Dica de uso</p>
                    <p>
                      Os modelos são pontos de partida inteligentes. A IA adapta o conteúdo 
                      baseado nas informações do seu caso específico e jurisprudências atualizadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Wizard Modal V2 - Mantido sem alterações */}
      <PetitionWizardV2 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  )
}