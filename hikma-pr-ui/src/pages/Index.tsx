
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SearchIcon, FilterIcon, Calendar, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { mockReviews, mockSummaryStats } from "@/data/mockData";
import QualityScoreDisplay from "@/components/QualityScoreDisplay";
import FindingsBadge from "@/components/FindingsBadge";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.repository.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || review.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || 
      review.findings.some(f => f.severity === severityFilter);
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">PR Vision Dashboard</h1>
          <p className="text-slate-600">Intelligent Pull Request Analysis & Quality Insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Reviews</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{mockSummaryStats.totalReviews}</div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Critical Findings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{mockSummaryStats.criticalFindings}</div>
              <p className="text-xs text-red-600 mt-1">-8% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Quality Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{mockSummaryStats.avgQualityScore}</div>
              <p className="text-xs text-green-600 mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Repositories</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{mockSummaryStats.activeRepos}</div>
              <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by PR title or repository..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              PR Reviews ({filteredReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">PR Title</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Repository</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Findings</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Quality Score</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <Link 
                          to={`/review/${review.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          {review.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-600">{review.repository}</td>
                      <td className="py-4 px-4 text-slate-600">{review.date}</td>
                      <td className="py-4 px-4">
                        <FindingsBadge findings={review.findings} />
                      </td>
                      <td className="py-4 px-4">
                        <QualityScoreDisplay score={review.qualityScore} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={review.status === 'completed' ? 'default' : 
                                  review.status === 'in-progress' ? 'secondary' : 'destructive'}
                        >
                          {review.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/review/${review.id}`}>View Details</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
