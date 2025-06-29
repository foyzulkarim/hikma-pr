
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { Finding } from "@/data/mockData";

interface FindingCardProps {
  finding: Finding;
  detailed?: boolean;
}

const FindingCard = ({ finding, detailed = false }: FindingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(detailed);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Zap className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <Card className={`bg-white shadow-sm border-l-4 ${getBorderColor(finding.severity)}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={getSeverityColor(finding.severity)}>
                  {getSeverityIcon(finding.severity)}
                  <span className="ml-1">{finding.severity.toUpperCase()}</span>
                </Badge>
                <Badge variant="outline" className="bg-slate-100 text-slate-700">
                  {finding.type}
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 hidden sm:inline-flex">
                  {finding.plugin}
                </Badge>
              </div>
              
              <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{finding.title}</h4>
              
              <div className="text-xs sm:text-sm text-slate-600">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">
                  {finding.file}:{finding.line}
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3" />
                  View Details
                </>
              )}
            </Button>
          </div>
          
          <p className="text-slate-700 text-sm">{finding.description}</p>
          
          {isExpanded && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <h5 className="font-medium text-green-800 mb-1 text-sm">Recommendation:</h5>
              <p className="text-sm text-green-700">{finding.recommendation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FindingCard;
