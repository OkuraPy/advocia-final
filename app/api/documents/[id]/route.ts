import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Document] Get document endpoint called:', params.id)
  
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
    
    // Get document metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        client:clients(
          id,
          name
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (docError || !document) {
      console.error('[Document] Not found:', docError)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Get file URL for viewing
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(document.file_url)
    
    return NextResponse.json({
      ...document,
      publicUrl
    })
    
  } catch (error) {
    console.error('[Document] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}