import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/',
  '/design-system',
  '/not-found',
  '/debug',
  '/debug-auth',
  '/api/debug',
  '/test-auth',
]

// Rotas de API que fazem sua própria autenticação
const apiRoutes = [
  '/api/documents',
  '/api/legal-search',
  '/api/legal-analysis',
  '/api/transcribe',
  '/api/clients',
  '/api/test-auth',
]

// Rotas que redirecionam para o dashboard se o usuário estiver autenticado
const authRoutes = [
  '/auth/login',
  '/auth/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verifica se é uma rota de API (elas fazem sua própria autenticação)
  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route))
  if (isApiRoute) {
    return NextResponse.next()
  }
  
  // Verifica se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Verifica se é uma rota de autenticação
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Cria cliente Supabase no middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gczqdsfsjglotowcxobe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjenFkc2Zzamdsb3Rvd2N4b2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Nzc2MzgsImV4cCI6MjA2MzQ1MzYzOH0.J-6CVKJwBol-l2NJf4Fc3fm8tt3c7XH4D5Bpod24TMU',
    {
      cookies: {
        getAll: () => {
          return request.cookies.getAll()
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Verifica se o usuário está autenticado
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Se não está autenticado e não é rota pública, redireciona para login
  if (!user && !isPublicRoute) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Se está autenticado e tenta acessar rotas de auth, redireciona para dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}