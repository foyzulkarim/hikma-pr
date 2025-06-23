'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import parse from 'parse-diff'

// Custom side-by-side diff viewer
const SideBySideDiff = ({ diffContent }: { diffContent: string }) => {
  const files = parse(diffContent);
  if (!files.length || !files[0] || !files[0].chunks || !files[0].chunks.length) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <pre className="text-sm text-gray-100 p-4 overflow-x-auto leading-relaxed">
          {diffContent}
        </pre>
      </div>
    );
  }

  const file = files[0];

  // Process chunks to create line-by-line comparison
  const lines: { left?: { number: number; content: string; type?: string }; right?: { number: number; content: string; type?: string } }[] = [];
  
  file.chunks.forEach((chunk: any) => {
    let leftLine = chunk.oldStart;
    let rightLine = chunk.newStart;

    chunk.changes.forEach((change: any) => {
      if (change.type === 'normal') {
        lines.push({
          left: { number: leftLine++, content: change.content.substring(1) },
          right: { number: rightLine++, content: change.content.substring(1) },
        });
      } else if (change.type === 'del') {
        lines.push({
          left: { number: leftLine++, content: change.content.substring(1), type: 'del' },
        });
      } else if (change.type === 'add') {
        lines.push({
          right: { number: rightLine++, content: change.content.substring(1), type: 'add' },
        });
      }
    });
  });

  return (
    <div className="font-mono text-xs border border-gray-700 rounded-lg bg-gray-900 text-gray-200">
      <table className="w-full border-collapse">
        <colgroup>
          <col style={{ width: '50px' }} />
          <col />
          <col style={{ width: '50px' }} />
          <col />
        </colgroup>
        <tbody>
          {lines.map((line, index) => (
            <tr key={index}>
              <td className={`pl-2 pr-2 text-right text-gray-500 ${line.left ? 'border-r border-gray-700' : ''} ${line.left?.type === 'del' ? 'bg-red-900/20' : ''}`}>
                {line.left?.number}
              </td>
              <td className={`pl-4 ${line.left?.type === 'del' ? 'bg-red-900/20' : ''}`}>
                <pre className="whitespace-pre-wrap">{line.left?.content}</pre>
              </td>
              <td className={`pl-2 pr-2 text-right text-gray-500 ${line.right ? 'border-r border-gray-700' : ''} ${line.right?.type === 'add' ? 'bg-green-900/20' : ''}`}>
                {line.right?.number}
              </td>
              <td className={`pl-4 ${line.right?.type === 'add' ? 'bg-green-900/20' : ''}`}>
                <pre className="whitespace-pre-wrap">{line.right?.content}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Simple markdown-to-JSX renderer for analysis results
const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactElement[] = []
    let currentList: string[] = []
    let listKey = 0

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
            {currentList.map((item, index) => (
              <li key={index} className="text-gray-700">
                {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
              </li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    const renderInlineMarkdown = (text: string) => {
      // Handle bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g
      const parts = text.split(boldRegex)
      
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-semibold text-gray-900">{part}</strong>
        }
        return part
      })
    }

    lines.forEach((line, index) => {
      line = line.trim()
      
      if (!line) {
        flushList()
        elements.push(<div key={`br-${index}`} className="mb-2"></div>)
        return
      }

      // Headers
      if (line.startsWith('## ')) {
        flushList()
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-1">
            {line.replace('## ', '')}
          </h3>
        )
      } else if (line.startsWith('### ')) {
        flushList()
        elements.push(
          <h4 key={index} className="text-base font-semibold text-gray-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h4>
        )
      }
      // List items
      else if (line.match(/^[-*]\s+/)) {
        currentList.push(line)
      }
      // Regular paragraphs
      else {
        flushList()
        elements.push(
          <p key={index} className="text-gray-700 mb-3 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        )
      }
    })

    flushList()
    return elements
  }

  return (
    <div className="prose prose-sm max-w-none">
      {renderMarkdown(content)}
    </div>
  )
}

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
            <div className="bg-gray-50 p-4 rounded">
              <MarkdownRenderer content={review.state.final_report} />
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
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleChunkExpansion(chunk.id)}
                    >
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
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                        {expandedChunks.has(chunk.id) ? 'Hide' : 'Show'} Details
                        <svg 
                          className={`w-4 h-4 transition-transform ${expandedChunks.has(chunk.id) ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                    </div>

                    {expandedChunks.has(chunk.id) && (
                      <div className="flex flex-col gap-6 mt-4">
                        {/* TOP: Diff Content */}
                        <div>
                          <h5 className="text-base font-medium text-gray-900 mb-3">📄 Diff Content</h5>
                          <SideBySideDiff diffContent={chunk.diffContent} />
                        </div>

                        {/* BOTTOM: Analysis Passes */}
                        <div>
                          <h5 className="text-base font-medium text-gray-900 mb-3">🔬 Analysis Passes</h5>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {chunk.analysisPasses
                              .filter(pass => selectedPassType === 'all' || pass.passType === selectedPassType)
                              .map(pass => (
                              <div key={pass.id} className="border border-gray-200 rounded p-4 bg-gray-50 h-full">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="text-base font-medium text-gray-900">
                                    {getPassTypeIcon(pass.passType)} {getPassTypeName(pass.passType)}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <span className={getRiskBadge(pass.riskLevel)}>
                                      {pass.riskLevel}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {pass.tokensUsed} tokens • {(pass.durationMs / 1000).toFixed(1)}s
                                    </span>
                                  </div>
                                </div>
                                <MarkdownRenderer content={pass.analysisResult} />
                              </div>
                            ))}
                          </div>
                        </div>
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
