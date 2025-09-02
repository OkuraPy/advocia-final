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
  Users
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
  cnj: string // Número CNJ completo
  court: string
  vara: string // Vara específica
  judge?: string
  classe: string // Classe processual
  assunto: string // Assunto do processo
  valorCausa?: number
  date: Date // Data da publicação
  movementDate: Date // Data da movimentação
  deadline?: Date
  deadlineStart?: Date // Início da contagem do prazo
  daysRemaining?: number
  deadlineType: DeadlineType
  countType: CountType
  urgency: UrgencyLevel
  content: string
  summary: string
  parties: {
    author: {
      name: string
      document?: string // CPF/CNPJ
      lawyers: Lawyer[]
    }
    defendant: {
      name: string
      document?: string
      lawyers: Lawyer[]
    }
  }
  responsibleLawyer: Lawyer // Advogado responsável pela publicação
  client: string // Cliente relacionado
  status: ProcessStatus
  isNew: boolean
  isRead: boolean
  hasAttachments: boolean
  aiAnalysis?: {
    summary: string
    actionRequired: string
    suggestedResponse: string
    specificArticles: string[] // Artigos do CPC/CC/CLT relevantes
    relevantPrecedents: string[] // Jurisprudências relevantes
    risks: string[]
    opportunities: string[]
    deadline: string
    deadlineCalculation: string // Explicação do cálculo do prazo
    suggestedPieces: string[] // Peças sugeridas
    confidence: number
  }
}

// Mock de publicações baseado na estrutura real do JusBrasil
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
    deadlineType: 'processual',
    countType: 'corridos',
    urgency: 'medium',
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
  },
  {
    id: '3',
    type: 'audiencia',
    title: 'Designação de audiência de conciliação',
    cnj: '0009876-54.2024.8.26.0100',
    court: 'TJSP',
    vara: 'CEJUSC Central',
    judge: 'Dr. Paulo Ricardo Ferreira',
    classe: 'Procedimento Comum Cível',
    assunto: 'Vícios de Construção',
    valorCausa: 85000,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    movementDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    deadlineStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    daysRemaining: 15,
    deadlineType: 'processual',
    countType: 'corridos',
    urgency: 'medium',
    content: 'Audiência de conciliação designada para o dia...',
    summary: 'Audiência em 15 dias - preparar proposta',
    parties: {
      author: {
        name: 'Pedro Oliveira',
        document: '234.567.890-12',
        lawyers: [
          { name: 'Dr. Miguel Andrade', oab: '678.901', state: 'SP' }
        ]
      },
      defendant: {
        name: 'Construtora Alfa Ltda',
        document: '45.678.901/0001-23',
        lawyers: [
          { name: 'Dra. Patrícia Souza', oab: '789.012', state: 'SP' }
        ]
      }
    },
    responsibleLawyer: { name: 'Dr. Miguel Andrade', oab: '678.901', state: 'SP' },
    client: 'Pedro Oliveira',
    status: 'pendente',
    isNew: false,
    isRead: true,
    hasAttachments: false,
    aiAnalysis: {
      summary: 'Audiência de conciliação agendada. Momento crucial para possível acordo e encerramento do processo.',
      actionRequired: 'Preparar cliente e estratégia de negociação',
      suggestedResponse: 'Sugestões: 1) Reunir com cliente para definir limites de acordo; 2) Preparar proposta inicial e contrapropostas; 3) Levantar jurisprudência sobre valores de acordos similares.',
      specificArticles: ['Art. 334 do CPC', 'Art. 165 do CPC', 'Art. 334, §8º do CPC'],
      relevantPrecedents: ['TJSP AC 1098765-43.2023', 'STJ REsp 1.678.345/SP'],
      risks: ['Ausência gera multa e presunção de desinteresse'],
      opportunities: ['Resolução rápida do conflito', 'Economia de custas processuais'],
      deadline: '15 dias para audiência',
      deadlineCalculation: 'Audiência agendada com antecedência mínima de 20 dias conforme art. 334 do CPC',
      suggestedPieces: ['Proposta de acordo', 'Procuração ad judicia com poderes especiais'],
      confidence: 85
    }
  },
  {
    id: '4',
    type: 'sentenca',
    title: 'Sentença procedente - Danos morais',
    cnj: '0003456-78.2023.8.26.0100',
    court: 'TJSP',
    vara: '10ª Vara Cível - Foro Central',
    judge: 'Dr. Carlos Ferreira',
    classe: 'Procedimento Comum Cível',
    assunto: 'Inscrição Indevida em Cadastro de Inadimplentes',
    valorCausa: 15000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    movementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    deadlineStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    daysRemaining: 10,
    deadlineType: 'processual',
    countType: 'uteis',
    urgency: 'low',
    content: 'Sentença julgando procedente o pedido de indenização...',
    summary: 'Vitória! R$ 15.000 de indenização concedida',
    parties: {
      author: {
        name: 'Ana Costa Silva',
        document: '345.678.901-23',
        lawyers: [
          { name: 'Dra. Juliana Mendes', oab: '890.123', state: 'SP' }
        ]
      },
      defendant: {
        name: 'Banco Nacional S/A',
        document: '56.789.012/0001-34',
        lawyers: [
          { name: 'Dr. Ricardo Almeida', oab: '901.234', state: 'SP' },
          { name: 'Dra. Beatriz Campos', oab: '012.345', state: 'SP' }
        ]
      }
    },
    responsibleLawyer: { name: 'Dra. Juliana Mendes', oab: '890.123', state: 'SP' },
    client: 'Ana Costa Silva',
    status: 'cumprido',
    isNew: false,
    isRead: true,
    hasAttachments: true,
    aiAnalysis: {
      summary: 'Sentença totalmente favorável ao cliente. Indenização de R$ 15.000 por danos morais, mais correção e juros.',
      actionRequired: 'Aguardar prazo recursal e preparar execução',
      suggestedResponse: 'Próximos passos: 1) Comunicar vitória ao cliente; 2) Monitorar prazo recursal (15 dias); 3) Preparar cumprimento de sentença se não houver recurso.',
      specificArticles: ['Art. 1.009 do CPC', 'Art. 523 do CPC', 'Art. 85, §1º do CPC'],
      relevantPrecedents: ['STJ Súmula 385', 'STJ REsp 1.234.567/SP', 'TJSP AC 2345678-90.2023'],
      risks: ['Possibilidade de apelação pela parte contrária'],
      opportunities: ['Execução imediata se não houver recurso', 'Precedente favorável para casos similares'],
      deadline: '10 dias para recurso da parte contrária',
      deadlineCalculation: 'Prazo de 15 dias úteis para apelação conforme art. 1.003, §5º do CPC',
      suggestedPieces: ['Petição de cumprimento de sentença', 'Planilha de cálculos'],
      confidence: 95
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
          <div 
            className={cn("h-full transition-all duration-500", getColor())}
            style={{ width: `${progress}%` }}
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
      {daysRemaining && (
        <span className="font-bold">• {daysRemaining}d</span>
      )}
    </div>
  )
}

