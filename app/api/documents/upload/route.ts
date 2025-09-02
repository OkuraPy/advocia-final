import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { textExtractor } from '@/lib/services/text-extractor'

// Configurar limite de tamanho para 50MB
export const runtime = 'nodejs'
export const maxDuration = 60 // 60 segundos de timeout
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('[Upload] Document upload endpoint called')
  
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
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const clientId = formData.get('clientId') as string
    const title = formData.get('title') as string || file.name
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' },
        { status: 400 }
      )
    }
    
    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    console.log('[Upload] Uploading file:', fileName, 'Size:', file.size)
    
    // Extract text content before uploading
    let extractedContent = ''
    try {
      console.log('[Upload] Extracting text from file...')
      extractedContent = await textExtractor.extractText(file, file.type)
      console.log('[Upload] Text extracted, length:', extractedContent.length)
    } catch (extractError) {
      console.error('[Upload] Text extraction failed:', extractError)
      // Continue without text extraction - não bloqueia o upload
    }
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)
    
    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: documentType || 'Outros',
        file_size: file.size,
        file_url: fileName, // Store path, not full URL
        mime_type: file.type,
        title: title,
        document_type: documentType,
        client_id: clientId || null,
        content: extractedContent, // Salva o texto extraído
        status: extractedContent ? 'analyzed' : 'pending' // Se extraiu texto, marca como analisado
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('[Upload] Database error:', dbError)
      
      // Clean up uploaded file
      await supabase.storage
        .from('documents')
        .remove([fileName])
      
      return NextResponse.json(
        { error: 'Failed to save document metadata' },
        { status: 500 }
      )
    }
    
    console.log('[Upload] Document uploaded successfully:', document.id)
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.file_name,
        type: document.document_type,
        size: `${(document.file_size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: document.created_at,
        status: document.status,
        url: publicUrl
      }
    })
    
  } catch (error) {
    console.error('[Upload] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}