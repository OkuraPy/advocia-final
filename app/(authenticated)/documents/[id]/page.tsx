'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  FileText,
  Download,
  Copy,
  Brain,
  Calendar,
  User,
  Tag,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Eye,
  X,
  FileType
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { formatFileSize, formatDate } from '@/lib/utils/format'
import { DocumentViewer } from '@/components/documents/DocumentViewer'

interface Document {
  id: string
  file_name: string
  document_type: string
  file_size: number
  created_at: string
  status: 'processing' | 'analyzed' | 'pending'
  client?: {
    id: string
    name: string
  }
  content?: string
  mime_type: string
  publicUrl: string
  title?: string
  analysis_result?: any
  analyzed_at?: string
}

interface AIAnalysis {
  tipo_documento: string
  titulo: string
  resumo_executivo: string
  objetivo_principal: string
  partes_envolvidas: Array<{
    nome: string
    tipo: string
    cpf_cnpj?: string
    qualificacao?: string
  }>
  pontos_principais: Array<{
    titulo: string
    descricao: string
    relevancia: string
    localizacao?: string
  }>
  clausulas_importantes?: Array<{
    tipo: string
    descricao: string
    impacto: string
  }>
  datas_relevantes: Array<{
    data: string
    descricao: string
    tipo: string
  }>
  valores_monetarios: Array<{
    valor: number
    descricao: string
    tipo: string
  }>
  riscos_identificados: Array<{
    tipo: string
    descricao: string
    probabilidade: string
    impacto: string
    mitigacao: string
  }>
  oportunidades?: Array<{
    descricao: string
    beneficio: string
    acao_recomendada: string
  }>
  proximos_passos: Array<{
    acao: string
    prazo: string
    responsavel: string
    observacao?: string
  }>
  alertas_juridicos?: Array<{
    tipo: string
    descricao: string
    gravidade: string
    recomendacao: string
  }>
  fundamentacao_legal?: Array<{
    lei: string
    artigo: string
    descricao: string
    aplicacao: string
  }>
  observacoes_tecnicas?: string
  qualidade_documento?: {
    completude: string
    clareza: string
    formalidade: string
    observacoes: string
  }
  recomendacoes_finais: string
}


// Função para normalizar dados da análise
const normalizeAnalysisData = (data: any): AIAnalysis => {
  // Se partes_envolvidas é um objeto, converter para array
  let partes_envolvidas = data.partes_envolvidas || []
  if (!Array.isArray(partes_envolvidas) && typeof partes_envolvidas === 'object') {
    // Converter objeto {contratante: {...}, contratado: {...}} para array
    partes_envolvidas = Object.entries(partes_envolvidas).map(([tipo, parte]: [string, any]) => ({
      ...parte,
      tipo: tipo
    }))
  }
  
  return {
    ...data,
    partes_envolvidas: partes_envolvidas || [],
    pontos_principais: data.pontos_principais || [],
    clausulas_importantes: data.clausulas_importantes || [],
    datas_relevantes: data.datas_relevantes || [],
    valores_monetarios: data.valores_monetarios || [],
    riscos_identificados: data.riscos_identificados || [],
    oportunidades: data.oportunidades || [],
    proximos_passos: data.proximos_passos || [],
    alertas_juridicos: data.alertas_juridicos || [],
    fundamentacao_legal: data.fundamentacao_legal || []
  }
}

