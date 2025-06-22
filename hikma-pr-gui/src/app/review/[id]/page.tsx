'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface AnalysisPass {
  id: string
  passType: string
  analysisResult: string
  riskLevel: string
  issuesFound: string[]
  recommendations: string[]
  tokensUsed: number
  durationMs: number
  createdAt: string
}

interface ChunkAnalysis {
  id: string
  chunkId: string
  filePath: string
  startLine?: number
  endLine?: number
  sizeTokens: number
  diffContent: string
  isCompleteFile: boolean
  contextBefore?: string
  contextAfter?: string
  analysisPasses: AnalysisPass[]
}

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
      critical_issues: string[]
      important_recommendations: string[]
      minor_suggestions: string[]
      reasoning: string
    }
    final_report?: string
  }
  error?: string | null
  createdAt: string
  updatedAt: string
  
  // Analysis metadata
  modelProvider?: string
  modelName?: string
  startedAt?: string
  completedAt?: string
  
  chunkAnalyses: ChunkAnalysis[]
  fileAnalyses?: Array<{
    fileName: string
    analysis: string
  }>
}

export default function ReviewDetail() {
  const params = useParams()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set())
  const [selectedPassType, setSelectedPassType] = useState<string>('all')

  useEffect(() => {
    if (params.id) {
      fetchReview(params.id as string)
    }
  }, [params.id])

  const fetchReview = async (id: string) => {
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

  const toggleChunkExpansion = (chunkId: string) => {
    const newExpanded = new Set(expandedChunks)
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId)
    } else {
      newExpanded.add(chunkId)
    }
    setExpandedChunks(newExpanded)
  }

  const getRiskBadge = (riskLevel: string) => {
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

  const getDecisionBadge = (decision: string) => {
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

  const getPassTypeIcon = (passType: string) => {
    switch (passType) {
      case 'syntax_logic': return '🔍'
      case 'security_performance': return '🔒'
      case 'architecture_design': return '🏗️'
      case 'testing_docs': return '📋'
      default: return '📝'
    }
  }

  const getPassTypeName = (passType: string) => {
    switch (passType) {
      case 'syntax_logic': return 'Syntax & Logic'
      case 'security_performance': return 'Security & Performance'
      case 'architecture_design': return 'Architecture & Design'
      case 'testing_docs': return 'Testing & Documentation'
      default: return passType
    }
  }

  const groupChunksByFile = (chunks: ChunkAnalysis[]) => {
    const grouped: { [filePath: string]: ChunkAnalysis[] } = {}
    chunks.forEach(chunk => {
      if (!grouped[chunk.filePath]) {
        grouped[chunk.filePath] = []
      }
      grouped[chunk.filePath].push(chunk)
    })
    return grouped
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts': case 'tsx': return '🔷'
      case 'js': case 'jsx': return '🟨'
      case 'py': return '🐍'
      case 'java': return '☕'
      case 'go': return '🐹'
      case 'rs': return '🦀'
      case 'md': return '📝'
      case 'json': return '📋'
      case 'yaml': case 'yml': return '⚙️'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
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
            <Link href="/" className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
  const fileGroups = groupChunksByFile(review.chunkAnalyses)
  const passTypes = ['all', 'syntax_logic', 'security_performance', 'architecture_design', 'testing_docs']

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Reviews
          </Link>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {review.state.pr_details?.title || 'Untitled PR'}
                </h1>
                {prInfo && (
                  <p className="text-gray-600">
                    <span className="font-medium">{prInfo.owner}/{prInfo.repo}</span> • PR #{prInfo.number}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Created: {formatDate(review.createdAt)}
                </p>
              </div>
              
              {review.state.synthesis_data?.decision && (
                <span className={getDecisionBadge(review.state.synthesis_data.decision)}>
                  {review.state.synthesis_data.decision}
                </span>
              )}
            </div>

            {/* Progress */}
            {review.state.progress && (
              <div className="grid grid-cols-4 gap-4 bg-gray-50 rounded p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {review.state.progress.completed_files}/{review.state.progress.total_files}
                  </div>
                  <div className="text-sm text-gray-600">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {review.state.progress.completed_chunks}/{review.state.progress.total_chunks}
                  </div>
                  <div className="text-sm text-gray-600">Chunks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {review.state.progress.completed_passes}/{review.state.progress.total_passes}
                  </div>
                  <div className="text-sm text-gray-600">Analysis Passes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {Math.round((review.state.progress.completed_passes / review.state.progress.total_passes) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
            )}
            
            {/* Analysis Performance */}
            {(review.modelProvider || review.startedAt || review.completedAt) && (
              <div className="mt-4 bg-blue-50 rounded p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3">⏱️ Analysis Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {review.modelProvider && (
                    <div>
                      <div className="font-medium text-blue-700">Provider</div>
                      <div className="text-blue-600">{review.modelProvider}</div>
                    </div>
                  )}
                  {review.modelName && (
                    <div>
                      <div className="font-medium text-blue-700">Model</div>
                      <div className="text-blue-600 font-mono text-xs">{review.modelName}</div>
                    </div>
                  )}
                  {review.startedAt && (
                    <div>
                      <div className="font-medium text-blue-700">Started</div>
                      <div className="text-blue-600">{new Date(review.startedAt).toLocaleTimeString()}</div>
                    </div>
                  )}
                  {review.completedAt && review.startedAt && (
                    <div>
                      <div className="font-medium text-blue-700">Duration</div>
                      <div className="text-blue-600">
                        {Math.round((new Date(review.completedAt).getTime() - new Date(review.startedAt).getTime()) / 1000)}s
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Report */}
        {review.state.final_report && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Final Analysis Report</h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                {review.state.final_report}
              </pre>
            </div>
          </div>
        )}

        {/* Synthesis Data */}
        {review.state.synthesis_data && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Analysis Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {review.state.synthesis_data.critical_issues.length > 0 && (
                <div>
                  <h3 className="font-medium text-red-800 mb-2">🚨 Critical Issues</h3>
                  <ul className="text-sm space-y-1">
                    {review.state.synthesis_data.critical_issues.map((issue, index) => (
                      <li key={index} className="text-red-700">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.state.synthesis_data.important_recommendations.length > 0 && (
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important Recommendations</h3>
                  <ul className="text-sm space-y-1">
                    {review.state.synthesis_data.important_recommendations.map((rec, index) => (
                      <li key={index} className="text-yellow-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.state.synthesis_data.minor_suggestions.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">💡 Minor Suggestions</h3>
                  <ul className="text-sm space-y-1">
                    {review.state.synthesis_data.minor_suggestions.map((suggestion, index) => (
                      <li key={index} className="text-blue-700">• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>Reasoning:</strong> {review.state.synthesis_data.reasoning}
              </p>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by pass type:</span>
            {passTypes.map(passType => (
              <button
                key={passType}
                onClick={() => setSelectedPassType(passType)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedPassType === passType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {passType === 'all' ? 'All' : `${getPassTypeIcon(passType)} ${getPassTypeName(passType)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Chunk Analysis by File */}
        <div className="space-y-6">
          {Object.entries(fileGroups).map(([filePath, chunks]) => (
            <div key={filePath} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {getFileIcon(filePath)} {filePath}
                  <span className="text-sm font-normal text-gray-500">
                    ({chunks.length} chunk{chunks.length !== 1 ? 's' : ''})
                  </span>
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {chunks.map(chunk => (
                  <div key={chunk.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">
                          Chunk {chunk.chunkId.slice(0, 8)}
                        </h4>
                        {chunk.startLine && chunk.endLine && (
                          <span className="text-sm text-gray-500">
                            Lines {chunk.startLine}-{chunk.endLine}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {chunk.sizeTokens} tokens
                        </span>
                        {chunk.isCompleteFile && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Complete File
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => toggleChunkExpansion(chunk.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {expandedChunks.has(chunk.id) ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    {/* Analysis Passes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {chunk.analysisPasses
                        .filter(pass => selectedPassType === 'all' || pass.passType === selectedPassType)
                        .map(pass => (
                        <div key={pass.id} className="border border-gray-200 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">
                              {getPassTypeIcon(pass.passType)} {getPassTypeName(pass.passType)}
                            </h5>
                            <span className={getRiskBadge(pass.riskLevel)}>
                              {pass.riskLevel}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            {pass.tokensUsed} tokens • {(pass.durationMs / 1000).toFixed(1)}s
                          </div>
                          
                          {pass.issuesFound.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-red-700 mb-1">Issues ({pass.issuesFound.length})</div>
                              <ul className="text-xs text-red-600 space-y-1">
                                {pass.issuesFound.slice(0, 2).map((issue, index) => (
                                  <li key={index}>• {issue}</li>
                                ))}
                                {pass.issuesFound.length > 2 && (
                                  <li className="text-gray-500">...and {pass.issuesFound.length - 2} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {expandedChunks.has(chunk.id) && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap">{pass.analysisResult}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Diff Content (when expanded) */}
                    {expandedChunks.has(chunk.id) && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Diff Content</h5>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                          {chunk.diffContent}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legacy File Analyses (if any) */}
        {review.fileAnalyses && review.fileAnalyses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📁 Legacy File Analyses</h2>
            <div className="space-y-4">
              {review.fileAnalyses.map((fileAnalysis, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{fileAnalysis.fileName}</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {fileAnalysis.analysis}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
