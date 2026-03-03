import { useBigFive } from '@/contexts/BigFiveContext';
import { DimensionCard } from '@/components/DimensionCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Lightbulb } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';

export default function ProfileDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/profile/:id');
  const { profiles } = useBigFive();

  if (!match) {
    return null;
  }

  const profile = profiles.find((p) => p.id === params?.id);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Perfil não encontrado</p>
          <Button onClick={() => setLocation('/')}>Voltar ao Dashboard</Button>
        </Card>
      </div>
    );
  }

  const { dimensions, combinationInsights, recommendations } = profile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Dimensões */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Perfil de Personalidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DimensionCard dimension={dimensions.openness} />
            <DimensionCard dimension={dimensions.conscientiousness} />
            <DimensionCard dimension={dimensions.extraversion} />
            <DimensionCard dimension={dimensions.agreeableness} />
            <DimensionCard dimension={dimensions.emotionalStability} />
          </div>
        </div>

        {/* Insights */}
        {combinationInsights.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Insights Importantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combinationInsights.map((insight, idx) => (
                <Card key={idx} className="p-4 border-l-4 border-primary">
                  <p className="text-sm">{insight}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recomendações */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Recomendações de Desenvolvimento
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <Card key={idx} className="p-4 bg-muted/50">
                  <p className="text-sm">{rec}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
