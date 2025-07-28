import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 INICIANDO ANÁLISE DA FOTO...')
    
    const { imageUrl, photoType } = await request.json()
    console.log('📸 Dados recebidos:', { photoType, imageUrlLength: imageUrl?.length })

    if (!imageUrl) {
      console.log('❌ URL da imagem é obrigatória')
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      )
    }

    // Verificar se a URL é muito longa (base64)
    if (imageUrl.length > 100000) {
      console.log('⚠️ URL muito longa detectada (base64), pode causar problemas')
      console.log('📏 Tamanho da URL:', imageUrl.length, 'caracteres')
    }

    console.log('🔑 Verificando API key...')
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log('❌ OPENAI_API_KEY não encontrada')
      return NextResponse.json(
        { error: 'API key não configurada' },
        { status: 500 }
      )
    }
    console.log('✅ API key encontrada')

    // Prompt específico baseado no tipo de foto
    const systemPrompt = photoType === 'INITIAL' 
      ? `Você é um especialista em análise de fotos de lanches e refeições. Analise a foto e identifique TODOS os itens de comida que você consegue ver.

ITENS PARA DETECTAR (lista não limitativa):
- Pães: pão, hambúrguer, sanduíche, hot dog, baguette, pão de queijo, etc.
- Carnes: hambúrguer, frango, peixe, carne bovina, porco, linguiça, salsicha, etc.
- Vegetais: alface, tomate, cebola, pepino, cenoura, milho, ervilha, etc.
- Queijos: queijo, queijo ralado, queijo cremoso, etc.
- Tubérculos: batata, batata doce, mandioca, etc.
- Massas: macarrão, lasanha, pizza, etc.
- Arroz e feijão
- Molhos: ketchup, mostarda, maionese, molho de tomate, etc.
- Ovos: frito, cozido, omelete, etc.
- Frutas: banana, maçã, laranja, etc.
- Doces: sobremesas, bolos, sorvetes, etc.
- Bebidas: refrigerante, suco, água, etc.
- E QUALQUER OUTRO ITEM DE COMIDA que você conseguir identificar

INSTRUÇÕES:
1. Analise a foto cuidadosamente
2. Liste TODOS os itens de comida que você consegue identificar claramente
3. Para cada item, indique a quantidade:
   - SIMPLES: quantidade normal (1 ponto)
   - DUPLO: quantidade maior que o normal (2 pontos)
   - TRIPLO: quantidade muito maior que o normal (3 pontos)

RESPONDA APENAS NO FORMATO JSON:
{
  "items": [
    {
      "name": "nome_do_item",
      "quantity": "SIMPLES|DUPLO|TRIPLO"
    }
  ]
}

Se não conseguir identificar nenhum item claramente, retorne um array vazio.`
      : `Você é um especialista em análise de limpeza de pratos após refeições. Analise a foto e avalie o nível de limpeza.

INSTRUÇÕES:
1. Analise a foto cuidadosamente - pode ser um prato, bandeja, mesa, etc.
2. Avalie quantos resíduos de comida ainda estão visíveis
3. Determine o nível de limpeza:
   - SUJO: muita comida não consumida ou muita sujeira (0 pontos)
   - SIMPLES: poucos resíduos visíveis (1 ponto)
   - DUPLO: bem limpo, muito poucos resíduos (2 pontos)
   - TRIPLO: muito limpo, praticamente sem resíduos (3 pontos)

IMPORTANTE: SEMPRE retorne uma resposta, mesmo quando o prato está sujo.

RESPONDA NO FORMATO JSON:
{
  "items": [
    {
      "name": "Limpeza",
      "quantity": "SUJO|SIMPLES|DUPLO|TRIPLO"
    }
  ]
}

NUNCA retorne array vazio. Sempre retorne uma resposta com o nível de limpeza.`

    const userPrompt = photoType === 'INITIAL'
      ? 'Analise esta foto da refeição/lanche. Identifique TODOS os itens de comida visíveis, incluindo ingredientes, acompanhamentos, bebidas e qualquer outro alimento que você conseguir detectar.'
      : 'Analise esta foto APÓS a refeição. Avalie a limpeza da superfície (prato, bandeja, mesa, etc.). SEMPRE retorne uma resposta: SUJO (0pts) se tem muita comida/sujeira, SIMPLES (1pt) se tem pouca sujeira, DUPLO (2pts) se está bem limpo, TRIPLO (3pts) se está muito limpo.'

    console.log('🤖 CHAMANDO OPENAI...')
    console.log('Modelo:', "gpt-4o-mini")
    console.log('URL da imagem (início):', imageUrl.substring(0, 100) + '...')
    console.log('URL da imagem (fim):', '...' + imageUrl.substring(imageUrl.length - 100))
    console.log('📸 Tipo de foto sendo analisada:', photoType)

    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    })

    console.log('✅ RESPOSTA RECEBIDA DA OPENAI')
    const content = response.choices[0]?.message?.content
    if (!content) {
      console.log('❌ Resposta vazia da OpenAI')
      throw new Error('Resposta vazia da OpenAI')
    }

    // Verificar se a IA menciona algo sobre a imagem
    const lowerContent = content.toLowerCase()
    const mentionsImage = lowerContent.includes('imagem') || lowerContent.includes('foto') || lowerContent.includes('prato') || lowerContent.includes('comida')
    console.log('🔍 IA menciona imagem/comida:', mentionsImage)
    console.log('🔍 Conteúdo da resposta (primeiros 200 chars):', content.substring(0, 200))

    console.log('🤖 RESPOSTA DA IA:')
    console.log('Raw response:', content)
    console.log('📏 Tamanho da resposta:', content.length, 'caracteres')
    console.log('🔍 Tipo de foto:', photoType)

    // Tentar fazer parse do JSON da resposta
    let detectedItems = []
    try {
      // Limpar a resposta de markdown se necessário
      let cleanContent = content.trim()
      
      console.log('🔍 Conteúdo original da IA:', content)
      
      // Se a resposta começa com ```json, remover o markdown
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        console.log('🧹 Removido markdown JSON')
      }
      // Se a resposta começa com ```, remover o markdown
      else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
        console.log('🧹 Removido markdown genérico')
      }
      
      console.log('🧹 Conteúdo limpo:', cleanContent)
      
      const parsed = JSON.parse(cleanContent)
      console.log('✅ JSON parseado com sucesso:', parsed)
      detectedItems = parsed.items || []
      console.log('✅ Itens detectados pela IA:')
      detectedItems.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ${item.name} - ${item.quantity}`)
      })
    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta:', content)
      console.error('Erro:', error)
      console.error('🔍 Tentando extrair JSON manualmente...')
      
      // Tentar extrair JSON manualmente
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const manualParsed = JSON.parse(jsonMatch[0])
          detectedItems = manualParsed.items || []
          console.log('✅ JSON extraído manualmente:', manualParsed)
        } catch (manualError) {
          console.error('❌ Erro no parse manual:', manualError)
          detectedItems = []
        }
      } else {
        detectedItems = []
      }
    }

    if (detectedItems.length === 0) {
      console.log('⚠️ NENHUM ITEM DETECTADO!')
      console.log('🔍 Tipo de foto:', photoType)
      console.log('📏 Tamanho da URL:', imageUrl.length)
      console.log('📄 Resposta completa da IA:', content)
      console.log('📄 Resposta da IA (primeiros 500 chars):', content.substring(0, 500))
    }

    console.log('📊 Total de itens detectados:', detectedItems.length)

    return NextResponse.json({
      success: true,
      items: detectedItems,
      rawResponse: content
    })

  } catch (error) {
    console.error('💥 ERRO NA ANÁLISE DA FOTO:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Erro ao analisar a foto', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 