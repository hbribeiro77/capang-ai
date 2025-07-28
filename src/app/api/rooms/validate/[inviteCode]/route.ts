import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function GET(
  request: NextRequest,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const { inviteCode } = params

    const rooms = serverStorage.getRooms()
    const room = rooms.find((r: any) => r.inviteCode === inviteCode)

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Sala inativa' },
        { status: 400 }
      )
    }

    // Buscar participantes da sala
    const participants = serverStorage.getParticipantsByRoom(room.id)

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        inviteCode: room.inviteCode,
        participants: participants,
        items: [] // Por enquanto, não temos items implementados no serverStorage
      }
    })
  } catch (error) {
    console.error('Erro ao validar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 