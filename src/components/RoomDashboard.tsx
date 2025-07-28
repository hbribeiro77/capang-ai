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
  console.log('🔍 RoomDashboard renderizado com roomId:', roomId)
  
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
  const [debugEnabled, setDebugEnabled] = useState(true)
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
      console.error('Erro ao buscar status da IA:', error)
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
          console.log('📊 Carregando resultados da IA do servidor...')
          console.log('📊 Dados do servidor:', data.aiResults)
          setAiResults(data.aiResults)
        } else if (data.scoresRevealed && (!data.aiResults || Object.keys(data.aiResults).length === 0)) {
          console.log('⚠️ Pontuações reveladas mas sem resultados da IA no servidor')
          console.log('⚠️ Mantendo resultados locais:', aiResults)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar status de revelação:', error)
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
      console.log('Usuário identificado:', { id: participantId, name: participantName })
    } else {
      console.log('Usuário não identificado, redirecionando para registro...')
      router.push(`/room/${roomId}/join`)
      return
    }
    
    fetchRoom()
    
    // Verificar status inicial da IA e revelação
    fetchAIStatus()
    fetchRevealStatus()
    
    // Configurar polling para atualização automática
    const interval = setInterval(() => {
      if (!isUpdating) { // Só atualiza se não estiver já atualizando
        console.log('🔄 Atualização automática da sala...')
        setIsUpdating(true)
        Promise.all([
          fetchRoom(),
          fetchAIStatus(),
          fetchRevealStatus() // Adicionar verificação de revelação
        ]).finally(() => setIsUpdating(false))
      }
    }, 3000) // Atualiza a cada 3 segundos
    
    return () => {
      clearInterval(interval)
    }
  }, [roomId, isUpdating, router])



  const fetchRoom = async () => {
    try {
      console.log('=== FETCHING ROOM ===')
      console.log('RoomId:', roomId)
      
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Dados da sala carregados:', data.room)
        console.log('Participantes:', data.room.participants)
        
        // Log detalhado das fotos de cada participante
        data.room.participants.forEach((participant: any) => {
          console.log(`Participante ${participant.name}:`, {
            id: participant.id,
            photosCount: participant.photos.length,
            photos: participant.photos
          })
        })
        
        // Verificar se houve mudanças antes de atualizar
        const hasChanges = !room || 
          room.participants.length !== data.room.participants.length ||
          JSON.stringify(room.participants.map((p: Participant) => ({ id: p.id, photos: p.photos.length }))) !== 
          JSON.stringify(data.room.participants.map((p: any) => ({ id: p.id, photos: p.photos.length })))
        
        if (hasChanges) {
          console.log('Mudanças detectadas, atualizando estado da sala...')
          
          // Verificar se há novos participantes
          if (room && data.room.participants.length > room.participants.length) {
            const newParticipants = data.room.participants.filter((p: any) => 
              !room.participants.some(existing => existing.id === p.id)
            )
            if (newParticipants.length > 0) {
              console.log('Novos participantes detectados:', newParticipants.map((p: any) => p.name))
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
          console.log('Estado da sala atualizado')
          
          // Se há um participante selecionado, atualizar com os novos dados
          if (selectedParticipant) {
            console.log('Atualizando participante selecionado com novos dados...')
            const updatedSelectedParticipant = data.room.participants.find((p: any) => p.id === selectedParticipant.id)
            if (updatedSelectedParticipant) {
              console.log('Participante selecionado atualizado com novos dados:', updatedSelectedParticipant)
              setSelectedParticipant(updatedSelectedParticipant)
            }
          }
        } else {
          console.log('Nenhuma mudança detectada, mantendo estado atual')
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
    console.log('=== HANDLE PHOTO UPLOAD INICIADO ===')
    console.log('Participant ID:', participantId)
    console.log('Photo Type:', photoType)
    console.log('File:', file.name, file.size)
    
    setUploadingPhoto(`${participantId}-${photoType}`)
    
    try {
      const formData = new FormData()
      formData.append('photo', file)
      formData.append('type', photoType)

      console.log('Enviando requisição para API...')
      const response = await fetch(`/api/rooms/${roomId}/participants/${participantId}/photos`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Foto enviada com sucesso:', data)
        
        console.log('Recarregando dados da sala...')
        await fetchRoom()
        console.log('Dados da sala recarregados')
        
        // Atualizar o participante selecionado se necessário
        if (selectedParticipant && selectedParticipant.id === participantId) {
          console.log('Atualizando participante selecionado...')
          const updatedParticipant = room?.participants.find(p => p.id === participantId)
          console.log('Participante atualizado encontrado:', updatedParticipant)
          if (updatedParticipant) {
            setSelectedParticipant(updatedParticipant)
            console.log('Participante selecionado atualizado')
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
      console.log('=== HANDLE PHOTO UPLOAD FINALIZADO ===')
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
        console.log('Foto removida com sucesso')
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
    console.log('=== REFRESH PARTICIPANT ===')
    console.log('Participant ID:', participantId)
    
    try {
      // Recarregar dados da sala
      await fetchRoom()
      
      // Encontrar o participante atualizado
      const updatedParticipant = room?.participants.find(p => p.id === participantId)
      console.log('Participante atualizado encontrado:', updatedParticipant)
      
      if (updatedParticipant) {
        setSelectedParticipant(updatedParticipant)
        console.log('Participante selecionado atualizado')
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
    console.log(`Foto ${type} encontrada para ${participant.name}:`, photo)
    return photo?.url || undefined // Retorna a URL da foto ou undefined
  }

  // Versão síncrona para exibição (usa dados simulados)
  const getParticipantScoresSync = (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLE' ? 1 : score.value === 'DUPLO' ? 2 : 3
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
      const points = score.value === 'SIMPLE' ? 1 : score.value === 'DUPLO' ? 2 : 3
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
      const points = score.value === 'SIMPLE' ? 1 : score.value === 'DUPLO' ? 2 : 3
      return total + points
    }, 0)
    
    // Pontuações automáticas da IA (se disponíveis)
    const aiResult = aiResults[participant.id]
    const autoPoints = aiResult?.autoScores ? 
      aiResult.autoScores.reduce((total: number, item: any) => {
        const points = item.value === 'SIMPLE' ? 1 : item.value === 'DUPLO' ? 2 : 3
        return total + points
      }, 0) : 0
    
    // Pontuação de limpeza da IA (se disponível) - CORRIGIDA: mais limpo = mais pontos
    const cleanlinessPoints = aiResult?.cleanlinessScore ? 
      (aiResult.cleanlinessScore.value === 'SIMPLE' ? 1 : 
       aiResult.cleanlinessScore.value === 'DUPLO' ? 2 : 3) : 0
    
    const total = manualScores + autoPoints + cleanlinessPoints
    
    return total
  }

  const getParticipantScoresReal = async (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total: number, score: any) => {
      const points = score.value === 'SIMPLE' ? 1 : score.value === 'DUPLO' ? 2 : 3
      return total + points
    }, 0)
    
    // Pontuações automáticas da foto inicial (chamada real da IA)
    const autoScores = await getAutoScoresFromInitialPhoto(participant)
    const autoPoints = autoScores.reduce((total: number, item: any) => {
      const points = item.value === 'SIMPLE' ? 1 : item.value === 'DUPLO' ? 2 : 3
      return total + points
    }, 0)
    
    // Pontuação de limpeza da foto final (chamada real da IA)
    const cleanlinessScore = await getCleanlinessScoreFromFinalPhoto(participant)
    const cleanlinessPoints = cleanlinessScore ? 
      (cleanlinessScore.value === 'SIMPLE' ? 1 : cleanlinessScore.value === 'DUPLO' ? 2 : 3) : 0
    
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

    try {
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
        console.error('❌ Erro na análise da foto:', response.statusText)
        return []
      }

      const data = await response.json()
      
      if (!data.success || !data.items) {
        console.error('❌ Resposta inválida da API:', data)
        return []
      }

      console.log('✅ RESULTADO DA ANÁLISE DA IA:')
      console.log('Itens detectados:', data.items)
      console.log('Resposta bruta:', data.rawResponse)

      // Converter os itens detectados para o formato esperado
      return data.items.map((item: any) => ({
        name: item.name,
        value: item.quantity
      }))

    } catch (error) {
      console.error('❌ Erro ao analisar foto com IA:', error)
      return [] // Retorna array vazio em caso de erro
    }
  }

  const getCleanlinessScoreFromFinalPhoto = async (participant: Participant) => {
    const finalPhoto = getParticipantPhoto(participant, 'FINAL')
    if (!finalPhoto) return null

    console.log('🧹 CHAMANDO IA PARA ANALISAR LIMPEZA:')
    console.log('Participante:', participant.name)
    console.log('URL da foto:', finalPhoto)

    try {
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
        console.error('❌ Erro na análise da limpeza:', response.statusText)
        return null
      }

      const data = await response.json()
      
      if (!data.success || !data.items) {
        console.error('❌ Resposta inválida da API de limpeza:', data)
        return null
      }

      console.log('✅ RESULTADO DA ANÁLISE DE LIMPEZA:')
      console.log('Itens detectados:', data.items)
      console.log('Resposta bruta:', data.rawResponse)

      // A IA deve retornar apenas um item de limpeza
      if (data.items.length > 0) {
        const cleanlinessItem: any = data.items[0]
        return {
          name: cleanlinessItem.name,
          value: cleanlinessItem.quantity
        }
      }

      return null

    } catch (error) {
      console.error('❌ Erro ao analisar limpeza com IA:', error)
      return null
    }
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
    if (value === 'SIMPLE') {
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
              // Ativar loading da IA no servidor
              await updateAIStatus(true)
              setIsAnalyzingWithAI(true)
              
              // Analisar todas as fotos de todos os participantes com IA
              console.log('🤖 ANALISANDO TODAS AS FOTOS COM IA...')
              
              // Criar um objeto temporário para coletar todos os resultados
              const tempAiResults: any = {}
              
              for (const participant of room.participants) {
                try {
                  // Analisar foto inicial se existir
                  if (participant.photos.some(p => p.type === 'INITIAL')) {
                    console.log(`📸 Analisando foto inicial de ${participant.name}...`)
                    const autoScores = await getAutoScoresFromInitialPhoto(participant)
                    
                    // Analisar foto final se existir
                    let cleanlinessScore = null
                    if (participant.photos.some(p => p.type === 'FINAL')) {
                      console.log(`🧹 Analisando foto final de ${participant.name}...`)
                      cleanlinessScore = await getCleanlinessScoreFromFinalPhoto(participant)
                    }
                    
                    // Salvar resultados no objeto temporário
                    tempAiResults[participant.id] = {
                      autoScores,
                      cleanlinessScore,
                      lastUpdated: new Date()
                    }
                    
                    console.log(`✅ ${participant.name}: ${autoScores.length} itens detectados, limpeza: ${cleanlinessScore ? cleanlinessScore.value : 'N/A'}`)
                  } else {
                    console.log(`⚠️ ${participant.name}: Sem foto inicial para analisar`)
                  }
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
              <div className="fixed top-20 left-4 z-50 bg-red-100 border-2 border-red-500 p-4 rounded-lg max-w-md">
                <h3 className="font-bold text-red-800 mb-2">🐛 DEBUG INFO</h3>
                <div className="text-xs text-red-700 space-y-1">
                  <div>showScores: {showScores.toString()}</div>
                  <div>aiResults: {JSON.stringify(aiResults)}</div>
                  <div>isAnalyzingWithAI: {isAnalyzingWithAI.toString()}</div>
                  <div>isRevealingScores: {isRevealingScores.toString()}</div>
                  <div>currentParticipantName: {currentParticipantName}</div>
                  <div>moderatorName: {room?.moderatorName}</div>
                  <div>isModerator: {isCurrentUserModerator().toString()}</div>
                </div>
              </div>
            )}

      {/* Participants Cards - Só mostra quando showScores for true */}
      {showScores && (
        <div className="card animate-in slide-in-from-bottom-4 duration-500" id="participants-details">
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
                            const points = item.value === 'SIMPLE' ? 1 : item.value === 'DUPLO' ? 2 : 3
                            return (
                              <div key={index} className="text-blue-600">
                                • {item.name} - {item.value} ({points}pt)
                              </div>
                            )
                          })}
                          <div className="text-blue-700 font-medium mt-1">
                            Total: {aiResults[participant.id].autoScores.reduce((sum: number, item: any) => 
                              sum + (item.value === 'SIMPLE' ? 1 : item.value === 'DUPLO' ? 2 : 3), 0
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
                        <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-300">
                          <div className="font-medium text-green-700 mb-1">
                            Análise de Limpeza:
                          </div>
                          <div className="text-green-600">
                            • {aiResults[participant.id].cleanlinessScore.name} - {aiResults[participant.id].cleanlinessScore.value}
                          </div>
                          <div className="text-green-600">
                            • Pontos: {aiResults[participant.id].cleanlinessScore.value === 'SIMPLE' ? 1 : 
                                      aiResults[participant.id].cleanlinessScore.value === 'DUPLO' ? 2 : 3}pt
                          </div>
                          <div className="text-green-700 text-xs mt-1">
                            {aiResults[participant.id].cleanlinessScore.value === 'SIMPLE' ? '✅ Limpo' :
                             aiResults[participant.id].cleanlinessScore.value === 'DUPLO' ? '✅ Bem limpo' :
                             '✅ Muito limpo'}
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