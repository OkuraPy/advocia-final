'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Brain,
  Send,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  FileText,
  Scale,
  Briefcase,
  Gavel,
  BookOpen,
  AlertCircle,
  MessageSquare,
  Bot,
  User,
  Loader2,
  Download,
  Plus,
  Paperclip,
  ArrowRight,
  Building2,
  Heart,
  Banknote,
  Users,
  Home,
  Shield,
  Globe,
  Zap,
  ChevronUp,
  Edit3,
  FileSearch,
  PenTool,
  Calculator,
  CheckCircle,
  X,
  Search,
  History,
  Lightbulb,
  Menu,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { 
  aiChatService, 
  AI_AGENTS,
  type AIConversation,
  type AIMessage as AIMessageType,
  type Agent 
} from '@/lib/services/ai-chat.service'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DocumentSelectorModal, { type Document } from '@/components/document-selector-modal'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isTyping?: boolean
  attachedDocuments?: Document[]
  status?: 'sending' | 'sent' | 'error'
  tempId?: string
}

// Map agent icons
const agentIcons: Record<string, any> = {
  Brain,
  Scale,
  Briefcase,
  Banknote,
  Shield,
  Building2,
  Heart,
  FileSearch
}

const agents = AI_AGENTS.map(agent => ({
  ...agent,
  icon: agentIcons[agent.icon] || Brain
}))


