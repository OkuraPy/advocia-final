'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageCircle,
  Bot,
  Settings,
  Phone,
  MapPin,
  Building,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  BarChart3,
  User,
  Scale,
  Briefcase,
  Home,
  Car,
  Heart,
  Gavel,
  Shield,
  FileText,
  Edit3,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegalArea {
  id: string
  name: string
  active: boolean
  qualificationQuestions: string[]
  description: string
}

interface OfficeConfig {
  name: string
  phone: string
  address: string
  schedule: {
    start: string
    end: string
    days: string[]
  }
  lawyers: Array<{
    name: string
    areas: string[]
    schedule: string
  }>
}

const defaultLegalAreas: LegalArea[] = [
  {
    id: 'trabalhista',
    name: 'Direito Trabalhista',
    active: true,
    qualificationQuestions: [
      'Você foi demitido recentemente?',
      'Houve pagamento incorreto de verbas rescisórias?',
      'Teve problemas com horas extras não pagas?',
      'Sofreu assédio moral no trabalho?'
    ],
    description: 'Demissões, verbas rescisórias, horas extras, assédio'
  },
  {
    id: 'civil',
    name: 'Direito Civil',
    active: true,
    qualificationQuestions: [
      'Está enfrentando problemas contratuais?',
      'Precisa de indenização por danos?',
      'Tem questões de responsabilidade civil?',
      'Problemas com vizinhos ou propriedades?'
    ],
    description: 'Contratos, indenizações, responsabilidade civil'
  },
  {
    id: 'familia',
    name: 'Direito de Família',
    active: false,
    qualificationQuestions: [
      'Precisa de divórcio ou separação?',
      'Tem questões de pensão alimentícia?',
      'Problemas de guarda de filhos?',
      'Questões de partilha de bens?'
    ],
    description: 'Divórcio, pensão, guarda, partilha'
  },
  {
    id: 'previdenciario',
    name: 'Direito Previdenciário',
    active: false,
    qualificationQuestions: [
      'Foi negado seu benefício do INSS?',
      'Precisa de aposentadoria?',
      'Teve auxílio-doença negado?',
      'Problemas com BPC/LOAS?'
    ],
    description: 'INSS, aposentadoria, auxílio-doença, BPC'
  },
  {
    id: 'consumidor',
    name: 'Direito do Consumidor',
    active: false,
    qualificationQuestions: [
      'Foi lesado como consumidor?',
      'Problemas com bancos ou financeiras?',
      'Produto ou serviço defeituoso?',
      'Cobrança indevida ou abusiva?'
    ],
    description: 'Relações de consumo, bancos, cobranças'
  },
  {
    id: 'criminal',
    name: 'Direito Criminal',
    active: false,
    qualificationQuestions: [
      'Está sendo processado criminalmente?',
      'Precisa de defesa criminal?',
      'Quer constituir assistência de acusação?',
      'Problemas com inquérito policial?'
    ],
    description: 'Defesa criminal, assistência de acusação'
  }
]

