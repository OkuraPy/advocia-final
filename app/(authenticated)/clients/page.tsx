'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Phone, 
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatCPFCNPJ } from '@/lib/utils/format'
import { clientsService, type Client } from '@/lib/services/clients.service'
import { useAppStore } from '@/lib/store'

export default function ClientsPage() {
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'individual' | 'company'>('all')
  const [showActions, setShowActions] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; client: Client | null }>({
    isOpen: false,
    client: null,
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await clientsService.getAll()
      
      if (response.error) {
        throw response.error
      }
      
      setClients(response.data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      addNotification({
        title: 'Erro',
        message: 'Erro ao carregar clientes',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (client: Client) => {
    try {
      const response = await clientsService.delete(client.id)
      
      if (response.error) {
        throw response.error
      }
      
      addNotification({
        title: 'Sucesso',
        message: 'Cliente removido com sucesso',
        type: 'success'
      })
      
      loadClients()
      setDeleteModal({ isOpen: false, client: null })
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      addNotification({
        title: 'Erro',
        message: 'Erro ao remover cliente',
        type: 'error'
      })
    }
  }

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cpf_cnpj?.includes(searchTerm)
    
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'individual' && client.type === 'individual') ||
                       (selectedType === 'company' && client.type === 'company')
    
    return matchesSearch && matchesType
  })

  // Stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.active !== false).length,
    individual: clients.filter(c => c.type === 'individual').length,
    company: clients.filter(c => c.type === 'company').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Clientes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie sua base de clientes
          </p>
        </div>
        <button 
          onClick={() => router.push('/clients/new')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total de Clientes
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Clientes Ativos
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pessoa Física
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.individual}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Pessoa Jurídica
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.company}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selectedType === 'all'
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedType('individual')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selectedType === 'individual'
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Pessoa Física
            </button>
            <button
              onClick={() => setSelectedType('company')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                selectedType === 'company'
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Pessoa Jurídica
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-500">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Carregando clientes...
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {searchTerm || selectedType !== 'all' 
                ? 'Nenhum cliente encontrado com os filtros aplicados'
                : 'Nenhum cliente cadastrado ainda'}
            </p>
            {!searchTerm && selectedType === 'all' && (
              <button 
                onClick={() => router.push('/clients/new')}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cadastrar Primeiro Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-600">
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium text-slate-900">
                          {client.name}
                        </h3>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full",
                          client.type === 'individual' 
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        )}>
                          {client.type === 'individual' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                        {client.active === false && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {client.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.cpf_cnpj && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {formatCPFCNPJ(client.cpf_cnpj)}
                          </div>
                        )}
                      </div>

                      {client.address && (
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <MapPin className="w-3 h-3" />
                          {[
                            client.address.street,
                            client.address.number,
                            client.address.neighborhood,
                            client.address.city,
                            client.address.state
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === client.id ? null : client.id)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>

                    <AnimatePresence>
                      {showActions === client.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
                        >
                          <button
                            onClick={() => {
                              router.push(`/clients/${client.id}`)
                              setShowActions(null)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Visualizar
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/clients/${client.id}/edit`)
                              setShowActions(null)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              setDeleteModal({ isOpen: true, client })
                              setShowActions(null)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.client && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteModal({ isOpen: false, client: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Tem certeza que deseja excluir o cliente <strong>{deleteModal.client.name}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, client: null })}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.client!)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir Cliente
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}