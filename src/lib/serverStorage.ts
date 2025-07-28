import fs from 'fs'
import path from 'path'

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

// Caminho para o arquivo de dados
const DATA_FILE = path.join(process.cwd(), 'data', 'capangai.json')

// Garantir que o diretório existe
const ensureDataDir = () => {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Ler dados do arquivo
const readData = () => {
  ensureDataDir()
  if (!fs.existsSync(DATA_FILE)) {
    return {
      rooms: [],
      participants: [],
      photos: [],
      scores: [],
      aiResults: {}
    }
  }
  
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erro ao ler dados:', error)
    return {
      rooms: [],
      participants: [],
      photos: [],
      scores: [],
      aiResults: {}
    }
  }
}

// Escrever dados no arquivo
const writeData = (data: any) => {
  ensureDataDir()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao escrever dados:', error)
  }
}

// Funções de armazenamento para o servidor
export const serverStorage = {
  // Salas
  getRooms: (): LocalRoom[] => {
    console.log('🔍 ServerStorage: getRooms chamado')
    const data = readData()
    console.log('🔍 ServerStorage: dados lidos:', data)
    const rooms = data.rooms || []
    console.log('🔍 ServerStorage: salas encontradas:', rooms.length)
    return rooms
  },

  saveRoom: (room: LocalRoom) => {
    const data = readData()
    const existingIndex = data.rooms.findIndex((r: LocalRoom) => r.id === room.id)
    
    if (existingIndex >= 0) {
      data.rooms[existingIndex] = room
    } else {
      data.rooms.push(room)
    }
    
    writeData(data)
  },

  getRoom: (id: string): LocalRoom | null => {
    console.log('🔍 ServerStorage: Buscando sala com ID:', id)
    const rooms = serverStorage.getRooms()
    console.log('🔍 ServerStorage: Salas encontradas:', rooms.length)
    const room = rooms.find((r: LocalRoom) => r.id === id) || null
    console.log('🔍 ServerStorage: Sala encontrada:', room)
    return room
  },

  // Participantes
  getParticipants: (): LocalParticipant[] => {
    const data = readData()
    return data.participants || []
  },

  saveParticipant: (participant: LocalParticipant) => {
    const data = readData()
    const existingIndex = data.participants.findIndex((p: LocalParticipant) => p.id === participant.id)
    
    if (existingIndex >= 0) {
      data.participants[existingIndex] = participant
    } else {
      data.participants.push(participant)
    }
    
    writeData(data)
  },

  getParticipantsByRoom: (roomId: string): LocalParticipant[] => {
    const participants = serverStorage.getParticipants()
    return participants.filter((p: LocalParticipant) => p.roomId === roomId)
  },

  // Fotos
  getPhotos: (): LocalPhoto[] => {
    const data = readData()
    return data.photos || []
  },

  savePhoto: (photo: LocalPhoto) => {
    const data = readData()
    const existingIndex = data.photos.findIndex((p: LocalPhoto) => p.id === photo.id)
    
    if (existingIndex >= 0) {
      data.photos[existingIndex] = photo
    } else {
      data.photos.push(photo)
    }
    
    writeData(data)
  },

  getPhotosByParticipant: (participantId: string): LocalPhoto[] => {
    const photos = serverStorage.getPhotos()
    return photos.filter((p: LocalPhoto) => p.participantId === participantId)
  },

  deletePhoto: (photoId: string) => {
    const data = readData()
    data.photos = data.photos.filter((p: LocalPhoto) => p.id !== photoId)
    writeData(data)
  },

  // Pontuações
  getScores: (): LocalScore[] => {
    const data = readData()
    return data.scores || []
  },

  saveScore: (score: LocalScore) => {
    const data = readData()
    const existingIndex = data.scores.findIndex((s: LocalScore) => s.id === score.id)
    
    if (existingIndex >= 0) {
      data.scores[existingIndex] = score
    } else {
      data.scores.push(score)
    }
    
    writeData(data)
  },

  getScoresByParticipant: (participantId: string): LocalScore[] => {
    const scores = serverStorage.getScores()
    return scores.filter((s: LocalScore) => s.participantId === participantId)
  },

  // Resultados da IA
  getAIResults: (): Record<string, any> => {
    const data = readData()
    return data.aiResults || {}
  },

  saveAIResults: (results: Record<string, any>) => {
    const data = readData()
    data.aiResults = results
    writeData(data)
  },

  // Utilitários
  clearAll: () => {
    writeData({
      rooms: [],
      participants: [],
      photos: [],
      scores: [],
      aiResults: {}
    })
  }
} 