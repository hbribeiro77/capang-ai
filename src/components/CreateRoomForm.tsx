'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Users, Trophy } from 'lucide-react'

export function CreateRoomForm() {
  const [roomName, setRoomName] = useState('')
  const [moderatorName, setModeratorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !moderatorName.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: roomName,
          moderatorName: moderatorName 
        })
      })

      if (response.ok) {
        const { roomId, participantId } = await response.json()
        // Salvar o ID do participante moderador no localStorage
        localStorage.setItem(`capangai_participant_${roomId}`, participantId)
        localStorage.setItem(`capangai_participant_name_${roomId}`, moderatorName)
        router.push(`/room/${roomId}`)
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Competição
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Ex: Desafio do Hambúrguer Gigante"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seu Nome (Moderador)
        </label>
        <input
          type="text"
          value={moderatorName}
          onChange={(e) => setModeratorName(e.target.value)}
          placeholder="Ex: João Silva"
          className="input-field"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !roomName.trim() || !moderatorName.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-300"
      >
        {isLoading ? (
          'Criando...'
        ) : (
          <>
            <ChefHat size={20} />
            Criar Competição
          </>
        )}
      </button>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
          <Trophy size={16} />
          Como funciona?
        </h3>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Crie uma sala e compartilhe o link</li>
          <li>• Seus colegas entram e registram os nomes</li>
          <li>• Tire fotos antes e depois de comer</li>
          <li>• IA detecta automaticamente os componentes</li>
          <li>• Veja quem comeu mais no ranking!</li>
        </ul>
      </div>
    </form>
  )
} 