export default function WhatsAppBotPage() {
  const [botActive, setBotActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'config' | 'areas' | 'analytics'>('config')
  const [officeConfig, setOfficeConfig] = useState<OfficeConfig>({
    name: '',
    phone: '',
    address: '',
    schedule: {
      start: '09:00',
      end: '18:00',
      days: ['seg', 'ter', 'qua', 'qui', 'sex']
    },
    lawyers: [
      { name: '', areas: [], schedule: 'Segunda a Sexta, 9h às 18h' }
    ]
  })
  const [legalAreas, setLegalAreas] = useState<LegalArea[]>(defaultLegalAreas)
  const [editingArea, setEditingArea] = useState<string | null>(null)

  const getAreaIcon = (areaId: string) => {
    switch (areaId) {
      case 'trabalhista': return Briefcase
      case 'civil': return Scale
      case 'familia': return Heart
      case 'previdenciario': return Shield
      case 'consumidor': return User
      case 'criminal': return Gavel
      default: return FileText
    }
  }

  const handleToggleArea = (areaId: string) => {
    setLegalAreas(prev => prev.map(area =>
      area.id === areaId ? { ...area, active: !area.active } : area
    ))
  }

  const handleSaveArea = (areaId: string, questions: string[]) => {
    setLegalAreas(prev => prev.map(area =>
      area.id === areaId ? { ...area, qualificationQuestions: questions } : area
    ))
    setEditingArea(null)
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
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              WhatsApp Bot IA
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Assistente IA para atendimento e qualificação de clientes no WhatsApp
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-medium",
              botActive 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}>
              <div className={cn(
                "h-2 w-2 rounded-full",
                botActive ? "bg-green-500" : "bg-gray-400"
              )} />
              {botActive ? 'Bot Ativo' : 'Bot Inativo'}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBotActive(!botActive)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2",
                botActive
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/25"
              )}
            >
              {botActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {botActive ? 'Pausar Bot' : 'Ativar Bot'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          {[
            { id: 'config', label: 'Configuração', icon: Settings },
            { id: 'areas', label: 'Áreas de Atuação', icon: Scale },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'config' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Configuração do Escritório */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Dados do Escritório
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Escritório
                </label>
                <input
                  type="text"
                  value={officeConfig.name}
                  onChange={(e) => setOfficeConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Advocacia Silva & Associados"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone/WhatsApp
                </label>
                <input
                  type="tel"
                  value={officeConfig.phone}
                  onChange={(e) => setOfficeConfig(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endereço Completo
                </label>
                <textarea
                  value={officeConfig.address}
                  onChange={(e) => setOfficeConfig(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex: Rua das Palmeiras, 123 - Centro - São Paulo/SP - CEP: 01234-567"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Horário de Atendimento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Início
                </label>
                <input
                  type="time"
                  value={officeConfig.schedule.start}
                  onChange={(e) => setOfficeConfig(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fim
                </label>
                <input
                  type="time"
                  value={officeConfig.schedule.end}
                  onChange={(e) => setOfficeConfig(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dias da Semana
                </label>
                <div className="flex gap-1">
                  {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = officeConfig.schedule.days.includes(day)
                          ? officeConfig.schedule.days.filter(d => d !== day)
                          : [...officeConfig.schedule.days, day]
                        setOfficeConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, days: newDays }
                        }))
                      }}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded transition-all",
                        officeConfig.schedule.days.includes(day)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advogados */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Advogados do Escritório
            </h2>
            
            <div className="space-y-4">
              {officeConfig.lawyers.map((lawyer, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome do Advogado
                      </label>
                      <input
                        type="text"
                        value={lawyer.name}
                        onChange={(e) => {
                          const newLawyers = [...officeConfig.lawyers]
                          newLawyers[index].name = e.target.value
                          setOfficeConfig(prev => ({ ...prev, lawyers: newLawyers }))
                        }}
                        placeholder="Ex: Dr. João Silva"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Horário de Atendimento
                      </label>
                      <input
                        type="text"
                        value={lawyer.schedule}
                        onChange={(e) => {
                          const newLawyers = [...officeConfig.lawyers]
                          newLawyers[index].schedule = e.target.value
                          setOfficeConfig(prev => ({ ...prev, lawyers: newLawyers }))
                        }}
                        placeholder="Ex: Segunda a Sexta, 9h às 18h"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          const newLawyers = officeConfig.lawyers.filter((_, i) => i !== index)
                          setOfficeConfig(prev => ({ ...prev, lawyers: newLawyers }))
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remover advogado"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  setOfficeConfig(prev => ({
                    ...prev,
                    lawyers: [...prev.lawyers, { name: '', areas: [], schedule: 'Segunda a Sexta, 9h às 18h' }]
                  }))
                }}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Advogado
              </button>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all">
              <Save className="h-5 w-5" />
              Salvar Configurações
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'areas' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Áreas de Atuação & Qualificação
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure as áreas jurídicas que seu escritório atende e as perguntas de qualificação para cada uma.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {legalAreas.map((area) => {
                const AreaIcon = getAreaIcon(area.id)
                const isEditing = editingArea === area.id
                
                return (
                  <motion.div
                    key={area.id}
                    layout
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      area.active
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          area.active 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                        )}>
                          <AreaIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {area.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {area.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingArea(isEditing ? null : area.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all"
                          title="Editar perguntas"
                        >
                          {isEditing ? <EyeOff className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleArea(area.id)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            area.active ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              area.active ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Perguntas de Qualificação
                          </label>
                          <div className="space-y-2">
                            {area.qualificationQuestions.map((question, qIndex) => (
                              <div key={qIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={question}
                                  onChange={(e) => {
                                    const newQuestions = [...area.qualificationQuestions]
                                    newQuestions[qIndex] = e.target.value
                                    setLegalAreas(prev => prev.map(a =>
                                      a.id === area.id ? { ...a, qualificationQuestions: newQuestions } : a
                                    ))
                                  }}
                                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                  onClick={() => {
                                    const newQuestions = area.qualificationQuestions.filter((_, i) => i !== qIndex)
                                    setLegalAreas(prev => prev.map(a =>
                                      a.id === area.id ? { ...a, qualificationQuestions: newQuestions } : a
                                    ))
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newQuestions = [...area.qualificationQuestions, '']
                                setLegalAreas(prev => prev.map(a =>
                                  a.id === area.id ? { ...a, qualificationQuestions: newQuestions } : a
                                ))
                              }}
                              className="w-full p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all text-sm flex items-center justify-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Adicionar Pergunta
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {!isEditing && area.active && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Perguntas de qualificação ({area.qualificationQuestions.length}):
                        </p>
                        <div className="space-y-1">
                          {area.qualificationQuestions.slice(0, 2).map((question, index) => (
                            <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                              • {question}
                            </p>
                          ))}
                          {area.qualificationQuestions.length > 2 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              +{area.qualificationQuestions.length - 2} perguntas...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">247</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversas Hoje</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">89</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Leads Qualificados</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">23</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reuniões Agendadas</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">67%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Conversão</p>
            </div>
          </div>

          {/* Gráfico de Conversas por Área */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Conversas por Área Jurídica
            </h3>
            <div className="space-y-3">
              {legalAreas.filter(area => area.active).map((area) => {
                const AreaIcon = getAreaIcon(area.id)
                const percentage = Math.floor(Math.random() * 40) + 10
                
                return (
                  <div key={area.id} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-48">
                      <AreaIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {area.name}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}