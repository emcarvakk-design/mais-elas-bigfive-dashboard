import { useState, useMemo } from 'react';
import { DimensionCardClickable } from '@/components/DimensionCardClickable';
import { DimensionModalExpandable } from '@/components/DimensionModalExpandable';
import { PrintableReport } from '@/components/PrintableReport';
import { PrintableReportSummary } from '@/components/PrintableReportSummary';
import { PrintablePowerfulQuestions } from '@/components/PrintablePowerfulQuestions';
import { PrintableMentorGuide } from '@/components/PrintableMentorGuide';
import { BigFiveRadarChart } from '@/components/RadarChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Lightbulb, Download, Printer, Activity, RefreshCw, BarChart2, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { BigFiveDimension } from '@/lib/bigfive';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';
import { trpc } from '@/lib/trpc';
import { SUBFACET_MAP, type SubfacetScore } from '@/lib/ipip120';

export default function ProfileDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/profile/:id');
  const [selectedDimension, setSelectedDimension] = useState<BigFiveDimension | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Buscar todos os perfis do banco e encontrar o atual pelo ID
  const { data: dbProfiles = [], isLoading } = trpc.profiles.list.useQuery();

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando perfil...</span>
      </div>
    );
  }

  const profile = (dbProfiles as any[]).find((p: any) => p.id === params?.id) as any;

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
  const isIPIP120 = profile.testVersion === 'ipip120' && profile.ipip120Data;
  const ipip120 = isIPIP120 ? profile.ipip120Data : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 no-print">
          {/* Linha 1: navegação + identidade */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {isIPIP120 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <BarChart2 className="w-3 h-3" />
                      IPIP-NEO-120
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Linha 2: botões de ação agrupados */}
          <div className="flex flex-wrap items-center gap-2 pl-16">
            {/* Grupo: Impressão geral */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs h-8"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs h-8"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  document.body.classList.add('print-summary-mode');
                  window.print();
                  setTimeout(() => document.body.classList.remove('print-summary-mode'), 1000);
                }}
                className="flex items-center gap-1.5 text-xs h-8"
              >
                <FileText className="w-3.5 h-3.5" />
                Resumo
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Grupo: PDFs para mentorado */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document.body.classList.add('print-powerful-mode');
                window.print();
                setTimeout(() => document.body.classList.remove('print-powerful-mode'), 1000);
              }}
              className="flex items-center gap-1.5 text-xs h-8 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Perguntas Poderosas
            </Button>

            {/* Grupo: PDF da mentora */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document.body.classList.add('print-mentor-guide-mode');
                window.print();
                setTimeout(() => document.body.classList.remove('print-mentor-guide-mode'), 1000);
              }}
              className="flex items-center gap-1.5 text-xs h-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guia da Mentora
            </Button>
          </div>
        </div>

        {/* Radar + Resumo */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Visão Geral — Radar
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Comparação visual das 5 dimensões</p>
            <BigFiveRadarChart profile={profile} />
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Resumo dos Escores</h2>
            <div className="space-y-3">
              {Object.entries(dimensions as Record<string, any>).map(([key, dim]: [string, any]) => {
                const classificationLabel: Record<string, string> = {
                  very_low: 'Muito Baixo',
                  low: 'Baixo',
                  moderate: 'Moderado',
                  high: 'Elevado',
                  very_high: 'Muito Elevado',
                };
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xl">{dim.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{dim.label}</span>
                        <span className="text-sm font-bold" style={{ color: dim.score >= 70 ? '#10b981' : dim.score >= 40 ? '#f59e0b' : '#ef4444' }}>
                          {Math.round(dim.score)}% — {classificationLabel[dim.classification]}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${dim.score}%`,
                            backgroundColor: dim.score >= 70 ? '#10b981' : dim.score >= 40 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Subfacetas IPIP-120 resumidas */}
        {isIPIP120 && ipip120?.subfacets && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-emerald-600" />
              Subfacetas IPIP-NEO-120
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escores reais das 30 subfacetas medidas pelo instrumento validado IPIP-NEO-120.
              Clique em cada dimensão abaixo para ver os detalhes de cada subfaceta.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['emotionalStability', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const).map(dimKey => {
                const dimSubfacets = (ipip120.subfacets as any[]).filter((s: any) => s.dimension === dimKey);
                const dimInfo = dimensions[dimKey];
                if (!dimInfo || dimSubfacets.length === 0) return null;
                return (
                  <div key={dimKey} className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{dimInfo.emoji}</span>
                      <span className="text-sm font-semibold">{dimInfo.label}</span>
                    </div>
                    {dimSubfacets.map((s: any) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-muted-foreground truncate">{s.label}</span>
                            <span className="font-bold ml-1" style={{ color: s.score >= 70 ? '#10b981' : s.score >= 40 ? '#f59e0b' : '#ef4444' }}>{s.score}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.score}%`,
                                backgroundColor: s.score >= 70 ? '#10b981' : s.score >= 40 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              {(combinationInsights as string[]).map((insight: string, idx: number) => (
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
              {(recommendations as string[]).map((rec: string, idx: number) => (
                <Card key={idx} className="p-4 bg-muted/50">
                  <p className="text-sm">{rec}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Dimensão */}
      {selectedDimension && (() => {
        const dimKey = Object.entries(dimensions).find(([_, d]) => d === selectedDimension)?.[0] || '';
        // Para IPIP-120, usar subfacetas reais; para 30 questões, usar tendências estimadas
        const facets = getFacetsByDimension(dimKey, selectedDimension.score);
        const ipip120Subfacets = isIPIP120 && ipip120?.subfacets
          ? (ipip120.subfacets as SubfacetScore[]).filter(s => s.dimension === dimKey)
          : null;
        return (
          <DimensionModalExpandable
            dimension={selectedDimension}
            dimensionKey={dimKey}
            facets={facets}
            ipip120Subfacets={ipip120Subfacets}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        );
      })()}

      {/* Relatório Imprimível Completo */}
      <PrintableReport profile={profile} />
      {/* Relatório Resumido (2 páginas) */}
      <PrintableReportSummary profile={profile} />
      {/* PDF de Perguntas Poderosas */}
      <PrintablePowerfulQuestions profile={profile} />
      {/* Guia da Mentora */}
      <PrintableMentorGuide profile={profile} />
    </div>
  );
}
