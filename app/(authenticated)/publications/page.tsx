'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell,
  BellRing,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Brain,
  Sparkles,
  TrendingUp,
  Shield,
  Gavel,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Download,
  Share2,
  Bookmark,
  MoreVertical,
  Timer,
  Building2,
  User,
  ArrowRight,
  Activity,
  Target,
  Zap,
  Info,
  CheckSquare,
  UserPlus,
  Users,
  X,
  ExternalLink,
  ArrowUpRight,
  Scale,
  FileCheck,
  AlertOctagon,
  Plus,
  Briefcase
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

// Tipos de publicação baseados na API JusBrasil
type PublicationType = 'intimacao' | 'despacho' | 'sentenca' | 'decisao' | 'citacao' | 'audiencia' | 'publicacao'
type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low'
type DeadlineType = 'fatal' | 'processual' | 'material' | 'judicial'
type CountType = 'uteis' | 'corridos'
type ProcessStatus = 'pendente' | 'em_andamento' | 'cumprido' | 'expirado'

interface Lawyer {
  name: string
  oab: string
  state: string
}

interface Publication {
  id: string
  type: PublicationType
  title: string
  cnj: string
  court: string
  vara: string
  judge?: string
  classe: string
  assunto: string
  valorCausa?: number
  date: Date
  movementDate: Date
  deadline?: Date
  deadlineStart?: Date
  daysRemaining?: number
  deadlineType: DeadlineType
  countType: CountType
  urgency: UrgencyLevel
  content: string
  summary: string
  parties: {
    author: {
      name: string
      document?: string
      lawyers: Lawyer[]
    }
    defendant: {
      name: string
      document?: string
      lawyers: Lawyer[]
    }
  }
  responsibleLawyer: Lawyer
  client: string
  status: ProcessStatus
  isNew: boolean
  isRead: boolean
  hasAttachments: boolean
  aiAnalysis?: {
    summary: string
    actionRequired: string
    suggestedResponse: string
    specificArticles: string[]
    relevantPrecedents: string[]
    risks: string[]
    opportunities: string[]
    deadline: string
    deadlineCalculation: string
    suggestedPieces: string[]
    confidence: number
  }
}