// Componente de progresso da análise
const AnalysisProgress = () => {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Preparando análise...')
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    // Atualizar tempo decorrido
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    
    // Simular progresso baseado em tempo real (60 segundos)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 60) // 60 segundos (1 minuto)
        
        // Atualizar estágio baseado no progresso - melhor distribuição em 60s
        if (newProgress < 15) {
          setStage('Identificando tipo de documento...')
        } else if (newProgress < 30) {
          setStage('Extraindo partes e informações principais...')
        } else if (newProgress < 45) {
          setStage('Analisando cláusulas e valores...')
        } else if (newProgress < 60) {
          setStage('Identificando riscos e oportunidades...')
        } else if (newProgress < 75) {
          setStage('Analisando jurisprudência aplicável...')
        } else if (newProgress < 90) {
          setStage('Gerando recomendações jurídicas...')
        } else {
          setStage('Finalizando análise...')
        }
        
        return Math.min(newProgress, 95) // Máximo 95% até completar
      })
    }, 1000)
    
    return () => {
      clearInterval(timeInterval)
      clearInterval(progressInterval)
    }
  }, [])
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block"
        >
          <Brain className="h-12 w-12 text-slate-600" />
        </motion.div>
        <h3 className="text-lg font-semibold text-slate-900 mt-4">
          Analisando documento com IA
        </h3>
        <p className="text-sm text-slate-600 mt-2">
          Tempo estimado: aproximadamente 1 minuto
        </p>
      </div>
      
      {/* Barra de progresso */}
      <div className="relative">
        <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-slate-900 h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{Math.round(progress)}%</span>
          <span>{elapsedTime}s</span>
        </div>
      </div>
      
      {/* Estágio atual */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
          <p className="text-sm text-slate-700">{stage}</p>
        </div>
      </div>
      
      {/* Mensagens informativas */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          <p className="text-xs text-slate-600">
            <strong>Importante:</strong> Não feche esta aba durante a análise
          </p>
        </div>
        
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-slate-500 mt-0.5" />
          <p className="text-xs text-slate-600">
            Nossa IA está analisando detalhadamente seu documento jurídico para extrair insights valiosos
          </p>
        </div>
        
        {elapsedTime > 45 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
            <p className="text-xs text-slate-600">
              Análise detalhada em andamento, quase lá...
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Dica */}
      <div className="bg-slate-50 rounded-lg p-3 mt-4 border border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          💡 Dica: Após a análise, você poderá ver um resumo completo, riscos identificados e ações recomendadas
        </p>
      </div>
    </div>
  )
}

