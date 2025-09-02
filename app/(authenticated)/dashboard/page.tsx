'use client'

import { useEffect, useState } from 'react'
import { 
  FileText,
  Search,
  Mic,
  FolderOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Estatísticas principais
  const mainStats = [
    {
      title: 'Petições Geradas',
      value: '127',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'slate'
    },
    {
      title: 'Documentos Analisados',
      value: '342',
      change: '+8%',
      trend: 'up',
      icon: FolderOpen,
      color: 'slate'
    },
    {
      title: 'Transcrições Realizadas',
      value: '89',
      change: '-3%',
      trend: 'down',
      icon: Mic,
      color: 'slate'
    },
    {
      title: 'Pesquisas Jurídicas',
      value: '256',
      change: '0%',
      trend: 'neutral',
      icon: Search,
      color: 'slate'
    }
  ]

  // Atividade recente
  const recentActivity = [
    { type: 'petition', description: 'Petição inicial trabalhista', time: '10 min atrás', client: 'João Silva' },
    { type: 'document', description: 'Contrato de prestação de serviços', time: '45 min atrás', client: 'Maria Santos' },
    { type: 'transcription', description: 'Audiência de conciliação', time: '2 horas atrás', client: 'Pedro Oliveira' },
    { type: 'search', description: 'Jurisprudência sobre danos morais', time: '3 horas atrás', client: 'Ana Costa' },
    { type: 'petition', description: 'Recurso de apelação', time: '5 horas atrás', client: 'Carlos Ferreira' }
  ]

  // Clientes ativos
  const activeClients = [
    { name: 'João Silva', cases: 3, lastActivity: 'Hoje' },
    { name: 'Maria Santos', cases: 2, lastActivity: 'Ontem' },
    { name: 'Pedro Oliveira', cases: 1, lastActivity: '3 dias atrás' },
    { name: 'Ana Costa', cases: 4, lastActivity: 'Hoje' },
    { name: 'Carlos Ferreira', cases: 2, lastActivity: 'Semana passada' }
  ]

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'petition': return FileText
      case 'document': return FolderOpen
      case 'transcription': return Mic
      case 'search': return Search
      default: return FileText
    }
  }

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return ArrowUp
      case 'down': return ArrowDown
      default: return Minus
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Simples */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Visão Geral
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            Últimos 30 dias
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas - Design Novo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = getTrendIcon(stat.trend)
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={cn(
                      "w-3 h-3",
                      stat.trend === 'up' && "text-emerald-500",
                      stat.trend === 'down' && "text-red-500",
                      stat.trend === 'neutral' && "text-slate-400"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend === 'up' && "text-emerald-500",
                      stat.trend === 'down' && "text-red-500",
                      stat.trend === 'neutral' && "text-slate-400"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-400">vs mês anterior</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Grid Principal - 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade Recente - Coluna maior */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Atividade Recente
              </h2>
              <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Ver tudo
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Cliente: {activity.client}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {activity.time}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Clientes Ativos - Coluna menor */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Clientes Ativos
              </h2>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {activeClients.map((client, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {client.cases} {client.cases === 1 ? 'caso' : 'casos'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {client.lastActivity}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Produtividade - Bottom */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Produtividade Mensal
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Distribuição de atividades ao longo do mês
            </p>
          </div>
          <BarChart3 className="w-5 h-5 text-slate-400" />
        </div>
        
        {/* Gráfico Simples com Barras */}
        <div className="h-48 flex items-end justify-between gap-2">
          {Array.from({ length: 30 }, (_, i) => {
            const height = Math.random() * 100
            const isToday = i === new Date().getDate() - 1
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-full rounded-t transition-all hover:opacity-80",
                    isToday ? "bg-slate-900" : "bg-slate-300"
                  )}
                  style={{ height: `${height}%` }}
                />
                {(i === 0 || i === 14 || i === 29) && (
                  <span className="text-xs text-slate-400">
                    {i + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé com Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-semibold text-slate-900">98%</p>
          <p className="text-xs text-slate-500 mt-1">Taxa de Sucesso</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-semibold text-slate-900">4.2h</p>
          <p className="text-xs text-slate-500 mt-1">Tempo Médio</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-semibold text-slate-900">156</p>
          <p className="text-xs text-slate-500 mt-1">Clientes Total</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="text-2xl font-semibold text-slate-900">R$ 45k</p>
          <p className="text-xs text-slate-500 mt-1">Economia Gerada</p>
        </div>
      </div>
    </div>
  )
}