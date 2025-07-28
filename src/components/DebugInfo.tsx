'use client'

import { useState } from 'react'

interface DebugInfoProps {
  participant: any
}

export function DebugInfo({ participant }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="text-xs text-gray-500 underline"
      >
        Debug Info
      </button>
    )
  }

  return (
    <div className="text-xs bg-gray-100 p-2 rounded mt-2">
      <button
        onClick={() => setIsVisible(false)}
        className="text-gray-500 underline mb-2 block"
      >
        Fechar Debug
      </button>
      <pre className="text-xs">
        {JSON.stringify({
          name: participant.name,
          photos: participant.photos,
          scores: participant.scores
        }, null, 2)}
      </pre>
    </div>
  )
} 