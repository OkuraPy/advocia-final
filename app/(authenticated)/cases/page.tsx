'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, FileText, Calendar, DollarSign, Scale } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner } from '@/components/ui'
import { DataTable } from '@/components/shared'
import { casesService } from '@/lib/services/api'
import { Case } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  useEffect(() => {
    loadCases()
  }, [pagination.page, pagination.limit, filter])

  const loadCases = async () => {
    try {
      setLoading(true)
      const filters = filter !== 'all' ? { status: [filter] } : undefined
      const response = await casesService.getAll(
        filters,
        { field: 'createdAt', direction: 'desc' },
        { page: pagination.page, limit: pagination.limit }
      )
      setCases(response.data)
      setPagination((prev) => ({ ...prev, total: response.pagination?.total || 0 }))
    } catch (error) {
      console.error('Erro ao carregar processos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary'
      case 'won':
        return 'success'
      case 'lost':
        return 'error'
      case 'settled':
        return 'warning'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      key: 'number',
      label: 'Número',
      sortable: true,
      render: (value: string, caseItem: Case) => (
        <div>
          <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {caseItem.court}
          </p>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Título',
      sortable: true,
      render: (value: string, caseItem: Case) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <div className="mt-1 flex items-center space-x-2">
            <Badge size="sm" variant={getStatusColor(caseItem.status)}>
              {caseItem.status === 'active' ? 'Ativo' :
               caseItem.status === 'won' ? 'Ganho' :
               caseItem.status === 'lost' ? 'Perdido' :
               caseItem.status === 'settled' ? 'Acordo' : 'Arquivado'}
            </Badge>
            <Badge size="sm" variant={getPriorityColor(caseItem.priority)}>
              {caseItem.priority === 'urgent' ? 'Urgente' :
               caseItem.priority === 'high' ? 'Alta' :
               caseItem.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'client.name',
      label: 'Cliente',
      sortable: true,
      render: (value: string) => (
        <p className="text-sm text-gray-900 dark:text-white">{value || '-'}</p>
      ),
    },
    {
      key: 'lawyer.name',
      label: 'Advogado',
      sortable: true,
      render: (value: string) => (
        <p className="text-sm text-gray-900 dark:text-white">{value || '-'}</p>
      ),
    },
    {
      key: 'value',
      label: 'Valor',
      sortable: true,
      render: (value: number) => (
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {value
            ? new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value)
            : '-'}
        </p>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      className: 'text-right',
      render: (_: any, caseItem: Case) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/cases/${caseItem.id}`)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const stats = {
    total: cases.length,
    active: cases.filter((c) => c.status === 'active').length,
    won: cases.filter((c) => c.status === 'won').length,
    totalValue: cases.reduce((sum, c) => sum + (c.value || 0), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Processos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Acompanhe todos os processos do escritório
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/cases/new')}
        >
          Novo Processo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Processos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg bg-royal-100 p-3 dark:bg-royal-900/20">
                <Scale className="h-6 w-6 text-royal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Processos Ativos
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.active}
                </p>
              </div>
              <div className="rounded-lg bg-navy-100 p-3 dark:bg-navy-900/20">
                <FileText className="h-6 w-6 text-navy-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Taxa de Sucesso
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total > 0
                    ? Math.round((stats.won / stats.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-lg bg-success-100 p-3 dark:bg-success-900/20">
                <Award className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valor Total
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(stats.totalValue)}
                </p>
              </div>
              <div className="rounded-lg bg-gold-100 p-3 dark:bg-gold-900/20">
                <DollarSign className="h-6 w-6 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Ativos
        </Button>
        <Button
          variant={filter === 'archived' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('archived')}
        >
          Arquivados
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={cases}
            loading={loading}
            searchPlaceholder="Buscar por número, título, cliente..."
            onRowClick={(caseItem) => router.push(`/cases/${caseItem.id}`)}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
              onLimitChange: (limit) => setPagination((prev) => ({ ...prev, limit, page: 1 })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Import missing icon
import { Award } from 'lucide-react'