export default function AIAssistantPage() {
  const { addNotification } = useAppStore()
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([])
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showLeftSidebar, setShowLeftSidebar] = useState(true)
  const [showRightSidebar, setShowRightSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load conversations from database
  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const convs = await aiChatService.getConversations()
      setConversations(convs)
      
      // Don't auto-select any conversation - show welcome screen
      // if (convs.length > 0 && !currentConversationId) {
      //   setCurrentConversationId(convs[0].id)
      //   await loadMessages(convs[0].id)
      // }
    } catch (error) {
      console.error('Error loading conversations:', error)
      addNotification({
        title: 'Erro ao carregar conversas',
        message: 'Não foi possível carregar o histórico de conversas',
        type: 'error'
      })
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await aiChatService.getMessages(conversationId)
      const formattedMessages: Message[] = msgs.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }))
      setMessages(formattedMessages)
      
      // Set the agent based on conversation
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        const agent = agents.find(a => a.id === conversation.agent_id)
        if (agent) setSelectedAgent(agent)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Change conversation
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId)
    }
  }, [currentConversationId])
  
  // Update conversation's agent in state when selectedAgent changes
  useEffect(() => {
    if (currentConversationId && selectedAgent) {
      // Update the conversation in the local state to reflect the new agent
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId
          ? { ...conv, agent_id: selectedAgent.id }
          : conv
      ))
    }
  }, [selectedAgent, currentConversationId])

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Create new temporary conversation or switch agent
  const createNewConversation = async (agentId?: string) => {
    const agent = agents.find(a => a.id === agentId) || selectedAgent
    const initialMessage = `Olá! Sou ${agent.name}. ${agent.description}. Como posso ajudá-lo hoje?`
    
    // Check if we're in a temporary conversation (not saved yet)
    const isTemporaryConversation = currentConversationId?.startsWith('temp-')
    
    // Check if current conversation has real messages
    const hasRealMessages = messages.some(m => 
      m.role === 'user' || (m.role === 'assistant' && !m.id.startsWith('initial-'))
    )
    
    // If temporary conversation or empty saved conversation, just switch agent
    if ((isTemporaryConversation || (currentConversationId && !hasRealMessages)) && !inputValue.trim()) {
      setSelectedAgent(agent)
      setMessages([{
        id: 'initial-1',
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date()
      }])
      
      // If it's not temporary but empty, update in database
      if (!isTemporaryConversation && currentConversationId) {
        await aiChatService.updateConversationAgent(currentConversationId, agent.id)
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, agent_id: agent.id }
            : conv
        ))
      }
      
      addNotification({
        title: 'Especialista alterado',
        message: `Agora conversando com ${agent.name}`,
        type: 'info'
      })
      return
    }
    
    // If we have real messages, create a new saved conversation
    if (hasRealMessages && currentConversationId && !isTemporaryConversation) {
      try {
        const conversation = await aiChatService.createConversation(
          agent.id,
          'Nova conversa',
          initialMessage
        )
        
        if (conversation) {
          setConversations(prev => [conversation, ...prev])
          setCurrentConversationId(conversation.id)
          setMessages([{
            id: 'initial-1',
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date()
          }])
          setInputValue('')
          setAttachedFiles([])
          setAttachedDocuments([])
          setSelectedAgent(agent)
          
          addNotification({
            title: 'Nova conversa criada',
            message: `Conversa com ${agent.name} iniciada`,
            type: 'success'
          })
        }
      } catch (error) {
        console.error('Error creating conversation:', error)
        addNotification({
          title: 'Erro ao criar conversa',
          message: 'Não foi possível iniciar uma nova conversa',
          type: 'error'
        })
      }
      return
    }
    
    // Otherwise create a temporary conversation (not saved to DB yet)
    const tempId = `temp-${Date.now()}`
    setCurrentConversationId(tempId)
    setMessages([{
      id: 'initial-1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }])
    setInputValue('')
    setAttachedFiles([])
    setAttachedDocuments([])
    setSelectedAgent(agent)
    
    addNotification({
      title: 'Chat iniciado',
      message: `Conversando com ${agent.name}`,
      type: 'info'
    })
  }

  // Handle send message with streaming
  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    if (!messageContent || isLoading || !currentConversationId) return
    
    // If it's a temporary conversation, create a real one now
    let conversationId = currentConversationId
    if (currentConversationId.startsWith('temp-')) {
      try {
        const conversation = await aiChatService.createConversation(
          selectedAgent.id,
          messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : ''),
          messages[0]?.content // Initial greeting message
        )
        
        if (conversation) {
          conversationId = conversation.id
          setCurrentConversationId(conversation.id)
          setConversations(prev => [conversation, ...prev])
        } else {
          throw new Error('Failed to create conversation')
        }
      } catch (error) {
        console.error('Error creating conversation:', error)
        addNotification({
          title: 'Erro ao salvar conversa',
          message: 'Não foi possível salvar a conversa',
          type: 'error'
        })
        return
      }
    }

    // Prepare document context
    let fullContent = messageContent
    if (attachedDocuments.length > 0) {
      const docsContext = attachedDocuments.map(doc => 
        `[Documento: ${doc.title || doc.file_name}]\n${doc.content || doc.ai_summary || ''}`
      ).join('\n\n')
      fullContent = `${messageContent}\n\n[Contexto dos documentos anexados:]\n${docsContext}`
    }

    // Save attached documents for display
    const currentAttachedDocs = [...attachedDocuments]
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    
    // Add message immediately (optimistic update)
    const optimisticMessage: Message = {
      id: tempId,
      tempId: tempId,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachedDocuments: currentAttachedDocs,
      status: 'sending'
    }
    
    setMessages(prev => [...prev, optimisticMessage])
    setInputValue('')
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')
    setAttachedFiles([])
    setAttachedDocuments([])

    // Update title if it's the first real message
    if (messages.length === 1) {
      const title = messageContent.slice(0, 30) + (messageContent.length > 30 ? '...' : '')
      await aiChatService.updateConversationTitle(currentConversationId, title)
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, title }
          : conv
      ))
    }

    let userMessageId = ''
    let accumulatedContent = ''
    let aiMessageData: any = null

    try {
      // Use streaming API
      await aiChatService.sendMessageStream(
        conversationId,
        fullContent,
        selectedAgent.id,
        // On chunk received
        (chunk: string) => {
          accumulatedContent += chunk
          setStreamingContent(accumulatedContent)
        },
        // On user message saved
        (userMessage: any) => {
          userMessageId = userMessage.id
          // Update the optimistic message with real ID and status
          setMessages(prev => prev.map(msg => 
            msg.tempId === tempId 
              ? {
                  ...msg,
                  id: userMessage.id,
                  status: 'sent',
                  timestamp: new Date(userMessage.created_at)
                }
              : msg
          ))
        },
        // On AI message saved
        (aiMessage: any) => {
          aiMessageData = aiMessage
        }
      )

      // After streaming completes, add the final AI message
      if (accumulatedContent) {
        const finalAiMessage: Message = {
          id: aiMessageData?.id || 'ai-' + Date.now(),
          role: 'assistant',
          content: accumulatedContent,
          timestamp: aiMessageData ? new Date(aiMessageData.created_at) : new Date()
        }

        setMessages(prev => [...prev, finalAiMessage])
        setStreamingContent('')

        // Update conversation in list
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message: accumulatedContent.slice(0, 50) + '...', 
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            : conv
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setStreamingContent('')
      
      // Mark message as error
      setMessages(prev => prev.map(msg => 
        msg.tempId === tempId 
          ? { ...msg, status: 'error' }
          : msg
      ))
      
      addNotification({
        title: 'Erro ao enviar mensagem',
        message: 'Não foi possível obter resposta da IA',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }


  // Handle file attachment
  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
    addNotification({
      title: 'Arquivo anexado',
      message: `${files.length} arquivo(s) anexado(s) com sucesso`,
      type: 'success'
    })
  }

  // Remove attached file
  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    addNotification({
      title: 'Texto Copiado',
      message: 'O conteúdo foi copiado para a área de transferência',
      type: 'success'
    })
  }
  
  // Retry failed message
  const retryMessage = async (message: Message) => {
    if (message.status !== 'error') return
    
    // Remove error message and resend
    setMessages(prev => prev.filter(m => m.id !== message.id))
    await handleSendMessage(message.content)
  }

  // Delete conversation
  const deleteConversation = async (convId: string) => {
    try {
      const success = await aiChatService.deleteConversation(convId)
      
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== convId))
        
        if (currentConversationId === convId) {
          const remaining = conversations.filter(c => c.id !== convId)
          if (remaining.length > 0) {
            setCurrentConversationId(remaining[0].id)
          } else {
            setCurrentConversationId(null)
            setMessages([])
          }
        }
        
        addNotification({
          title: 'Conversa excluída',
          message: 'A conversa foi removida com sucesso',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      addNotification({
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir a conversa',
        type: 'error'
      })
    }
  }

  // Get agent color classes
  const getAgentColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      amber: 'from-amber-500 to-amber-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 lg:-m-8 relative bg-slate-50">
      <div className="h-full flex relative">
        {/* Left Sidebar - Minimalist Design */}
        <motion.div
          initial={false}
          animate={{ 
            width: showLeftSidebar ? 240 : 0,
            opacity: showLeftSidebar ? 1 : 0
          }}
          transition={{ 
            duration: 0.2,
            ease: "easeInOut"
          }}
          className="bg-white border-r border-slate-200 flex flex-col h-full relative overflow-hidden"
        >
            {/* Sidebar Header - Simplified */}
            <motion.div 
              animate={{ opacity: showLeftSidebar ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="p-3 flex items-center justify-between border-b border-slate-100"
            >
              <h2 className="text-sm font-medium text-slate-700">Histórico</h2>
              <button
                onClick={() => {
                  // Create a new temporary conversation
                  const tempId = `temp-${Date.now()}`
                  setCurrentConversationId(tempId)
                  setMessages([{
                    id: 'initial-1',
                    role: 'assistant',
                    content: `Olá! Sou ${selectedAgent.name}. ${selectedAgent.description}. Como posso ajudá-lo hoje?`,
                    timestamp: new Date()
                  }])
                  setInputValue('')
                  setAttachedFiles([])
                  setAttachedDocuments([])
                }}
                className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                title="Nova conversa"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </motion.div>

            {/* Conversations List - Clean Style */}
            <motion.div 
              animate={{ opacity: showLeftSidebar ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {conversations.length === 0 && !currentConversationId?.startsWith('temp-') ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Sem conversas
                  </div>
                ) : (
                  <>
                  {/* Show temporary conversation if it exists */}
                  {currentConversationId?.startsWith('temp-') && (
                    <div className="group">
                      <button
                        onClick={() => setCurrentConversationId(currentConversationId)}
                        className="w-full p-2 rounded-md text-left transition-all bg-slate-100 border-l-2 border-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">
                              Nova conversa
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {selectedAgent.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {conversations.map((conv) => {
                    const agent = agents.find(a => a.id === conv.agent_id)
                    return (
                      <div key={conv.id} className="group">
                        <button
                          onClick={() => setCurrentConversationId(conv.id)}
                          className={cn(
                            "w-full p-2 rounded-md text-left transition-all relative",
                            currentConversationId === conv.id
                              ? "bg-slate-100 border-l-2 border-slate-900"
                              : "hover:bg-slate-50 border-l-2 border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              currentConversationId === conv.id ? "bg-slate-900" : "bg-slate-400"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 truncate">
                                {conv.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {conv.last_message || 'Conversa'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="absolute top-2 right-2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-200 transition-all"
                          >
                            <Trash2 className="h-3 w-3 text-slate-400" />
                          </button>
                        </button>
                      </div>
                    )
                  })}
                  </>
                )}
              </div>
            </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className={cn(
                "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                getAgentColor(selectedAgent.color)
              )}>
                {React.createElement(selectedAgent.icon, { className: "h-5 w-5 text-white" })}
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedAgent.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAgent.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container - Minimalist Design */}
        <div className="flex-1 flex overflow-hidden bg-white">
          <div className="flex-1 flex flex-col">
            {/* Messages Area - Clean Background */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {!currentConversationId ? (
                // Welcome Screen - Simplified
                <div className="h-full flex items-center justify-center">
                  <div className="max-w-xl w-full px-6">
                    {/* Minimal Logo */}
                    <div className="mb-6 flex justify-center">
                      <div className="h-14 w-14 rounded-lg bg-slate-900 flex items-center justify-center">
                        <Brain className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    
                    {/* Welcome Text - Smaller */}
                    <h1 className="text-xl font-semibold text-slate-900 text-center mb-2">
                      Assistente Jurídico IA
                    </h1>
                    <p className="text-sm text-slate-500 text-center mb-8">
                      Selecione um especialista para começar
                    </p>
                    
                    {/* Quick Start Options - Vertical List */}
                    <div className="space-y-2">
                      <button
                        onClick={() => createNewConversation('trabalhista')}
                        className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900">
                              Trabalhista
                            </h3>
                            <p className="text-xs text-slate-500">
                              Cálculos e verbas rescisórias
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => createNewConversation('civil')}
                        className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                            <Scale className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900">
                              Cível
                            </h3>
                            <p className="text-xs text-slate-500">
                              Contratos e obrigações
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => createNewConversation('familia')}
                        className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                            <Heart className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900">
                              Família
                            </h3>
                            <p className="text-xs text-slate-500">
                              Pensão e guarda
                            </p>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => createNewConversation('criminal')}
                        className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-400 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-slate-100 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-900">
                              Criminal
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Análise de casos e cálculo de penas
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Or Start General Chat */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-50/30 dark:bg-gray-900/30 text-gray-500">
                          ou
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Start with general agent in a temporary conversation
                        const generalAgent = agents.find(a => a.id === 'general') || agents[0]
                        setSelectedAgent(generalAgent)
                        const tempId = `temp-${Date.now()}`
                        setCurrentConversationId(tempId)
                        setMessages([{
                          id: 'initial-1',
                          role: 'assistant',
                          content: `Olá! Sou ${generalAgent.name}. ${generalAgent.description}. Como posso ajudá-lo hoje?`,
                          timestamp: new Date()
                        }])
                        setInputValue('')
                        setAttachedFiles([])
                        setAttachedDocuments([])
                      }}
                      className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg transition-all transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 inline mr-2" />
                      Iniciar Nova Conversa
                    </button>
                    
                    {/* Features */}
                    <div className="mt-12 grid grid-cols-3 gap-4 text-center">
                      <div className="text-gray-600 dark:text-gray-400">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                        <p className="text-xs">Respostas Rápidas</p>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-xs">100% Confidencial</p>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        <Brain className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-xs">IA Especializada</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto px-4 py-6">
                  <AnimatePresence>
                  {messages.map((message) => (
                    <div key={message.id} className="mb-4">
                      <div className={cn(
                        "px-4 py-3 rounded-lg",
                        message.role === 'user' 
                          ? message.status === 'error' 
                            ? 'bg-red-50 border border-red-200 ml-12'
                            : 'bg-white border border-slate-200 ml-12' 
                          : 'bg-slate-50 mr-12'
                      )}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            {message.role === 'assistant' ? (
                              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-md bg-slate-600 flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-700">
                                {message.role === 'assistant' ? 'Assistente' : 'Você'}
                              </span>
                              {message.status === 'sending' && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Enviando...
                                </span>
                              )}
                              {message.status === 'error' && (
                                <button
                                  onClick={() => retryMessage(message)}
                                  className="text-xs text-red-600 flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  Reenviar
                                </button>
                              )}
                              {(!message.status || message.status === 'sent') && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              {message.isTyping ? (
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                  <div className="flex gap-1">
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                </div>
                              ) : message.role === 'assistant' ? (
                                <div className="text-gray-700 dark:text-gray-300">
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                    // Customizar estilo dos componentes Markdown
                                    h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-4 text-gray-900 dark:text-white">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-3 text-gray-900 dark:text-white">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-2 text-gray-900 dark:text-white">{children}</h3>,
                                    strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                    li: ({children}) => <li className="ml-2">{children}</li>,
                                    blockquote: ({children}) => (
                                      <blockquote className="border-l-4 border-blue-500 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
                                        {children}
                                      </blockquote>
                                    ),
                                    code: ({children, ...props}: any) => {
                                      const isInline = !props.className?.includes('language-')
                                      return isInline ? (
                                        <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-blue-600 dark:text-blue-400">
                                          {children}
                                        </code>
                                      ) : (
                                        <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto my-2">
                                          {children}
                                        </code>
                                      )
                                    },
                                    p: ({children}) => <p className="my-2 leading-relaxed">{children}</p>,
                                    a: ({children, href}) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {children}
                                      </a>
                                    ),
                                    hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
                                    table: ({children}) => (
                                      <div className="overflow-x-auto my-3">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    th: ({children}) => (
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                                        {children}
                                      </th>
                                    ),
                                    td: ({children}) => (
                                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                                        {children}
                                      </td>
                                    )
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{message.content}</div>
                              )}
                            </div>
                            
                            {/* Attached Documents */}
                            {message.attachedDocuments && message.attachedDocuments.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.attachedDocuments.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                      {doc.title || doc.file_name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {message.role === 'assistant' && !message.isTyping && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                                <button
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="Copiar"
                                >
                                  <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button 
                                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="Útil"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <button 
                                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  title="Não útil"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
                
                {/* Streaming Message */}
                {isStreaming && streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div className="px-4 py-6 rounded-2xl my-2 mx-2 bg-white dark:bg-gray-900/50">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                            getAgentColor(selectedAgent.color)
                          )}>
                            {React.createElement(selectedAgent.icon, { className: "h-5 w-5 text-white" })}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                              {selectedAgent.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              digitando...
                            </span>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="text-gray-700 dark:text-gray-300">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-4 text-gray-900 dark:text-white">{children}</h1>,
                                h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-3 text-gray-900 dark:text-white">{children}</h2>,
                                h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-2 text-gray-900 dark:text-white">{children}</h3>,
                                strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                                ul: ({children}) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                li: ({children}) => <li className="ml-2">{children}</li>,
                                blockquote: ({children}) => (
                                  <blockquote className="border-l-4 border-blue-500 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
                                    {children}
                                  </blockquote>
                                ),
                                code: ({children, ...props}: any) => {
                                  const isInline = !props.className?.includes('language-')
                                  return isInline ? (
                                    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-blue-600 dark:text-blue-400">
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto my-2">
                                      {children}
                                    </code>
                                  )
                                },
                                p: ({children}) => <p className="my-2 leading-relaxed">{children}</p>,
                                a: ({children, href}) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                    {children}
                                  </a>
                                ),
                                hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
                                table: ({children}) => (
                                  <div className="overflow-x-auto my-3">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({children}) => (
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                                    {children}
                                  </th>
                                ),
                                td: ({children}) => (
                                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                                    {children}
                                  </td>
                                )
                                }}
                              >
                                {streamingContent}
                              </ReactMarkdown>
                              <span className="inline-block w-2 h-4 ml-1 bg-gray-400 dark:bg-gray-600 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - Minimalist Design */}
            {currentConversationId && (
              <div className="flex-shrink-0 border-t border-slate-200 bg-white">
                <div className="max-w-2xl mx-auto px-4 py-3">
                {/* Attached Documents - Simplified */}
                {attachedDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {attachedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs"
                      >
                        <FileText className="h-3 w-3 text-slate-500" />
                        <span className="text-slate-700">
                          {doc.title || doc.file_name}
                        </span>
                        <button
                          onClick={() => setAttachedDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Attached Files (for future upload) */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm"
                      >
                        <Paperclip className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                {selectedAgent.quickActions && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {selectedAgent.quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(action)}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all font-medium text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Sparkles className="h-3.5 w-3.5 inline mr-1.5 text-blue-500" />
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="relative"
                >
                  <div className="relative flex items-center">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        // Auto-resize
                        e.target.style.height = 'auto'
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      rows={1}
                      className="w-full resize-none pr-20 pl-10 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 placeholder-slate-400 text-slate-900 text-sm transition-all"
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowDocumentModal(true)}
                      className="absolute left-2 p-1.5 rounded hover:bg-slate-100 transition-colors"
                      title="Anexar documentos"
                    >
                      <Paperclip className={cn(
                        "h-4 w-4 transition-colors",
                        attachedDocuments.length > 0 
                          ? "text-slate-700" 
                          : "text-slate-400"
                      )} />
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading || isStreaming}
                      className={cn(
                        "absolute right-2 p-1.5 rounded-md transition-all",
                        inputValue.trim() && !isLoading
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileAttach}
                />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Agents */}
      <motion.div
        initial={false}
        animate={{ 
          width: showRightSidebar ? 280 : 0,
          opacity: showRightSidebar ? 1 : 0
        }}
        transition={{ 
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="bg-gray-50 dark:bg-gray-800/50 border-l border-gray-100 dark:border-gray-800 flex flex-col h-full relative overflow-hidden"
      >
            {/* Sidebar Header */}
            <motion.div 
              animate={{ opacity: showRightSidebar ? 1 : 0 }}
              transition={{ duration: 0.2, delay: showRightSidebar ? 0.1 : 0 }}
              className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Agentes Especializados
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Escolha um especialista para sua consulta
              </p>
            </motion.div>

            {/* Agents List */}
            <motion.div 
              animate={{ opacity: showRightSidebar ? 1 : 0 }}
              transition={{ duration: 0.2, delay: showRightSidebar ? 0.15 : 0 }}
              className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {agents.map((agent) => {
                  const Icon = agent.icon
                  const isActive = selectedAgent.id === agent.id
                  return (
                    <motion.button
                      key={agent.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => createNewConversation(agent.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all text-left",
                        isActive
                          ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          getAgentColor(agent.color)
                        )}>
                          {React.createElement(Icon, { className: "h-6 w-6 text-white" })}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {agent.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

        </motion.div>
      </div>
      
      {/* Document Selector Modal */}
      <DocumentSelectorModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onSelectDocuments={(docs) => {
          setAttachedDocuments(docs)
          setShowDocumentModal(false)
        }}
        selectedDocuments={attachedDocuments}
      />
    </div>
  )
}