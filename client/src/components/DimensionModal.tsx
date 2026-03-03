import { BigFiveDimension } from '@/lib/bigfive';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface Facet {
  name: string;
  description: string;
  score: number;
}

interface DimensionModalProps {
  dimension: BigFiveDimension | null;
  facets: Facet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
            <h3 className="text-lg font-semibold mb-4">Subfacetas</h3>
            <div className="space-y-4">
              {facets.map((facet, idx) => (
                <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-base">{facet.name}</h4>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {facet.score}%
                      </span>
                    </div>
                    <Progress value={facet.score} className="h-2" />
                    <p className="text-sm text-muted-foreground">{facet.description}</p>
                  </div>
                </Card>
              ))}
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

  if (label === 'Abertura à Experiência') {
    if (score >= 80)
      return 'Você é altamente criativo e inovador, com grande curiosidade sobre o mundo. Gosta de explorar novas ideias, experiências e perspectivas. Tende a ser imaginativo, artístico e aberto a mudanças. Pode se destacar em campos criativos e de inovação.';
    if (score >= 60)
      return 'Você tem uma boa abertura para novas experiências e ideias. Equilibra criatividade com praticidade, apreciando tanto inovação quanto estabilidade.';
    if (score >= 40)
      return 'Você mantém um equilíbrio entre abertura para novas experiências e preferência por estabilidade. Aprecia rotinas, mas está aberto a mudanças quando necessário.';
    if (score >= 20)
      return 'Você prefere estabilidade e rotinas conhecidas. Tende a ser mais prático e menos interessado em explorar novas ideias ou experiências.';
    return 'Você prefere fortemente manter as coisas como estão, com resistência a mudanças e preferência clara por rotinas estabelecidas.';
  }

  if (label === 'Conscienciosidade') {
    if (score >= 80)
      return 'Você é altamente organizado, disciplinado e focado em objetivos. Planeja cuidadosamente, segue cronogramas e é confiável. Tende a ser perfeccionista e muito responsável. Pode se destacar em posições que exigem atenção aos detalhes e execução precisa.';
    if (score >= 60)
      return 'Você é bem organizado e responsável. Equilibra planejamento com flexibilidade, mantendo foco nos objetivos.';
    if (score >= 40)
      return 'Você mantém um equilíbrio entre organização e espontaneidade. Consegue ser estruturado quando necessário, mas também aprecia flexibilidade.';
    if (score >= 20)
      return 'Você prefere espontaneidade e flexibilidade. Pode procrastinar ocasionalmente, mas é criativo e adaptável.';
    return 'Você é muito espontâneo e pode procrastinar. Prefere liberdade a estrutura rígida, podendo ser desorganizado.';
  }

  if (label === 'Extroversão') {
    if (score >= 80)
      return 'Você é altamente extrovertido, energizado pelo contato social e interação com outras pessoas. Gosta de estar no centro das atenções, é comunicativo e entusiasmado. Tende a buscar estímulos externos e aprecia ambientes sociais.';
    if (score >= 60)
      return 'Você é comunicativo e confortável socialmente. Gosta de interagir com pessoas e tem boa capacidade de se expressar.';
    if (score >= 40)
      return 'Você é ambivertido, confortável tanto em situações sociais quanto em momentos de solidão. Adapta-se bem a diferentes contextos.';
    if (score >= 20)
      return 'Você é mais introvertido, preferindo conexões profundas com poucas pessoas. Recarrega sua energia na solidão.';
    return 'Você é altamente introvertido, recarregando-se na solidão. Prefere profundidade nas relações a ampla rede social.';
  }

  if (label === 'Agradabilidade') {
    if (score >= 80)
      return 'Você é altamente empático, colaborativo e compassivo. Prioriza as necessidades dos outros e busca harmonia. É confiável, generoso e tende a ser bem-vindo em grupos. Pode se destacar em funções que exigem empatia e trabalho em equipe.';
    if (score >= 60)
      return 'Você é colaborativo e empático. Valoriza as relações e busca harmonia nos relacionamentos.';
    if (score >= 40)
      return 'Você equilibra colaboração com assertividade. Consegue ser empático, mas também defende seus pontos de vista.';
    if (score >= 20)
      return 'Você é direto e objetivo. Valoriza a verdade mais que a harmonia, podendo ser percebido como crítico.';
    return 'Você é altamente assertivo e direto. Prioriza objetivos sobre harmonia, podendo parecer insensível aos sentimentos alheios.';
  }

  if (label === 'Estabilidade Emocional') {
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
