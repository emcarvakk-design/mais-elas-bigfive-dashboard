import { useState } from 'react';
import { BigFiveDimension } from '@/lib/bigfive';
import { Facet } from '@/lib/facets';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface DimensionModalExpandableProps {
  dimension: BigFiveDimension;
  facets: Facet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DimensionModalExpandable({
  dimension,
  facets,
  open,
  onOpenChange,
}: DimensionModalExpandableProps) {
  const [expandedFacet, setExpandedFacet] = useState<number | null>(null);

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
          {/* Score Principal */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Score Geral</p>
                <p className="text-4xl font-bold text-primary">{dimension.score}%</p>
              </div>
              <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Nível</p>
                  <p className="font-bold text-primary">{dimension.classification}</p>
                </div>
              </div>
            </div>
            <p className="text-sm mt-4 text-muted-foreground italic">{dimension.description}</p>
          </Card>

          {/* Subfacetas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Subfacetas</h3>
            <div className="space-y-2">
              {facets.map((facet, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFacet(expandedFacet === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="flex-1">
                        <p className="font-semibold">{facet.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${facet.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary min-w-fit">{facet.score}%</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedFacet === idx ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Descrição Expandida */}
                  {expandedFacet === idx && (
                    <Card className="mt-2 p-4 bg-muted/50 border-primary/20">
                      <p className="text-sm leading-relaxed">{facet.description}</p>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interpretação Geral */}
          <Card className="p-4 bg-accent/10 border-accent/20">
            <h4 className="font-semibold mb-2">O que significa?</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {getInterpretation(dimension)}
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getInterpretation(dimension: BigFiveDimension): string {
  const { name, label, score } = dimension;
  const dimensionName = label || name;

  if (!dimensionName) return 'Dimensão não identificada.';

  if (dimensionName.includes('Abertura') ) {
    if (score >= 80)
      return 'Você é altamente criativo e inovador, com grande curiosidade sobre o mundo. Gosta de explorar novas ideias, experiências e perspectivas. Tende a ser imaginativo, artístico e aberto a mudanças. Pode se destacar em campos criativos e de inovação.';
    if (score >= 60)
      return 'Você tem uma boa abertura para novas experiências e ideias. Equilibra criatividade com praticidade, apreciando tanto inovação quanto estabilidade.';
    if (score >= 40)
      return 'Você é moderadamente aberto a novas experiências. Aprecia algumas mudanças, mas também valoriza a familiaridade e a tradição.';
    if (score >= 20)
      return 'Você prefere estabilidade e rotinas conhecidas. Tende a ser mais prático e menos interessado em explorar novas ideias ou experiências.';
    return 'Você prefere fortemente manter as coisas como estão, com resistência a mudanças e preferência clara por rotinas estabelecidas.';
  }

  if (dimensionName.includes('Conscienciosidade') ) {
    if (score >= 80)
      return 'Você é altamente organizado, disciplinado e focado em objetivos. Planeja cuidadosamente, segue cronogramas e é confiável. Tende a ser perfeccionista e muito responsável. Pode se destacar em posições que exigem atenção aos detalhes e execução precisa.';
    if (score >= 60)
      return 'Você é bem organizado e responsável. Equilibra planejamento com flexibilidade, mantendo foco nos objetivos.';
    if (score >= 40)
      return 'Você tem um nível moderado de organização. Consegue ser responsável quando necessário, mas também aprecia flexibilidade.';
    if (score >= 20)
      return 'Você prefere espontaneidade e flexibilidade. Pode procrastinar ocasionalmente, mas é criativo e adaptável.';
    return 'Você é muito espontâneo e pode procrastinar. Prefere liberdade a estrutura rígida, podendo ser desorganizado.';
  }

  if (dimensionName.includes('Extroversão') ) {
    if (score >= 80)
      return 'Você é altamente extrovertido, energizado pelo contato social e interação com outras pessoas. Gosta de estar no centro das atenções, é comunicativo e entusiasmado. Tende a buscar estímulos externos e aprecia ambientes sociais.';
    if (score >= 60)
      return 'Você é comunicativo e confortável socialmente. Gosta de interagir com pessoas e tem boa capacidade de se expressar.';
    if (score >= 40)
      return 'Você é ambivertido, confortável tanto em ambientes sociais quanto em trabalho focado. Equilibra interação com reflexão.';
    if (score >= 20)
      return 'Você é mais introvertido, preferindo conexões profundas com poucas pessoas. Recarrega sua energia na solidão.';
    return 'Você é altamente introvertido, recarregando-se na solidão. Prefere profundidade nas relações a ampla rede social.';
  }

  if (dimensionName.includes('Agradabilidade') ) {
    if (score >= 80)
      return 'Você é altamente empático, colaborativo e compassivo. Prioriza as necessidades dos outros e busca harmonia. É confiável, generoso e tende a ser bem-vindo em grupos. Pode se destacar em funções que exigem empatia e trabalho em equipe.';
    if (score >= 60)
      return 'Você é colaborativo e empático. Valoriza as relações e busca harmonia nos relacionamentos.';
    if (score >= 40)
      return 'Você equilibra empatia com assertividade. Consegue colaborar bem, mas também mantém seus próprios interesses em mente.';
    if (score >= 20)
      return 'Você é direto e objetivo. Valoriza a verdade mais que a harmonia, podendo ser percebido como crítico.';
    return 'Você é altamente assertivo e direto. Prioriza objetivos sobre harmonia, podendo parecer insensível aos sentimentos alheios.';
  }

  if (dimensionName.includes('Estabilidade') || dimensionName.includes('Emotional')) {
    if (score >= 80)
      return 'Você tem excelente estabilidade emocional e resiliência. Lida bem com estresse, mantém calma em situações difíceis e tem perspectiva equilibrada. Raramente se sente ansioso ou deprimido.';
    if (score >= 60)
      return 'Você tem boa resiliência emocional. Lida bem com estresse e mantém equilíbrio em situações desafiadoras.';
    if (score >= 40)
      return 'Você tem equilíbrio emocional moderado. Experimenta emoções variadas, mas consegue lidar com elas de forma saudável.';
    if (score >= 20)
      return 'Você é mais sensível emocionalmente. Pode se sentir ansioso ou deprimido com mais frequência, mas consegue se recuperar.';
    return 'Você é altamente reativo ao estresse. Tende a experimentar ansiedade, preocupação e instabilidade emocional com frequência.';
  }

  return 'Dimensão não identificada.';
}
