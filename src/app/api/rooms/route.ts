import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInviteCode } from '@/lib/utils'

const ITEMS = [
  'Pão', 'Carne', 'Salada', 'Bacon', 'Ovo', 
  'Queijo', 'Batata', 'Batata com Bacon', 'Limpeza'
]

export async function POST(request: NextRequest) {
  try {
    const { name, moderatorName } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nome da sala é obrigatório' },
        { status: 400 }
      )
    }

    if (!moderatorName || typeof moderatorName !== 'string') {
      return NextResponse.json(
        { error: 'Nome do moderador é obrigatório' },
        { status: 400 }
      )
    }

    // Gerar código de convite único
    const inviteCode = generateInviteCode()

    // Criar sala
    const room = await prisma.room.create({
      data: {
        name,
        inviteCode,
        moderatorName,
        items: {
          create: ITEMS.map(itemName => ({
            name: itemName
          }))
        },
        participants: {
          create: {
            name: moderatorName
          }
        }
      },
      include: {
        participants: true,
        items: true
      }
    })

    return NextResponse.json({ 
      roomId: room.id,
      inviteCode: room.inviteCode,
      participantId: room.participants[0].id // ID do moderador
    })
  } catch (error) {
    console.error('Erro ao criar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 