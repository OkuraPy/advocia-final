'use client'

import { useState, useEffect } from 'react'
import { 
  User,
  Building2,
  Bell,
  Shield,
  Key,
  Globe,
  Save,
  Upload,
  Mail,
  Phone,
  MapPin,
  FileText,
  Image,
  Type,
  Briefcase,
  Hash,
  CreditCard,
  Calendar,
  Clock,
  Languages,
  Volume2,
  Sparkles,
  Check,
  X,
  Camera,
  Edit2,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore, useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { settingsService, type Profile, type OfficeSettings, type UserPreferences } from '@/lib/services/settings.service'

export default function SettingsPage() {
  const { addNotification } = useAppStore()
  const { updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Form states
  const [profileData, setProfileData] = useState<Profile>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    oab_number: '',
    avatar_url: ''
  })

  const [officeData, setOfficeData] = useState<OfficeSettings>({
    name: '',
    cnpj: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip_code: '',
    phone: '',
    email: '',
    website: '',
    footer_text: ''
  })

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    date_format: 'DD/MM/YYYY',
    currency: 'BRL',
    sound_notifications: true,
    ai_suggestions: true,
    auto_save: true,
    transcription_language: 'pt-BR'
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      // Carregar perfil
      const profile = await settingsService.getProfile()
      if (profile) {
        setProfileData(profile)
        if (profile.avatar_url) {
          setAvatarPreview(profile.avatar_url)
        }
      }

      // Carregar configurações do escritório
      const office = await settingsService.getOfficeSettings()
      if (office) {
        setOfficeData(office)
        if (office.logo_url) {
          setLogoPreview(office.logo_url)
        }
      }

      // Carregar preferências
      const prefs = await settingsService.getUserPreferences()
      if (prefs) {
        setPreferences(prefs)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      addNotification({
        title: 'Erro',
        message: 'Não foi possível carregar as configurações',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'office', label: 'Escritório', icon: Building2 },
    { id: 'preferences', label: 'Preferências', icon: Globe },
    { id: 'security', label: 'Segurança', icon: Shield }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      if (activeTab === 'profile') {
        const updatedProfile = await settingsService.updateProfile({
          full_name: profileData.full_name,
          phone: profileData.phone,
          oab_number: profileData.oab_number,
          avatar_url: avatarPreview || undefined
        })
        
        // Atualizar o usuário no store para refletir no menu imediatamente
        if (updatedProfile) {
          updateUser({
            name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            avatar: updatedProfile.avatar_url
          })
        }
      } else if (activeTab === 'office') {
        await settingsService.upsertOfficeSettings({
          ...officeData,
          logo_url: logoPreview || undefined
        })
      } else if (activeTab === 'preferences') {
        await settingsService.upsertUserPreferences(preferences)
      }

      addNotification({
        title: 'Configurações salvas',
        message: 'Suas alterações foram salvas com sucesso',
        type: 'success'
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      addNotification({
        title: 'Erro',
        message: 'Não foi possível salvar as configurações',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      addNotification({
        title: 'Erro',
        message: 'As senhas não coincidem',
        type: 'error'
      })
      return
    }

    if (passwordData.new.length < 6) {
      addNotification({
        title: 'Erro',
        message: 'A nova senha deve ter pelo menos 6 caracteres',
        type: 'error'
      })
      return
    }

    setIsSaving(true)
    
    try {
      const success = await settingsService.updatePassword(passwordData.current, passwordData.new)
      
      if (success) {
        addNotification({
          title: 'Senha alterada',
          message: 'Sua senha foi alterada com sucesso',
          type: 'success'
        })
        setPasswordData({ current: '', new: '', confirm: '' })
      } else {
        throw new Error('Falha ao alterar senha')
      }
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Senha atual incorreta ou erro ao alterar senha',
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload para o Supabase
      const url = await settingsService.uploadLogo(file)
      if (url) {
        setLogoPreview(url)
      }
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload para o Supabase
      const url = await settingsService.uploadAvatar(file)
      if (url) {
        setAvatarPreview(url)
        // Atualizar avatar imediatamente no menu
        updateUser({ avatar: url })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-slate-600 mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Configurações
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie suas preferências e informações do escritório
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-medium text-slate-900">Informações Pessoais</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Avatar */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {profileData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
                        >
                          <Camera className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
                        >
                          Alterar foto
                        </label>
                        <p className="text-xs text-slate-500 mt-1">
                          JPG, PNG ou GIF. Máx 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Número OAB
                      </label>
                      <input
                        type="text"
                        value={profileData.oab_number || ''}
                        onChange={(e) => setProfileData({ ...profileData, oab_number: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        placeholder="OAB/UF 000.000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Office Tab */}
            {activeTab === 'office' && (
              <div className="space-y-6">
                {/* Logo Section */}
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-medium text-slate-900">Logo do Escritório</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      <div>
                        <div className="h-32 w-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                          {logoPreview ? (
                            <img 
                              src={logoPreview} 
                              alt="Logo" 
                              className="max-h-full max-w-full object-contain p-2"
                            />
                          ) : (
                            <Image className="h-8 w-8 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 mb-2">
                          Logo para Papel Timbrado
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Esta logo será usada em documentos e petições geradas pelo sistema.
                        </p>
                        <input
                          type="file"
                          id="logo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                        <button
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Enviar Logo
                        </button>
                        <p className="text-xs text-slate-500 mt-2">
                          PNG ou JPG. Recomendado: 300x100px
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office Info */}
                <div className="bg-white border border-slate-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-medium text-slate-900">Informações do Escritório</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nome do Escritório
                        </label>
                        <input
                          type="text"
                          value={officeData.name}
                          onChange={(e) => setOfficeData({ ...officeData, name: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                          placeholder="Silva & Associados Advocacia"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          CNPJ
                        </label>
                        <input
                          type="text"
                          value={officeData.cnpj || ''}
                          onChange={(e) => setOfficeData({ ...officeData, cnpj: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={officeData.phone || ''}
                          onChange={(e) => setOfficeData({ ...officeData, phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                          placeholder="(00) 0000-0000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={officeData.email || ''}
                          onChange={(e) => setOfficeData({ ...officeData, email: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                          placeholder="contato@escritorio.com.br"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Website
                        </label>
                        <input
                          type="text"
                          value={officeData.website || ''}
                          onChange={(e) => setOfficeData({ ...officeData, website: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                          placeholder="www.escritorio.com.br"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-4">
                        Endereço
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            CEP
                          </label>
                          <input
                            type="text"
                            value={officeData.address_zip_code || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_zip_code: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="00000-000"
                          />
                        </div>
                        <div></div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Rua
                          </label>
                          <input
                            type="text"
                            value={officeData.address_street || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_street: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="Av. Paulista"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            value={officeData.address_number || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_number: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={officeData.address_complement || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_complement: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="Sala 101"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={officeData.address_neighborhood || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_neighborhood: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="Bela Vista"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={officeData.address_city || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_city: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="São Paulo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Estado
                          </label>
                          <input
                            type="text"
                            value={officeData.address_state || ''}
                            onChange={(e) => setOfficeData({ ...officeData, address_state: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-4">
                        Rodapé de Documentos
                      </h4>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Texto do Rodapé
                      </label>
                      <input
                        type="text"
                        value={officeData.footer_text || ''}
                        onChange={(e) => setOfficeData({ ...officeData, footer_text: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        placeholder="Ex: Silva & Associados Advocacia - OAB/SP 123.456"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Este texto aparecerá no rodapé de documentos gerados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-medium text-slate-900">Preferências</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Idioma
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Fuso Horário
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                        <option value="America/Recife">Recife (GMT-3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Formato de Data
                      </label>
                      <select
                        value={preferences.date_format}
                        onChange={(e) => setPreferences({ ...preferences, date_format: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                        <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                        <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Moeda
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar (US$)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-4">
                      Recursos de IA
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Sugestões de IA
                          </p>
                          <p className="text-xs text-slate-500">
                            Receba sugestões inteligentes enquanto trabalha
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences({ ...preferences, ai_suggestions: !preferences.ai_suggestions })}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            preferences.ai_suggestions ? "bg-slate-900" : "bg-slate-200"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              preferences.ai_suggestions ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Salvamento Automático
                          </p>
                          <p className="text-xs text-slate-500">
                            Salva automaticamente seu trabalho
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences({ ...preferences, auto_save: !preferences.auto_save })}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            preferences.auto_save ? "bg-slate-900" : "bg-slate-200"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              preferences.auto_save ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Notificações Sonoras
                          </p>
                          <p className="text-xs text-slate-500">
                            Sons para alertas e notificações
                          </p>
                        </div>
                        <button
                          onClick={() => setPreferences({ ...preferences, sound_notifications: !preferences.sound_notifications })}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            preferences.sound_notifications ? "bg-slate-900" : "bg-slate-200"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              preferences.sound_notifications ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-4">
                      Transcrição
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Idioma de Transcrição
                      </label>
                      <select
                        value={preferences.transcription_language}
                        onChange={(e) => setPreferences({ ...preferences, transcription_language: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-base font-medium text-slate-900">Segurança</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">
                      Alterar Senha
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-slate-900 focus:outline-none transition-colors"
                        />
                      </div>
                      <button 
                        onClick={handlePasswordChange}
                        disabled={!passwordData.current || !passwordData.new || !passwordData.confirm || isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Alterar Senha
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Save Button */}
          {activeTab !== 'security' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}