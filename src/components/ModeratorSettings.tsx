import { useState } from 'react'
import { Settings, X } from 'lucide-react'

interface ModeratorSettingsProps {
  isOpen: boolean
  onClose: () => void
  debugEnabled: boolean
  onToggleDebug: (enabled: boolean) => void
  showButton?: boolean
  currentRoomId?: string
  onCleanupRooms?: () => void
  isCleaningUp?: boolean
  updateInterval: number
  onUpdateIntervalChange: (interval: number) => void
  cheatName?: string
  onCheatNameChange?: (name: string) => void
}

export function ModeratorSettings({ 
  isOpen, 
  onClose, 
  debugEnabled, 
  onToggleDebug,
  showButton = true,
  currentRoomId,
  onCleanupRooms,
  isCleaningUp = false,
  updateInterval,
  onUpdateIntervalChange,
  cheatName = '',
  onCheatNameChange
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
            className={`bg-white h-full w-80 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header da gaveta */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
            <div className="p-4 space-y-4">
              {/* Seção de Debug */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🐛 Debug
                </h3>
                <div className="space-y-2">
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

              {/* Seção de Performance */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⚡ Performance
                </h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Tempo de Atualização</p>
                      <span className="text-xs text-gray-500">{updateInterval}s</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Intervalo entre atualizações automáticas da sala
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={updateInterval}
                        onChange={(e) => onUpdateIntervalChange(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => onUpdateIntervalChange(Math.max(1, updateInterval - 1))}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors"
                        >
                          -
                        </button>
                        <button
                          onClick={() => onUpdateIntervalChange(Math.min(30, updateInterval + 1))}
                          className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1s</span>
                      <span>30s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Limpeza de Salas */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🧹 Limpeza
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Limpar Salas Antigas</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Remove todas as salas exceto a atual para melhorar performance
                    </p>
                    <button
                      onClick={onCleanupRooms}
                      disabled={isCleaningUp}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isCleaningUp
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                      }`}
                    >
                      {isCleaningUp ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Limpando...
                        </span>
                      ) : (
                        '🗑️ Limpar Todas as Salas (Exceto Atual)'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Seção de Cheat */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  🎯 Cheat
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Limpeza Tripla</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Nome do participante que receberá limpeza tripla (3 pontos) automaticamente
                    </p>
                    <input
                      type="text"
                      placeholder="Digite o nome do participante..."
                      value={cheatName}
                      onChange={(e) => onCheatNameChange?.(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {cheatName && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ "{cheatName}" receberá limpeza tripla automaticamente
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divisor */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  ⚙️ Outras Configurações
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Mais opções em breve...
                </p>
              </div>

              {/* Informações do Moderador */}
              <div className="border-t border-gray-200 pt-4">
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