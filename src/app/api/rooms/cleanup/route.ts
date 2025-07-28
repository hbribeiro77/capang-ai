import { NextRequest, NextResponse } from 'next/server'
import { serverStorage } from '@/lib/serverStorage'

export async function POST(request: NextRequest) {
  try {
    const { currentRoomId } = await request.json()

    if (!currentRoomId) {
      return NextResponse.json(
        { error: 'ID da sala atual é obrigatório' },
        { status: 400 }
      )
    }

    // Ler todos os dados atuais
    const data = {
      rooms: serverStorage.getRooms(),
      participants: serverStorage.getParticipants(),
      photos: serverStorage.getPhotos(),
      scores: serverStorage.getScores(),
      aiResults: serverStorage.getAIResults()
    }

    // Filtrar apenas a sala atual e seus dados relacionados
    const currentRoom = data.rooms.find(room => room.id === currentRoomId)
    if (!currentRoom) {
      return NextResponse.json(
        { error: 'Sala atual não encontrada' },
        { status: 404 }
      )
    }

    // Manter apenas a sala atual
    const filteredRooms = [currentRoom]

    // Manter apenas participantes da sala atual
    const filteredParticipants = data.participants.filter(
      participant => participant.roomId === currentRoomId
    )

    // Manter apenas fotos dos participantes da sala atual
    const currentParticipantIds = filteredParticipants.map(p => p.id)
    const filteredPhotos = data.photos.filter(
      photo => currentParticipantIds.includes(photo.participantId)
    )

    // Manter apenas pontuações dos participantes da sala atual
    const filteredScores = data.scores.filter(
      score => currentParticipantIds.includes(score.participantId)
    )

    // Manter apenas resultados de IA da sala atual
    const filteredAiResults: Record<string, any> = {}
    if (data.aiResults[currentRoomId]) {
      filteredAiResults[currentRoomId] = data.aiResults[currentRoomId]
    }

    // Salvar dados filtrados
    const cleanedData = {
      rooms: filteredRooms,
      participants: filteredParticipants,
      photos: filteredPhotos,
      scores: filteredScores,
      aiResults: filteredAiResults
    }

    // Escrever dados limpos no arquivo
    const fs = require('fs')
    const path = require('path')
    const DATA_FILE = path.join(process.cwd(), 'data', 'capangai.json')
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(cleanedData, null, 2))

    // Retornar estatísticas da limpeza
    const removedRooms = data.rooms.length - filteredRooms.length
    const removedParticipants = data.participants.length - filteredParticipants.length
    const removedPhotos = data.photos.length - filteredPhotos.length
    const removedScores = data.scores.length - filteredScores.length

    return NextResponse.json({
      success: true,
      message: 'Limpeza concluída com sucesso',
      stats: {
        removedRooms,
        removedParticipants,
        removedPhotos,
        removedScores,
        keptRooms: filteredRooms.length,
        keptParticipants: filteredParticipants.length,
        keptPhotos: filteredPhotos.length,
        keptScores: filteredScores.length
      }
    })

  } catch (error) {
    console.error('Erro ao limpar salas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 