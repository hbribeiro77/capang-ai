import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

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
    const participants = serverStorage.getParticipants()
    const participant = participants.find((p: any) => p.id === participantId)

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a sala existe
    const room = serverStorage.getRoom(roomId)

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
      const existingScores = serverStorage.getScoresByParticipant(participantId)
      const existingScore = existingScores.find((s: any) => s.itemId === score.itemId)

      if (existingScore) {
        // Atualizar score existente
        const updatedScore = {
          ...existingScore,
          value: score.value,
          updatedAt: new Date().toISOString()
        }
        serverStorage.saveScore(updatedScore)
        savedScores.push(updatedScore)
      } else {
        // Criar novo score
        const newScore = {
          id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          participantId,
          itemId: score.itemId,
          value: score.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        serverStorage.saveScore(newScore)
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