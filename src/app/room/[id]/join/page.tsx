import { ParticipantRegistration } from '@/components/ParticipantRegistration'

interface JoinPageProps {
  params: {
    id: string
  }
}

export default function JoinPage({ params }: JoinPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <ParticipantRegistration roomId={params.id} />
      </div>
    </div>
  )
} 