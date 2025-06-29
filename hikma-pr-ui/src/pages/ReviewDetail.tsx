import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ExternalLink, FileText, AlertTriangle, CheckCircle, TrendingUp, ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { mockReviews } from "@/data/mockData";
import QualityScoreDisplay from "@/components/QualityScoreDisplay";
import FindingCard from "@/components/FindingCard";
import QualityRadarChart from "@/components/QualityRadarChart";

const ReviewDetail = () => {
  const { id } = useParams();
  const review = mockReviews.find(r => r.id === id);
  
  if (!review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Review not found</h2>
          <p className="text-slate-600 mb-4">The requested PR review could not be found.</p>
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate findings distribution for pie chart
  const findingsDistribution = review.findings.reduce((acc, finding) => {
    const existing = acc.find(item => item.severity === finding.severity);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ severity: finding.severity, count: 1 });
    }
    return acc;
  }, [] as Array<{ severity: string; count: number }>);

  const pieData = findingsDistribution.map(item => ({
    name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    value: item.count,
    color: getSeverityColor(item.severity)
  }));

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#2563eb';
      default: return '#6b7280';
    }
  }

  // Group files by analysis status and findings
  const fileAnalysis = [...new Set(review.findings.map(f => f.file))].map(file => {
    const fileFindings = review.findings.filter(f => f.file === file);
    const totalLines = Math.floor(Math.random() * 100) + 50; // Mock data
    const addedLines = Math.floor(Math.random() * 30) + 5;
    const removedLines = Math.floor(Math.random() * 15) + 2;
    const chunks = Math.floor(Math.random() * 5) + 1;
    
    return {
      file,
      findings: fileFindings,
      status: 'analyzed',
      totalLines,
      addedLines,
      removedLines,
      chunks
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 leading-tight">{review.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base text-slate-600">
                <span>{review.repository}</span>
                <span className="hidden sm:inline">•</span>
                <span>by {review.author}</span>
                <span className="hidden sm:inline">•</span>
                <span>{review.date}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <QualityScoreDisplay score={review.qualityScore} size="lg" showLabel />
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={review.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View PR
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Status and Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Status</p>
                  <Badge 
                    variant={review.status === 'completed' ? 'default' : 
                            review.status === 'in-progress' ? 'secondary' : 'destructive'}
                    className="mt-1 text-xs"
                  >
                    {review.status}
                  </Badge>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Files Analyzed</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{review.filesAnalyzed}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Lines of Code</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{review.linesOfCode}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Total Findings</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">{review.findings.length}</p>
                </div>
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Lines Added</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">+{review.linesAdded}</p>
                </div>
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600">Lines Removed</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">-{review.linesRemoved}</p>
                </div>
                <Minus className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="findings" className="text-xs sm:text-sm px-2 py-2">
              Findings <span className="hidden sm:inline">({review.findings.length})</span>
            </TabsTrigger>
            <TabsTrigger value="semantic" className="text-xs sm:text-sm px-2 py-2">
              <span className="hidden sm:inline">Semantic </span>Analysis
            </TabsTrigger>
            <TabsTrigger value="files" className="text-xs sm:text-sm px-2 py-2">
              Files <span className="hidden sm:inline">({review.filesAnalyzed})</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm px-2 py-2">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quality Metrics */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <QualityRadarChart quality={review.quality} />
                </CardContent>
              </Card>

              {/* Findings Distribution Pie Chart */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Findings Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500">
                      No findings to display
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Recommendations */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Top Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {review.semantic.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-700">{suggestion}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Critical Findings */}
            {review.findings.filter(f => f.severity === 'critical' || f.severity === 'high').length > 0 && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-red-700 text-lg sm:text-xl">Critical & High Priority Findings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {review.findings
                    .filter(f => f.severity === 'critical' || f.severity === 'high')
                    .map(finding => (
                      <FindingCard key={finding.id} finding={finding} />
                    ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="findings" className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">All Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.findings.map(finding => (
                  <FindingCard key={finding.id} finding={finding} detailed />
                ))}
                
                {review.findings.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No issues found</h3>
                    <p className="text-slate-600">This PR passed all quality checks successfully.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semantic" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">AI Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{review.semantic.summary}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Impact Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{review.semantic.impact}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Files Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fileAnalysis.map((file, index) => (
                    <FileAnalysisCard key={index} fileData={file} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analysis Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">LLM Provider</span>
                      <span className="text-slate-900 font-mono text-sm">{review.analysisPerformance.llmProvider}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">Model Used</span>
                      <code className="bg-slate-100 px-2 py-1 rounded text-sm">{review.analysisPerformance.modelUsed}</code>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">Start Time</span>
                      <span className="text-slate-900">{review.analysisPerformance.startTime}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">End Time</span>
                      <span className="text-slate-900">{review.analysisPerformance.endTime}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">Total Duration</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">{review.analysisPerformance.totalDuration}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="font-medium text-slate-700">Average per File</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">{review.analysisPerformance.averagePerFile}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const FileAnalysisCard = ({ fileData }: { fileData: any }) => {
  const [isDiffExpanded, setIsDiffExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg">
      {/* File Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-t-lg gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-sm font-medium text-slate-900 truncate">
              {fileData.file}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
              <span>Analysis Status: <span className="text-green-600 font-medium">{fileData.status}</span></span>
              <span>Chunks: {fileData.chunks}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {fileData.findings.length > 0 ? (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              {fileData.findings.length} findings
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Clean
            </Badge>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Plus className="h-3 w-3" />
              {fileData.addedLines}
            </span>
            <span className="text-red-600 flex items-center gap-1">
              <Minus className="h-3 w-3" />
              {fileData.removedLines}
            </span>
          </div>
        </div>
      </div>

      {/* Findings in this file */}
      {fileData.findings.length > 0 && (
        <div className="p-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Findings in this file:</h4>
          <div className="space-y-2">
            {fileData.findings.map((finding: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    finding.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {finding.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900">{finding.title}</div>
                  <div className="text-xs text-slate-600 mt-1">Line {finding.line}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Diff View */}
      <Collapsible open={isDiffExpanded} onOpenChange={setIsDiffExpanded}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 border-t border-slate-200 rounded-none hover:bg-slate-50"
          >
            <span className="text-sm font-medium">View Diff</span>
            {isDiffExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="bg-white rounded border font-mono text-xs">
              <div className="bg-slate-100 px-3 py-2 border-b text-slate-600">
                {fileData.file}
              </div>
              <div className="p-3 space-y-1">
                <div className="text-red-600">- const oldFunction = () =&gt; {'{'}</div>
                <div className="text-red-600">-   // old implementation</div>
                <div className="text-red-600">- {'}'}</div>
                <div className="text-green-600">+ const newFunction = () =&gt; {'{'}</div>
                <div className="text-green-600">+   // improved implementation</div>
                <div className="text-green-600">+   // with better error handling</div>
                <div className="text-green-600">+ {'}'}</div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ReviewDetail;
