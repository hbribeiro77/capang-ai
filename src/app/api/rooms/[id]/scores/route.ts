import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: roomId } = params
    const { participantId, scores } = await request.json()

    if (!participantId) {
      return NextResponse.json(
        { error: 'ID do participante é obrigatório' },
        { status: 400 }
      )
    }

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'Scores é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    // Verificar se o participante existe
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a sala existe
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      )
    }

    // Salvar cada score
    const savedScores = []
    for (const score of scores) {
      if (!score.itemId || !score.value || !['SIMPLE', 'DUPLO', 'TRIPLO'].includes(score.value)) {
        continue
      }

      // Verificar se já existe um score para este item e participante
      const existingScore = await prisma.score.findFirst({
        where: {
          participantId,
          itemId: score.itemId
        }
      })

      if (existingScore) {
        // Atualizar score existente
        const updatedScore = await prisma.score.update({
          where: { id: existingScore.id },
          data: { value: score.value }
        })
        savedScores.push(updatedScore)
      } else {
        // Criar novo score
        const newScore = await prisma.score.create({
          data: {
            participantId,
            itemId: score.itemId,
            value: score.value
          }
        })
        savedScores.push(newScore)
      }
    }

    return NextResponse.json({
      message: 'Pontuação salva com sucesso!',
      scores: savedScores
    })

  } catch (error) {
    console.error('Erro ao salvar pontuação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 