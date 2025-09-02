// Força renderização dinâmica para evitar erros de build com Supabase
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Scale, ArrowRight, CheckCircle2, Shield, Zap, Users, FileText, Brain } from 'lucide-react'
import { Button } from '@/components/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-8 border-b border-gray-100">
        <nav className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AdvocIA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 pt-20 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sistema Jurídico
              <span className="block text-blue-600">Inteligente</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transforme sua prática jurídica com inteligência artificial. 
              Gerencie casos, crie petições e automatize tarefas com a mais 
              avançada tecnologia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button 
                  size="xl" 
                  variant="primary" 
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Começar Agora
                </Button>
              </Link>
              
              <Link href="/design-system">
                <Button 
                  size="xl" 
                  variant="outline"
                >
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestão Completa
              </h3>
              <p className="text-gray-600">
                Gerencie clientes, casos e documentos em um único lugar
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                IA Assistente
              </h3>
              <p className="text-gray-600">
                Crie petições e analise documentos com inteligência artificial
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                100% Seguro
              </h3>
              <p className="text-gray-600">
                Seus dados protegidos com a mais alta segurança
              </p>
            </div>
          </div>
          
          {/* Seção de Benefícios */}
          <div className="mt-32">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
              Por que escolher o AdvocIA?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Produtividade Aumentada</h3>
                  <p className="text-gray-600">Automatize tarefas repetitivas e foque no que realmente importa: seus clientes.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Colaboração Eficiente</h3>
                  <p className="text-gray-600">Trabalhe em equipe com ferramentas integradas de comunicação e compartilhamento.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Conformidade Garantida</h3>
                  <p className="text-gray-600">Mantenha-se atualizado com as últimas mudanças na legislação automaticamente.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">IA de Última Geração</h3>
                  <p className="text-gray-600">Tecnologia avançada que aprende e se adapta ao seu estilo de trabalho.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Final */}
          <div className="mt-32 text-center">
            <div className="bg-blue-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pronto para revolucionar sua prática jurídica?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de advogados que já transformaram sua forma de trabalhar.
              </p>
              <Link href="/auth/register">
                <Button 
                  size="xl" 
                  variant="primary"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Começar Teste Gratuito
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-gray-500 border-t border-gray-100">
        <p>© 2024 AdvocIA. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}