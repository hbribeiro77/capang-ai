'use client'

import { Users, Trophy, Camera } from 'lucide-react'
import type { Participant } from '@/types'

interface ParticipantsTableProps {
  participants: Participant[]
  roomName: string
  inviteCode: string
  moderatorName?: string
  currentParticipantId?: string | null
  currentParticipantName?: string | null
  onParticipantClick?: (participant: Participant) => void
  onRevealScores?: () => void
  showScores?: boolean
  getParticipantScores?: (participant: Participant) => number
  settingsOpen?: boolean
  onToggleSettings?: () => void
  debugEnabled?: boolean
  onToggleDebug?: (enabled: boolean) => void
}

export function ParticipantsTable({ participants, roomName, inviteCode, moderatorName, currentParticipantId, currentParticipantName, onParticipantClick, onRevealScores, showScores = false, getParticipantScores, settingsOpen, onToggleSettings, debugEnabled, onToggleDebug }: ParticipantsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getParticipantStatus = (participant: Participant) => {
    const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
    const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
    const totalScores = participant.scores.length

    if (hasInitialPhoto && hasFinalPhoto) {
      return { status: 'complete', text: 'Completo', color: 'text-green-600', bgColor: 'bg-green-100' }
    } else if (hasInitialPhoto) {
      return { status: 'partial', text: 'Foto inicial', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'pending', text: 'Pendente', color: 'text-gray-500', bgColor: 'bg-gray-100' }
    }
  }

  const getTotalScore = (participant: Participant) => {
    // Pontuações manuais
    const manualScores = participant.scores.reduce((total, score) => {
      const points = score.value === 'SIMPLE' ? 1 : score.value === 'DUPLO' ? 2 : 3
      return total + points
    }, 0)
    
    // Pontuações automáticas da foto inicial (simulação baseada nos itens detectados)
    const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
    const autoScores = hasInitialPhoto ? 5 : 0 // Estimativa baseada nos itens típicos
    
    // Pontuação de limpeza da foto final
    const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
    const cleanlinessScore = hasFinalPhoto ? 1 : 0 // Pontuação de limpeza
    
    return manualScores + autoScores + cleanlinessScore
  }

  const isCurrentUserModerator = () => {
    return currentParticipantName === moderatorName
  }

  const canRevealScores = () => {
    if (participants.length === 0) {
      return false
    }
    
    return participants.every(participant => {
      const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
      const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
      return hasInitialPhoto && hasFinalPhoto
    })
  }

  const getWinner = () => {
    if (!showScores || participants.length === 0) return null
    
    const participantsWithScores = participants.map(p => ({
      ...p,
      totalScore: getParticipantScores ? getParticipantScores(p) : getTotalScore(p)
    }))
    
    const maxScore = Math.max(...participantsWithScores.map(p => p.totalScore))
    const winners = participantsWithScores.filter(p => p.totalScore === maxScore)
    
    return winners.length > 0 ? winners : null
  }

  return (
    <div className="mb-3 max-w-6xl mx-auto flex flex-col" style={{ minHeight: '80vh' }}>
      {/* Título principal da aplicação */}
      <h1 className="text-4xl font-bold text-orange-600 mb-4 mt-0">
        CAPANG-AI
      </h1>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Mesa de Combate
        <span className="text-sm text-gray-600 font-normal">
          - Código: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{inviteCode}</span>
        </span>
        {moderatorName && (
          <span className="text-sm text-gray-600 font-normal ml-2 flex items-center gap-2">
            • Moderador: <span className="font-semibold text-orange-600">{moderatorName}</span>
            {isCurrentUserModerator() && onToggleSettings && (
              <button
                onClick={() => {
                  console.log('🔧 Botão de configurações clicado!')
                  onToggleSettings()
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
                title="Configurações do Moderador"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </span>
        )}
      </h2>
      
      <div className={`relative w-full flex items-center justify-center px-4 ${showScores ? 'min-h-[600px]' : 'min-h-[500px]'}`} style={{ paddingTop: showScores ? '4rem' : '6rem', paddingBottom: showScores ? '4rem' : '2rem' }}>
        {/* Mesa - centralizada na tela */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-full mx-auto w-80 h-80 md:w-[420px] md:h-[420px] flex items-center justify-center shadow-lg border-4 border-amber-700 relative z-10">
          <div className="text-center text-white">
            {participants.length > 0 ? (
              <div className="space-y-2">
                <button
                  onClick={() => onRevealScores?.()}
                  disabled={!canRevealScores() || !isCurrentUserModerator()}
                  className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-200 relative z-20 ${
                    canRevealScores() && isCurrentUserModerator()
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  title={
                    !isCurrentUserModerator() 
                      ? 'Apenas o moderador pode revelar as pontuações'
                      : `Status: ${canRevealScores() ? 'Habilitado' : 'Desabilitado'} - Participantes: ${participants.length}`
                  }
                >
                  {showScores ? '🎉 Pontuações Reveladas!' : '🏆 Revelar Pontuações'}
                </button>
                
                {/* Mensagem para não-moderadores */}
                {!isCurrentUserModerator() && canRevealScores() && !showScores && (
                  <div className="text-xs text-white bg-black bg-opacity-30 px-3 py-1 rounded-full">
                    ⏳ Aguardando moderador revelar pontuações...
                  </div>
                )}
              </div>
            ) : (
              <Trophy className="w-12 h-12 mx-auto mb-2" />
            )}
            <h3 className="text-lg font-bold mt-2">{roomName}</h3>
          </div>
        </div>

        {/* Participantes ao redor da mesa */}
        {participants.length > 0 && (
          <div className="absolute inset-0">
            {participants.map((participant, index) => {
              const status = getParticipantStatus(participant)
              const totalScore = getParticipantScores ? getParticipantScores(participant) : getTotalScore(participant)
              const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
              const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
              
              // Calcular posição ao redor da mesa (ajustado para cada posição)
              const angle = (index * 360) / participants.length
              // Ajustar raio baseado na posição para evitar sobreposição com a mesa
              let radius = 200 // Base
              if (angle >= 135 && angle <= 225) {
                // Posições inferiores (onde estava o avatar 2) - mais longe
                radius = 240
              } else if (angle >= 315 || angle <= 45) {
                // Posições superiores (onde estava o avatar 1) - mais próximo
                radius = 180
              }
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius

              return (
                <div
                  key={participant.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    zIndex: 15
                  }}
                >
                  <div
                    className={`relative bg-white rounded-full p-3 shadow-lg border-2 transition-all duration-200 ${
                      currentParticipantId === participant.id 
                        ? 'hover:scale-110 cursor-pointer hover:shadow-xl' 
                        : 'cursor-default opacity-75'
                    } ${status.status === 'complete' ? 'border-green-500' : 
                        status.status === 'partial' ? 'border-yellow-500' : 'border-gray-300'}`}
                    onClick={() => {
                      if (currentParticipantId === participant.id) {
                        onParticipantClick?.(participant)
                      }
                    }}
                    onMouseEnter={(e) => {
                      // Mostrar preview das fotos ao passar o mouse (exceto no próprio avatar)
                      if (participant.photos.length > 0 && currentParticipantId !== participant.id) {
                        const tooltip = document.createElement('div')
                        tooltip.className = 'fixed z-50 bg-white rounded-lg shadow-xl border p-3 max-w-xs'
                        tooltip.style.left = `${e.clientX + 10}px`
                        tooltip.style.top = `${e.clientY - 10}px`
                        
                        const hasInitialPhoto = participant.photos.some(p => p.type === 'INITIAL')
                        const hasFinalPhoto = participant.photos.some(p => p.type === 'FINAL')
                        
                        tooltip.innerHTML = `
                          <div class="text-sm font-semibold text-gray-800 mb-2">${participant.name}</div>
                          <div class="space-y-2">
                            ${hasInitialPhoto ? `
                              <div class="text-xs text-gray-600">
                                <div class="font-medium">Foto Inicial:</div>
                                <img src="${participant.photos.find(p => p.type === 'INITIAL')?.url}" 
                                     alt="Foto inicial" 
                                     class="w-full h-20 object-cover rounded mt-1" />
                              </div>
                            ` : ''}
                            ${hasFinalPhoto ? `
                              <div class="text-xs text-gray-600">
                                <div class="font-medium">Foto Final:</div>
                                <img src="${participant.photos.find(p => p.type === 'FINAL')?.url}" 
                                     alt="Foto final" 
                                     class="w-full h-20 object-cover rounded mt-1" />
                              </div>
                            ` : ''}
                            ${!hasInitialPhoto && !hasFinalPhoto ? `
                              <div class="text-xs text-gray-500">Nenhuma foto enviada ainda</div>
                            ` : ''}
                          </div>
                        `
                        
                        tooltip.id = `photo-preview-${participant.id}`
                        document.body.appendChild(tooltip)
                      }
                    }}
                    onMouseLeave={() => {
                      // Remover tooltip ao sair do mouse
                      const tooltip = document.getElementById(`photo-preview-${participant.id}`)
                      if (tooltip) {
                        tooltip.remove()
                      }
                    }}
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-orange-400 to-red-500 ${
                      currentParticipantId === participant.id 
                        ? 'ring-4 ring-orange-300' 
                        : ''
                    }`}>
                      {getInitials(participant.name)}
                    </div>
                    
                    {/* Indicador "Você" */}
                    {/* Removido conforme solicitado */}
                    
                    {/* Nome */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <p className="text-xs font-bold text-gray-800 bg-white px-1 rounded flex items-center gap-1">
                        {participant.name}
                        {participant.name === moderatorName && (
                          <span className="text-orange-600" title="Moderador">👑</span>
                        )}
                      </p>
                    </div>

                    {/* Pontuação */}
                    {showScores && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {totalScore}
                      </div>
                    )}

                    {/* Troféu do vencedor */}
                    {showScores && getWinner()?.some(winner => winner.id === participant.id) && (
                      <div className="absolute -top-2 -left-2">
                        <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                      </div>
                    )}

                    {/* Status das fotos */}
                    <div className="absolute -bottom-2 -left-2 flex gap-1">
                      <div className={`w-3 h-3 rounded-full ${
                        hasInitialPhoto ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div className={`w-3 h-3 rounded-full ${
                        hasFinalPhoto ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    </div>

                    {/* Linha conectando à mesa */}
                    <div 
                      className="absolute w-px bg-gray-300"
                      style={{
                        height: '20px',
                        left: '50%',
                        top: '-20px',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Estado vazio */}
        {participants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Nenhum participante ainda</p>
              <p className="text-sm">Compartilhe o código de convite!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 