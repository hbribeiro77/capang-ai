import { Room, Participant, Photo, Score } from '@/types'

// Chaves para localStorage
const ROOMS_KEY = 'capangai_rooms'
const PARTICIPANTS_KEY = 'capangai_participants'
const PHOTOS_KEY = 'capangai_photos'
const SCORES_KEY = 'capangai_scores'
const AI_RESULTS_KEY = 'capangai_ai_results'

// Tipos para armazenamento local
interface LocalRoom {
  id: string
  name: string
  moderatorName: string
  inviteCode: string
  isActive: boolean
  createdAt: string
  aiAnalyzing: boolean
  aiAnalysisStartedAt?: string
  scoresRevealed: boolean
  scoresRevealedAt?: string
  aiResults?: string
}

interface LocalParticipant {
  id: string
  name: string
  roomId: string
  createdAt: string
}

interface LocalPhoto {
  id: string
  participantId: string
  type: 'INITIAL' | 'FINAL'
  url: string
  createdAt: string
}

interface LocalScore {
  id: string
  participantId: string
  itemId: string
  value: 'SIMPLE' | 'DUPLO' | 'TRIPLO'
  createdAt: string
}

// Funções de armazenamento
export const localStorage = {
  // Salas
  getRooms: (): LocalRoom[] => {
    if (typeof window === 'undefined') {
      console.log('🔍 localStorage executado no servidor, retornando array vazio')
      return []
    }
    const data = window.localStorage.getItem(ROOMS_KEY)
    console.log('🔍 localStorage executado no cliente, dados:', data ? 'encontrados' : 'não encontrados')
    return data ? JSON.parse(data) : []
  },

  saveRoom: (room: LocalRoom) => {
    if (typeof window === 'undefined') return
    const rooms = localStorage.getRooms()
    const existingIndex = rooms.findIndex(r => r.id === room.id)
    
    if (existingIndex >= 0) {
      rooms[existingIndex] = room
    } else {
      rooms.push(room)
    }
    
    window.localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
  },

  getRoom: (id: string): LocalRoom | null => {
    console.log('🔍 Buscando sala com ID:', id)
    const rooms = localStorage.getRooms()
    console.log('🔍 Salas encontradas:', rooms.length)
    const room = rooms.find(r => r.id === id) || null
    console.log('🔍 Sala encontrada:', room)
    return room
  },

  // Participantes
  getParticipants: (): LocalParticipant[] => {
    if (typeof window === 'undefined') return []
    const data = window.localStorage.getItem(PARTICIPANTS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveParticipant: (participant: LocalParticipant) => {
    if (typeof window === 'undefined') return
    const participants = localStorage.getParticipants()
    const existingIndex = participants.findIndex(p => p.id === participant.id)
    
    if (existingIndex >= 0) {
      participants[existingIndex] = participant
    } else {
      participants.push(participant)
    }
    
    window.localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants))
  },

  getParticipantsByRoom: (roomId: string): LocalParticipant[] => {
    const participants = localStorage.getParticipants()
    return participants.filter(p => p.roomId === roomId)
  },

  // Fotos
  getPhotos: (): LocalPhoto[] => {
    if (typeof window === 'undefined') return []
    const data = window.localStorage.getItem(PHOTOS_KEY)
    return data ? JSON.parse(data) : []
  },

  savePhoto: (photo: LocalPhoto) => {
    if (typeof window === 'undefined') return
    const photos = localStorage.getPhotos()
    const existingIndex = photos.findIndex(p => p.id === photo.id)
    
    if (existingIndex >= 0) {
      photos[existingIndex] = photo
    } else {
      photos.push(photo)
    }
    
    window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos))
  },

  getPhotosByParticipant: (participantId: string): LocalPhoto[] => {
    const photos = localStorage.getPhotos()
    return photos.filter(p => p.participantId === participantId)
  },

  deletePhoto: (photoId: string) => {
    if (typeof window === 'undefined') return
    const photos = localStorage.getPhotos()
    const filteredPhotos = photos.filter(p => p.id !== photoId)
    window.localStorage.setItem(PHOTOS_KEY, JSON.stringify(filteredPhotos))
  },

  // Pontuações
  getScores: (): LocalScore[] => {
    if (typeof window === 'undefined') return []
    const data = window.localStorage.getItem(SCORES_KEY)
    return data ? JSON.parse(data) : []
  },

  saveScore: (score: LocalScore) => {
    if (typeof window === 'undefined') return
    const scores = localStorage.getScores()
    const existingIndex = scores.findIndex(s => s.id === score.id)
    
    if (existingIndex >= 0) {
      scores[existingIndex] = score
    } else {
      scores.push(score)
    }
    
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
  },

  getScoresByParticipant: (participantId: string): LocalScore[] => {
    const scores = localStorage.getScores()
    return scores.filter(s => s.participantId === participantId)
  },

  // Resultados da IA
  getAIResults: (): Record<string, any> => {
    if (typeof window === 'undefined') return {}
    const data = window.localStorage.getItem(AI_RESULTS_KEY)
    return data ? JSON.parse(data) : {}
  },

  saveAIResults: (results: Record<string, any>) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(AI_RESULTS_KEY, JSON.stringify(results))
  },

  // Utilitários
  clearAll: () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(ROOMS_KEY)
    window.localStorage.removeItem(PARTICIPANTS_KEY)
    window.localStorage.removeItem(PHOTOS_KEY)
    window.localStorage.removeItem(SCORES_KEY)
    window.localStorage.removeItem(AI_RESULTS_KEY)
  }
}

// Funções de conversão
export const convertToRoom = (localRoom: LocalRoom, participants: Participant[], photos: Photo[], scores: Score[]): Room => {
  return {
    id: localRoom.id,
    name: localRoom.name,
    moderatorName: localRoom.moderatorName,
    inviteCode: localRoom.inviteCode,
    isActive: localRoom.isActive,
    createdAt: new Date(localRoom.createdAt),
    aiAnalyzing: localRoom.aiAnalyzing,
    aiAnalysisStartedAt: localRoom.aiAnalysisStartedAt ? new Date(localRoom.aiAnalysisStartedAt) : undefined,
    scoresRevealed: localRoom.scoresRevealed,
    scoresRevealedAt: localRoom.scoresRevealedAt ? new Date(localRoom.scoresRevealedAt) : undefined,
    aiResults: localRoom.aiResults,
    participants,
    items: [] // Não vamos usar items por enquanto
  }
}

export const convertToParticipant = (localParticipant: LocalParticipant, photos: Photo[], scores: Score[]): Participant => {
  return {
    id: localParticipant.id,
    name: localParticipant.name,
    roomId: localParticipant.roomId,
    createdAt: new Date(localParticipant.createdAt),
    photos,
    scores
  }
}

export const convertToPhoto = (localPhoto: LocalPhoto): Photo => {
  return {
    id: localPhoto.id,
    participantId: localPhoto.participantId,
    type: localPhoto.type,
    url: localPhoto.url,
    createdAt: new Date(localPhoto.createdAt)
  }
}

export const convertToScore = (localScore: LocalScore): Score => {
  return {
    id: localScore.id,
    participantId: localScore.participantId,
    itemId: localScore.itemId,
    value: localScore.value,
    createdAt: new Date(localScore.createdAt)
  }
} 