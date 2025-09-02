import { MainLayout } from '@/components/layout'

// Força renderização dinâmica para evitar erros de build com Supabase
export const dynamic = 'force-dynamic'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MainLayout>{children}</MainLayout>
}