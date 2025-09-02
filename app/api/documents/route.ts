import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('[Documents] List documents endpoint called')
  
  try {
    // Debug: Log cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log('[Documents] Cookies:', allCookies.map(c => c.name))
    
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[Documents] Auth error:', authError)
      console.error('[Documents] User:', user)
      return NextResponse.json(
        { error: 'Unauthorized: ' + (authError?.message || 'No user found') },
        { status: 401 }
      )
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Build query
    let query = supabase
      .from('documents')
      .select(`
        *,
        client:clients(
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,file_name.ilike.%${search}%,case_reference.ilike.%${search}%`)
    }
    
    if (type !== 'all') {
      query = query.eq('document_type', type)
    }
    
    const { data: documents, error: queryError } = await query
    
    if (queryError) {
      console.error('[Documents] Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }
    
    // Get total count
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    return NextResponse.json({
      documents: documents || [],
      total: count || 0,
      limit,
      offset
    })
    
  } catch (error) {
    console.error('[Documents] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}