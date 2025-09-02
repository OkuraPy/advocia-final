import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[Analysis] API route called')
  
  try {
    const { results, query } = await request.json()
    console.log('[Analysis] Analyzing', results.length, 'results for query:', query)
    
    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    
    if (!openRouterApiKey || openRouterApiKey === 'your_openrouter_api_key_here') {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    const resultsSummary = results.map((r: any) => `
      ${r.tribunal} - ${r.numero}
      ${r.ementa}
      Decisão: ${r.decisao || 'não especificada'}
      ${r.valor ? `Valor: R$ ${r.valor.toLocaleString('pt-BR')}` : ''}
    `).join('\n\n')

    const prompt = `
      Você é um assistente jurídico especializado em análise estratégica para advogados.
      Analise estes resultados de jurisprudência para: "${query}"
      
      RESULTADOS:
      ${resultsSummary}
      
      Forneça uma análise prática e direta:
      
      1. SÍNTESE (máximo 2 frases): Capture a essência dos precedentes de forma objetiva
      
      2. RESUMO (1 parágrafo): Tendência jurisprudencial clara e aplicável
      
      3. PONTOS-CHAVE (3-5 pontos): Os mais relevantes para o caso
      
      4. TOP 3 DECISÕES: As mais relevantes com tribunal, número e resumo da decisão
      
      5. ARGUMENTOS VENCEDORES (4-5): Argumentos ESPECÍFICOS que foram aceitos nos tribunais nos casos analisados (cite o tribunal e o argumento exato, não genéricos)
      
      6. TEXTO PRONTO PARA PETIÇÃO: Um parágrafo COMPLETO (mínimo 100 palavras) citando os precedentes específicos encontrados, números dos processos e argumentação jurídica aplicável
      
      7. TESE SUGERIDA: Uma tese jurídica ESPECÍFICA e DETALHADA para o caso concreto, baseada nos precedentes encontrados (não genérica)
      
      Retorne EXCLUSIVAMENTE em formato JSON:
      {
        "synthesis": "síntese em 2 frases",
        "summary": "resumo em 1 parágrafo",
        "keyPoints": ["ponto 1", "ponto 2", ...],
        "topDecisions": [
          {"tribunal": "STJ", "numero": "REsp 123", "decisao": "resumo", "valor": 15000}
        ],
        "winningArguments": ["argumento 1", "argumento 2", ...],
        "readyToCopy": "texto formatado para petição",
        "suggestedThesis": "tese jurídica sugerida"
      }
    `

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-235b-a22b',
        provider: {
          order: ['deepinfra/fp8']
        },
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API Error:', response.status, errorText)
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[Analysis] Response structure:', Object.keys(data))
    
    const content = data.choices?.[0]?.message?.content
    console.log('[Analysis] Content type:', typeof content)
    console.log('[Analysis] Content preview:', content ? content.substring(0, 100) : 'No content')

    if (!content) {
      console.error('[Analysis] No content found in response')
      return NextResponse.json({ error: 'No content in response' }, { status: 500 })
    }

    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
      const parsed = JSON.parse(cleanContent)
      return NextResponse.json(parsed)
    } catch (e) {
      console.error('Error parsing response:', e)
      console.error('Raw content:', content.substring(0, 200))
      
      // Tenta extrair JSON de outras formas
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(parsed);
        }
      } catch (e2) {
        // Fallback
      }
      
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}