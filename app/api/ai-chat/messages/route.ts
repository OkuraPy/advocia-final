import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentSystemPrompt } from '@/lib/prompts/legal-agents'

// GET - Listar mensagens de uma conversa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    // Verificar se a conversa pertence ao usuário
    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Buscar mensagens da conversa
    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[AI Chat] Error fetching messages:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Enviar mensagem e receber resposta da IA
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversation_id, content, agent_id } = await request.json()

    if (!conversation_id || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      )
    }

    // Verificar se a conversa pertence ao usuário
    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Salvar mensagem do usuário
    const { data: userMessage, error: userMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id,
        role: 'user',
        content,
        metadata: {}
      })
      .select()
      .single()

    if (userMsgError) {
      console.error('[AI Chat] Error saving user message:', userMsgError)
      return NextResponse.json({ error: userMsgError.message }, { status: 500 })
    }

    // Buscar últimas mensagens para contexto (máximo 10)
    const { data: previousMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Reverter ordem para cronológica
    const contextMessages = previousMessages?.reverse() || []

    // Preparar prompt baseado no agente
    const systemPrompt = getAgentSystemPrompt(agent_id || conversation.agent_id)

    // Chamar OpenRouter API
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    
    if (!openRouterApiKey) {
      console.error('[AI Chat] OpenRouter API key not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Construir mensagens para a API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages.slice(0, -1).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content }
    ]

    console.log('[AI Chat] Sending request to OpenRouter with', apiMessages.length, 'messages')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[AI Chat] OpenRouter API error:', error)
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      )
    }

    const aiResponse = await response.json()
    const aiContent = aiResponse.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'

    // Salvar resposta da IA
    const { data: aiMessage, error: aiMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id,
        role: 'assistant',
        content: aiContent,
        metadata: { model: 'qwen-2.5-72b' }
      })
      .select()
      .single()

    if (aiMsgError) {
      console.error('[AI Chat] Error saving AI message:', aiMsgError)
      return NextResponse.json({ error: aiMsgError.message }, { status: 500 })
    }

    return NextResponse.json({
      userMessage,
      aiMessage
    })
  } catch (error) {
    console.error('[AI Chat] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Prompt function is now imported from legal-agents.ts