
import { Badge } from "@/components/ui/badge";
import { Finding } from "@/data/mockData";

interface FindingsBadgeProps {
  findings: Finding[];
}

const FindingsBadge = ({ findings }: FindingsBadgeProps) => {
  const severityCounts = findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

  if (findings.length === 0) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        No issues
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(severityCounts).map(([severity, count]) => (
        <Badge
          key={severity}
          variant="outline"
          className={getSeverityColor(severity)}
        >
          {count} {severity}
        </Badge>
      ))}
    </div>
  );
};

export default FindingsBadge;
