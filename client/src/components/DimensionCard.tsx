import { BigFiveDimension } from '@/lib/bigfive';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DimensionCardProps {
  dimension: BigFiveDimension;
}

export function DimensionCard({ dimension }: DimensionCardProps) {
  const getColor = (classification: string) => {
    switch (classification) {
      case 'very_low':
        return 'bg-red-500';
      case 'low':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-blue-500';
      case 'very_high':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
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
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{dimension.emoji}</span>
            <h3 className="font-semibold text-lg">{dimension.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{dimension.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{dimension.score}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            {getClassificationLabel(dimension.classification)}
          </div>
        </div>
      </div>
      <Progress value={dimension.score} className="h-2" />
    </Card>
  );
}
