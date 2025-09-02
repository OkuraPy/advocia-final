import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { textExtractor } from '@/lib/services/text-extractor'

export async function POST(request: NextRequest) {
  console.log('[Process] Document process endpoint called')
  
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
    
    const { 
      filePath, 
      fileName, 
      fileType, 
      fileSize,
      mimeType,
      title,
      documentType,
      clientId 
    } = await request.json()
    
    if (!filePath || !fileName) {
      return NextResponse.json(
        { error: 'File path and name are required' },
        { status: 400 }
      )
    }
    
    // Download file from storage to extract text
    let extractedContent = ''
    try {
      console.log('[Process] Downloading file for text extraction:', filePath)
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(filePath)
      
      if (!downloadError && fileData) {
        console.log('[Process] Extracting text from file...')
        const buffer = Buffer.from(await fileData.arrayBuffer())
        extractedContent = await textExtractor.extractText(buffer, mimeType)
        console.log('[Process] Text extracted, length:', extractedContent.length)
      }
    } catch (extractError) {
      console.error('[Process] Text extraction failed:', extractError)
      // Continue without text extraction
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)
    
    // Save document metadata to database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_type: documentType || 'Outros',
        file_size: fileSize,
        file_url: filePath,
        mime_type: mimeType,
        title: title || fileName,
        document_type: documentType,
        client_id: clientId || null,
        content: extractedContent,
        status: extractedContent ? 'analyzed' : 'pending'
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('[Process] Database error:', dbError)
      
      // Clean up uploaded file
      await supabase.storage
        .from('documents')
        .remove([filePath])
      
      return NextResponse.json(
        { error: 'Failed to save document metadata' },
        { status: 500 }
      )
    }
    
    console.log('[Process] Document processed successfully:', document.id)
    
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
    console.error('[Process] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}