// Componente de Tipo de Publicação
const PublicationTypeBadge = ({ type }: { type: PublicationType }) => {
  const configs: Record<PublicationType, { label: string; color: string }> = {
    intimacao: { label: 'Intimação', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    despacho: { label: 'Despacho', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
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
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'all'>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [lawyerFilter, setLawyerFilter] = useState<string>('all')

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
    if (statusFilter !== 'all' && pub.status !== statusFilter) return false
    if (clientFilter !== 'all' && pub.client !== clientFilter) return false
    if (lawyerFilter !== 'all' && pub.responsibleLawyer?.name !== lawyerFilter) return false
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

  // Obter lista única de clientes e advogados
  const uniqueClients = Array.from(new Set(publications.map(p => p.client).filter(Boolean)))
  const uniqueLawyers = Array.from(new Set(publications.map(p => p.responsibleLawyer?.name).filter(Boolean)))

  // Marcar como lida
  const markAsRead = (id: string) => {
    setPublications(prev => prev.map(pub => 
      pub.id === id ? { ...pub, isRead: true, isNew: false } : pub
    ))
  }

  // Simular novas publicações chegando
  useEffect(() => {
    const interval = setInterval(() => {
      // Simula nova publicação a cada 30 segundos
      const hasNew = Math.random() > 0.7
      if (hasNew) {
        addNotification({
          title: 'Nova publicação',
          message: 'Você tem uma nova intimação para revisar',
          type: 'info'
        })
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25">
            <Bell className="h-8 w-8 text-white" />
          </div>
          Central de Publicações e Intimações
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitore suas publicações e receba insights da IA sobre como agir
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vencendo Hoje */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Urgente</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">
              {publications.filter(p => p.daysRemaining === 0 || p.daysRemaining === 1).length}
            </p>
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">Vencendo hoje</p>
            <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">Ação imediata necessária</p>
          </div>
        </motion.div>

        {/* Esta Semana */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Semana</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
              {publications.filter(p => p.daysRemaining && p.daysRemaining <= 7 && p.daysRemaining > 1).length}
            </p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1">Próximos 7 dias</p>
            <p className="text-xs text-amber-500 dark:text-amber-500 mt-0.5">Requer atenção</p>
          </div>
        </motion.div>

        {/* Cumpridos Este Mês */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Mês</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {publications.filter(p => p.status === 'cumprido').length}
            </p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">Cumpridos este mês</p>
            <p className="text-xs text-green-500 dark:text-green-500 mt-0.5">Taxa: 85% ↑</p>
          </div>
        </motion.div>

        {/* Novas Publicações */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg animate-pulse">
              <BellRing className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Novas</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.new}</p>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">Não lidas</p>
            <p className="text-xs text-purple-500 dark:text-purple-500 mt-0.5">Requer revisão</p>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por processo, título ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                showOnlyNew
                  ? "bg-purple-600 text-white"
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
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              )}
            >
              <Brain className="h-4 w-4 inline mr-2" />
              Insights IA
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os tipos</option>
              <option value="intimacao">Intimações</option>
              <option value="decisao">Decisões</option>
              <option value="sentenca">Sentenças</option>
              <option value="despacho">Despachos</option>
              <option value="audiencia">Audiências</option>
              <option value="citacao">Citações</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="cumprido">Cumprido</option>
              <option value="expirado">Expirado</option>
            </select>
          </div>
        </div>
      </div>

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
                  ? "border-purple-200 dark:border-purple-800 shadow-lg shadow-purple-500/10"
                  : "border-gray-100 dark:border-gray-800"
              )}
            >
              {/* Publication Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {publication.isNew && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-600 text-white animate-pulse">
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
                        {publication.vara || publication.court}
                      </span>
                      {publication.judge && (
                        <span className="flex items-center gap-1">
                          <Gavel className="h-3.5 w-3.5" />
                          {publication.judge}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {publication.date.toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {publication.summary}
                    </p>

                    {/* Informações das Partes e Advogados */}
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {publication.client}
                        </span>
                        {publication.responsibleLawyer && (
                          <>
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
                          </>
                        )}
                      </div>
                      
                      {typeof publication.parties.author === 'object' && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Autor: {publication.parties.author.name}</span>
                          {publication.parties.author.lawyers?.length > 0 && (
                            <span className="text-gray-400">Adv: {publication.parties.author.lawyers[0].name}</span>
                          )}
                          <span className="text-gray-400">×</span>
                          <span>Réu: {publication.parties.defendant.name}</span>
                          {publication.parties.defendant.lawyers?.length > 0 && (
                            <span className="text-gray-400">Adv: {publication.parties.defendant.lawyers[0].name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
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
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Salvar">
                        <Bookmark className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Compartilhar">
                        <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    {/* Ações Práticas */}
                    {publication.deadline && (
                      <div className="flex flex-col gap-1">
                        <button 
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          title="Marcar como cumprido"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Cumprido</span>
                        </button>
                        <button 
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          title="Adicionar ao calendário"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Agendar</span>
                        </button>
                        <button 
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                          title="Delegar para equipe"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Delegar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                {showAIInsights && publication.aiAnalysis && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Análise e Recomendações da IA
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {publication.aiAnalysis.confidence}% confiança
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Resumo */}
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Resumo:</strong> {publication.aiAnalysis.summary}
                            </p>
                          </div>

                          {/* Ação Necessária */}
                          <div className="flex items-start gap-2">
                            <Target className="h-4 w-4 text-purple-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Ação Necessária:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {publication.aiAnalysis.actionRequired}
                              </p>
                            </div>
                          </div>

                          {/* Sugestão de Resposta */}
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Sugestão de Resposta:
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {publication.aiAnalysis.suggestedResponse}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {/* Riscos */}
                            {publication.aiAnalysis.risks.length > 0 && (
                              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Riscos
                                </p>
                                <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                                  {publication.aiAnalysis.risks.map((risk, i) => (
                                    <li key={i}>• {risk}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Oportunidades */}
                            {publication.aiAnalysis.opportunities.length > 0 && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Oportunidades
                                </p>
                                <ul className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
                                  {publication.aiAnalysis.opportunities.map((opp, i) => (
                                    <li key={i}>• {opp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Artigos e Precedentes */}
                          {(publication.aiAnalysis.specificArticles?.length > 0 || publication.aiAnalysis.relevantPrecedents?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {publication.aiAnalysis.specificArticles?.length > 0 && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Artigos Relevantes
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {publication.aiAnalysis.specificArticles.slice(0, 3).map((article, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                        {article}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {publication.aiAnalysis.relevantPrecedents?.length > 0 && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1">
                                    <Gavel className="h-3 w-3" />
                                    Jurisprudência
                                  </p>
                                  <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-0.5">
                                    {publication.aiAnalysis.relevantPrecedents.slice(0, 2).map((precedent, i) => (
                                      <div key={i} className="truncate">• {precedent}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prazo e Ações */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                Prazo: {publication.aiAnalysis.deadline}
                              </span>
                              {publication.aiAnalysis.deadlineCalculation && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-6">
                                  {publication.aiAnalysis.deadlineCalculation}
                                </p>
                              )}
                            </div>
                            <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                              <Zap className="h-3.5 w-3.5" />
                              Gerar Petição com IA
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline de Prazo */}
                {publication.deadline && publication.deadlineStart && (
                  <DeadlineTimeline 
                    start={publication.deadlineStart}
                    end={publication.deadline}
                    current={new Date()}
                    type={publication.deadlineType}
                    countType={publication.countType}
                  />
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
    </div>
  )
}