import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  console.log('=== INÍCIO DO UPLOAD DE FOTO ===')
  console.log('Params:', params)
  
  try {
    const { id: roomId, participantId } = params
    console.log('RoomId:', roomId, 'ParticipantId:', participantId)

    // Verificar se a sala e participante existem
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    // Por enquanto, vamos simular o upload
    // Em produção, você integraria com Cloudinary ou similar
    const formData = await request.formData()
    const photo = formData.get('photo') as File
    const type = formData.get('type') as string
    
    console.log('FormData recebido:')
    console.log('- Photo:', photo ? 'File presente' : 'File ausente')
    console.log('- Type:', type)

    if (!photo) {
      return NextResponse.json(
        { error: 'Foto é obrigatória' },
        { status: 400 }
      )
    }

    if (!type || !['INITIAL', 'FINAL'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de foto inválido' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma foto deste tipo para este participante
    const existingPhoto = await prisma.photo.findFirst({
      where: {
        participantId,
        type
      }
    })

    if (existingPhoto) {
      return NextResponse.json(
        { error: `Já existe uma foto ${type === 'INITIAL' ? 'inicial' : 'final'} para este participante` },
        { status: 400 }
      )
    }

    // Converter a foto para base64 para usar a imagem real
    const arrayBuffer = await photo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = photo.type || 'image/jpeg'
    const photoUrl = `data:${mimeType};base64,${base64}`
    
    console.log('Foto convertida para base64, tamanho:', buffer.length, 'bytes')

    // Salvar a foto no banco
    const savedPhoto = await prisma.photo.create({
      data: {
        participantId,
        url: photoUrl,
        type
      }
    })

    console.log('Foto salva:', {
      id: savedPhoto.id,
      url: savedPhoto.url,
      type: savedPhoto.type,
      participantId: savedPhoto.participantId
    })

    const response = {
      photoId: savedPhoto.id,
      url: savedPhoto.url,
      message: `Foto ${type === 'INITIAL' ? 'inicial' : 'final'} enviada com sucesso!`
    }
    
    console.log('Resposta da API:', response)
    console.log('=== FIM DO UPLOAD DE FOTO ===')
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; participantId: string } }
) {
  console.log('=== REMOVENDO FOTO ===')
  console.log('Params:', params)
  
  try {
    const { id: roomId, participantId } = params
    console.log('RoomId:', roomId, 'ParticipantId:', participantId)

    // Verificar se a sala e participante existem
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type } = body

    if (!type || !['INITIAL', 'FINAL'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de foto inválido' },
        { status: 400 }
      )
    }

    // Buscar e remover a foto
    const photo = await prisma.photo.findFirst({
      where: {
        participantId,
        type
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: `Foto ${type === 'INITIAL' ? 'inicial' : 'final'} não encontrada` },
        { status: 404 }
      )
    }

    await prisma.photo.delete({
      where: { id: photo.id }
    })

    console.log('Foto removida:', {
      id: photo.id,
      type: photo.type,
      participantId: photo.participantId
    })

    return NextResponse.json({
      message: `Foto ${type === 'INITIAL' ? 'inicial' : 'final'} removida com sucesso!`
    })

  } catch (error) {
    console.error('Erro ao remover foto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 