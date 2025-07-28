'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Users, Trophy, Camera } from 'lucide-react'

interface ParticipantRegistrationProps {
  roomId: string
}

export function ParticipantRegistration({ roomId }: ParticipantRegistrationProps) {
  const [participantName, setParticipantName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantName.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/rooms/${roomId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: participantName })
      })

      if (response.ok) {
        const { participantId } = await response.json()
        // Salvar o ID do participante no localStorage
        localStorage.setItem(`capangai_participant_${roomId}`, participantId)
        localStorage.setItem(`capangai_participant_name_${roomId}`, participantName)
        // Redirecionar para o dashboard da sala
        router.push(`/room/${roomId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao registrar participante')
      }
    } catch (error) {
      console.error('Erro ao registrar participante:', error)
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          🎯 Entrar na Competição
        </h1>
        <p className="text-gray-600">
          Registre seu nome para participar da competição!
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !participantName.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            {isLoading ? (
              'Registrando...'
            ) : (
              <>
                <User size={20} />
                Entrar na Competição
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Users size={16} />
              Como funciona?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Registre seu nome na competição</li>
              <li>• Tire fotos do lanche antes de comer</li>
              <li>• Tire fotos depois de terminar</li>
              <li>• Veja como você se sai no ranking!</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Camera size={16} />
              Próximos Passos
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Após o registro, você poderá enviar fotos</li>
              <li>• Tire fotos claras do seu lanche</li>
              <li>• A IA detectará automaticamente os componentes</li>
              <li>• Compare seu resultado com os amigos!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 