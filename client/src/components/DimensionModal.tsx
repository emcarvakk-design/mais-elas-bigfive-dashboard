import { BigFiveDimension } from '@/lib/bigfive';
import { Facet } from '@/lib/facets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DimensionModalProps {
  dimension: BigFiveDimension | null;
  facets: Facet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tendencyConfig = {
  elevada: { label: '↑ Elevada', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  moderada: { label: '— Moderada', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  baixa: { label: '↓ Baixa', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export function DimensionModal({
  dimension,
  facets,
  open,
  onOpenChange,
}: DimensionModalProps) {
  if (!dimension) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span className="text-3xl">{dimension.emoji}</span>
            {dimension.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo da Dimensão */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Escore Geral</span>
                <span className="text-2xl font-bold text-primary">{dimension.score}%</span>
              </div>
              <Progress value={dimension.score} className="h-3" />
              <p className="text-sm text-muted-foreground">{dimension.description}</p>
            </div>
          </Card>

          {/* Subfacetas */}
          <div>
            <h3 className="text-lg font-semibold mb-1">Subfacetas</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Tendência estimada com base no escore geral da dimensão.
            </p>
            <div className="space-y-3">
              {facets.map((facet, idx) => {
                const tc = tendencyConfig[facet.tendency] ?? tendencyConfig.moderada;
                return (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-base">{facet.name}</h4>
                        <Badge className={`text-xs border flex-shrink-0 ${tc.color}`} variant="outline">
                          {tc.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{facet.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Interpretação */}
          <Card className="p-4 bg-muted/50 border-muted">
            <h4 className="font-semibold mb-2">O que significa?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getInterpretation(dimension)}
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInterpretation(dimension: BigFiveDimension): string {
  const { label, score } = dimension;

  if (label.includes('Abertura')) {
    if (score >= 80) return 'Altamente criativa e inovadora, com grande curiosidade sobre o mundo. Estimule projetos inovadores, novos mercados e criação de conteúdo autoral. Atenção: alta abertura sem conscienciosidade pode gerar dispersão.';
    if (score >= 60) return 'Boa abertura para novas experiências e aprendizado contínuo. Equilibra criatividade com praticidade.';
    if (score >= 40) return 'Equilíbrio entre abertura e estabilidade. Aprecia algumas mudanças, mas também valoriza a familiaridade.';
    return 'Prefere estabilidade e rotinas conhecidas. Valorize sua consistência — ajude a criar sistemas sólidos.';
  }

  if (label.includes('Conscienciosidade')) {
    if (score >= 80) return 'Altamente organizada, disciplinada e focada em objetivos. Pode tender ao perfeccionismo e burnout — trabalhe os limites saudáveis.';
    if (score >= 60) return 'Bem organizada e responsável. Equilibra planejamento com flexibilidade.';
    if (score >= 40) return 'Nível moderado de organização. Implemente ferramentas simples: listas, rotinas mínimas e ancoragens.';
    return 'Prefere espontaneidade e flexibilidade. Foque em sistemas mínimos viáveis e celebre pequenas consistências.';
  }

  if (label.includes('Extroversão')) {
    if (score >= 80) return 'Energizada pelo contato social. Explore seu potencial de comunicação, liderança de equipes e presença de marca.';
    if (score >= 60) return 'Comunicativa e confortável socialmente. Boa capacidade de networking e expressão.';
    if (score >= 40) return 'Ambivertida — confortável tanto em ambientes sociais quanto no trabalho focado.';
    return 'Introvertida — recarrega na solidão. Liderança silenciosa é igualmente poderosa. Crie estratégias de gestão de energia.';
  }

  if (label.includes('Agradabilidade')) {
    if (score >= 80) return 'Alta empatia e colaboração. Risco de dificuldade em estabelecer limites e dizer não — trabalhe assertividade. Síndrome da boa moça é um ponto de trabalho importante.';
    if (score >= 60) return 'Colaborativa e empática. Valoriza as relações e busca harmonia.';
    if (score >= 40) return 'Equilíbrio entre empatia e assertividade. Consegue colaborar bem e também manter seus próprios interesses.';
    return 'Direta e orientada a resultados. Explore a liderança por resultados, mas atenção à gestão de relacionamentos.';
  }

  if (label.includes('Estabilidade')) {
    if (score >= 80) return 'Estabilidade emocional elevada — use essa fortaleza como ativo de liderança em ambientes voláteis.';
    if (score >= 60) return 'Boa resiliência emocional. Lida bem com adversidades e mantém equilíbrio.';
    if (score >= 40) return 'Equilíbrio emocional moderado. Desenvolva práticas de regulação emocional e autoconhecimento dos gatilhos.';
    return 'Maior sensibilidade emocional — explore práticas de regulação e prevenção ao burnout. Alta sensibilidade não é fraqueza.';
  }

  return 'Dimensão não identificada.';
}
