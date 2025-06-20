'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Review {
  id: string
  prUrl: string
  state: {
    pr_details?: {
      title: string
      body: string
    }
    analyzed_files?: Record<string, string>
    files_to_review?: string[]
    final_report?: string
  }
  error?: string | null
  createdAt: string
  updatedAt: string
}

export default function ReviewDetail() {
  const params = useParams()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [showRawJson, setShowRawJson] = useState(false)

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

  const toggleFileExpansion = (fileName: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName)
    } else {
      newExpanded.add(fileName)
    }
    setExpandedFiles(newExpanded)
  }

  const formatMarkdown = (text: string) => {
    // Simple markdown-like formatting
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br>')
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const iconClass = "w-4 h-4 mr-2 flex-shrink-0"
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return <div className={`${iconClass} bg-yellow-400 rounded`} title="JavaScript" />
      case 'ts':
      case 'tsx':
        return <div className={`${iconClass} bg-blue-600 rounded`} title="TypeScript" />
      case 'css':
      case 'scss':
        return <div className={`${iconClass} bg-pink-500 rounded`} title="Stylesheet" />
      case 'html':
        return <div className={`${iconClass} bg-orange-500 rounded`} title="HTML" />
      case 'json':
        return <div className={`${iconClass} bg-green-500 rounded`} title="JSON" />
      case 'md':
        return <div className={`${iconClass} bg-gray-600 rounded`} title="Markdown" />
      default:
        return <div className={`${iconClass} bg-gray-400 rounded`} title="File" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading review</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <Link 
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Review not found</p>
            <p className="text-gray-500 text-sm mt-1">The requested review could not be found</p>
            <Link 
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Reviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const prInfo = extractPRInfo(review.prUrl)
  const { pr_details, analyzed_files, files_to_review, final_report } = review.state || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reviews
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {pr_details?.title || (prInfo ? `${prInfo.owner}/${prInfo.repo} PR #${prInfo.number}` : 'Review Details')}
              </h1>
              <p className="mt-2 text-sm text-gray-600">Review ID: {review.id}</p>
              <p className="text-sm text-gray-600">Created: {formatDate(review.createdAt)}</p>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={review.prUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View PR
              </a>
              
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {showRawJson ? 'Hide' : 'Show'} JSON
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {review.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-red-800 font-medium">Review Error</h3>
            </div>
            <p className="mt-2 text-red-700 text-sm">{review.error}</p>
          </div>
        )}

        {/* Raw JSON Display */}
        {showRawJson && (
          <div className="mb-6 bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Raw JSON Data</h2>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto max-h-96">
                <code className="text-gray-800">
                  {JSON.stringify(review.state, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* PR Details */}
            {pr_details && (
              <div className="bg-white shadow-sm rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Pull Request Details
                  </h2>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{pr_details.title}</h3>
                  {pr_details.body && (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(pr_details.body) }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* File Reviews */}
            {analyzed_files && Object.keys(analyzed_files).length > 0 && (
              <div className="bg-white shadow-sm rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    File Reviews ({Object.keys(analyzed_files).length} files)
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {Object.entries(analyzed_files).map(([fileName, review], index) => (
                    <div key={fileName} className="p-6">
                      <button
                        onClick={() => toggleFileExpansion(fileName)}
                        className="flex items-center w-full text-left group hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                      >
                        {getFileIcon(fileName)}
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {fileName}
                        </span>
                        <svg 
                          className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                            expandedFiles.has(fileName) ? 'rotate-90' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {expandedFiles.has(fileName) && (
                        <div className="mt-4 pl-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div 
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{ __html: formatMarkdown(review) }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            {final_report && (
              <div className="bg-white shadow-sm rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Summary Report
                  </h2>
                </div>
                <div className="p-6">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(final_report) }}
                  />
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="bg-white shadow-sm rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Review Statistics</h2>
              </div>
              <div className="p-6 space-y-4">
                {analyzed_files && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Files Reviewed</span>
                    <span className="text-sm font-medium text-gray-900">{Object.keys(analyzed_files).length}</span>
                  </div>
                )}
                {files_to_review && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Files Pending</span>
                    <span className="text-sm font-medium text-gray-900">{files_to_review.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${review.error ? 'text-red-600' : 'text-green-600'}`}>
                    {review.error ? 'Error' : 'Complete'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-lg border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <a 
                  href={review.prUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open PR in GitHub
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Copy Review Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
