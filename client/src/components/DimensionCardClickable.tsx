import { BigFiveDimension } from '@/lib/bigfive';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';

interface DimensionCardClickableProps {
  dimension: BigFiveDimension;
  onClick: () => void;
}

export function DimensionCardClickable({
  dimension,
  onClick,
}: DimensionCardClickableProps) {
  const getColor = (classification: string) => {
    switch (classification) {
      case 'very_low':
        return 'text-red-600';
      case 'low':
        return 'text-orange-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-blue-600';
      case 'very_high':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getClassificationLabel = (classification: string) => {
    const labels: Record<string, string> = {
      very_low: 'Muito Baixo',
      low: 'Baixo',
      moderate: 'Moderado',
      high: 'Elevado',
      very_high: 'Muito Elevado',
    };
    return labels[classification] || classification;
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{dimension.emoji}</span>
            <h3 className="font-semibold text-lg">{dimension.label}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{dimension.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-right flex-1">
          <div className={`text-3xl font-bold ${getColor(dimension.classification)}`}>
            {dimension.score}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getClassificationLabel(dimension.classification)}
          </div>
        </div>
      </div>
      
      <Progress value={dimension.score} className="h-2" />
    </Card>
  );
}
