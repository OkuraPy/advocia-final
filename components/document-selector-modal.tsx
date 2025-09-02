'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  X, 
  Search,
  Loader2,
  Check,
  Calendar,
  FileType,
  AlertCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Document {
  id: string
  title: string
  file_name: string
  file_type: string
  file_size: number
  content?: string
  ai_summary?: string
  created_at: string
  document_type?: string
  client?: {
    name: string
  }
}

interface DocumentSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectDocuments: (documents: Document[]) => void
  selectedDocuments?: Document[]
}

export default function DocumentSelectorModal({
  isOpen,
  onClose,
  onSelectDocuments,
  selectedDocuments = []
}: DocumentSelectorModalProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedDocuments.map(d => d.id))
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchDocuments()
    }
  }, [isOpen])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/documents')
      if (!response.ok) throw new Error('Falha ao carregar documentos')
      
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setError('Não foi possível carregar os documentos')
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const query = searchQuery.toLowerCase()
    return (
      doc.title?.toLowerCase().includes(query) ||
      doc.file_name?.toLowerCase().includes(query) ||
      doc.document_type?.toLowerCase().includes(query) ||
      doc.client?.name?.toLowerCase().includes(query)
    )
  })

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedIds(newSelected)
  }

  const handleConfirm = () => {
    const selected = documents.filter(doc => selectedIds.has(doc.id))
    onSelectDocuments(selected)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    const colors: Record<string, string> = {
      pdf: 'text-red-500',
      docx: 'text-blue-500',
      doc: 'text-blue-500',
      txt: 'text-gray-500',
      jpg: 'text-green-500',
      png: 'text-green-500'
    }
    return colors[fileType] || 'text-gray-400'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-3xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden z-[101]"
          >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Selecionar Documentos
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={fetchDocuments}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Nenhum documento encontrado' : 'Você ainda não tem documentos'}
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredDocuments.map((doc) => {
                  const isSelected = selectedIds.has(doc.id)
                  return (
                    <motion.div
                      key={doc.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleDocument(doc.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className={cn(
                          "mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          "p-2 rounded-lg bg-gray-100 dark:bg-gray-800",
                          getFileIcon(doc.file_type)
                        )}>
                          <FileText className="h-5 w-5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {doc.title || doc.file_name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileType className="h-3 w-3" />
                              {doc.file_type?.toUpperCase()}
                            </span>
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            {doc.client?.name && (
                              <span className="text-blue-600 dark:text-blue-400">
                                {doc.client.name}
                              </span>
                            )}
                          </div>
                          {doc.ai_summary && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {doc.ai_summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedIds.size} documento(s) selecionado(s)
              </span>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedIds.size === 0}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors",
                    selectedIds.size > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  Anexar {selectedIds.size > 0 && `(${selectedIds.size})`}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}