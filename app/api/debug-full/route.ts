import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Get Supabase specific cookies
  const supabaseCookies = allCookies.filter(c => 
    c.name.includes('supabase') || 
    c.name.includes('auth-token')
  )
  
  try {
    const supabase = await createClient()
    
    // Try to get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      },
      cookies: {
        total: allCookies.length,
        supabase: supabaseCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value
        }))
      },
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        userError: authError?.message,
        session: session ? {
          hasAccessToken: !!session.access_token,
          hasRefreshToken: !!session.refresh_token,
          expiresAt: session.expires_at
        } : null,
        sessionError: sessionError?.message
      },
      request: {
        url: request.url,
        method: request.method,
        headers: {
          cookie: request.headers.get('cookie') ? 'PRESENT' : 'MISSING',
          authorization: request.headers.get('authorization') ? 'PRESENT' : 'MISSING',
          referer: request.headers.get('referer'),
          origin: request.headers.get('origin')
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}