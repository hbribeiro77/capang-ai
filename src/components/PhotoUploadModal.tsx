'use client'

import { useState } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import type { Participant, Photo } from '@/types'

interface PhotoUploadModalProps {
  participant: Participant
  currentParticipantId?: string | null
  isOpen: boolean
  onClose: () => void
  onPhotoUpload: (participantId: string, photoType: 'INITIAL' | 'FINAL', file: File) => Promise<void>
  onRemovePhoto: (participantId: string, photoType: 'INITIAL' | 'FINAL') => Promise<void>
  onRefreshParticipant: (participantId: string) => Promise<Participant | null>
}

export function PhotoUploadModal({ 
  participant, 
  currentParticipantId,
  isOpen, 
  onClose, 
  onPhotoUpload, 
  onRemovePhoto,
  onRefreshParticipant
}: PhotoUploadModalProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  const getParticipantPhoto = (type: 'INITIAL' | 'FINAL') => {
    console.log('=== GET PARTICIPANT PHOTO ===')
    console.log('Tipo solicitado:', type)
    console.log('Participant atual:', participant.name)
    console.log('Fotos disponíveis:', participant.photos)
    
    const photo = participant.photos.find(p => p.type === type)
    console.log('Foto encontrada:', photo)
    console.log('=== FIM GET PARTICIPANT PHOTO ===')
    
    return photo
  }

  const handleFileUpload = async (photoType: 'INITIAL' | 'FINAL', file: File) => {
    console.log('=== UPLOAD INICIADO ===')
    console.log('Participant ID:', participant.id)
    console.log('Photo Type:', photoType)
    console.log('File:', file.name, file.size)
    
    setUploading(photoType)
    try {
      console.log('Chamando onPhotoUpload...')
      await onPhotoUpload(participant.id, photoType, file)
      console.log('onPhotoUpload concluído')
      
      // A atualização automática a cada 3 segundos vai atualizar os dados
      console.log('Upload concluído - dados serão atualizados automaticamente')
    } catch (error) {
      console.error('Erro ao enviar foto:', error)
    } finally {
      setUploading(null)
      console.log('=== UPLOAD FINALIZADO ===')
    }
  }

  const handleRemovePhoto = async (photoType: 'INITIAL' | 'FINAL') => {
    console.log('=== REMOÇÃO INICIADA ===')
    console.log('Photo Type:', photoType)
    
    setUploading(photoType)
    try {
      await onRemovePhoto(participant.id, photoType)
      console.log('Foto removida com sucesso')
      
      // A atualização automática a cada 3 segundos vai atualizar os dados
      console.log('Remoção concluída - dados serão atualizados automaticamente')
    } catch (error) {
      console.error('Erro ao remover foto:', error)
    } finally {
      setUploading(null)
      console.log('=== REMOÇÃO FINALIZADA ===')
    }
  }

  if (!isOpen) return null

  // Verificação de segurança - só permite acesso ao próprio avatar
  if (currentParticipantId && currentParticipantId !== participant.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você só pode enviar fotos para o seu próprio avatar.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotos de {participant.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Foto Inicial */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Foto Inicial do Lanche
          </h3>
          
          {getParticipantPhoto('INITIAL') ? (
            <div className="space-y-3">
              <img 
                src={getParticipantPhoto('INITIAL')?.url || ''} 
                alt="Foto inicial"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', e)
                  e.currentTarget.style.display = 'none'
                }}
              />
              <button
                onClick={() => handleRemovePhoto('INITIAL')}
                disabled={uploading === 'INITIAL'}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {uploading === 'INITIAL' ? (
                  'Removendo...'
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Remover Foto
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500 mb-3">Tire uma foto do seu lanche</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload('INITIAL', file)
                  }
                }}
                disabled={uploading === 'INITIAL'}
                className="hidden"
                id="initial-photo"
              />
              <label
                htmlFor="initial-photo"
                className={`inline-block px-4 py-2 rounded cursor-pointer transition-colors ${
                  uploading === 'INITIAL'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {uploading === 'INITIAL' ? 'Enviando...' : 'Selecionar Foto'}
              </label>
            </div>
          )}
        </div>

        {/* Foto Final */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Foto Final (Limpeza)
          </h3>
          
          {getParticipantPhoto('FINAL') ? (
            <div className="space-y-3">
              <img 
                src={getParticipantPhoto('FINAL')?.url || ''} 
                alt="Foto final"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', e)
                  e.currentTarget.style.display = 'none'
                }}
              />
              <button
                onClick={() => handleRemovePhoto('FINAL')}
                disabled={uploading === 'FINAL'}
                className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {uploading === 'FINAL' ? (
                  'Removendo...'
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Remover Foto
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500 mb-3">Tire uma foto após comer</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload('FINAL', file)
                  }
                }}
                disabled={uploading === 'FINAL'}
                className="hidden"
                id="final-photo"
              />
              <label
                htmlFor="final-photo"
                className={`inline-block px-4 py-2 rounded cursor-pointer transition-colors ${
                  uploading === 'FINAL'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {uploading === 'FINAL' ? 'Enviando...' : 'Selecionar Foto'}
              </label>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${
              getParticipantPhoto('INITIAL') ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={getParticipantPhoto('INITIAL') ? 'text-green-600' : 'text-gray-500'}>
              Foto Inicial
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${
              getParticipantPhoto('FINAL') ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={getParticipantPhoto('FINAL') ? 'text-green-600' : 'text-gray-500'}>
              Foto Final
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 