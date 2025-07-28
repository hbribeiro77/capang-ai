import { useState } from 'react'
import { Settings, X } from 'lucide-react'

interface ModeratorSettingsProps {
  isOpen: boolean
  onClose: () => void
  debugEnabled: boolean
  onToggleDebug: (enabled: boolean) => void
  showButton?: boolean
}

export function ModeratorSettings({ 
  isOpen, 
  onClose, 
  debugEnabled, 
  onToggleDebug,
  showButton = true
}: ModeratorSettingsProps) {
  return (
    <>
      {/* Botão da engrenagem - só renderiza se showButton for true */}
      {showButton && (
        <button
          onClick={() => onClose()}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
          title="Configurações do Moderador"
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* Overlay da gaveta */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[200] flex justify-end">
          <div 
            className={`bg-white h-full w-80 shadow-2xl transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header da gaveta */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Configurações
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da gaveta */}
            <div className="p-6 space-y-6">
              {/* Seção de Debug */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🐛 Debug
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Painel de Debug</p>
                      <p className="text-xs text-gray-500">Mostra informações técnicas na tela</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={debugEnabled}
                        onChange={(e) => onToggleDebug(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Divisor */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⚙️ Outras Configurações
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Mais opções em breve...
                </p>
              </div>

              {/* Informações do Moderador */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  👑 Moderador
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-3">
                  <p className="text-sm text-orange-800">
                    Você tem controle total sobre esta sala de competição.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 