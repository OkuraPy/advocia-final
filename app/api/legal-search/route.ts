import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[API] Legal search endpoint called')
  
  try {
    const { query, type, searchMode = 'quick' } = await request.json()
    console.log('[API] Search query:', query, 'Type:', type, 'Mode:', searchMode)
    
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    
    if (!openRouterApiKey || openRouterApiKey === 'your_openrouter_api_key_here') {
      console.error('[API] OpenRouter API key not configured')
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }
    
    console.log('[API] API Key found:', openRouterApiKey.substring(0, 10) + '...')

    // Enriquece a query
    const enhancedQuery = `jurisprudência brasileira recente sobre ${query} decisões 2023 2024 tribunais superiores`
    
    const prompt = `Busque 5 jurisprudências brasileiras recentes (2023-2024) sobre: ${enhancedQuery}

IMPORTANTE: Você DEVE retornar APENAS um JSON válido, sem nenhum texto adicional antes ou depois.
Não inclua explicações, comentários ou markdown. APENAS o JSON puro.

Formato exato do JSON:
{
  "results": [
    {
      "titulo": "breve descrição do caso",
      "tribunal": "TST",
      "numero": "RR-123456",
      "data": "2024-01-15",
      "relator": "Min. Nome",
      "ementa": "resumo da decisão em 150 palavras",
      "decisao": "favoravel",
      "valor": 50000,
      "fonte": "link ou referência oficial",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Busque em sites oficiais (TST, TRTs, STJ) e inclua decisões favoráveis e desfavoráveis.`

    // Usa Qwen para todas as buscas jurídicas
    const model = 'qwen/qwen-2.5-72b-instruct' // Qwen 2.5 72B para pesquisa jurídica
    
    console.log('[API] Using model:', model)
    console.log('[API] Request URL:', 'https://openrouter.ai/api/v1/chat/completions')
    console.log('[API] Search mode:', searchMode)
    
    console.log('[API] Sending request to OpenRouter...')
    const startTime = Date.now()
    
    // Define timeout baseado no modo
    const timeoutMs = searchMode === 'deep' ? 30000 : 10000 // Deep: 30s, Quick: 10s
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'system',
          content: 'Você é um assistente jurídico especializado em pesquisa de jurisprudência brasileira. SEMPRE retorne APENAS JSON válido, sem texto adicional, markdown ou explicações.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.1,
        max_tokens: 5000, // Aumentado para garantir resposta completa
        response_format: { type: "json_object" } // Força resposta em JSON
      })
    }).finally(() => {
      clearTimeout(timeoutId)
    })

    console.log(`[API] Response received in ${Date.now() - startTime}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] OpenRouter API Error:', response.status, errorText)
      
      // Log mais detalhes do erro
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenRouter API key.' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    console.log('[API] Parsing response...')
    const data = await response.json()
    console.log('[API] Response data:', JSON.stringify(data).substring(0, 500) + '...')
    
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.log('[API] No content in response')
      return NextResponse.json({ results: [], sources: [] })
    }

    try {
      // Remove markdown code blocks if present
      let cleanContent = content
      
      // Remove qualquer texto antes do primeiro {
      const jsonStart = cleanContent.indexOf('{')
      if (jsonStart > 0) {
        cleanContent = cleanContent.substring(jsonStart)
      }
      
      // Remove qualquer texto depois do último }
      const jsonEnd = cleanContent.lastIndexOf('}')
      if (jsonEnd > 0 && jsonEnd < cleanContent.length - 1) {
        cleanContent = cleanContent.substring(0, jsonEnd + 1)
      }
      
      // Remove markdown code blocks
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      const parsed = JSON.parse(cleanContent)
      
      // Valida estrutura da resposta
      if (!parsed.results || !Array.isArray(parsed.results)) {
        console.error('[API] Invalid response structure')
        return NextResponse.json({ results: [] })
      }
      
      console.log(`[API] Successfully parsed ${parsed.results.length} results`)
      return NextResponse.json(parsed)
    } catch (e) {
      console.error('[API] Error parsing JSON response:', e)
      console.error('[API] Raw content:', content.substring(0, 500))
      return NextResponse.json({ results: [] })
    }
  } catch (error: any) {
    console.error('[API] Route error:', error)
    console.error('[API] Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}