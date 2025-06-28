'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Review {
  id: string
  prUrl: string
  state: {
    pr_details?: {
      title: string
      body: string
    }
    progress?: {
      total_files: number
      completed_files: number
      total_chunks: number
      completed_chunks: number
      total_passes: number
      completed_passes: number
    }
    synthesis_data?: {
      decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT'
      overall_assessment: string
    }
    final_report?: string
  }
  error?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    chunkAnalyses: number
    analysisPasses: number
    pluginFindings: number
  }
  chunkAnalyses?: Array<{
    id: string
    filePath: string
    analysisPasses: Array<{
      passType: string
      riskLevel: string
    }>
  }>
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const extractPRInfo = (prUrl: string) => {
    const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        number: match[3]
      }
    }
    return null
  }

  const getDecisionBadge = (decision?: string) => {
    const baseClasses = "px-2 py-1 rounded text-sm font-medium"
    switch (decision) {
      case 'APPROVE':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'REQUEST_CHANGES':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'REJECT':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getHighestRiskLevel = (chunkAnalyses?: Review['chunkAnalyses']) => {
    if (!chunkAnalyses || chunkAnalyses.length === 0) return 'UNKNOWN'
    
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    let highestRisk = 'LOW'
    
    for (const chunk of chunkAnalyses) {
      for (const pass of chunk.analysisPasses) {
        const currentRiskIndex = riskLevels.indexOf(pass.riskLevel)
        const highestRiskIndex = riskLevels.indexOf(highestRisk)
        if (currentRiskIndex > highestRiskIndex) {
          highestRisk = pass.riskLevel
        }
      }
    }
    
    return highestRisk
  }

  const getRiskBadge = (riskLevel: string) => {
    const baseClasses = "px-2 py-1 rounded text-sm font-medium"
    switch (riskLevel) {
      case 'LOW':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'MEDIUM':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'HIGH':
        return `${baseClasses} bg-orange-100 text-orange-800`
      case 'CRITICAL':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getProgressPercentage = (progress?: Review['state']['progress']) => {
    if (!progress) return 0
    if (progress.total_passes === 0) return 0
    return Math.round((progress.completed_passes / progress.total_passes) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchReviews}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔬 Hikmapr Multi-Pass PR Reviews
          </h1>
          <p className="text-gray-600">
            Advanced AI-powered pull request analysis with 4-pass specialized review
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">
              Start your first multi-pass PR analysis with the CLI:
            </p>
            <code className="bg-gray-100 px-3 py-2 rounded text-sm">
              hikma review https://github.com/owner/repo/pull/123
            </code>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => {
              const prInfo = extractPRInfo(review.prUrl)
              const progress = getProgressPercentage(review.state.progress)
              const decision = review.state.synthesis_data?.decision
              const riskLevel = getHighestRiskLevel(review.chunkAnalyses)
              const isComplete = review.state.final_report ? true : false

              return (
                <Link key={review.id} href={`/review/${review.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer border border-gray-200 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.state.pr_details?.title || 'Untitled PR'}
                          </h3>
                          {isComplete && (
                            <span className={getDecisionBadge(decision)}>
                              {decision || 'PENDING'}
                            </span>
                          )}
                          <span className={getRiskBadge(riskLevel)}>
                            {riskLevel} Risk
                          </span>
                        </div>
                        
                        {prInfo && (
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{prInfo.owner}/{prInfo.repo}</span>
                            <span className="mx-2">•</span>
                            <span>PR #{prInfo.number}</span>
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📅 {formatDate(review.createdAt)}</span>
                          {review._count && (
                            <>
                              <span>🧩 {review._count.chunkAnalyses} chunks</span>
                              <span>🔬 {review._count.analysisPasses} passes</span>
                              {review._count.pluginFindings > 0 && (
                                <span>🔌 {review._count.pluginFindings} plugin findings</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.state.progress && (
                      <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 rounded p-3">
                        <div>
                          <div className="font-medium text-gray-700">Files</div>
                          <div className="text-gray-600">
                            {review.state.progress.completed_files}/{review.state.progress.total_files}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Chunks</div>
                          <div className="text-gray-600">
                            {review.state.progress.completed_chunks}/{review.state.progress.total_chunks}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Analysis Passes</div>
                          <div className="text-gray-600">
                            {review.state.progress.completed_passes}/{review.state.progress.total_passes}
                          </div>
                        </div>
                      </div>
                    )}

                    {review.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">❌ {review.error}</p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
