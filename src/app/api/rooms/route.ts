import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function POST(request: NextRequest) {
  try {
    const { name, moderatorName } = await request.json()

    if (!name || !moderatorName) {
      return NextResponse.json(
        { error: 'Nome da sala e nome do moderador são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar ID único e código de convite
    const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const inviteCode = Math.random().toString(36).substr(2, 6).toUpperCase()

    // Criar sala
    const room = {
      id,
      name,
      moderatorName,
      inviteCode,
      isActive: true,
      createdAt: new Date().toISOString(),
      aiAnalyzing: false,
      scoresRevealed: false
    }

    // Salvar no serverStorage
    serverStorage.saveRoom(room)

    // Criar o participante moderador automaticamente
    const participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: moderatorName,
      roomId: room.id,
      createdAt: new Date().toISOString()
    }
    serverStorage.saveParticipant(participant)

    return NextResponse.json({
      id: room.id,
      name: room.name,
      moderatorName: room.moderatorName,
      inviteCode: room.inviteCode,
      isActive: room.isActive,
      createdAt: room.createdAt,
      participantId: participant.id
    })
  } catch (error) {
    console.error('Erro ao criar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const rooms = serverStorage.getRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 