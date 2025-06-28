'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function ReviewDetail() {
  const params = useParams()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    if (params.id) {
      fetchReview(params.id)
    }
  }, [params.id])

  const fetchReview = async (id) => {
    try {
      const response = await fetch(`/api/reviews/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch review')
      }
      const data = await response.json()
      setReview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const extractPRInfo = (prUrl) => {
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

  const getDecisionBadge = (decision) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
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

  const getRiskBadge = (riskLevel) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
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

  const getSeverityBadge = (severity) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium"
    switch (severity) {
      case 'LOW':
        return `${baseClasses} bg-blue-100 text-blue-800`
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

  const getProgressPercentage = (progress) => {
    if (!progress) return 0
    if (progress.total_passes === 0) return 0
    return Math.round((progress.completed_passes / progress.total_passes) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
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
            <Link href="/" className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Review not found</h3>
            <Link href="/" className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const prInfo = extractPRInfo(review.prUrl)
  const progress = getProgressPercentage(review.state.progress)
  const decision = review.state.synthesis_data?.decision
  const isComplete = review.state.final_report ? true : false

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Reviews
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {review.state.pr_details?.title || 'Untitled PR'}
              </h1>
              {prInfo && (
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">{prInfo.owner}/{prInfo.repo}</span>
                  <span className="mx-2">•</span>
                  <span>PR #{prInfo.number}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(review.createdAt)}</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {isComplete && (
                <span className={getDecisionBadge(decision)}>
                  {decision || 'PENDING'}
                </span>
              )}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Progress</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
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
          </div>
        </div>

        {/* Progress Summary */}
        {review.state.progress && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Analysis Progress</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {review.state.progress.completed_files}/{review.state.progress.total_files}
                </div>
                <div className="text-sm text-gray-600">Files Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {review.state.progress.completed_chunks}/{review.state.progress.total_chunks}
                </div>
                <div className="text-sm text-gray-600">Code Chunks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {review.state.progress.completed_passes}/{review.state.progress.total_passes}
                </div>
                <div className="text-sm text-gray-600">Analysis Passes</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'analysis', 'findings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* PR Description */}
                {review.state.pr_details?.body && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">PR Description</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {review.state.pr_details.body}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Final Report */}
                {review.state.final_report && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Final Review Report</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {review.state.final_report}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Overall Assessment */}
                {review.state.synthesis_data?.overall_assessment && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
                    <div className="bg-gray-50 rounded p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {review.state.synthesis_data.overall_assessment}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Code Analysis by File</h3>
                {review.chunkAnalyses && review.chunkAnalyses.length > 0 ? (
                  <div className="space-y-4">
                    {review.chunkAnalyses.map((chunk) => (
                      <div key={chunk.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{chunk.filePath}</h4>
                          <div className="flex gap-2">
                            {chunk.analysisPasses.map((pass) => (
                              <span key={pass.id} className={getRiskBadge(pass.riskLevel)}>
                                {pass.passType}: {pass.riskLevel}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {chunk.analysisPasses.map((pass) => (
                          <div key={pass.id} className="mb-4 last:mb-0">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              {pass.passType} Analysis
                            </div>
                            {pass.analysis && (
                              <div className="bg-gray-50 rounded p-3 text-sm">
                                <pre className="whitespace-pre-wrap text-gray-700">
                                  {pass.analysis}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No code analysis available yet.</p>
                )}
              </div>
            )}

            {selectedTab === 'findings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Plugin Findings</h3>
                {review.pluginFindings && review.pluginFindings.length > 0 ? (
                  <div className="space-y-4">
                    {review.pluginFindings.map((finding) => (
                      <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{finding.title}</h4>
                            <p className="text-sm text-gray-600">
                              Plugin: {finding.pluginName} • File: {finding.filePath}
                              {finding.lineNumber && ` • Line: ${finding.lineNumber}`}
                            </p>
                          </div>
                          <span className={getSeverityBadge(finding.severity)}>
                            {finding.severity}
                          </span>
                        </div>
                        
                        {finding.description && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-700">{finding.description}</p>
                          </div>
                        )}
                        
                        {finding.suggestion && (
                          <div className="bg-blue-50 rounded p-3">
                            <div className="text-sm font-medium text-blue-800 mb-1">Suggestion:</div>
                            <p className="text-sm text-blue-700">{finding.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No plugin findings available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {review.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{review.error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
