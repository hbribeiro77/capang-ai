import { ScoreTable } from '@/components/ScoreTable'

interface ScorePageProps {
  params: {
    id: string
    participantId: string
  }
}

export default function ScorePage({ params }: ScorePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <ScoreTable 
          roomId={params.id} 
          participantId={params.participantId} 
        />
      </div>
    </div>
  )
} 