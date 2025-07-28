'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Users, Camera, Upload, CheckCircle, AlertCircle, Edit, Bot } from 'lucide-react'
import type { Room, Participant, Item, Photo, Score } from '@/types'
import { PhotoModal } from './PhotoModal'
import { DebugInfo } from './DebugInfo'
import { ParticipantsTable } from './ParticipantsTable'
import { PhotoUploadModal } from './PhotoUploadModal'
import { ModeratorSettings } from './ModeratorSettings'

interface RoomDashboardProps {
  roomId: string
}

export function RoomDashboard({ roomId }: RoomDashboardProps) {
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null)
  const [currentParticipantName, setCurrentParticipantName] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string
    type: 'INITIAL' | 'FINAL'
    participantName: string
  } | null>(null)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showScores, setShowScores] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [aiResults, setAiResults] = useState<{[participantId: string]: {
    autoScores: any[];
    cleanlinessScore: any;
    lastUpdated: Date;
  }}>({})
  const [isAnalyzingWithAI, setIsAnalyzingWithAI] = useState(false)
  const [isRevealingScores, setIsRevealingScores] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [debugEnabled, setDebugEnabled] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [updateInterval, setUpdateInterval] = useState(3)
  const [retryAttempts, setRetryAttempts] = useState<{[key: string]: number}>({})
  const [retryLogs, setRetryLogs] = useState<string[]>([])
  const [cheatName, setCheatName] = useState('') // Nome do participante que receberá cheat
  const router = useRouter()

  // Função para atualizar status da IA no servidor
  const updateAIStatus = async (analyzing: boolean) => {
    try {
      await fetch(`/api/rooms/${roomId}/ai-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiAnalyzing: analyzing })
      })
    } catch (error) {
      console.error('Erro ao atualizar status da IA:', error)
    }
  }

  // Função para buscar status da IA do servidor
  const fetchAIStatus = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/ai-status`)
      if (response.ok) {
        const data = await response.json()
        setIsAnalyzingWithAI(data.aiAnalyzing || false)
      }
    } catch (error) {
      // Silenciar erro para reduzir logs
    }
  }

  // Função para buscar status de revelação do servidor
  const fetchRevealStatus = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/reveal-scores`)
      if (response.ok) {
        const data = await response.json()
        setShowScores(data.scoresRevealed || false)
        
        // Se as pontuações foram reveladas, carregar os resultados da IA
        if (data.scoresRevealed && data.aiResults && Object.keys(data.aiResults).length > 0) {
          setAiResults(data.aiResults)
        }
      }
    } catch (error) {
      // Silenciar erro para reduzir logs
    }
  }

  const scrollToParticipant = (participantId: string) => {
    const element = document.getElementById(`participant-${participantId}`)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  useEffect(() => {
    // Identificar o usuário atual
    const participantId = localStorage.getItem(`capangai_participant_${roomId}`)
    const participantName = localStorage.getItem(`capangai_participant_name_${roomId}`)
    
    if (participantId && participantName) {
      setCurrentParticipantId(participantId)
      setCurrentParticipantName(participantName)
    } else {
      router.push(`/room/${roomId}/join`)
      return
    }
    
    fetchRoom()
    
    // Verificar status inicial da IA e revelação
    fetchAIStatus()
    fetchRevealStatus()
    
    // Configurar polling para atualização automática (configurável)
    const interval = setInterval(() => {
      if (!isUpdating) { // Só atualiza se não estiver já atualizando
        setIsUpdating(true)
        Promise.all([
          fetchRoom(),
          fetchAIStatus(),
          fetchRevealStatus()
        ]).finally(() => setIsUpdating(false))
      }
    }, updateInterval * 1000) // Atualiza conforme configuração
    
    return () => {
      clearInterval(interval)
    }
  }, [roomId, isUpdating, router, updateInterval])



  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Verificar se houve mudanças antes de atualizar (otimizado)
        const hasChanges = !room || 
          room.participants.length !== data.room.participants.length ||
          room.participants.some((p: Participant, index: number) => 
            p.id !== data.room.participants[index]?.id || 
            p.photos.length !== data.room.participants[index]?.photos.length
          )
        
        if (hasChanges) {
          // Verificar se há novos participantes
          if (room && data.room.participants.length > room.participants.length) {
            const newParticipants = data.room.participants.filter((p: any) => 
              !room.participants.some(existing => existing.id === p.id)
            )
            if (newParticipants.length > 0) {
              // Mostrar notificação
              if (typeof window !== 'undefined' && 'Notification' in window) {
                newParticipants.forEach((participant: any) => {
                  new Notification('Capangai Food Challenge', {
                    body: `${participant.name} entrou na competição!`,
                    icon: '/favicon.ico'
                  })
                })
              }
            }
          }
          
          setRoom(data.room)
          
          // Se há um participante selecionado, atualizar com os novos dados
          if (selectedParticipant) {
            const updatedSelectedParticipant = data.room.participants.find((p: any) => p.id === selectedParticipant.id)
            if (updatedSelectedParticipant) {
              setSelectedParticipant(updatedSelectedParticipant)
            }
          }
        }
      } else {
        setError('Sala não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar sala:', error)
      setError('Erro ao carregar sala')
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantClick = (participant: Participant) => {
    setSelectedParticipant(participant)
    setPhotoModalOpen(true)
  }

  const handlePhotoUpload = async (participantId: string, photoType: 'INITIAL' | 'FINAL', file: File) => {
    
    setUploadingPhoto(`${participantId}-${photoType}`)
    
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('type', photoType)

      const response = await fetch(`/api/rooms/${roomId}/participants/${participantId}/photos`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        await fetchRoom()
        
        // Atualizar o participante selecionado se necessário
        if (selectedParticipant && selectedParticipant.id === participantId) {
          const updatedParticipant = room?.participants.find(p => p.id === participantId)
          if (updatedParticipant) {
            setSelectedParticipant(updatedParticipant)
          }
        }
      } else {
        const data = await response.json()
        console.error('Erro na API:', data)
        alert(data.error || 'Erro ao enviar foto')
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error)
      alert('Erro ao enviar foto')
    } finally {
      setUploadingPhoto(null)
    }
  }

  const handleRemovePhoto = async (participantId: string, photoType: 'INITIAL' | 'FINAL') => {
    if (!confirm(`Tem certeza que deseja remover a foto ${photoType === 'INITIAL' ? 'inicial' : 'final'}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}/participants/${participantId}/photos`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: photoType })
      })

      if (response.ok) {
        await fetchRoom()
        // Atualizar o participante selecionado se necessário
        if (selectedParticipant && selectedParticipant.id === participantId) {
          const updatedParticipant = room?.participants.find(p => p.id === participantId)
          if (updatedParticipant) {
            setSelectedParticipant(updatedParticipant)
          }
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao remover foto')
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error)
      alert('Erro ao remover foto')
    }
  }

  const handleRefreshParticipant = async (participantId: string): Promise<Participant | null> => {
    try {
      // Recarregar dados da sala
      await fetchRoom()
      
      // Encontrar o participante atualizado
      const updatedParticipant = room?.participants.find(p => p.id === participantId)
      
      if (updatedParticipant) {
        setSelectedParticipant(updatedParticipant)
        return updatedParticipant
      }
      
      return null
    } catch (error) {
      console.error('Erro ao atualizar participante:', error)
      return null
    }
  }

  const getParticipantPhoto = (participant: Participant, type: 'INITIAL' | 'FINAL') => {
    const photo = participant.photos.find(photo => photo.type === type)
    return photo?.url || undefined // Retorna a URL da foto ou undefined
  }

  // Versão síncrona para exibição (usa dados simulados)
  const getParticipantScoresSync = (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLES' ? 1 : score.value === 'DUPLO' ? 2 : score.value === 'TRIPLO' ? 3 : 0
      return total + points
    }, 0)
    
    // TODO: Integrar com IA real para pontuações automáticas e limpeza
    const autoPoints = 0
    const cleanlinessPoints = 0 // Aguardando IA real
    
    const total = manualScores + autoPoints + cleanlinessPoints
    
    return total
  }

  const getParticipantScoresAsync = async (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLES' ? 1 : score.value === 'DUPLO' ? 2 : score.value === 'TRIPLO' ? 3 : 0
      return total + points
    }, 0)
    
    // TODO: Integrar com IA real para pontuações automáticas e limpeza
    const autoScores: any[] = [] // Não chamar IA durante polling
    const autoPoints = 0
    
    // TODO: Integrar com IA real para limpeza também
    const cleanlinessPoints = 0 // Aguardando IA real
    
    return {
      manualScores,
      autoScores,
      autoPoints,
      cleanlinessPoints,
      total: manualScores + autoPoints + cleanlinessPoints
    }
  }

  const getParticipantScores = (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLES' ? 1 : score.value === 'DUPLO' ? 2 : score.value === 'TRIPLO' ? 3 : 0
      return total + points
    }, 0)
    
    // Pontuações automáticas da IA (se disponíveis)
    const aiResult = aiResults[participant.id]
    const autoPoints = aiResult?.autoScores ? 
      aiResult.autoScores.reduce((total: number, item: any) => {
        const points = item.value === 'SIMPLES' ? 1 : item.value === 'DUPLO' ? 2 : item.value === 'TRIPLO' ? 3 : 0
        return total + points
      }, 0) : 0
    
    // Pontuação de limpeza da IA (se disponível) - CORRIGIDA: mais limpo = mais pontos
    const cleanlinessPoints = aiResult?.cleanlinessScore ? 
      (aiResult.cleanlinessScore.value === 'SIMPLES' ? 1 : 
       aiResult.cleanlinessScore.value === 'DUPLO' ? 2 : 
       aiResult.cleanlinessScore.value === 'TRIPLO' ? 3 : 0) : 0
    
    const total = manualScores + autoPoints + cleanlinessPoints
    
    return total
  }

  const getParticipantScoresReal = async (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLES' ? 1 : score.value === 'DUPLO' ? 2 : score.value === 'TRIPLO' ? 3 : 0
      return total + points
    }, 0)
    
    // Pontuações automáticas da foto inicial (chamada real da IA)
    const autoScores = await getAutoScoresFromInitialPhoto(participant)
    const autoPoints = autoScores.reduce((total: number, item: any) => {
      const points = item.value === 'SIMPLES' ? 1 : item.value === 'DUPLO' ? 2 : item.value === 'TRIPLO' ? 3 : 0
      return total + points
    }, 0)
    
    // Pontuação de limpeza da foto final (chamada real da IA)
    const cleanlinessScore = await getCleanlinessScoreFromFinalPhoto(participant)
    const cleanlinessPoints = cleanlinessScore ? 
      (cleanlinessScore.value === 'SIMPLES' ? 1 : 
       cleanlinessScore.value === 'DUPLO' ? 2 : 
       cleanlinessScore.value === 'TRIPLO' ? 3 : 0) : 0
    
    return {
      manualScores,
      autoScores,
      autoPoints,
      cleanlinessScore,
      cleanlinessPoints,
      total: manualScores + autoPoints + cleanlinessPoints
    }
  }

  const getAutoScoresFromInitialPhoto = async (participant: Participant) => {
    const initialPhoto = getParticipantPhoto(participant, 'INITIAL')
    if (!initialPhoto) return []

    console.log('🤖 CHAMANDO IA PARA ANALISAR FOTO:')
    console.log('Participante:', participant.name)
    console.log('URL da foto:', initialPhoto)

    // Sistema de retry - tentar até 3 vezes com delay
    const maxRetries = 3
    const delayMs = 2000 // 2 segundos (aumentado para dar mais tempo)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const logKey = `initial_${participant.id}`
      setRetryAttempts(prev => ({ ...prev, [logKey]: attempt }))
      setRetryLogs(prev => [...prev.slice(-9), `🔄 ${participant.name} - Foto inicial: Tentativa ${attempt}/${maxRetries}`])
      
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} para análise de foto inicial...`)
        
        const response = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: initialPhoto,
            photoType: 'INITIAL'
          })
        })

        if (!response.ok) {
          console.error(`❌ Erro na análise da foto (tentativa ${attempt}):`, response.statusText)
          if (attempt < maxRetries) {
            console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue
          }
          return []
        }

        const data = await response.json()
        
        if (!data.success || !data.items) {
          console.error(`❌ Resposta inválida da API (tentativa ${attempt}):`, data)
          if (attempt < maxRetries) {
            console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue
          }
          return []
        }

        console.log(`✅ RESULTADO DA ANÁLISE DA IA (tentativa ${attempt}):`)
        console.log('Itens detectados:', data.items)
        console.log('Resposta bruta:', data.rawResponse)

        // Converter os itens detectados para o formato esperado
        const result = data.items.map((item: any) => ({
          name: item.name,
          value: item.quantity
        }))
        
        console.log(`🎉 Análise de foto inicial bem-sucedida na tentativa ${attempt}:`, result.length, 'itens')
        setRetryLogs(prev => [...prev.slice(-9), `✅ ${participant.name} - Foto inicial: Sucesso na tentativa ${attempt}`])
        return result

      } catch (error) {
        console.error(`❌ Erro ao analisar foto com IA (tentativa ${attempt}):`, error)
        if (attempt < maxRetries) {
          console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }
        return [] // Retorna array vazio em caso de erro
      }
    }

    console.error(`💥 Todas as ${maxRetries} tentativas falharam para análise de foto inicial`)
    setRetryLogs(prev => [...prev.slice(-9), `💥 ${participant.name} - Foto inicial: Todas as ${maxRetries} tentativas falharam`])
    return []
  }

  const getCleanlinessScoreFromFinalPhoto = async (participant: Participant) => {
    const finalPhoto = getParticipantPhoto(participant, 'FINAL')
    if (!finalPhoto) return null

    console.log('🧹 CHAMANDO IA PARA ANALISAR LIMPEZA:')
    console.log('Participante:', participant.name)
    console.log('URL da foto:', finalPhoto)
    console.log('URL da foto (length):', finalPhoto?.length)
    setRetryLogs(prev => [...prev.slice(-9), `🔍 ${participant.name} - Foto final: URL length ${finalPhoto?.length || 0}`])

    // Sistema de retry - tentar até 3 vezes com delay
    const maxRetries = 3
    const delayMs = 2000 // 2 segundos (aumentado para dar mais tempo)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const logKey = `final_${participant.id}`
      setRetryAttempts(prev => ({ ...prev, [logKey]: attempt }))
      setRetryLogs(prev => [...prev.slice(-9), `🔄 ${participant.name} - Foto final: Tentativa ${attempt}/${maxRetries}`])
      
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} para análise de limpeza...`)
        
        const response = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: finalPhoto,
            photoType: 'FINAL'
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Erro na análise da limpeza (tentativa ${attempt}):`, response.statusText)
          console.error(`❌ Detalhes do erro:`, errorText)
          setRetryLogs(prev => [...prev.slice(-9), `❌ ${participant.name} - Foto final: HTTP ${response.status} - ${response.statusText}`])
          if (attempt < maxRetries) {
            console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue
          }
          return null
        }

        const data = await response.json()
        
        if (!data.success || !data.items) {
          console.error(`❌ Resposta inválida da API de limpeza (tentativa ${attempt}):`, data)
          setRetryLogs(prev => [...prev.slice(-9), `❌ ${participant.name} - Foto final: Resposta inválida - success: ${data.success}, items: ${data.items?.length || 0}`])
          if (attempt < maxRetries) {
            console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
            continue
          }
          return null
        }

        console.log(`✅ RESULTADO DA ANÁLISE DE LIMPEZA (tentativa ${attempt}):`)
        console.log('Itens detectados:', data.items)
        console.log('Resposta bruta:', data.rawResponse)

        // A IA deve retornar apenas um item de limpeza
        if (data.items.length > 0) {
          const cleanlinessItem: any = data.items[0]
          let result = {
            name: cleanlinessItem.name,
            value: cleanlinessItem.quantity
          }

          // Aplicar cheat se o nome do participante corresponder
          if (cheatName && participant.name.toLowerCase().includes(cheatName.toLowerCase())) {
            console.log(`🎯 CHEAT APLICADO para ${participant.name}!`)
            setRetryLogs(prev => [...prev.slice(-9), `🎯 ${participant.name} - CHEAT: Limpeza tripla aplicada!`])
            result = {
              name: 'Limpeza',
              value: 'TRIPLO'
            }
          }

          console.log(`🎉 Análise de limpeza bem-sucedida na tentativa ${attempt}:`, result)
          setRetryLogs(prev => [...prev.slice(-9), `✅ ${participant.name} - Foto final: Sucesso na tentativa ${attempt}`])
          return result
        }

        // Se chegou aqui, a API respondeu mas não retornou itens
        console.log(`⚠️ API respondeu mas não retornou itens de limpeza (tentativa ${attempt})`)
        setRetryLogs(prev => [...prev.slice(-9), `⚠️ ${participant.name} - Foto final: API OK mas sem itens (tentativa ${attempt})`])
        if (attempt < maxRetries) {
          console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }

        return null

      } catch (error) {
        console.error(`❌ Erro ao analisar limpeza com IA (tentativa ${attempt}):`, error)
        setRetryLogs(prev => [...prev.slice(-9), `❌ ${participant.name} - Foto final: Exception - ${error instanceof Error ? error.message : 'Unknown error'}`])
        if (attempt < maxRetries) {
          console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
          await new Promise(resolve => setTimeout(resolve, delayMs))
          continue
        }
        return null
      }
    }

    console.error(`💥 Todas as ${maxRetries} tentativas falharam para análise de limpeza`)
    setRetryLogs(prev => [...prev.slice(-9), `💥 ${participant.name} - Foto final: Todas as ${maxRetries} tentativas falharam`])
    return null
  }

  const getCleanlinessScore = (participant: Participant) => {
    const finalPhoto = getParticipantPhoto(participant, 'FINAL')
    if (!finalPhoto) return null

    // TODO: Integrar com IA real para limpeza
    return null // Por enquanto não retorna nada até a IA estar funcionando
  }

  const getItemGender = (itemName: string) => {
    // Itens femininos
    const feminineItems = ['carne', 'salada', 'batata', 'limpeza']
    // Itens masculinos
    const masculineItems = ['pão', 'bacon', 'ovo', 'queijo']
    
    const normalizedName = itemName.toLowerCase()
    
    if (feminineItems.includes(normalizedName)) return 'feminine'
    if (masculineItems.includes(normalizedName)) return 'masculine'
    
    // Padrão masculino para itens não listados
    return 'masculine'
  }

  const formatScoreValue = (value: string, itemName: string) => {
    if (value === 'SIMPLES') {
      return 'Simples (1pt)'
    } else if (value === 'DUPLO') {
      return 'Duplo (2pts)'
    } else {
      return 'Triplo (3pts)'
    }
  }

  // Verificar se o usuário atual é moderador
  const isCurrentUserModerator = () => {
    return currentParticipantName === room?.moderatorName
  }

  // Função para limpar todas as salas exceto a atual
  const handleCleanupRooms = async () => {
    if (!confirm('Tem certeza que deseja remover todas as salas exceto a atual? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsCleaningUp(true)
    try {
      const response = await fetch('/api/rooms/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRoomId: roomId })
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Limpeza concluída!\n\nRemovidos:\n- ${data.stats.removedRooms} salas\n- ${data.stats.removedParticipants} participantes\n- ${data.stats.removedPhotos} fotos\n- ${data.stats.removedScores} pontuações\n\nMantidos:\n- ${data.stats.keptRooms} sala atual\n- ${data.stats.keptParticipants} participantes\n- ${data.stats.keptPhotos} fotos\n- ${data.stats.keptScores} pontuações`)
      } else {
        const error = await response.json()
        alert(`Erro na limpeza: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao limpar salas:', error)
      alert('Erro ao limpar salas. Tente novamente.')
    } finally {
      setIsCleaningUp(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando competição...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-600">{error || 'Sala não encontrada'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overlay de Loading da IA */}
      {isAnalyzingWithAI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">🤖 Analisando com IA</h3>
            <p className="text-gray-600 mb-4">Processando todas as fotos dos participantes...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-pulse">📸</div>
              <div className="animate-pulse delay-100">🧹</div>
              <div className="animate-pulse delay-200">🎯</div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Loading da Revelação */}
      {isRevealingScores && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">🎉 Revelando Pontuações</h3>
            <p className="text-gray-600 mb-4">Sincronizando com todos os participantes...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-pulse">🏆</div>
              <div className="animate-pulse delay-100">📊</div>
              <div className="animate-pulse delay-200">🎯</div>
            </div>
          </div>
        </div>
      )}

      {/* Configurações do Moderador */}
      {isCurrentUserModerator() && (
        <ModeratorSettings
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(!settingsOpen)}
          debugEnabled={debugEnabled}
          onToggleDebug={setDebugEnabled}
          showButton={false}
          currentRoomId={roomId}
          onCleanupRooms={handleCleanupRooms}
          isCleaningUp={isCleaningUp}
          updateInterval={updateInterval}
          onUpdateIntervalChange={setUpdateInterval}
          cheatName={cheatName}
          onCheatNameChange={setCheatName}
        />
      )}

      {/* Mesa dos Participantes */}
        <ParticipantsTable
          participants={room.participants}
          roomName={room.name}
          inviteCode={room.inviteCode}
          moderatorName={room.moderatorName}
          currentParticipantId={currentParticipantId}
          currentParticipantName={currentParticipantName}
          onParticipantClick={handleParticipantClick}
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen(!settingsOpen)}
          debugEnabled={debugEnabled}
          onToggleDebug={setDebugEnabled}
          onRevealScores={async () => {
            console.log('🎉 REVELANDO PONTUAÇÕES!')
            console.log('🔍 Estado inicial aiResults:', aiResults)
            
            setIsRevealingScores(true)
            
            try {
              // Limpar logs de retry anteriores
              setRetryAttempts({})
              setRetryLogs([])
              
              // Ativar loading da IA no servidor
              await updateAIStatus(true)
              setIsAnalyzingWithAI(true)
              
              // Analisar todas as fotos de todos os participantes com IA (SEQUENCIAL)
              console.log('🤖 ANALISANDO TODAS AS FOTOS COM IA (SEQUENCIAL)...')
              
              // Criar um objeto temporário para coletar todos os resultados
              const tempAiResults: any = {}
              
              for (const participant of room.participants) {
                try {
                  console.log(`🔍 === ANALISANDO PARTICIPANTE: ${participant.name} ===`)
                  
                  // Verificar quais fotos o participante tem
                  const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
                  const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
                  
                  if (!hasInitialPhoto && !hasFinalPhoto) {
                    console.log(`⚠️ ${participant.name}: Sem fotos para analisar`)
                    continue
                  }
                  
                  // Verificar se as fotos são iguais (apenas para debug)
                  const initialPhoto = participant.photos.find(p => p.type === 'INITIAL')
                  const finalPhoto = participant.photos.find(p => p.type === 'FINAL')
                  
                  if (initialPhoto && finalPhoto && initialPhoto.url === finalPhoto.url) {
                    console.log(`ℹ️ ${participant.name}: Foto inicial e final são iguais (normal)`)
                  }
                  
                  // Analisar foto inicial se existir
                  let autoScores = []
                  if (hasInitialPhoto) {
                    console.log(`📸 Analisando foto inicial de ${participant.name}...`)
                    autoScores = await getAutoScoresFromInitialPhoto(participant)
                    console.log(`✅ Foto inicial de ${participant.name} analisada: ${autoScores.length} itens`)
                  }
                  
                  // Aguardar um pouco entre análises
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  
                  // Analisar foto final se existir
                  let cleanlinessScore = null
                  if (hasFinalPhoto) {
                    console.log(`🧹 Analisando foto final de ${participant.name}...`)
                    cleanlinessScore = await getCleanlinessScoreFromFinalPhoto(participant)
                    console.log(`✅ Foto final de ${participant.name} analisada: ${cleanlinessScore ? cleanlinessScore.value : 'N/A'}`)
                  }
                  
                  // Aguardar um pouco antes do próximo participante
                  await new Promise(resolve => setTimeout(resolve, 1000))
                  
                  // Salvar resultados no objeto temporário
                  tempAiResults[participant.id] = {
                    autoScores,
                    cleanlinessScore,
                    lastUpdated: new Date()
                  }
                  
                  console.log(`✅ ${participant.name}: ${autoScores.length} itens detectados, limpeza: ${cleanlinessScore ? cleanlinessScore.value : 'N/A'}`)
                  console.log(`🔍 === FIM DA ANÁLISE: ${participant.name} ===`)
                } catch (error) {
                  console.error(`❌ Erro ao analisar fotos de ${participant.name}:`, error)
                }
              }
              
              console.log('🎯 TODAS AS ANÁLISES CONCLUÍDAS!')
              console.log('📊 Resultados temporários coletados:', tempAiResults)
              
              // Atualizar o estado com todos os resultados
              const finalAiResults = { ...aiResults, ...tempAiResults }
              setAiResults(finalAiResults)
              
              console.log('📊 Estado final aiResults:', finalAiResults)
              
              // Atualizar status de revelação no servidor para sincronizar com todos
              await fetch(`/api/rooms/${roomId}/reveal-scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  revealed: true,
                  aiResults: finalAiResults
                })
              })
              
              // Atualizar estado local
              setShowScores(true)
              
              // Scroll automático para todos os participantes
              setTimeout(() => {
                const element = document.getElementById('participants-details')
                if (element) {
                  element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  })
                  console.log('✅ Scroll executado para todos')
                }
              }, 100)
            } finally {
              // Desativar loading da IA no servidor
              await updateAIStatus(false)
              setIsAnalyzingWithAI(false)
              setIsRevealingScores(false)
            }
          }}
          showScores={showScores}
          getParticipantScores={getParticipantScores}
        />

            {/* Seção de Debug - Apenas para moderador quando habilitado */}
            {debugEnabled && isCurrentUserModerator() && (
              <div className="fixed top-20 left-4 z-50 bg-red-100 border-2 border-red-500 p-4 rounded-lg max-w-md max-h-96 overflow-y-auto">
                <h3 className="font-bold text-red-800 mb-2">🐛 DEBUG INFO</h3>
                <div className="text-xs text-red-700 space-y-1">
                  <div>showScores: {showScores.toString()}</div>
                  <div>isAnalyzingWithAI: {isAnalyzingWithAI.toString()}</div>
                  <div>isRevealingScores: {isRevealingScores.toString()}</div>
                  <div>currentParticipantName: {currentParticipantName}</div>
                  <div>moderatorName: {room?.moderatorName}</div>
                  <div>isModerator: {isCurrentUserModerator().toString()}</div>
                  
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <div className="font-semibold">🔄 RETRY ATTEMPTS:</div>
                    {Object.entries(retryAttempts).map(([key, attempt]) => (
                      <div key={key} className="ml-2">
                        {key}: {attempt}/3
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <div className="font-semibold">📋 RETRY LOGS:</div>
                    {retryLogs.map((log, index) => (
                      <div key={index} className="ml-2 text-xs">
                        {log}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-red-300">
                    <div className="font-semibold">📊 AI RESULTS:</div>
                    <div className="text-xs break-all">
                      {JSON.stringify(aiResults, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

      {/* Participants Cards - Só mostra quando showScores for true */}
      {showScores && (
        <div className="card animate-in slide-in-from-bottom-4 duration-500 mt-8 pt-8" id="participants-details">
          <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Detalhes dos Participantes
          </h2>
          
          {room.participants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum participante ainda. Compartilhe o código de convite!
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {room.participants.map((participant) => {
              const participantScore = getParticipantScores(participant);
              const maxScore = Math.max(...room.participants.map(getParticipantScores));
              const isWinner = showScores && participantScore === maxScore;
              return (
                <div 
                  key={participant.id} 
                  id={`participant-${participant.id}`}
                  className={`border rounded-lg p-6 bg-white shadow-sm transition-all duration-300 ${
                    selectedParticipant?.id === participant.id 
                      ? 'ring-2 ring-orange-500 shadow-lg scale-105' 
                      : ''
                  } ${isWinner ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-105' : ''}`}
                >
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 flex items-center justify-center gap-2">
                      {participant.name}
                      {isWinner && (
                        <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                      )}
                    </h3>
                  </div>

                {/* Thumbnails das fotos */}
                <div className="flex gap-2 mb-3">
                  {getParticipantPhoto(participant, 'INITIAL') && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Foto Inicial:</p>
                      <img 
                        src={getParticipantPhoto(participant, 'INITIAL')} 
                        alt="Foto inicial" 
                        className="w-full h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                  {getParticipantPhoto(participant, 'FINAL') && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Foto Final:</p>
                      <img 
                        src={getParticipantPhoto(participant, 'FINAL')} 
                        alt="Foto final" 
                        className="w-full h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  Clique no avatar para gerenciar fotos
                </p>

                {/* Pontuação Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Pontuação Total:</span>
                    <span className="text-lg font-bold text-orange-600">
                      {getParticipantScores(participant)}pts
                    </span>
                  </div>
                </div>

                {/* Informações da IA */}
                <div className="border-t pt-3 mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    Análise da IA
                  </h4>
                  
                  {/* Foto Inicial - Itens detectados */}
                  {getParticipantPhoto(participant, 'INITIAL') && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">📸 Foto Inicial:</p>
                      {aiResults[participant.id]?.autoScores ? (
                        <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                          <div className="font-medium text-blue-700 mb-1">
                            Itens detectados ({aiResults[participant.id].autoScores.length}):
                          </div>
                          {aiResults[participant.id].autoScores.map((item: any, index: number) => {
                            const points = item.value === 'SIMPLES' ? 1 : item.value === 'DUPLO' ? 2 : item.value === 'TRIPLO' ? 3 : 0
                            return (
                              <div key={index} className="text-blue-600">
                                • {item.name} - {item.value} ({points}pt)
                              </div>
                            )
                          })}
                          <div className="text-blue-700 font-medium mt-1">
                            Total: {aiResults[participant.id].autoScores.reduce((sum: number, item: any) => 
                              sum + (item.value === 'SIMPLES' ? 1 : item.value === 'DUPLO' ? 2 : item.value === 'TRIPLO' ? 3 : 0), 0
                            )}pts
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          ⏳ Clique em "🤖 Testar IA" para analisar itens de comida
                        </div>
                      )}
                    </div>
                  )}

                  {/* Foto Final - Limpeza */}
                  {getParticipantPhoto(participant, 'FINAL') && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">🧹 Foto Final:</p>
                      {aiResults[participant.id]?.cleanlinessScore ? (
                        <div className={`text-xs p-2 rounded border-l-2 ${
                          aiResults[participant.id].cleanlinessScore.value === 'SUJO' 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-green-50 border-green-300'
                        }`}>
                          <div className={`font-medium mb-1 ${
                            aiResults[participant.id].cleanlinessScore.value === 'SUJO' 
                              ? 'text-red-700' 
                              : 'text-green-700'
                          }`}>
                            Análise de Limpeza:
                          </div>
                          <div className={`${
                            aiResults[participant.id].cleanlinessScore.value === 'SUJO' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            • {aiResults[participant.id].cleanlinessScore.name} - {aiResults[participant.id].cleanlinessScore.value}
                          </div>
                          <div className={`${
                            aiResults[participant.id].cleanlinessScore.value === 'SUJO' 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            • Pontos: {aiResults[participant.id].cleanlinessScore.value === 'SUJO' ? 0 : 
                                      aiResults[participant.id].cleanlinessScore.value === 'SIMPLES' ? 1 : 
                                      aiResults[participant.id].cleanlinessScore.value === 'DUPLO' ? 2 : 3}pt
                          </div>
                          <div className={`text-xs mt-1 ${
                            aiResults[participant.id].cleanlinessScore.value === 'SUJO' 
                              ? 'text-red-700' 
                              : 'text-green-700'
                          }`}>
                            {aiResults[participant.id].cleanlinessScore.value === 'SUJO' ? '❌ Prato sujo (muita comida)' :
                             aiResults[participant.id].cleanlinessScore.value === 'SIMPLES' ? '✅ Limpeza simples' :
                             aiResults[participant.id].cleanlinessScore.value === 'DUPLO' ? '✅ Limpeza dupla' :
                             '✅ Limpeza tripla'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          ⏳ Clique em "🧹 Testar Limpeza" para analisar limpeza
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensagem quando não há fotos */}
                  {!getParticipantPhoto(participant, 'INITIAL') && !getParticipantPhoto(participant, 'FINAL') && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      Faça upload de fotos para analisar com IA
                    </div>
                  )}

                  {/* Timestamp da última análise */}
                                  {aiResults[participant.id]?.lastUpdated && (
                  <div className="text-xs text-gray-400 mt-2">
                    Última análise: {new Date(aiResults[participant.id].lastUpdated).toLocaleTimeString()}
                  </div>
                )}
                </div>
              </div>
            )})}
          </div>
        )}
        </div>
      )}

      {/* Photo Modal */}
      <PhotoModal
        isOpen={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        photoUrl={selectedPhoto?.url || ''}
        photoType={selectedPhoto?.type || 'INITIAL'}
        participantName={selectedPhoto?.participantName || ''}
      />

      {/* Photo Upload Modal */}
      {selectedParticipant && (
        <PhotoUploadModal
          participant={selectedParticipant}
          currentParticipantId={currentParticipantId}
          isOpen={photoModalOpen}
          onClose={() => {
            setPhotoModalOpen(false)
            setSelectedParticipant(null)
          }}
          onPhotoUpload={handlePhotoUpload}
          onRemovePhoto={handleRemovePhoto}
          onRefreshParticipant={handleRefreshParticipant}
        />
      )}
    </div>
  )
} 