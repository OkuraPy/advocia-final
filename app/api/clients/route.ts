import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get clients for the current user
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('name')
    
    if (error) {
      console.error('[Clients] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      clients: clients || []
    })
    
  } catch (error) {
    console.error('[Clients] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}