// Mock de publicações
const mockPublications: Publication[] = [
  {
    id: '1',
    type: 'intimacao',
    title: 'Intimação para apresentar contrarrazões',
    cnj: '0001234-56.2024.8.26.0100',
    court: 'TJSP',
    vara: '2ª Vara Cível - Foro Central Cível',
    judge: 'Dr. João Carlos da Silva Santos',
    classe: 'Apelação Cível',
    assunto: 'Indenização por Dano Moral',
    valorCausa: 50000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    movementDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    deadlineStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    daysRemaining: 5,
    deadlineType: 'processual',
    countType: 'uteis',
    urgency: 'high',
    content: 'Intimação das partes para apresentação de contrarrazões ao recurso de apelação interposto pela parte autora. Prazo de 15 (quinze) dias úteis conforme art. 1.010, §1º do CPC.',
    summary: 'Prazo de 15 dias úteis para contrarrazões (restam 5 dias)',
    parties: {
      author: {
        name: 'Empresa XYZ Comércio e Serviços Ltda',
        document: '12.345.678/0001-90',
        lawyers: [
          { name: 'Dr. Pedro Henrique Oliveira', oab: '123.456', state: 'SP' },
          { name: 'Dra. Ana Paula Costa', oab: '234.567', state: 'SP' }
        ]
      },
      defendant: {
        name: 'João da Silva Santos',
        document: '123.456.789-00',
        lawyers: [
          { name: 'Dr. Carlos Eduardo Martins', oab: '345.678', state: 'SP' }
        ]
      }
    },
    responsibleLawyer: { name: 'Dr. Carlos Eduardo Martins', oab: '345.678', state: 'SP' },
    client: 'João da Silva Santos',
    status: 'pendente',
    isNew: true,
    isRead: false,
    hasAttachments: true,
    aiAnalysis: {
      summary: 'A parte contrária (Empresa XYZ) apresentou apelação questionando a sentença que condenou ao pagamento de R$ 50.000 por danos morais. Você representa o apelado e tem 5 dias úteis para apresentar contrarrazões.',
      actionRequired: 'Elaborar e protocolar contrarrazões ao recurso de apelação via PJe até 13/08/2024',
      suggestedResponse: 'Contrarrazões devem focar em: 1) Manutenção da sentença por seus próprios fundamentos (art. 252 RITJSP); 2) Demonstrar configuração do dano moral in re ipsa; 3) Adequação do quantum indenizatório aos parâmetros do STJ.',
      specificArticles: ['Art. 1.010, §1º do CPC', 'Art. 252 do RITJSP', 'Art. 927 do CC', 'Art. 944 do CC'],
      relevantPrecedents: ['STJ REsp 1.698.654/SP', 'STJ AgInt no AREsp 1.456.789/SP', 'TJSP Apelação 1234567-89.2023'],
      risks: ['Perda do prazo resultará em preclusão', 'Não impugnação específica dos fundamentos recursais'],
      opportunities: ['Pedido de majoração de honorários (art. 85, §11 CPC)', 'Caracterização de litigância de má-fé'],
      deadline: '5 dias úteis (13/08/2024 às 23:59)',
      deadlineCalculation: 'Prazo de 15 dias úteis iniciado em 29/07/2024 (primeira segunda após publicação). Feriado municipal dia 09/08 não suspende prazo.',
      suggestedPieces: ['Contrarrazões de Apelação', 'Pedido de majoração de honorários'],
      confidence: 92
    }
  },
  {
    id: '2',
    type: 'decisao',
    title: 'Decisão - Tutela de urgência deferida',
    cnj: '0005678-90.2024.8.26.0100',
    court: 'TJSP',
    vara: '5ª Vara Empresarial',
    judge: 'Dra. Maria Santos',
    classe: 'Ação de Obrigação de Fazer',
    assunto: 'Descumprimento Contratual',
    valorCausa: 120000,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    movementDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    deadlineStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    daysRemaining: 2,
    deadlineType: 'judicial',
    countType: 'corridos',
    urgency: 'critical',
    content: 'Decisão deferindo parcialmente a tutela de urgência requerida...',
    summary: 'Tutela parcialmente deferida - cumprimento imediato',
    parties: {
      author: {
        name: 'ABC Comércio Ltda',
        document: '23.456.789/0001-01',
        lawyers: [
          { name: 'Dra. Fernanda Lima', oab: '456.789', state: 'SP' }
        ]
      },
      defendant: {
        name: 'Fornecedor Beta S/A',
        document: '34.567.890/0001-12',
        lawyers: [
          { name: 'Dr. Roberto Santos', oab: '567.890', state: 'SP' }
        ]
      }
    },
    responsibleLawyer: { name: 'Dra. Fernanda Lima', oab: '456.789', state: 'SP' },
    client: 'ABC Comércio Ltda',
    status: 'pendente',
    isNew: true,
    isRead: false,
    hasAttachments: false,
    aiAnalysis: {
      summary: 'Tutela de urgência foi parcialmente deferida. O juiz acatou o pedido de suspensão dos protestos, mas negou o bloqueio de valores.',
      actionRequired: 'Comunicar cliente e iniciar cumprimento da decisão',
      suggestedResponse: 'Providenciar: 1) Ofícios aos cartórios de protesto; 2) Comunicação formal ao cliente; 3) Avaliar necessidade de agravo quanto à parte indeferida.',
      specificArticles: ['Art. 300 do CPC', 'Art. 497 do CPC', 'Art. 536 do CPC'],
      relevantPrecedents: ['STJ REsp 1.789.456/SP', 'TJSP AI 2234567-89.2023'],
      risks: ['Descumprimento pode gerar multa diária'],
      opportunities: ['Decisão favorável pode pressionar acordo', 'Base para futura execução'],
      deadline: 'Cumprimento imediato',
      deadlineCalculation: 'Decisão com eficácia imediata conforme art. 1.012, §1º, V do CPC',
      suggestedPieces: ['Ofícios aos cartórios', 'Petição de cumprimento'],
      confidence: 88
    }
  }
]

