import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  const { id } = await params
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: id
      },
      include: {
        fileAnalyses: true,
        chunkAnalyses: {
          include: {
            analysisPasses: {
              orderBy: {
                passType: 'asc'
              }
            },
            pluginFindings: {
              orderBy: {
                severity: 'desc'
              }
            }
          },
          orderBy: {
            filePath: 'asc'
          }
        },
        pluginFindings: {
          orderBy: {
            severity: 'desc'
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}
