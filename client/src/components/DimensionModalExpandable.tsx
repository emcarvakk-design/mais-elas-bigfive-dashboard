import { useState } from 'react';
import { BigFiveDimension } from '@/lib/bigfive';
import { Facet, FacetTendency } from '@/lib/facets';
import { getQuestionsForDimension } from '@/lib/powerfulQuestions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Info, MessageCircleQuestion } from 'lucide-react';

interface DimensionModalExpandableProps {
  dimension: BigFiveDimension;
  dimensionKey: string;
  facets: Facet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const classificationLabels: Record<string, string> = {
  very_low: 'Muito Baixo',
  low: 'Baixo',
  moderate: 'Moderado',
  high: 'Elevado',
  very_high: 'Muito Elevado',
};

const classificationColors: Record<string, string> = {
  very_low: 'bg-red-100 text-red-700 border-red-200',
  low: 'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-green-100 text-green-700 border-green-200',
  very_high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const tendencyConfig: Record<FacetTendency, { label: string; color: string; dot: string }> = {
  elevada: { label: 'Tende a ser elevada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  moderada: { label: 'Tende a ser moderada', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  baixa: { label: 'Tende a ser baixa', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

export function DimensionModalExpandable({
  dimension,
  dimensionKey,
  facets,
  open,
  onOpenChange,
}: DimensionModalExpandableProps) {
  const [expandedFacet, setExpandedFacet] = useState<number | null>(null);

  const classLabel = classificationLabels[dimension.classification] ?? dimension.classification;
  const classColor = classificationColors[dimension.classification] ?? '';
  const powerfulQs = getQuestionsForDimension(dimensionKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{dimension.emoji}</span>
            <div>
              <div>{dimension.label}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-primary">{dimension.score}%</span>
                <Badge className={`text-xs font-semibold border ${classColor}`} variant="outline">
                  {classLabel}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Descrição Geral */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm leading-relaxed">{dimension.description}</p>
          </Card>

          {/* Barra de progresso visual */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Baixo</span>
              <span>Moderado</span>
              <span>Elevado</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              {/* Marcadores de faixa */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 border-r border-background/50" />
                <div className="flex-1 border-r border-background/50" />
                <div className="flex-1" />
              </div>
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${dimension.score}%` }}
              />
            </div>
          </div>

          {/* Subfacetas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold">Subfacetas</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <Info className="w-3 h-3" />
                <span>Tendência estimada com base no escore geral</span>
              </div>
            </div>
            <div className="space-y-2">
              {facets.map((facet, idx) => {
                const tc = tendencyConfig[facet.tendency];
                return (
                  <div key={idx}>
                    <button
                      onClick={() => setExpandedFacet(expandedFacet === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tc.dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{facet.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{facet.description}</p>
                        </div>
                        <Badge className={`text-xs border flex-shrink-0 ${tc.color}`} variant="outline">
                          {tc.label}
                        </Badge>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform text-muted-foreground ${expandedFacet === idx ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Conteúdo Expandido */}
                    {expandedFacet === idx && (
                      <Card className="mt-1 p-4 bg-muted/30 border-primary/20 rounded-t-none">
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                              <p className="text-xs font-semibold text-emerald-700 mb-1">Quando elevada</p>
                              <p className="text-xs text-emerald-800 leading-relaxed">{facet.highDescription}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                              <p className="text-xs font-semibold text-orange-700 mb-1">Quando baixa</p>
                              <p className="text-xs text-orange-800 leading-relaxed">{facet.lowDescription}</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-xs font-semibold text-blue-700 mb-1">💡 Dica para o mentoring</p>
                            <p className="text-xs text-blue-800 leading-relaxed">{facet.mentorNote}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interpretação Geral */}
          <Card className="p-4 bg-accent/10 border-accent/20">
            <h4 className="font-semibold mb-2 text-sm">O que significa para o mentoring?</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {getInterpretation(dimension)}
            </p>
          </Card>

          {/* Perguntas Poderosas */}
          {powerfulQs && (
            <Card className="p-4 border-purple-200 bg-purple-50/50">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircleQuestion className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-sm text-purple-800">Perguntas Poderosas para a Sessão</h4>
              </div>
              <p className="text-xs text-purple-600 mb-3 leading-relaxed">{powerfulQs.intro}</p>
              <ol className="space-y-2">
                {powerfulQs.questions.map((q, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-200 text-purple-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-purple-900 leading-relaxed italic">"{q.question}"</p>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInterpretation(dimension: BigFiveDimension): string {
  const { label, score } = dimension;

  if (label.includes('Abertura')) {
    if (score >= 80)
      return 'Altamente criativa e inovadora, com grande curiosidade sobre o mundo. Estimule projetos que explorem novos mercados, criação de conteúdo autoral e inovação. Atenção: alta abertura sem conscienciosidade pode gerar dispersão — muitas ideias, pouca execução.';
    if (score >= 60)
      return 'Boa abertura para novas experiências e aprendizado contínuo. Equilibra criatividade com praticidade. Explore projetos que combinem inovação com estrutura.';
    if (score >= 40)
      return 'Moderadamente aberta a novas experiências. Aprecia algumas mudanças, mas também valoriza a familiaridade. Introduza novidades de forma gradual e segura.';
    return 'Prefere estabilidade e rotinas conhecidas. Valorize sua consistência como diferencial — ajude a criar sistemas sólidos e processos confiáveis.';
  }

  if (label.includes('Conscienciosidade')) {
    if (score >= 80)
      return 'Altamente organizada, disciplinada e focada em objetivos. Pode tender ao perfeccionismo e burnout — trabalhe os limites saudáveis e a diferença entre excelência e perfeição.';
    if (score >= 60)
      return 'Bem organizada e responsável. Equilibra planejamento com flexibilidade. Explore oportunidades de liderança de projetos e execução de alta qualidade.';
    if (score >= 40)
      return 'Nível moderado de organização. Implemente ferramentas simples de gestão: listas, rotinas mínimas e ancoragens de hábito.';
    return 'Prefere espontaneidade e flexibilidade. Pode procrastinar ou se distrair. Foque em sistemas mínimos viáveis e celebre pequenas consistências.';
  }

  if (label.includes('Extroversão')) {
    if (score >= 80)
      return 'Energizada pelo contato social e interação. Explore seu potencial de comunicação, liderança de equipes e presença de marca. Atenção à gestão de energia em períodos de sobrecarga social.';
    if (score >= 60)
      return 'Comunicativa e confortável socialmente. Boa capacidade de networking e expressão. Explore oportunidades de visibilidade e posicionamento.';
    if (score >= 40)
      return 'Ambivertida — confortável tanto em ambientes sociais quanto no trabalho focado. Flexível e adaptável a diferentes contextos.';
    return 'Introvertida — recarrega na solidão e prefere conexões profundas. Valorize sua profundidade: liderança silenciosa é igualmente poderosa. Crie estratégias de gestão de energia para contextos de alta exposição.';
  }

  if (label.includes('Agradabilidade')) {
    if (score >= 80)
      return 'Alta empatia e colaboração. Risco de dificuldade em estabelecer limites, dizer não e negociar — trabalhe assertividade. Mulheres com alta agradabilidade frequentemente sofrem com a síndrome da boa moça.';
    if (score >= 60)
      return 'Colaborativa e empática. Valoriza as relações e busca harmonia. Explore funções de liderança humanizada, mentoria e construção de equipes.';
    if (score >= 40)
      return 'Equilíbrio entre empatia e assertividade. Consegue colaborar bem e também manter seus próprios interesses.';
    return 'Direta e orientada a resultados. Explore a liderança por resultados, mas atenção à gestão de relacionamentos e reputação. Trabalhe escuta ativa.';
  }

  if (label.includes('Estabilidade')) {
    if (score >= 80)
      return 'Estabilidade emocional elevada — use essa fortaleza como ativo de liderança em ambientes voláteis. Difícil de desestabilizar, mantém clareza em situações de crise.';
    if (score >= 60)
      return 'Boa resiliência emocional. Lida bem com adversidades e mantém equilíbrio. Explore posições que exijam presença e consistência emocional.';
    if (score >= 40)
      return 'Equilíbrio emocional moderado. Experimenta variações de humor conforme o contexto. Desenvolva práticas de regulação emocional e autoconhecimento dos gatilhos.';
    return 'Maior sensibilidade emocional — explore práticas de regulação, gestão do estresse e prevenção ao burnout. Alta pontuação em neuroticismo não significa fraqueza — significa sensibilidade. Trabalhe com compaixão.';
  }

  return 'Dimensão não identificada.';
}
