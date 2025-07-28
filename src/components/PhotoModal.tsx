'use client'

import { X } from 'lucide-react'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  photoType: 'INITIAL' | 'FINAL'
  participantName: string
}

export function PhotoModal({ isOpen, onClose, photoUrl, photoType, participantName }: PhotoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {photoType === 'INITIAL' ? 'Foto Inicial' : 'Foto Final'} - {participantName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <img 
            src={photoUrl} 
            alt={`${photoType === 'INITIAL' ? 'Foto inicial' : 'Foto final'} de ${participantName}`}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  )
} 