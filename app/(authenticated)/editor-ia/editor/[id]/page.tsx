'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Save,
  Download,
  Share2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Brain,
  Sparkles,
  Copy,
  Send,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Wand2,
  FileSignature,
  Scale,
  User,
  Building,
  Calendar,
  Hash,
  ChevronDown,
  ChevronRight,
  Settings,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Importar BlockEditor dinamicamente
const BlockEditor = dynamic(() => import('@/components/editor/BlockEditor'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
})

interface PetitionData {
  id: string
  template: any
  description: string
  jurisprudences: string[]
  formData: Record<string, string>
  createdAt: string
  content?: string
}

export default function PetitionEditorPage() {
  const router = useRouter()
  const params = useParams()
  const [petitionData, setPetitionData] = useState<PetitionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'info'>('editor')

  useEffect(() => {
    // Carregar dados da petição do localStorage
    const loadPetitionData = () => {
      const data = localStorage.getItem('currentPetition')
      
      // Se não tem dados no localStorage, criar dados padrão
      if (!data) {
        const mockData = {
          id: Array.isArray(params.id) ? params.id[0] : params.id,
          template: { name: 'Documento Jurídico' },
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
          createdAt: new Date().toISOString()
        }
        
        const mockContent = `
          <h1>NOVO DOCUMENTO JURÍDICO</h1>
          
          <p>Este é um novo documento criado no Editor IA. Você pode editar cada bloco clicando nele ou usando a inteligência artificial.</p>
          
          <h2>SEÇÃO 1</h2>
          
          <p>Adicione o conteúdo do seu documento aqui. Cada parágrafo é um bloco editável que pode ser modificado individualmente.</p>
          
          <h2>SEÇÃO 2</h2>
          
          <p>Use o botão de IA (✨) em cada bloco para melhorar o texto com inteligência artificial.</p>
          
          <p>Você também pode adicionar novos blocos usando o botão "Adicionar Bloco" no final do documento.</p>
        `
        
        setPetitionData({
          ...mockData,
          id: Array.isArray(params.id) ? params.id[0] : params.id,
          content: mockContent
        })
        setIsLoading(false)
        return
      }
      
      // Se tem dados, usar eles
      try {
        const parsed = JSON.parse(data)
        
        // Se já tem conteúdo, usar ele
        if (parsed.content) {
          setPetitionData(parsed)
          setIsLoading(false)
          return
        }
        
        // Gerar conteúdo mockado da petição
        const mockContent = `
          <h1>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO DA ___ VARA DO TRABALHO DE SÃO PAULO</h1>
          
          <p><strong>${parsed.formData.clientName || '[NOME DO RECLAMANTE]'}</strong>, brasileiro(a), ${parsed.formData.role || '[profissão]'}, 
          portador(a) do CPF nº ${parsed.formData.clientCPF || '___.___.___-__'}, residente e domiciliado(a) na 
          ${parsed.formData.clientAddress || '[endereço completo]'}, vem, respeitosamente, à presença de Vossa Excelência, 
          por seu advogado que esta subscreve, propor a presente</p>
          
          <h2>RECLAMAÇÃO TRABALHISTA</h2>
          
          <p>em face de <strong>${parsed.formData.defendantName || '[NOME DA EMPRESA]'}</strong>, pessoa jurídica de direito privado, 
          inscrita no CNPJ sob o nº ${parsed.formData.defendantCNPJ || '__.___.___/____-__'}, com sede na 
          ${parsed.formData.defendantAddress || '[endereço da empresa]'}, pelos fatos e fundamentos jurídicos que passa a expor:</p>
          
          <h3>I - DOS FATOS</h3>
          
          <p>O(a) reclamante foi admitido(a) pela reclamada em ${parsed.formData.admissionDate || '__/__/____'}, 
          para exercer a função de ${parsed.formData.role || '[cargo]'}, com salário mensal de R$ ${parsed.formData.salary || '_____,__'}.</p>
          
          <p>${parsed.description || 'Durante o período laborado, o reclamante cumpriu regularmente suas obrigações, tendo sido dispensado sem justa causa, sem o pagamento correto das verbas rescisórias devidas.'}</p>
          
          <h3>II - DO DIREITO</h3>
          
          <p>A Consolidação das Leis do Trabalho, em seu artigo 477, estabelece que o empregador deve quitar 
          as verbas rescisórias nos prazos legalmente estabelecidos, sob pena de pagamento de multa.</p>
          
          <p>Conforme entendimento pacífico da jurisprudência trabalhista, é direito do trabalhador receber 
          todas as verbas decorrentes da rescisão contratual, incluindo aviso prévio, férias proporcionais 
          acrescidas de 1/3, 13º salário proporcional e multa de 40% sobre o FGTS.</p>
          
          <h3>III - DOS PEDIDOS</h3>
          
          <p>Ante o exposto, requer:</p>
          
          <p>a) A condenação da reclamada ao pagamento das verbas rescisórias;</p>
          <p>b) Aviso prévio indenizado;</p>
          <p>c) 13º salário proporcional;</p>
          <p>d) Férias proporcionais acrescidas de 1/3;</p>
          <p>e) Multa de 40% sobre o FGTS;</p>
          <p>f) Liberação das guias para saque do FGTS e seguro-desemprego;</p>
          <p>g) Pagamento de honorários advocatícios;</p>
          
          <p>Dá-se à causa o valor de R$ 50.000,00.</p>
          
          <p>Nestes termos,<br>
          Pede deferimento.</p>
          
          <p>São Paulo, ${new Date().toLocaleDateString('pt-BR')}</p>
        `
        
        setPetitionData({
          ...parsed,
          content: mockContent
        })
      } catch (error) {
        console.error('Erro ao parsear dados:', error)
        // Se não encontrou dados, criar documento vazio
        const mockData = {
          id: Array.isArray(params.id) ? params.id[0] : params.id,
          template: { name: 'Documento Jurídico' },
          description: 'Documento criado no Editor IA',
          jurisprudences: [],
          formData: {},
          createdAt: new Date().toISOString(),
          content: '<h1>Novo Documento</h1><p>Comece a editar seu documento...</p>'
        }
        setPetitionData(mockData)
      }
      setIsLoading(false)
    }
    
    loadPetitionData()
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    // Simular salvamento
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
      // Salvar no localStorage
      if (petitionData) {
        localStorage.setItem('currentPetition', JSON.stringify(petitionData))
      }
    }, 1500)
  }

  const handleExport = () => {
    // Implementar exportação para PDF
    alert('Exportar para PDF - Em desenvolvimento')
  }

  const handleShare = () => {
    // Implementar compartilhamento
    alert('Compartilhar petição - Em desenvolvimento')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando petição...</p>
        </div>
      </div>
    )
  }

  if (!petitionData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Petição não encontrada
          </h2>
          <button
            onClick={() => router.push('/editor-ia')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Voltar para Petições
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/editor-ia')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <FileSignature className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {petitionData.template?.name || 'Nova Petição'}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Criado {new Date(petitionData.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    {lastSaved && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Exportar PDF"
              >
                <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Compartilhar"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Informações"
              >
                <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {[
              { id: 'editor', label: 'Editor', icon: Edit3 },
              { id: 'preview', label: 'Visualizar', icon: Eye },
              { id: 'info', label: 'Informações', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 border-b-2",
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
                >
                  <BlockEditor
                    initialContent={petitionData.content}
                    onChange={(blocks) => {
                      console.log('Blocos atualizados:', blocks)
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
                >
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: petitionData.content || '' }} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Dados do Cliente
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-gray-500">Nome</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                          {petitionData.formData.clientName || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">CPF</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                          {petitionData.formData.clientCPF || '-'}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-sm text-gray-500">Endereço</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                          {petitionData.formData.clientAddress || '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Dados da Parte Contrária
                    </h3>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm text-gray-500">Nome/Razão Social</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                          {petitionData.formData.defendantName || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-500">CNPJ/CPF</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white">
                          {petitionData.formData.defendantCNPJ || '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Scale className="h-5 w-5 text-blue-600" />
                      Jurisprudências Aplicadas
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {petitionData.jurisprudences.length} jurisprudências foram utilizadas nesta petição
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Assistant Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Assistente IA
                  </h3>
                  <p className="text-xs text-gray-500">Sempre pronto para ajudar</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Melhorar Redação
                </button>
                <button className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Seção
                </button>
                <button className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                  <Scale className="h-4 w-4" />
                  Sugerir Jurisprudência
                </button>
              </div>
            </div>

            {/* Document Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Estatísticas
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Palavras</span>
                  <span className="font-medium text-gray-900 dark:text-white">1.234</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Caracteres</span>
                  <span className="font-medium text-gray-900 dark:text-white">6.789</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Parágrafos</span>
                  <span className="font-medium text-gray-900 dark:text-white">15</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tempo de leitura</span>
                  <span className="font-medium text-gray-900 dark:text-white">5 min</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicar Petição
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar por E-mail
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir Petição
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}