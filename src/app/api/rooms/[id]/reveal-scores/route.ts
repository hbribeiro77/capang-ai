import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { revealed, aiResults } = await request.json()
    
    console.log('🔍 POST /reveal-scores - Dados recebidos:')
    console.log('revealed:', revealed)
    console.log('aiResults:', aiResults)
    
    // Atualizar o status de revelação da sala e salvar resultados da IA
    await prisma.room.update({
      where: { id: params.id },
      data: { 
        scoresRevealed: revealed,
        scoresRevealedAt: revealed ? new Date() : null,
        aiResults: aiResults ? JSON.stringify(aiResults) : null
      }
    })

    console.log('✅ Dados salvos no banco com sucesso')
    return NextResponse.json({ success: true, revealed })
  } catch (error) {
    console.error('Erro ao atualizar status de revelação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      select: { scoresRevealed: true, scoresRevealedAt: true, aiResults: true }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    console.log('🔍 GET /reveal-scores - Dados do banco:')
    console.log('scoresRevealed:', room.scoresRevealed)
    console.log('scoresRevealedAt:', room.scoresRevealedAt)
    console.log('aiResults (raw):', room.aiResults)
    
    const parsedAiResults = room.aiResults ? JSON.parse(room.aiResults) : null
    console.log('aiResults (parsed):', parsedAiResults)

    return NextResponse.json({
      scoresRevealed: room.scoresRevealed || false,
      scoresRevealedAt: room.scoresRevealedAt,
      aiResults: parsedAiResults
    })
  } catch (error) {
    console.error('Erro ao buscar status de revelação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 