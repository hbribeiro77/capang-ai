import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== BUSCANDO SALA ===')
  console.log('Room ID:', params.id)
  
  try {
    const { id } = params

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            photos: true,
            scores: {
              include: {
                item: true
              }
            }
          }
        },
        items: true
      }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    console.log('Sala encontrada:', {
      id: room.id,
      name: room.name,
      participantsCount: room.participants.length,
      participants: room.participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        photosCount: p.photos.length,
        photos: p.photos.map((photo: any) => ({
          id: photo.id,
          type: photo.type,
          url: photo.url
        }))
      }))
    })

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Erro ao buscar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 