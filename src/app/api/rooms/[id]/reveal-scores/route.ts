import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id
    const { revealed, aiResults } = await request.json()
    
    // Buscar sala
    const room = serverStorage.getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status de revelação
    const updatedRoom = {
      ...room,
      scoresRevealed: revealed,
      scoresRevealedAt: revealed ? new Date().toISOString() : undefined,
      aiResults: aiResults ? JSON.stringify(aiResults) : undefined
    }

    serverStorage.saveRoom(updatedRoom)

    // Salvar resultados da IA separadamente
    if (aiResults) {
      serverStorage.saveAIResults(aiResults)
    }

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
    const roomId = params.id

    // Buscar sala
    const room = serverStorage.getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Buscar resultados da IA
    const aiResults = serverStorage.getAIResults()

    return NextResponse.json({
      scoresRevealed: room.scoresRevealed || false,
      scoresRevealedAt: room.scoresRevealedAt,
      aiResults: room.aiResults ? JSON.parse(room.aiResults) : aiResults
    })
  } catch (error) {
    console.error('Erro ao buscar status de revelação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 