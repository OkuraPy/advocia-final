'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Search,
  Scale,
  Sparkles,
  Clock,
  BookOpen,
  FileText,
  Filter,
  Download,
  Copy,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Calendar,
  Gavel,
  Building2,
  ExternalLink,
  Hash,
  Loader2,
  History,
  Bookmark,
  Trash2,
  TrendingUp,
  Brain,
  Shield,
  DollarSign,
  Users,
  FileCheck,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { 
  legalSearchService, 
  type JurisprudenceResult, 
  type AIAnalysis,
  QUICK_SEARCH_BUTTONS 
} from '@/lib/services/legal-search.service'

// Icon mapping
const iconMap: { [key: string]: React.ComponentType<any> } = {
  AlertCircle,
  Clock,
  FileText,
  AlertTriangle,
  Users,
  XCircle: AlertCircle,
  Shield,
  DollarSign
}

export default function LegalSearchPage() {
  const { addNotification } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'smart' | 'quick'>('smart')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<JurisprudenceResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [selectedQuickButton, setSelectedQuickButton] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'stj' | 'stf' | 'tjsp'>('all')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load search history
  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = async () => {
    try {
      const history = await legalSearchService.getSearchHistory()
      setSearchHistory(history)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  // Handle search
  const handleSearch = async (query?: string) => {
    let searchText = query || searchQuery.trim()
    
    // Se é busca rápida com botão selecionado, combina a query base com a personalização
    if (searchMode === 'quick' && selectedQuickButton && !query) {
      const button = QUICK_SEARCH_BUTTONS.find(b => b.id === selectedQuickButton)
      if (button) {
        searchText = searchQuery.trim() 
          ? `${button.query} - Detalhes específicos: ${searchQuery.trim()}`
          : button.query
      }
    }
    
    if (!searchText) {
      addNotification({
        title: 'Campo vazio',
        message: searchMode === 'smart' ? 'Digite ou cole o contexto do caso' : 'Selecione um tipo de caso',
        type: 'error'
      })
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await legalSearchService.performSearch({
        query: searchText,
        type: searchMode === 'smart' ? 'context' : 'quick'
      }, selectedQuickButton || undefined)
      
      setSearchResults(response.results)
      setAiAnalysis(response.analysis)
      
      addNotification({
        title: 'Pesquisa concluída',
        message: `${response.results.length} resultados encontrados`,
        type: 'success'
      })
      
      loadSearchHistory()
    } catch (error) {
      console.error('Search error:', error)
      addNotification({
        title: 'Erro na pesquisa',
        message: 'Não foi possível realizar a pesquisa',
        type: 'error'
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
      addNotification({
        title: 'Copiado!',
        message: 'Texto copiado para área de transferência',
        type: 'success'
      })
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Não foi possível copiar o texto',
        type: 'error'
      })
    }
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || AlertCircle
  }

  // Filter results
  const filteredResults = searchResults.filter(result => {
    if (selectedFilter === 'all') return true
    return result.tribunal?.toLowerCase() === selectedFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Pesquisa Legal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Busque jurisprudências e precedentes com análise de IA
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <History className="w-4 h-4" />
          Histórico
          {searchHistory.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-900 text-white rounded-full">
              {searchHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSearchMode('smart')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                searchMode === 'smart'
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Brain className="w-4 h-4" />
              Busca Inteligente
            </button>
            <button
              onClick={() => setSearchMode('quick')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                searchMode === 'quick'
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Busca Rápida
            </button>
          </div>

          {/* Search Input */}
          {searchMode === 'smart' ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cole aqui a petição, descrição do caso ou contexto jurídico para buscar precedentes relevantes..."
                  className="w-full min-h-[150px] px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Quanto mais detalhes, melhores serão os resultados
                </p>
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching || !searchQuery.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar Jurisprudências
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected quick search input */}
              {selectedQuickButton && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-1">
                      Tipo selecionado: {QUICK_SEARCH_BUTTONS.find(b => b.id === selectedQuickButton)?.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      Base: {QUICK_SEARCH_BUTTONS.find(b => b.id === selectedQuickButton)?.query}
                    </p>
                  </div>
                  <textarea
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Adicione detalhes específicos do seu caso aqui... (valores, datas, nomes das partes, circunstâncias)"
                    className="w-full min-h-[100px] px-4 py-3 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSearch()}
                      disabled={isSearching}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Buscar com Personalização
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Search Buttons */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">
                  {selectedQuickButton ? 'Ou escolha outro tipo:' : 'Selecione o tipo de caso:'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {QUICK_SEARCH_BUTTONS.map((button) => {
                    const Icon = getIconComponent(button.icon)
                    return (
                      <button
                        key={button.id}
                        onClick={() => {
                          setSelectedQuickButton(button.id)
                          setSearchQuery('') // Limpa o campo ao selecionar
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                          selectedQuickButton === button.id
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <Icon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-900">
                          {button.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          {isSearching ? (
            // Loading State
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-slate-900 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-900">Analisando jurisprudências...</p>
                  <p className="text-sm text-slate-500 mt-1">Isso pode levar alguns segundos</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">Filtrar por tribunal:</span>
                    <div className="flex gap-2">
                      {['all', 'stj', 'stf', 'tjsp'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter as any)}
                          className={cn(
                            "px-3 py-1 text-sm rounded-lg transition-colors",
                            selectedFilter === filter
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {filter === 'all' ? 'Todos' : filter.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    {filteredResults.length} resultados
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Results */}
                <div className="lg:col-span-2 space-y-4">
                  {filteredResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                    >
                      {/* Result Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                              {result.tribunal}
                            </span>
                            <span className="text-xs text-slate-500">
                              {result.numero}
                            </span>
                          </div>
                          <h3 className="font-medium text-slate-900">
                            {result.title}
                          </h3>
                          {result.relator && (
                            <p className="text-sm text-slate-500 mt-1">
                              {result.relator}
                            </p>
                          )}
                        </div>
                        {result.relevancia && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-medium text-emerald-600">
                              {result.relevancia}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ementa */}
                      <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                        {result.ementa}
                      </p>

                      {/* Tags */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {result.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-slate-50 text-slate-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {result.data && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(result.data).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* AI Analysis Sidebar */}
                {aiAnalysis && (
                  <div className="space-y-4">
                    {/* Summary Card */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-slate-600" />
                        <h3 className="font-medium text-slate-900">Análise da IA</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        {aiAnalysis.summary}
                      </p>
                      <div className="space-y-2">
                        {aiAnalysis.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-600">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ready to Copy */}
                    {aiAnalysis.readyToCopy && (
                      <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-slate-900">
                            Texto para Petição
                          </h3>
                          <button
                            onClick={() => copyToClipboard(aiAnalysis.readyToCopy)}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            {copiedText === aiAnalysis.readyToCopy ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 italic">
                          "{aiAnalysis.readyToCopy}"
                        </p>
                      </div>
                    )}

                    {/* Top Decisions */}
                    {aiAnalysis.topDecisions && aiAnalysis.topDecisions.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-sm font-medium text-slate-900 mb-3">
                          Principais Decisões
                        </h3>
                        <div className="space-y-3">
                          {aiAnalysis.topDecisions.map((decision, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs font-medium text-slate-700">
                                {decision.tribunal} - {decision.numero}
                              </p>
                              <p className="text-xs text-slate-600 mt-1">
                                {decision.decisao}
                              </p>
                              {decision.valor && (
                                <p className="text-xs font-medium text-emerald-600 mt-1">
                                  R$ {(decision.valor / 1000).toFixed(0)}k
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !isSearching && (
        <div className="bg-white border border-slate-200 rounded-lg p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Comece sua pesquisa jurídica
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Use a busca inteligente para colar o contexto do seu caso ou escolha a busca rápida para casos comuns
            </p>
          </div>
        </div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Histórico de Pesquisas
                </h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {searchHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhuma pesquisa realizada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">
                              {item.query}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {item.results_count} resultados
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                              <Bookmark className="w-4 h-4 text-slate-400" />
                            </button>
                            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}