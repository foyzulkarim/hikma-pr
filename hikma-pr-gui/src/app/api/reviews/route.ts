import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // First, try a simple query to test basic connectivity
    const reviews = await prisma.review.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        fileAnalyses: true,
        chunkAnalyses: {
          include: {
            analysisPasses: true,
            pluginFindings: true
          }
        },
        pluginFindings: true
      }
    })
    
    // Add counts manually to avoid potential issues with _count
    const reviewsWithCounts = reviews.map(review => ({
      ...review,
      _count: {
        chunkAnalyses: review.chunkAnalyses?.length || 0,
        analysisPasses: review.analysisPasses?.length || 0,
        pluginFindings: review.pluginFindings?.length || 0
      }
    }))
    
    return NextResponse.json(reviewsWithCounts)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    )
  }
} 
