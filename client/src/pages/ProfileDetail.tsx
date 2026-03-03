import { useState } from 'react';
import { useBigFive } from '@/contexts/BigFiveContext';
import { DimensionCardClickable } from '@/components/DimensionCardClickable';
import { DimensionModal } from '@/components/DimensionModal';
import { PrintableReport } from '@/components/PrintableReport';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Lightbulb, Download, Printer } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { BigFiveDimension } from '@/lib/bigfive';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';

export default function ProfileDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/profile/:id');
  const { profiles } = useBigFive();
  const [selectedDimension, setSelectedDimension] = useState<BigFiveDimension | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </div>

        {/* Dimensões */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Perfil de Personalidade</h2>
          <p className="text-muted-foreground mb-6">Clique em cada dimensão para ver as subfacetas e descrições detalhadas</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DimensionCardClickable
              dimension={dimensions.openness}
              onClick={() => {
                setSelectedDimension(dimensions.openness);
                setModalOpen(true);
              }}
            />
            <DimensionCardClickable
              dimension={dimensions.conscientiousness}
              onClick={() => {
                setSelectedDimension(dimensions.conscientiousness);
                setModalOpen(true);
              }}
            />
            <DimensionCardClickable
              dimension={dimensions.extraversion}
              onClick={() => {
                setSelectedDimension(dimensions.extraversion);
                setModalOpen(true);
              }}
            />
            <DimensionCardClickable
              dimension={dimensions.agreeableness}
              onClick={() => {
                setSelectedDimension(dimensions.agreeableness);
                setModalOpen(true);
              }}
            />
            <DimensionCardClickable
              dimension={dimensions.emotionalStability}
              onClick={() => {
                setSelectedDimension(dimensions.emotionalStability);
                setModalOpen(true);
              }}
            />
          </div>
        </div>

        {/* Professional Insights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Análise Profissional
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {generateProfessionalInsights(profile).map((insight, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-primary bg-primary/5">
                <h3 className="font-semibold mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Insights */}
        {combinationInsights.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              Combinações de Traços Importantes
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

      {/* Modal de Detalhes da Dimensão */}
      {selectedDimension && (
        <DimensionModal
          dimension={selectedDimension}
          facets={getFacetsByDimension(
            Object.entries(dimensions).find(([_, d]) => d === selectedDimension)?.[0] || '',
            selectedDimension.score
          )}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}

      {/* Relatório Imprimível */}
      <PrintableReport profile={profile} />
    </div>
  );
}
