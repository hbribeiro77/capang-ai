export interface Room {
  id: string
  name: string
  moderatorName: string
  inviteCode: string
  isActive: boolean
  createdAt: Date
  aiAnalyzing: boolean
  aiAnalysisStartedAt?: Date
  scoresRevealed: boolean
  scoresRevealedAt?: Date
  aiResults?: string // JSON string com análises da IA
  participants: Participant[]
  items: Item[]
}

export interface Participant {
  id: string
  name: string
  roomId: string
  createdAt: Date
  photos: Photo[]
  scores: Score[]
}

export interface Item {
  id: string
  name: string
  roomId: string
  scores: Score[]
}

export interface Photo {
  id: string
  participantId: string
  url: string
  type: 'INITIAL' | 'FINAL'
  createdAt: Date
}

export interface Score {
  id: string
  participantId: string
  itemId: string
  value: 'SIMPLE' | 'DUPLO' | 'TRIPLO'
  createdAt: Date
  item?: Item
}



export type PhotoType = 'INITIAL' | 'FINAL'
export type ScoreValue = 'SIMPLE' | 'DUPLO' | 'TRIPLO' 