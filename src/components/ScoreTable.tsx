'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, CheckCircle, AlertCircle, Save } from 'lucide-react'
import type { Item, Score } from '@/types'

interface ScoreTableProps {
  roomId: string
  participantId: string
}

interface ItemScore {
  itemId: string
  itemName: string
  value: 'SIMPLE' | 'DUPLO' | 'TRIPLO' | null
}

export function ScoreTable({ roomId, participantId }: ScoreTableProps) {
  const [items, setItems] = useState<Item[]>([])
  const [scores, setScores] = useState<ItemScore[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        const roomItems = data.room.items
        setItems(roomItems)
        
        // Inicializar scores
        const initialScores = roomItems.map((item: Item) => ({
          itemId: item.id,
          itemName: item.name,
          value: null as 'SIMPLE' | 'DUPLO' | 'TRIPLO' | null
        }))
        setScores(initialScores)
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error)
      setError('Erro ao carregar itens')
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (itemId: string, value: 'SIMPLE' | 'DUPLO' | 'TRIPLO') => {
    setScores(prev => prev.map(score => 
      score.itemId === itemId ? { ...score, value } : score
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const scoresToSave = scores.filter(score => score.value !== null)
    if (scoresToSave.length === 0) {
      setError('Selecione pelo menos um item')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/rooms/${roomId}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          scores: scoresToSave
        })
      })

      if (response.ok) {
        setSuccess('Pontuação salva com sucesso!')
        setTimeout(() => {
          router.push(`/room/${roomId}`)
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao salvar pontuação')
      }
    } catch (error) {
      console.error('Erro ao salvar pontuação:', error)
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando itens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">
          🏆 Pontuação
        </h1>
        <p className="text-gray-600">
          Marque os itens que você encontrou no seu lanche!
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {scores.map((score) => (
              <div key={score.itemId} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {score.itemName}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(score.itemId, 'SIMPLE')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      score.value === 'SIMPLE'
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    Simples (1pt)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange(score.itemId, 'DUPLO')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      score.value === 'DUPLO'
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-500'
                    }`}
                  >
                    Duplo (2pts)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange(score.itemId, 'TRIPLO')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      score.value === 'TRIPLO'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-500'
                    }`}
                  >
                    Triplo (3pts)
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              disabled={saving || scores.filter(s => s.value !== null).length === 0}
              className="btn-primary flex items-center gap-2 disabled:bg-gray-300"
            >
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Pontuação
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Como pontuar:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Simples:</strong> Item encontrado uma vez (1 ponto)</li>
            <li>• <strong>Duplo:</strong> Item encontrado duas vezes (2 pontos)</li>
            <li>• <strong>Triplo:</strong> Item encontrado três ou mais vezes (3 pontos)</li>
            <li>• <strong>Limpeza:</strong> Baseado no grau de limpeza do prato</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 