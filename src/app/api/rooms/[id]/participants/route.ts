import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome do participante é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a sala existe
    const room = serverStorage.getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe participante com esse nome na sala
    const existingParticipants = serverStorage.getParticipantsByRoom(roomId)
    const existingParticipant = existingParticipants.find((p: any) => p.name === name)
    
    if (existingParticipant) {
      return NextResponse.json({
        id: existingParticipant.id,
        name: existingParticipant.name,
        roomId: existingParticipant.roomId,
        createdAt: existingParticipant.createdAt
      })
    }

    // Criar novo participante
    const participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      roomId,
      createdAt: new Date().toISOString()
    }

    // Salvar no serverStorage
    serverStorage.saveParticipant(participant)

    return NextResponse.json({
      id: participant.id,
      name: participant.name,
      roomId: participant.roomId,
      createdAt: participant.createdAt
    })
  } catch (error) {
    console.error('Erro ao criar participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id

    // Verificar se a sala existe
    const room = serverStorage.getRoom(roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Buscar participantes da sala
    const participants = serverStorage.getParticipantsByRoom(roomId)

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Erro ao buscar participantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 