import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function POST(request: NextRequest, { params }: { params: { id: string, participantId: string } }) {
  try {
    const { participantId } = params
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const type = formData.get('type') as 'INITIAL' | 'FINAL'

    if (!photo || !type) {
      return NextResponse.json(
        { error: 'Foto e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o participante existe
    const participants = serverStorage.getParticipants()
    const participant = participants.find((p: any) => p.id === participantId)
    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    // Converter foto para base64
    const arrayBuffer = await photo.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${photo.type};base64,${base64}`

    // Criar foto
    const photoData = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantId,
      type,
      url: dataUrl,
      createdAt: new Date().toISOString()
    }

    // Salvar no localStorage
    serverStorage.savePhoto(photoData)

    return NextResponse.json({
      id: photoData.id,
      participantId: photoData.participantId,
      type: photoData.type,
      url: photoData.url,
      createdAt: photoData.createdAt
    })
  } catch (error) {
    console.error('Erro ao enviar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string, participantId: string } }) {
  try {
    const { participantId } = params
    const { type } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Tipo da foto é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar fotos do participante
    const photos = serverStorage.getPhotosByParticipant(participantId)
    const photoToDelete = photos.find((p: any) => p.type === type)

    if (!photoToDelete) {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      )
    }

    // Deletar foto
    serverStorage.deletePhoto(photoToDelete.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 