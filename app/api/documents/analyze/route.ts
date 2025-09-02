import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Tipos de documentos jurídicos
const DOCUMENT_TYPES = {
  contract: 'contrato',
  petition: 'petição',
  sentence: 'sentença',
  appeal: 'recurso',
  agreement: 'acordo',
  power_of_attorney: 'procuração',
  notification: 'notificação',
  certificate: 'certidão',
  other: 'outro'
}

export async function POST(request: NextRequest) {
  console.log('[Document Analysis] Starting document analysis')
  
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      console.error('[Document Analysis] Document not found:', docError)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Verificar se já tem análise
    if (document.analysis_result) {
      console.log('[Document Analysis] Returning existing analysis')
      return NextResponse.json(document.analysis_result)
    }

    // Verificar se tem conteúdo extraído
    if (!document.content) {
      return NextResponse.json(
        { error: 'Document content not available. Please wait for processing to complete.' },
        { status: 400 }
      )
    }

    const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    
    if (!openRouterApiKey) {
      console.error('[Document Analysis] OpenRouter API key not configured')
      return NextResponse.json(
        { error: 'Analysis service not configured' },
        { status: 500 }
      )
    }

    // Criar prompt especializado para análise jurídica
    const analysisPrompt = `Analise este documento jurídico em português brasileiro e forneça uma análise completa e estruturada.

DOCUMENTO:
${document.content.substring(0, 6000)} // Limitar para evitar timeout e garantir resposta completa

INSTRUÇÕES:
Realize uma análise jurídica profunda na perspectiva de um advogado que precisa identificar riscos para seu cliente e oportunidades de melhoria.
Considere que este é um documento legal brasileiro e você deve auxiliar o advogado no dia a dia.
Identifique o tipo de documento e extraia TODAS as informações relevantes.

IMPORTANTE:
- Para CONTRATOS: foque em cláusulas perigosas, desequilíbrios contratuais e cláusulas faltantes
- Para PETIÇÕES: verifique fundamentos jurídicos, provas necessárias e adequação dos pedidos
- Para PROCURAÇÕES: analise se os poderes são suficientes e prazo de validade
- Sempre identifique riscos práticos e oportunidades de melhoria

Retorne APENAS um JSON válido com a seguinte estrutura:

{
  "tipo_documento": "contrato/petição/sentença/recurso/acordo/procuração/notificação/certidão/outro",
  "titulo": "título descritivo do documento",
  "resumo_executivo": "resumo em 3-4 linhas do conteúdo principal",
  "objetivo_principal": "qual o objetivo central deste documento",
  
  "partes_envolvidas": [
    {
      "nome": "nome completo",
      "tipo": "autor/réu/contratante/contratado/outorgante/outorgado/etc",
      "cpf_cnpj": "se disponível",
      "qualificacao": "profissão, estado civil, etc se mencionado"
    }
  ],
  
  "pontos_principais": [
    {
      "titulo": "título do ponto",
      "descricao": "descrição detalhada",
      "relevancia": "alta/média/baixa",
      "localizacao": "onde no documento está mencionado"
    }
  ],
  
  "clausulas_importantes": [
    {
      "tipo": "pagamento/prazo/penalidade/obrigação/direito/garantia",
      "descricao": "descrição completa da cláusula",
      "impacto": "explicação do impacto jurídico"
    }
  ],
  
  "datas_relevantes": [
    {
      "data": "YYYY-MM-DD",
      "descricao": "o que acontece nesta data",
      "tipo": "assinatura/vencimento/prazo/audiência/outro"
    }
  ],
  
  "valores_monetarios": [
    {
      "valor": 0.00,
      "descricao": "a que se refere este valor",
      "tipo": "principal/multa/honorários/custas/outro"
    }
  ],
  
  "riscos_identificados": [
    {
      "tipo": "jurídico/financeiro/operacional/reputacional",
      "descricao": "descrição detalhada do risco",
      "probabilidade": "alta/média/baixa",
      "impacto": "alto/médio/baixo",
      "mitigacao": "sugestão de como mitigar este risco"
    }
  ],
  
  "oportunidades": [
    {
      "descricao": "oportunidade identificada",
      "beneficio": "benefício potencial",
      "acao_recomendada": "o que fazer para aproveitar"
    }
  ],
  
  "proximos_passos": [
    {
      "acao": "ação recomendada",
      "prazo": "urgente/curto prazo/médio prazo",
      "responsavel": "quem deve executar",
      "observacao": "detalhes importantes"
    }
  ],
  
  "alertas_juridicos": [
    {
      "tipo": "prazo/prescrição/decadência/nulidade/irregularidade",
      "descricao": "descrição do alerta",
      "gravidade": "crítico/alto/médio/baixo",
      "recomendacao": "o que fazer"
    }
  ],
  
  "fundamentacao_legal": [
    {
      "lei": "número da lei/código",
      "artigo": "artigo específico",
      "descricao": "o que diz",
      "aplicacao": "como se aplica ao caso"
    }
  ],
  
  "observacoes_tecnicas": "observações técnicas relevantes sobre o documento",
  
  "qualidade_documento": {
    "completude": "completo/incompleto",
    "clareza": "claro/ambíguo",
    "formalidade": "adequada/inadequada",
    "observacoes": "detalhes sobre a qualidade"
  },
  
  "recomendacoes_finais": "recomendações gerais e conclusão da análise"
}

IMPORTANTE:
- Seja extremamente detalhado e preciso
- Extraia TODOS os valores, datas e nomes mencionados
- Identifique riscos ocultos e oportunidades
- Sugira ações concretas e práticas
- Use linguagem jurídica apropriada mas clara
- Considere o contexto do direito brasileiro`

    console.log('[Document Analysis] Sending request to Qwen model...')
    
    // Usar AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct', // Qwen 2.5 72B para análise avançada
        messages: [{
          role: 'system',
          content: 'Você é um advogado especialista brasileiro com 20 anos de experiência. Analise documentos na perspectiva prática do dia a dia advocatício, identificando riscos para o cliente, oportunidades de melhoria e ações necessárias. Seja direto e objetivo, focando no que realmente importa para a atuação do advogado. IMPORTANTE: Retorne APENAS JSON válido, sem texto adicional.'
        }, {
          role: 'user',
          content: analysisPrompt
        }],
        temperature: 0.2, // Baixa temperatura para respostas mais consistentes
        max_tokens: 12000, // Aumentado para garantir resposta completa do Qwen
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Document Analysis] API Error:', response.status, errorText)
      
      // Fallback para outro modelo se Qwen falhar
      console.log('[Document Analysis] Trying fallback model...')
      
      const fallbackController = new AbortController()
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 20000) // 20 segundos
      
      const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku', // Modelo de fallback rápido
          messages: [{
            role: 'system',
            content: 'Você é um assistente jurídico. Analise o documento e retorne APENAS JSON válido.'
          }, {
            role: 'user',
            content: analysisPrompt
          }],
          temperature: 0.2,
          max_tokens: 3000
        }),
        signal: fallbackController.signal
      }).finally(() => clearTimeout(fallbackTimeoutId))

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: 'Analysis service unavailable' },
          { status: 503 }
        )
      }

      const fallbackData = await fallbackResponse.json()
      const fallbackContent = fallbackData.choices[0]?.message?.content
      
      try {
        const cleanContent = fallbackContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const analysis = JSON.parse(cleanContent)
        
        // Salvar análise no banco
        await supabase
          .from('documents')
          .update({ 
            analysis_result: analysis,
            analyzed_at: new Date().toISOString(),
            status: 'analyzed'
          })
          .eq('id', documentId)
        
        return NextResponse.json(analysis)
      } catch (e) {
        console.error('[Document Analysis] Parse error:', e)
        return NextResponse.json(
          { error: 'Failed to parse analysis results' },
          { status: 500 }
        )
      }
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500 }
      )
    }

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const analysis = JSON.parse(cleanContent)
      
      // Salvar análise no banco
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          analysis_result: analysis,
          analyzed_at: new Date().toISOString(),
          status: 'analyzed'
        })
        .eq('id', documentId)

      if (updateError) {
        console.error('[Document Analysis] Failed to save analysis:', updateError)
      }

      console.log('[Document Analysis] Analysis completed successfully')
      return NextResponse.json(analysis)
      
    } catch (e) {
      console.error('[Document Analysis] Parse error:', e)
      console.error('[Document Analysis] Raw content:', content.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to parse analysis results' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[Document Analysis] Unexpected error:', error)
    
    // Tratar erro de timeout especificamente
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Análise demorou muito tempo. Por favor, tente novamente.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}