// Componente de Timeline de Prazo
const DeadlineTimeline = ({ 
  start, 
  end, 
  current = new Date(),
  type,
  countType 
}: { 
  start?: Date; 
  end?: Date; 
  current?: Date;
  type: DeadlineType;
  countType: CountType;
}) => {
  if (!start || !end) return null
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.ceil((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
  
  const getColor = () => {
    if (remainingDays <= 2) return 'bg-red-500'
    if (remainingDays <= 5) return 'bg-orange-500'
    if (remainingDays <= 10) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
        <span className="font-medium">
          Início: {start.toLocaleDateString('pt-BR')}
        </span>
        <span className="px-2 py-0.5 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
          {type === 'fatal' ? '⚠️ Prazo Fatal' : type === 'processual' ? '📋 Processual' : '📄 Material'}
        </span>
        <span className="font-medium">
          Fim: {end.toLocaleDateString('pt-BR')}
        </span>
      </div>
      
      <div className="relative">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={cn("h-full transition-all duration-500", getColor())}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {elapsedDays} dias {countType === 'uteis' ? 'úteis' : 'corridos'} decorridos
          </span>
          <span className={cn(
            "text-xs font-bold",
            remainingDays <= 2 ? "text-red-600" : 
            remainingDays <= 5 ? "text-orange-600" : 
            "text-gray-600"
          )}>
            {remainingDays > 0 ? `${remainingDays} dias restantes` : 'PRAZO EXPIRADO'}
          </span>
        </div>
      </div>
    </div>
  )
}

// Modal de Análise Completa
const AnalysisModal = ({ 
  isOpen, 
  onClose, 
  analysis 
}: { 
  isOpen: boolean
  onClose: () => void
  analysis?: Publication['aiAnalysis']
}) => {
  if (!isOpen || !analysis) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Análise Completa da IA
                  </h2>
                  <p className="text-sm text-gray-500">
                    Confiança: {analysis.confidence}%
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] space-y-6">
            {/* Resumo */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resumo</h3>
              <p className="text-gray-600 dark:text-gray-400">{analysis.summary}</p>
            </div>
            
            {/* Ação Necessária */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Ação Necessária</h3>
              <p className="text-gray-600 dark:text-gray-400">{analysis.actionRequired}</p>
            </div>
            
            {/* Sugestão de Resposta */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sugestão de Resposta</h3>
              <p className="text-gray-600 dark:text-gray-400">{analysis.suggestedResponse}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Artigos Relevantes */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Artigos Relevantes</h3>
                <div className="space-y-1">
                  {analysis.specificArticles.map((article, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{article}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Precedentes */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Jurisprudência</h3>
                <div className="space-y-1">
                  {analysis.relevantPrecedents.map((precedent, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{precedent}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Riscos */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Riscos</h3>
                <div className="space-y-1">
                  {analysis.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Oportunidades */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Oportunidades</h3>
                <div className="space-y-1">
                  {analysis.opportunities.map((opp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Cálculo do Prazo */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Cálculo do Prazo</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">{analysis.deadlineCalculation}</p>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mt-2">
                Prazo: {analysis.deadline}
              </p>
            </div>
            
            {/* Peças Sugeridas */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Peças Sugeridas</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedPieces.map((piece, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                  >
                    {piece}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" />
                Gerar Petição com IA
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Componente de Badge de Urgência
const UrgencyBadge = ({ urgency, daysRemaining }: { urgency: UrgencyLevel; daysRemaining?: number }) => {
  const configs = {
    critical: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200',
      icon: AlertTriangle,
      label: 'Urgente'
    },
    high: {
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
      icon: Clock,
      label: 'Alta prioridade'
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200',
      icon: AlertCircle,
      label: 'Média'
    },
    low: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
      icon: CheckCircle,
      label: 'Baixa'
    }
  }

  const config = configs[urgency]
  const Icon = config.icon

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      config.color
    )}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
      {daysRemaining !== undefined && (
        <span className="font-bold">• {daysRemaining}d</span>
      )}
    </div>
  )
}

// Componente de Tipo de Publicação
const PublicationTypeBadge = ({ type }: { type: PublicationType }) => {
  const configs: Record<PublicationType, { label: string; color: string }> = {
    intimacao: { label: 'Intimação', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    despacho: { label: 'Despacho', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
    sentenca: { label: 'Sentença', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    decisao: { label: 'Decisão', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    citacao: { label: 'Citação', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    audiencia: { label: 'Audiência', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    publicacao: { label: 'Publicação', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' }
  }

  const config = configs[type]

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
      config.color
    )}>
      {config.label}
    </span>
  )
}

export default function PublicationsPage() {
  const { addNotification } = useAppStore()
  const [publications, setPublications] = useState<Publication[]>(mockPublications)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [filter, setFilter] = useState<'all' | PublicationType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyNew, setShowOnlyNew] = useState(false)
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Publication['aiAnalysis'] | undefined>(undefined)

  // Stats
  const stats = {
    total: publications.length,
    new: publications.filter(p => p.isNew).length,
    urgent: publications.filter(p => p.urgency === 'critical' || p.urgency === 'high').length,
    deadlines: publications.filter(p => p.daysRemaining && p.daysRemaining <= 7).length
  }

  // Filtrar publicações
  const filteredPublications = publications.filter(pub => {
    if (filter !== 'all' && pub.type !== filter) return false
    if (showOnlyNew && !pub.isNew) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return pub.title.toLowerCase().includes(query) ||
             pub.cnj.toLowerCase().includes(query) ||
             pub.content.toLowerCase().includes(query) ||
             pub.client.toLowerCase().includes(query)
    }
    return true
  })

  // Marcar como lida
  const markAsRead = (id: string) => {
    setPublications(prev => prev.map(pub => 
      pub.id === id ? { ...pub, isRead: true, isNew: false } : pub
    ))
  }

  // Abrir análise completa
  const openAnalysis = (analysis: Publication['aiAnalysis']) => {
    setSelectedAnalysis(analysis)
    setShowAnalysisModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header igual ao padrão do sistema */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <Bell className="h-8 w-8 text-white" />
              </div>
              Publicações
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie todas as suas intimações e prazos processuais
            </p>
          </div>
          
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Análise
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Urgente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {publications.filter(p => p.daysRemaining && p.daysRemaining <= 1).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vencendo hoje</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">7 dias</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {publications.filter(p => p.daysRemaining && p.daysRemaining <= 7).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Esta semana</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">+15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {publications.filter(p => p.status === 'cumprido').length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cumpridos</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Novas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Não lidas</p>
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
                placeholder="Buscar por processo, título ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                showOnlyNew
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <BellRing className="h-4 w-4 inline mr-2" />
              Apenas novas
            </button>

            <button
              onClick={() => setShowAIInsights(!showAIInsights)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                showAIInsights
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              Insights IA
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="intimacao">Intimações</option>
              <option value="decisao">Decisões</option>
              <option value="sentenca">Sentenças</option>
              <option value="despacho">Despachos</option>
              <option value="audiencia">Audiências</option>
              <option value="citacao">Citações</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Publications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPublications.map((publication, index) => (
            <motion.div
              key={publication.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-white dark:bg-gray-900 rounded-xl border overflow-hidden transition-all",
                publication.isNew
                  ? "border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/10"
                  : "border-gray-100 dark:border-gray-800"
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {publication.isNew && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white animate-pulse">
                          NOVO
                        </span>
                      )}
                      <PublicationTypeBadge type={publication.type} />
                      <UrgencyBadge urgency={publication.urgency} daysRemaining={publication.daysRemaining} />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {publication.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="font-mono text-xs">{publication.cnj}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {publication.vara}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {publication.date.toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {publication.summary}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {publication.client}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {publication.responsibleLawyer.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          OAB {publication.responsibleLawyer.oab}/{publication.responsibleLawyer.state}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPublication(publication)
                        markAsRead(publication.id)
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* AI Insights */}
                {showAIInsights && publication.aiAnalysis && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            Análise e Recomendações da IA
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {publication.aiAnalysis.confidence}% confiança
                          </span>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Resumo:</strong> {publication.aiAnalysis.summary}
                          </p>

                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Ação Necessária:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {publication.aiAnalysis.actionRequired}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {publication.aiAnalysis.risks.length > 0 && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Riscos
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                                  {publication.aiAnalysis.risks.slice(0, 2).map((risk, i) => (
                                    <li key={i}>• {risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {publication.aiAnalysis.opportunities.length > 0 && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Oportunidades
                                </p>
                                <ul className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
                                  {publication.aiAnalysis.opportunities.slice(0, 2).map((opp, i) => (
                                    <li key={i}>• {opp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-500" />
                              Prazo: {publication.aiAnalysis.deadline}
                            </span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openAnalysis(publication.aiAnalysis)}
                                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ver Análise Completa
                              </button>
                              <button className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5" />
                                Gerar Petição
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {publication.deadline && publication.deadlineStart && (
                  <DeadlineTimeline 
                    start={publication.deadlineStart}
                    end={publication.deadline}
                    current={new Date()}
                    type={publication.deadlineType}
                    countType={publication.countType}
                  />
                )}

                {/* Action Buttons */}
                {publication.deadline && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Marcar como Cumprido
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Adicionar ao Calendário
                    </button>
                    <button className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Delegar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma publicação encontrada com os filtros aplicados
            </p>
          </div>
        )}
      </div>

      {/* Modal de Análise Completa */}
      <AnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        analysis={selectedAnalysis}
      />
    </div>
  )
}