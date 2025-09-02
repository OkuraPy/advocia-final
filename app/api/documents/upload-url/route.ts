import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  console.log('[Upload URL] Generate upload URL endpoint called')
  
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
    
    const { fileName, fileType } = await request.json()
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'File name and type are required' },
        { status: 400 }
      )
    }
    
    // Generate unique file name
    const fileExt = fileName.split('.').pop()
    const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUploadUrl(uniqueFileName)
    
    if (error) {
      console.error('[Upload URL] Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }
    
    console.log('[Upload URL] Signed URL created for:', uniqueFileName)
    
    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: uniqueFileName,
      token: data.token
    })
    
  } catch (error) {
    console.error('[Upload URL] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}