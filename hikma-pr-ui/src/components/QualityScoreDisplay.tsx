
import { cn } from "@/lib/utils";

interface QualityScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const QualityScoreDisplay = ({ score, size = 'md', showLabel = false }: QualityScoreDisplayProps) => {
  const getColorClass = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-16 h-16 text-lg font-bold';
      default:
        return 'w-12 h-12 text-sm font-semibold';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'rounded-full flex items-center justify-center',
        getColorClass(score),
        getSizeClasses()
      )}>
        {score}
      </div>
      {showLabel && (
        <span className="text-sm text-slate-600">Quality Score</span>
      )}
    </div>
  );
};

export default QualityScoreDisplay;
