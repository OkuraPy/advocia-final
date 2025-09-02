'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowLeft, 
  Save, 
  Users, 
  Building2,
  User, 
  Home, 
  FileText,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Hash,
  MapPin
} from 'lucide-react'
import { clientsService } from '@/lib/services/clients.service'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const clientSchema = z.object({
  type: z.enum(['individual', 'company']),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  birth_date: z.string().optional(),
  profession: z.string().optional(),
  marital_status: z.string().optional(),
  address: z.object({
    zip_code: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(3, 'Bairro é obrigatório'),
    city: z.string().min(3, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  }),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function NewClientPage() {
  const router = useRouter()
  const { addNotification } = useAppStore()
  const [clientType, setClientType] = useState<'individual' | 'company'>('individual')
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: 'individual',
      address: {
        state: 'SP',
      },
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    try {
      const response = await clientsService.create({
        ...data,
        type: clientType,
        birth_date: data.birth_date ? data.birth_date : undefined,
        active: true,
      })
      
      if (response.error) {
        throw response.error
      }
      
      addNotification({
        title: 'Sucesso',
        message: 'Cliente cadastrado com sucesso',
        type: 'success',
      })
      
      router.push('/clients')
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error)
      addNotification({
        title: 'Erro',
        message: 'Erro ao cadastrar cliente',
        type: 'error',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Novo Cliente
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cadastre um novo cliente no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Client Type Selection */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-medium text-slate-700 mb-4">Tipo de Cliente</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setClientType('individual')
              setValue('type', 'individual')
            }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
              clientType === 'individual'
                ? "border-slate-900 bg-slate-50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              clientType === 'individual' ? "bg-slate-900" : "bg-slate-100"
            )}>
              <Users className={cn(
                "w-5 h-5",
                clientType === 'individual' ? "text-white" : "text-slate-600"
              )} />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">Pessoa Física</p>
              <p className="text-xs text-slate-500">CPF, RG, dados pessoais</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setClientType('company')
              setValue('type', 'company')
            }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
              clientType === 'company'
                ? "border-slate-900 bg-slate-50"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              clientType === 'company' ? "bg-slate-900" : "bg-slate-100"
            )}>
              <Building2 className={cn(
                "w-5 h-5",
                clientType === 'company' ? "text-white" : "text-slate-600"
              )} />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">Pessoa Jurídica</p>
              <p className="text-xs text-slate-500">CNPJ, razão social</p>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-lg"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                {clientType === 'individual' ? 'Dados Pessoais' : 'Dados da Empresa'}
              </h2>
            </div>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {clientType === 'individual' ? 'Nome Completo' : 'Razão Social'} *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {clientType === 'individual' ? 'CPF' : 'CNPJ'} *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder={clientType === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                  {...register('cpf_cnpj')}
                />
              </div>
              {errors.cpf_cnpj && (
                <p className="text-xs text-red-600 mt-1">{errors.cpf_cnpj.message}</p>
              )}
            </div>
            
            {clientType === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                    {...register('birth_date')}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="cliente@exemplo.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="(11) 98765-4321"
                  {...register('phone')}
                />
              </div>
            </div>
            
            {clientType === 'individual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Profissão
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      {...register('profession')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Estado Civil
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                    {...register('marital_status')}
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Endereço */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200 rounded-lg"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Endereço
              </h2>
            </div>
          </div>
          
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CEP *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                  placeholder="00000-000"
                  {...register('address.zip_code')}
                />
              </div>
              {errors.address?.zip_code && (
                <p className="text-xs text-red-600 mt-1">{errors.address.zip_code.message}</p>
              )}
            </div>
            
            <div></div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rua *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                {...register('address.street')}
              />
              {errors.address?.street && (
                <p className="text-xs text-red-600 mt-1">{errors.address.street.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                {...register('address.number')}
              />
              {errors.address?.number && (
                <p className="text-xs text-red-600 mt-1">{errors.address.number.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                placeholder="Apto, Sala, etc."
                {...register('address.complement')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                {...register('address.neighborhood')}
              />
              {errors.address?.neighborhood && (
                <p className="text-xs text-red-600 mt-1">{errors.address.neighborhood.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                {...register('address.city')}
              />
              {errors.address?.city && (
                <p className="text-xs text-red-600 mt-1">{errors.address.city.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado *
              </label>
              <input
                type="text"
                maxLength={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                placeholder="SP"
                {...register('address.state')}
              />
              {errors.address?.state && (
                <p className="text-xs text-red-600 mt-1">{errors.address.state.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Observações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-lg"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Observações
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Anotações sobre o cliente
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Adicione observações sobre o cliente, particularidades do caso, preferências de contato..."
              {...register('notes')}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}