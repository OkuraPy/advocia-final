import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgentSystemPrompt } from '@/lib/prompts/legal-agents'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  try {
    // Parse request body
    const { conversation_id, content, agent_id } = await request.json()

    if (!conversation_id || !content) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenRouter API key
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    
    if (!openRouterApiKey) {
      console.error('[AI Chat Stream] OpenRouter API key not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify conversation belongs to user
    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Save user message first
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
      console.error('[AI Chat Stream] Error saving user message:', userMsgError)
      return new Response(
        JSON.stringify({ error: userMsgError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get recent messages for context
    const { data: previousMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .limit(10)

    const contextMessages = previousMessages?.reverse() || []

    // Prepare system prompt
    const systemPrompt = getAgentSystemPrompt(agent_id || conversation.agent_id)

    // Build messages for API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages.slice(0, -1).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content }
    ]

    // Call OpenRouter API with streaming
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true // Enable streaming
      })
    })

    if (!openRouterResponse.ok) {
      const error = await openRouterResponse.text()
      console.error('[AI Chat Stream] OpenRouter API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a TransformStream to handle the streaming response
    let accumulatedContent = ''
    let aiMessageId: string | null = null
    let buffer = '' // Buffer for incomplete JSON chunks

    const stream = new ReadableStream({
      async start(controller) {
        // Send user message ID first
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'user_message', 
          data: userMessage 
        })}\n\n`))

        const reader = openRouterResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            // Split by newlines but keep incomplete lines in buffer
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // Keep the last incomplete line

            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue
              
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6).trim()
                
                if (data === '[DONE]') {
                  // Save the complete message to database
                  if (accumulatedContent && !aiMessageId) {
                    try {
                      const { data: aiMessage } = await supabase
                        .from('ai_messages')
                        .insert({
                          conversation_id,
                          role: 'assistant',
                          content: accumulatedContent,
                          metadata: { model: 'qwen-2.5-72b', streamed: true }
                        })
                        .select()
                        .single()

                      if (aiMessage) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                          type: 'message_saved', 
                          data: aiMessage 
                        })}\n\n`))
                      }
                    } catch (saveError) {
                      console.error('[AI Chat Stream] Error saving message:', saveError)
                    }
                  }
                  
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                // Skip empty data
                if (!data || data === '{}') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    accumulatedContent += content
                    
                    // Send the chunk to client
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'content', 
                      data: content 
                    })}\n\n`))
                  }
                } catch (e) {
                  // Only log if it's not an empty object
                  if (data !== '{}' && data !== '') {
                    console.error('[AI Chat Stream] Error parsing chunk:', e, 'Data:', data.substring(0, 100))
                  }
                }
              }
            }
          }
          
          // Process any remaining buffer
          if (buffer.trim() && buffer.trim().startsWith('data: ')) {
            const data = buffer.trim().slice(6).trim()
            if (data && data !== '[DONE]' && data !== '{}') {
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  accumulatedContent += content
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                    type: 'content', 
                    data: content 
                  })}\n\n`))
                }
              } catch (e) {
                console.error('[AI Chat Stream] Error parsing final buffer:', e)
              }
            }
          }
          
          // Ensure message is saved even if no [DONE] signal
          if (accumulatedContent && !aiMessageId) {
            try {
              const { data: aiMessage } = await supabase
                .from('ai_messages')
                .insert({
                  conversation_id,
                  role: 'assistant',
                  content: accumulatedContent,
                  metadata: { model: 'qwen-2.5-72b', streamed: true }
                })
                .select()
                .single()

              if (aiMessage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'message_saved', 
                  data: aiMessage 
                })}\n\n`))
              }
            } catch (saveError) {
              console.error('[AI Chat Stream] Error saving final message:', saveError)
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('[AI Chat Stream] Stream error:', error)
          
          // Try to save partial message if we have content
          if (accumulatedContent && !aiMessageId) {
            try {
              const { data: aiMessage } = await supabase
                .from('ai_messages')
                .insert({
                  conversation_id,
                  role: 'assistant',
                  content: accumulatedContent + '\n\n[Resposta interrompida devido a erro]',
                  metadata: { model: 'qwen-2.5-72b', streamed: true, error: true }
                })
                .select()
                .single()

              if (aiMessage) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'message_saved', 
                  data: aiMessage 
                })}\n\n`))
              }
            } catch (saveError) {
              console.error('[AI Chat Stream] Error saving partial message:', saveError)
            }
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            data: 'Erro ao processar resposta' 
          })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } finally {
          reader.releaseLock()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('[AI Chat Stream] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}