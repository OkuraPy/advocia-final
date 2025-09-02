import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar conversas do usuário
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar conversas do usuário
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[AI Chat] Error fetching conversations:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar nova conversa
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agent_id, title, initial_message } = await request.json()

    // Criar nova conversa
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        agent_id,
        title: title || 'Nova conversa',
        metadata: { agent_id }
      })
      .select()
      .single()

    if (convError) {
      console.error('[AI Chat] Error creating conversation:', convError)
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    // Se tiver mensagem inicial, criar a primeira mensagem
    if (initial_message) {
      const { error: msgError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: initial_message,
          metadata: {}
        })

      if (msgError) {
        console.error('[AI Chat] Error creating initial message:', msgError)
      }
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar conversa
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Deletar conversa (mensagens serão deletadas em cascata)
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('[AI Chat] Error deleting conversation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}