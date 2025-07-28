import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roomId } = params
    const { name } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome do participante é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a sala existe e está ativa
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

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

    // Verificar se já existe um participante com esse nome na sala
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        roomId,
        name: name.trim()
      }
    })

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Já existe um participante com esse nome nesta sala' },
        { status: 400 }
      )
    }

    // Criar o participante
    const participant = await prisma.participant.create({
      data: {
        name: name.trim(),
        roomId
      }
    })

    return NextResponse.json({
      participantId: participant.id,
      message: 'Participante registrado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao registrar participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 