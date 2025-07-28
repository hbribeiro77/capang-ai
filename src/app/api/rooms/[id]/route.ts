import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'
import { convertToRoom, convertToParticipant, convertToPhoto, convertToScore } from '@/lib/localStorage'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id
    console.log('🔍 API: Buscando sala com ID:', roomId)

    // Buscar sala
    const localRoom = serverStorage.getRoom(roomId)
    if (!localRoom) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Buscar participantes da sala
    const localParticipants = serverStorage.getParticipantsByRoom(roomId)
    
    // Converter participantes com fotos e pontuações
    const participants = localParticipants.map((localParticipant: any) => {
      const photos = serverStorage.getPhotosByParticipant(localParticipant.id)
        .map(convertToPhoto)
      
      const scores = serverStorage.getScoresByParticipant(localParticipant.id)
        .map(convertToScore)
      
      return convertToParticipant(localParticipant, photos, scores)
    })

    // Converter sala
    const room = convertToRoom(localRoom, participants, [], [])

    return NextResponse.json({ room })
  } catch (error) {
    console.error('Erro ao buscar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const roomId = params.id
    const updates = await request.json()

    // Buscar sala atual
    const localRoom = serverStorage.getRoom(roomId)
    if (!localRoom) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar sala
    const updatedRoom = { ...localRoom, ...updates }
    serverStorage.saveRoom(updatedRoom)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar sala:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 