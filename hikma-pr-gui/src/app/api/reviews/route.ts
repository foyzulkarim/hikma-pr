import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        fileAnalyses: true,
        chunkAnalyses: {
          include: {
            analysisPasses: true
          }
        },
        _count: {
          select: {
            chunkAnalyses: true,
            analysisPasses: true
          }
        }
      }
    })
    
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
} 
