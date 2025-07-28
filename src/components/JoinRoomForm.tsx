'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ArrowRight } from 'lucide-react'

export function JoinRoomForm() {
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setIsLoading(true)
    try {
      // Primeiro, buscar o ID da sala pelo código de convite
      const response = await fetch(`/api/rooms/by-code/${inviteCode}`)
      if (response.ok) {
        const { roomId } = await response.json()
        // Redirecionar para a página de registro
        router.push(`/room/${roomId}/join`)
      } else {
        alert('Código de convite inválido!')
      }
    } catch (error) {
      console.error('Erro ao validar sala:', error)
      alert('Erro ao conectar com a sala')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código de Convite
        </label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="Digite o código (ex: ABC123)"
          className="input-field uppercase"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !inviteCode.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:bg-gray-300"
      >
        {isLoading ? (
          'Entrando...'
        ) : (
          <>
            <Users size={20} />
            Entrar na Competição
            <ArrowRight size={20} />
          </>
        )}
      </button>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">
          🎯 Pronto para competir?
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Digite o código que recebeu</li>
          <li>• Registre seu nome na competição</li>
          <li>• Tire fotos do seu lanche</li>
          <li>• Veja como você se sai!</li>
        </ul>
      </div>
    </form>
  )
} 