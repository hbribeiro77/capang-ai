import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

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

    return NextResponse.json({
      aiAnalyzing: room.aiAnalyzing || false,
      aiAnalysisStartedAt: room.aiAnalysisStartedAt
    })
  } catch (error) {
    console.error('Erro ao buscar status da IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id
    const { aiAnalyzing } = await request.json()

    // Buscar sala
    const room = serverStorage.getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status da IA
    const updatedRoom = {
      ...room,
      aiAnalyzing,
      aiAnalysisStartedAt: aiAnalyzing ? new Date().toISOString() : undefined
    }

    serverStorage.saveRoom(updatedRoom)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar status da IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 