export default function DocumentViewPage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'highlights' | 'insights' | 'actions'>('highlights')
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }
      
      const data = await response.json()
      console.log('[Document View] Document data loaded:', data)
      setDocument(data)
      
      // Se já tem análise, carregar
      if (data.analysis_result) {
        console.log('[Document View] Found existing analysis:', data.analysis_result)
        // Normalizar formato de partes_envolvidas
        const normalizedAnalysis = normalizeAnalysisData(data.analysis_result)
        setAnalysis(normalizedAnalysis)
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar o documento',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyContent = () => {
    if (document?.content) {
      navigator.clipboard.writeText(document.content)
      addNotification({
        title: 'Conteúdo Copiado',
        message: 'O texto do documento foi copiado para a área de transferência',
        type: 'success'
      })
    }
  }

  const handleDownload = () => {
    if (document?.publicUrl) {
      window.open(document.publicUrl, '_blank')
      addNotification({
        title: 'Download Iniciado',
        message: 'O download do documento foi iniciado',
        type: 'success'
      })
    }
  }

  const handleAnalyze = async () => {
    if (!document) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documentId: document.id })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze document')
      }
      
      const analysisData = await response.json()
      console.log('[Document View] Analysis data received:', analysisData)
      const normalizedAnalysis = normalizeAnalysisData(analysisData)
      setAnalysis(normalizedAnalysis)
      setDocument(prev => prev ? { ...prev, status: 'analyzed', analysis_result: normalizedAnalysis } : null)
      
      addNotification({
        title: 'Análise Concluída',
        message: 'A IA terminou de analisar o documento jurídico',
        type: 'success'
      })
    } catch (error) {
      console.error('Error analyzing document:', error)
      addNotification({
        title: 'Erro na Análise',
        message: error instanceof Error ? error.message : 'Não foi possível analisar o documento',
        type: 'error'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getFileIcon = () => {
    if (!document) return <FileText className="h-5 w-5" />
    
    const ext = document.file_name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FileType className="h-5 w-5 text-red-600" />
      case 'doc':
      case 'docx':
        return <FileType className="h-5 w-5 text-blue-600" />
      case 'txt':
        return <FileText className="h-5 w-5 text-slate-600" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando documento...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Documento não encontrado</h2>
          <button 
            onClick={() => router.push('/documents')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Voltar para Documentos
          </button>
        </div>
      </div>
    )
  }

  // Check if document is text-based (not PDF for now)
  const isTextDocument = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(document.mime_type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/documents')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getFileIcon()}
                <h1 className="text-2xl font-semibold text-slate-900">
                  {document.title || document.file_name}
                </h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(document.created_at)}
                </div>
                {document.client && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {document.client.name}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {document.document_type}
                </div>
                <div className="text-xs">
                  {formatFileSize(document.file_size)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Baixar Original
            </button>
            
            {document.status === 'pending' && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 inline mr-2" />
                    Analisar com IA
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '850px' }}>
        {/* Document Content */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Conteúdo do Documento
              </h2>
            </div>
            <div className="h-[800px] overflow-hidden">
              {document.status === 'processing' ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600">
                      Processando documento...
                    </p>
                  </div>
                </div>
              ) : (
                <DocumentViewer
                  fileUrl={document.publicUrl}
                  fileName={document.file_name}
                  mimeType={document.mime_type}
                  content={document.content}
                />
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div>
          <div className="bg-white border border-slate-200 rounded-lg h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-slate-600" />
                Análise com IA
              </h2>
            </div>
            
            <div className="h-[calc(800px-73px)] overflow-hidden">
              {document.status === 'analyzed' && document.analysis_result ? (
                <>
                  {/* Tab Navigation */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveTab('highlights')}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === 'highlights'
                          ? "text-slate-900 border-b-2 border-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Resumo
                    </button>
                    <button
                      onClick={() => setActiveTab('insights')}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === 'insights'
                          ? "text-slate-900 border-b-2 border-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Análise
                    </button>
                    <button
                      onClick={() => setActiveTab('actions')}
                      className={cn(
                        "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                        activeTab === 'actions'
                          ? "text-slate-900 border-b-2 border-slate-900"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      Ações
                    </button>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="p-6 h-full overflow-y-auto">
                    {analysis ? (
                      <>
                        {activeTab === 'highlights' ? (
                          <div className="space-y-4">
                            {/* Tipo de Documento */}
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-500">Tipo:</span>
                              <span className="font-semibold text-slate-900 capitalize">
                                {analysis.tipo_documento}
                              </span>
                            </div>

                            {/* Resumo Executivo */}
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4 text-slate-600" />
                                Resumo Executivo
                              </h3>
                              <p className="text-sm text-slate-700">
                                {analysis.resumo_executivo}
                              </p>
                            </div>

                            {/* Objetivo Principal */}
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <h3 className="font-semibold text-slate-900 mb-2">
                                Objetivo Principal
                              </h3>
                              <p className="text-sm text-slate-700">
                                {analysis.objetivo_principal}
                              </p>
                            </div>

                            {/* Partes Envolvidas */}
                            {analysis.partes_envolvidas && Array.isArray(analysis.partes_envolvidas) && analysis.partes_envolvidas.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Partes Envolvidas
                                </h3>
                                <div className="space-y-3">
                                  {analysis.partes_envolvidas.map((parte, index) => (
                                    <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                      <div className="space-y-2">
                                        {/* Nome e Tipo */}
                                        <div>
                                          <p className="font-medium text-slate-900">
                                            {parte.nome}
                                          </p>
                                          <p className="text-sm text-slate-600 capitalize mt-0.5">
                                            {parte.tipo}
                                          </p>
                                        </div>
                                        
                                        {/* CPF/CNPJ em linha separada */}
                                        {parte.cpf_cnpj && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-500">
                                              {parte.cpf_cnpj.length > 14 ? 'CNPJ:' : 'CPF:'}
                                            </span>
                                            <span className="font-mono text-slate-700">
                                              {parte.cpf_cnpj}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {/* Qualificação */}
                                        {parte.qualificacao && (
                                          <p className="text-sm text-slate-600 pt-1 border-t border-slate-200">
                                            {parte.qualificacao}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Valores Monetários */}
                            {analysis.valores_monetarios && Array.isArray(analysis.valores_monetarios) && analysis.valores_monetarios.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3">
                                  Valores Identificados
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                  {analysis.valores_monetarios.map((valor, index) => (
                                    <div key={index} className="flex items-center justify-between bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                                      <div>
                                        <p className="text-sm font-medium text-emerald-800">
                                          {new Intl.NumberFormat('pt-BR', { 
                                            style: 'currency', 
                                            currency: 'BRL' 
                                          }).format(valor.valor)}
                                        </p>
                                        <p className="text-xs text-emerald-700">
                                          {valor.descricao}
                                        </p>
                                      </div>
                                      <span className="text-xs text-emerald-600 capitalize">
                                        {valor.tipo}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Datas Relevantes */}
                            {analysis.datas_relevantes && Array.isArray(analysis.datas_relevantes) && analysis.datas_relevantes.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Datas Importantes
                                </h3>
                                <div className="space-y-2">
                                  {analysis.datas_relevantes.map((data, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm">
                                      <span className="font-medium text-slate-900">
                                        {new Date(data.data).toLocaleDateString('pt-BR')}
                                      </span>
                                      <span className="text-slate-600">
                                        {data.descricao}
                                      </span>
                                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {data.tipo}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : activeTab === 'insights' ? (
                          <div className="space-y-4">
                            {/* Pontos Principais */}
                            <div>
                              <h3 className="font-semibold text-slate-900 mb-3">
                                Pontos Principais
                              </h3>
                              <div className="space-y-3">
                                {analysis.pontos_principais.map((ponto, index) => (
                                  <div key={index} className="border-l-4 border-slate-500 pl-4">
                                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                      {ponto.titulo}
                                      <span className={cn(
                                        "text-xs px-2 py-1 rounded",
                                        ponto.relevancia === 'alta' 
                                          ? 'bg-red-100 text-red-700'
                                          : ponto.relevancia === 'média'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-slate-100 text-slate-700'
                                      )}>
                                        {ponto.relevancia}
                                      </span>
                                    </h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {ponto.descricao}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Riscos Identificados */}
                            {analysis.riscos_identificados.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                  Riscos Identificados
                                </h3>
                                <div className="space-y-3">
                                  {analysis.riscos_identificados.map((risco, index) => (
                                    <div key={index} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                      <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-amber-900">
                                          {risco.tipo}
                                        </h4>
                                        <div className="flex gap-2">
                                          <span className={cn(
                                            "text-xs px-2 py-1 rounded",
                                            risco.probabilidade === 'alta' 
                                              ? 'bg-red-200 text-red-800'
                                              : risco.probabilidade === 'média'
                                              ? 'bg-yellow-200 text-yellow-800'
                                              : 'bg-green-200 text-green-800'
                                          )}>
                                            Prob: {risco.probabilidade}
                                          </span>
                                          <span className={cn(
                                            "text-xs px-2 py-1 rounded",
                                            risco.impacto === 'alto' 
                                              ? 'bg-red-200 text-red-800'
                                              : risco.impacto === 'médio'
                                              ? 'bg-yellow-200 text-yellow-800'
                                              : 'bg-green-200 text-green-800'
                                          )}>
                                            Impacto: {risco.impacto}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-amber-800 mb-2">
                                        {risco.descricao}
                                      </p>
                                      <div className="bg-amber-100 rounded p-2 border border-amber-300">
                                        <p className="text-xs text-amber-900">
                                          <strong>Mitigação:</strong> {risco.mitigacao}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Alertas Jurídicos */}
                            {analysis.alertas_juridicos && analysis.alertas_juridicos.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  Alertas Jurídicos
                                </h3>
                                <div className="space-y-2">
                                  {analysis.alertas_juridicos.map((alerta, index) => (
                                    <div key={index} className={cn(
                                      "rounded-lg p-3",
                                      alerta.gravidade === 'crítico' 
                                        ? 'bg-red-50 border border-red-200'
                                        : alerta.gravidade === 'alto'
                                        ? 'bg-orange-50 border border-orange-200'
                                        : 'bg-yellow-50 border border-yellow-200'
                                    )}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-900">
                                          {alerta.tipo}
                                        </span>
                                        <span className={cn(
                                          "text-xs px-2 py-0.5 rounded",
                                          alerta.gravidade === 'crítico' 
                                            ? 'bg-red-600 text-white'
                                            : alerta.gravidade === 'alto'
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-yellow-600 text-white'
                                        )}>
                                          {alerta.gravidade}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-700">
                                        {alerta.descricao}
                                      </p>
                                      <p className="text-xs text-slate-600 mt-2">
                                        <strong>Recomendação:</strong> {alerta.recomendacao}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Qualidade do Documento */}
                            {analysis.qualidade_documento && (
                              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-3">
                                  Qualidade do Documento
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Completude</p>
                                    <p className={cn(
                                      "font-medium",
                                      analysis.qualidade_documento.completude === 'completo'
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                    )}>
                                      {analysis.qualidade_documento.completude}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Clareza</p>
                                    <p className={cn(
                                      "font-medium",
                                      analysis.qualidade_documento.clareza === 'claro'
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                    )}>
                                      {analysis.qualidade_documento.clareza}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Formalidade</p>
                                    <p className={cn(
                                      "font-medium",
                                      analysis.qualidade_documento.formalidade === 'adequada'
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                    )}>
                                      {analysis.qualidade_documento.formalidade}
                                    </p>
                                  </div>
                                </div>
                                {analysis.qualidade_documento.observacoes && (
                                  <p className="text-sm text-slate-600 mt-3">
                                    {analysis.qualidade_documento.observacoes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          // activeTab === 'actions'
                          <div className="space-y-4">
                            {/* Próximos Passos */}
                            <div>
                              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Próximos Passos
                              </h3>
                              <div className="space-y-3">
                                {analysis.proximos_passos.map((passo, index) => (
                                  <div key={index} className={cn(
                                    "border rounded-lg p-4",
                                    passo.prazo === 'urgente'
                                      ? 'border-red-200 bg-red-50'
                                      : passo.prazo === 'curto prazo'
                                      ? 'border-amber-200 bg-amber-50'
                                      : 'border-slate-200'
                                  )}>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-slate-900">
                                          {passo.acao}
                                        </h4>
                                        {passo.observacao && (
                                          <p className="text-sm text-slate-600 mt-1">
                                            {passo.observacao}
                                          </p>
                                        )}
                                      </div>
                                      <span className={cn(
                                        "text-xs px-2 py-1 rounded ml-3",
                                        passo.prazo === 'urgente'
                                          ? 'bg-red-600 text-white'
                                          : passo.prazo === 'curto prazo'
                                          ? 'bg-amber-600 text-white'
                                          : 'bg-slate-600 text-white'
                                      )}>
                                        {passo.prazo}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                      Responsável: {passo.responsavel}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Oportunidades */}
                            {analysis.oportunidades && analysis.oportunidades.length > 0 && (
                              <div>
                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-emerald-600" />
                                  Oportunidades
                                </h3>
                                <div className="space-y-3">
                                  {analysis.oportunidades.map((op, index) => (
                                    <div key={index} className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                      <h4 className="font-medium text-emerald-900 mb-1">
                                        {op.descricao}
                                      </h4>
                                      <p className="text-sm text-emerald-800 mb-2">
                                        <strong>Benefício:</strong> {op.beneficio}
                                      </p>
                                      <div className="bg-emerald-100 rounded p-2 border border-emerald-300">
                                        <p className="text-xs text-emerald-900">
                                          <strong>Ação recomendada:</strong> {op.acao_recomendada}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recomendações Finais */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                              <h3 className="font-semibold text-slate-900 mb-3">
                                Recomendações Finais
                              </h3>
                              <p className="text-sm text-slate-700">
                                {analysis.recomendacoes_finais}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">
                          Análise não disponível. Clique em "Analisar com IA" para gerar insights.
                        </p>
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 inline mr-2" />
                              Analisar com IA
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : document.status === 'processing' || isAnalyzing ? (
                <div className="p-6">
                  <AnalysisProgress />
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Brain className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    Este documento ainda não foi analisado
                  </p>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 inline mr-2" />
                        Analisar com IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}