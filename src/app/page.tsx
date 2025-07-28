import { CreateRoomForm } from '@/components/CreateRoomForm'
import { JoinRoomForm } from '@/components/JoinRoomForm'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">
            🍔 Capang-AI Food Challenge
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🏆 Criar Nova Competição
            </h2>
            <CreateRoomForm />
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🎯 Entrar na Competição
            </h2>
            <JoinRoomForm />
          </div>
        </div>
        

      </div>
    </div>
  )
} 