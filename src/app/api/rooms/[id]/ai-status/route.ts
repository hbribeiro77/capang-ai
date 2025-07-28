import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      select: { 
        id: true,
        aiAnalyzing: true,
        aiAnalysisStartedAt: true
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Sala não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ 
      aiAnalyzing: room.aiAnalyzing || false,
      aiAnalysisStartedAt: room.aiAnalysisStartedAt
    })
  } catch (error) {
    console.error('Erro ao buscar status da IA:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { aiAnalyzing } = await request.json()

    const room = await prisma.room.update({
      where: { id: params.id },
      data: { 
        aiAnalyzing,
        aiAnalysisStartedAt: aiAnalyzing ? new Date() : null
      },
      select: { 
        id: true,
        aiAnalyzing: true,
        aiAnalysisStartedAt: true
      }
    })

    return NextResponse.json({ 
      aiAnalyzing: room.aiAnalyzing,
      aiAnalysisStartedAt: room.aiAnalysisStartedAt
    })
  } catch (error) {
    console.error('Erro ao atualizar status da IA:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 