import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { inviteCode: string } }
) {
  try {
    const { inviteCode } = params

    const room = await prisma.room.findUnique({
      where: { inviteCode },
      include: {
        participants: true,
        items: true
      }
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

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        inviteCode: room.inviteCode,
        participants: room.participants,
        items: room.items
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