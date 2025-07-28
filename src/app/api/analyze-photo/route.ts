import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

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
   - SIMPLE: quantidade normal (1 ponto)
   - DUPLO: quantidade maior que o normal (2 pontos)
   - TRIPLO: quantidade muito maior que o normal (3 pontos)

RESPONDA APENAS NO FORMATO JSON:
{
  "items": [
    {
      "name": "nome_do_item",
      "quantity": "SIMPLE|DUPLO|TRIPLO"
    }
  ]
}

Se não conseguir identificar nenhum item claramente, retorne um array vazio.`
      : `Você é um especialista em análise de limpeza de pratos após refeições. Analise a foto do prato e avalie o nível de limpeza.

INSTRUÇÕES:
1. Analise a foto do prato cuidadosamente
2. Avalie quantos resíduos de comida ainda estão visíveis
3. Determine o nível de limpeza:
   - SIMPLE: prato limpo, poucos resíduos (1 ponto)
   - DUPLO: prato bem limpo, muito poucos resíduos (2 pontos)
   - TRIPLO: prato muito limpo, praticamente sem resíduos (3 pontos)
   - Se o prato estiver muito sujo, não retorne nenhum item

RESPONDA APENAS NO FORMATO JSON:
{
  "items": [
    {
      "name": "Limpeza",
      "quantity": "SIMPLE|DUPLO|TRIPLO"
    }
  ]
}

Se o prato estiver muito sujo ou não conseguir avaliar a limpeza, retorne um array vazio.`

    const userPrompt = photoType === 'INITIAL'
      ? 'Analise esta foto da refeição/lanche. Identifique TODOS os itens de comida visíveis, incluindo ingredientes, acompanhamentos, bebidas e qualquer outro alimento que você conseguir detectar.'
      : 'Analise esta foto do prato após a refeição. Avalie cuidadosamente a limpeza do prato, considerando quantos resíduos de comida ainda estão visíveis. Quanto mais limpo o prato, melhor a pontuação.'

    console.log('🤖 CHAMANDO OPENAI...')
    console.log('Modelo:', "gpt-4o-mini")
    console.log('URL da imagem:', imageUrl.substring(0, 100) + '...')

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

    console.log('🤖 RESPOSTA DA IA:')
    console.log('Raw response:', content)

    // Tentar fazer parse do JSON da resposta
    let detectedItems = []
    try {
      // Limpar a resposta de markdown se necessário
      let cleanContent = content.trim()
      
      // Se a resposta começa com ```json, remover o markdown
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      }
      // Se a resposta começa com ```, remover o markdown
      else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      console.log('🧹 Conteúdo limpo:', cleanContent)
      
      const parsed = JSON.parse(cleanContent)
      detectedItems = parsed.items || []
      console.log('✅ Itens detectados pela IA:')
      detectedItems.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ${item.name} - ${item.quantity}`)
      })
    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta:', content)
      console.error('Erro:', error)
      // Fallback: tentar extrair informações do texto
      detectedItems = []
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