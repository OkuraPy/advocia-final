import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  console.log('[Test Auth] Testing authentication...')
  
  try {
    const supabase = await createClient()
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('[Test Auth] User:', user?.email)
    console.log('[Test Auth] Error:', authError)
    
    // Test database connection
    const { data: testQuery, error: dbError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('[Test Auth] DB test:', { success: !dbError, error: dbError })
    
    return NextResponse.json({
      auth: {
        authenticated: !!user,
        user: user?.email,
        error: authError?.message
      },
      database: {
        connected: !dbError,
        error: dbError?.message
      },
      headers: {
        cookie: request.headers.get('cookie'),
        authorization: request.headers.get('authorization')
      }
    })
    
  } catch (error: any) {
    console.error('[Test Auth] Unexpected error:', error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}