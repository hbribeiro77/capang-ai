import { RoomDashboard } from '@/components/RoomDashboard'

interface RoomPageProps {
  params: {
    id: string
  }
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <RoomDashboard roomId={params.id} />
      </div>
    </div>
  )
} 