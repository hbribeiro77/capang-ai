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
      select: {
        id: true,
        name: true,
        inviteCode: true,
        isActive: true
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
      roomId: room.id,
      roomName: room.name,
      inviteCode: room.inviteCode
    })
  } catch (error) {
    console.error('Erro ao buscar sala por código:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 