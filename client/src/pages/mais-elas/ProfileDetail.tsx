import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DIMENSOES, getScoreClass, getScoreLabel } from "@/lib/rodaDimensoes";
import { RodaRadarChart } from "@/components/mais-elas/RodaRadarChart";
import { RodaMentorGuide } from "@/components/mais-elas/RodaMentorGuide";
import { useState, useRef } from "react";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>;
  const cls = getScoreClass(score);
  const label = getScoreLabel(score);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${cls}`}>
      {score.toFixed(1)} · {label}
    </span>
  );
}

function DimensaoCard({ dimensaoKey, score }: { dimensaoKey: string; score: number | null }) {
  const [expanded, setExpanded] = useState(false);
  const dim = DIMENSOES.find((d) => d.key === dimensaoKey);
  if (!dim) return null;

  const isAlert = score !== null && score < 4;
  const isAttention = score !== null && score >= 4 && score < 7;

  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer transition-all ${
        isAlert ? "border-red-200 bg-red-50" : isAttention ? "border-amber-200 bg-amber-50" : "border-border bg-card"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{dim.emoji}</span>
          <span className="font-semibold text-foreground">{dim.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={score} />
          <span className="text-muted-foreground text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 text-sm">
          <p className="text-muted-foreground italic">{dim.definicao}</p>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Perguntas para a sessão</h4>
            <ul className="space-y-1">
              {dim.perguntas.map((q, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary font-bold shrink-0">→</span>
                  <span className="text-foreground">{q}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-semibold text-green-800 mb-2 text-xs uppercase tracking-wide">Sinais de Saúde</h5>
              <ul className="space-y-1">
                {dim.sinaisSaude.map((s, i) => (
                  <li key={i} className="text-green-700 text-xs flex gap-1"><span>✓</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-semibold text-red-800 mb-2 text-xs uppercase tracking-wide">Sinais de Alerta</h5>
              <ul className="space-y-1">
                {dim.sinaisAlerta.map((s, i) => (
                  <li key={i} className="text-red-700 text-xs flex gap-1"><span>⚠</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const decodedId = decodeURIComponent(id ?? "");

  const { data: profile, isLoading } = trpc.maisElas.getById.useQuery(
    { id: decodedId },
    { enabled: !!decodedId }
  );

  const generateAnalysisMutation = trpc.maisElas.generateAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Análise gerada com sucesso!");
      refetchAnalysis();
    },
    onError: (err) => toast.error(`Erro ao gerar análise: ${err.message}`),
  });

  const { data: analysis, refetch: refetchAnalysis } = trpc.maisElas.getAnalysis.useQuery(
    { profileId: decodedId },
    { enabled: !!decodedId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/mais-elas")}>← Voltar</Button>
        </div>
      </div>
    );
  }

  const scores = [
    { label: "Carreira", score: profile.scoreCarreira, key: "carreira" },
    { label: "Financeiro", score: profile.scoreFinanceiro, key: "financeiro" },
    { label: "Propósito", score: profile.scoreProposito, key: "proposito" },
    { label: "Liderança", score: profile.scoreLideranca, key: "lideranca" },
    { label: "Relacionamentos", score: profile.scoreRelacionamentos, key: "relacionamentos" },
    { label: "Desenvolvimento", score: profile.scoreDesenvolvimento, key: "desenvolvimento" },
    { label: "Saúde e Energia", score: profile.scoreSaude, key: "saude" },
    { label: "Equilíbrio", score: profile.scoreEquilibrio, key: "equilibrio" },
    { label: "Reconhecimento", score: profile.scoreReconhecimento, key: "reconhecimento" },
    { label: "Autonomia", score: profile.scoreAutonomia, key: "autonomia" },
  ];

  const validScores = scores.filter((s) => s.score !== null).map((s) => s.score as number);
  const avgGeral = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
  const alertDims = scores.filter((s) => s.score !== null && (s.score as number) < 4);
  const attentionDims = scores.filter((s) => s.score !== null && (s.score as number) >= 4 && (s.score as number) < 7);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="container py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/mais-elas")} className="text-sidebar-foreground hover:bg-sidebar-accent">
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h1 className="text-xl font-bold text-sidebar-foreground">Mais Elas</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const el = document.getElementById('roda-mentor-guide-print');
                if (!el) return;
                const win = window.open('', '_blank');
                if (!win) return;
                win.document.write(`<!DOCTYPE html><html><head><title>Guia da Mentora — ${profile?.name}</title><style>@media print{body{margin:0}}</style></head><body>${el.outerHTML}</body></html>`);
                win.document.close();
                win.focus();
                setTimeout(() => { win.print(); }, 500);
              }}
              className="text-sidebar-foreground border-sidebar-foreground/30 hover:bg-sidebar-accent"
            >
              🖨️ Imprimir Guia
            </Button>
            <Button
              size="sm"
              onClick={() => generateAnalysisMutation.mutate({ profileId: decodedId })}
              disabled={generateAnalysisMutation.isPending}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              {generateAnalysisMutation.isPending ? "Gerando..." : "✨ Gerar Análise IA"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground mt-1">{profile.area || "Área não informada"}</p>
              {profile.faixaEtaria && <p className="text-muted-foreground text-sm">{profile.faixaEtaria}</p>}
              <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {avgGeral !== null && (
                  <Badge className="bg-primary text-primary-foreground">Média Geral: {avgGeral.toFixed(1)}</Badge>
                )}
                {alertDims.length > 0 && (
                  <Badge variant="destructive">{alertDims.length} dimensão(ões) em alerta</Badge>
                )}
                {attentionDims.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800">{attentionDims.length} dimensão(ões) com atenção</Badge>
                )}
              </div>
              {profile.respostaDimensaoAtencao && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Dimensão que mais precisa de atenção (auto-avaliação):</p>
                  <p className="text-sm text-foreground">{profile.respostaDimensaoAtencao}</p>
                </div>
              )}
            </div>
            <div className="shrink-0">
              <RodaRadarChart scores={scores.map((s) => ({ label: s.label, score: s.score }))} size={340} showLegend={false} profileName={profile.name} />
            </div>
          </div>
        </div>

        {(profile.respostaEstacao || profile.respostaDrena || profile.respostaConquista || profile.respostaObstaculo || profile.respostaHabilidade || profile.respostaLegado) && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Respostas Abertas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.respostaEstacao && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Estação da vida profissional</p>
                  <p className="text-sm text-foreground">{profile.respostaEstacao}</p>
                </div>
              )}
              {profile.respostaDrena && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">O que drena energia</p>
                  <p className="text-sm text-foreground">{profile.respostaDrena}</p>
                </div>
              )}
              {profile.respostaConquista && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Maior conquista recente</p>
                  <p className="text-sm text-foreground">{profile.respostaConquista}</p>
                </div>
              )}
              {profile.respostaObstaculo && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Principal obstáculo</p>
                  <p className="text-sm text-foreground">{profile.respostaObstaculo}</p>
                </div>
              )}
              {profile.respostaHabilidade && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Habilidade a desenvolver</p>
                  <p className="text-sm text-foreground">{profile.respostaHabilidade}</p>
                </div>
              )}
              {profile.respostaLegado && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">Legado que quer construir</p>
                  <p className="text-sm text-foreground">{profile.respostaLegado}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {analysis && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">✨ Análise da Mentora (IA)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Pontos de Apoio</h4>
                <p className="text-sm text-green-700">{analysis.ajudas}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Oportunidades</h4>
                <p className="text-sm text-blue-700">{analysis.oportunidades}</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Riscos</h4>
                <p className="text-sm text-amber-700">{analysis.riscos}</p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Síntese para a Sessão</h4>
              <p className="text-sm text-foreground">{analysis.sintese}</p>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Dimensões da Roda da Vida</h3>
          <p className="text-sm text-muted-foreground mb-4">Clique em cada dimensão para ver perguntas-chave e sinais de saúde/alerta.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scores.map((s) => (
              <DimensaoCard key={s.key} dimensaoKey={s.key} score={s.score} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container text-center text-xs text-muted-foreground">
          Mais Elas · Agro Com Propósito · @oagrocomproposito
        </div>
      </footer>

      {/* Guia imprimível — oculto na tela, visível apenas na impressão */}
      <div style={{ display: 'none' }}>
        <RodaMentorGuide profile={profile} analysis={analysis} />
      </div>
    </div>
  );
}
