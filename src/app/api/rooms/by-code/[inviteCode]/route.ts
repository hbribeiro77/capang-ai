import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function GET(request: NextRequest, { params }: { params: { inviteCode: string } }) {
  try {
    const inviteCode = params.inviteCode

    // Buscar sala pelo código de convite
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

    return NextResponse.json({
      id: room.id,
      name: room.name,
      moderatorName: room.moderatorName,
      inviteCode: room.inviteCode,
      isActive: room.isActive,
      createdAt: room.createdAt
    })
  } catch (error) {
    console.error('Erro ao buscar sala por código:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 