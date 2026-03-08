import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DIMENSOES, getScoreClass } from "@/lib/rodaDimensoes";
import { RodaRadarChart } from "@/components/mais-elas/RodaRadarChart";

type RodaProfile = {
  id: string; email: string; name: string; area?: string | null; faixaEtaria?: string | null;
  scoreCarreira?: number | null; scoreFinanceiro?: number | null; scoreProposito?: number | null;
  scoreLideranca?: number | null; scoreRelacionamentos?: number | null; scoreDesenvolvimento?: number | null;
  scoreSaude?: number | null; scoreEquilibrio?: number | null; scoreReconhecimento?: number | null;
  scoreAutonomia?: number | null;
  respostaEstacao?: string | null; respostaDrena?: string | null; respostaRelacionamento?: string | null;
  respostaConquista?: string | null; respostaObstaculo?: string | null; respostaHabilidade?: string | null;
  respostaLegado?: string | null; respostaDimensaoAtencao?: string | null;
  submittedAt?: Date | null; syncedAt?: Date | null;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>;
  const cls = getScoreClass(score);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {score.toFixed(1)}
    </span>
  );
}

function ProfileCard({ profile }: { profile: RodaProfile }) {
  const [, navigate] = useLocation();
  const scores = [
    profile.scoreCarreira, profile.scoreFinanceiro, profile.scoreProposito,
    profile.scoreLideranca, profile.scoreRelacionamentos, profile.scoreDesenvolvimento,
    profile.scoreSaude, profile.scoreEquilibrio, profile.scoreReconhecimento, profile.scoreAutonomia,
  ];
  const validScores = scores.filter((s) => s !== null) as number[];
  const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;

  let lowestIdx = -1;
  for (let idx = 0; idx < scores.length; idx++) {
    const s = scores[idx];
    if (s === null) continue;
    if (lowestIdx === -1) { lowestIdx = idx; continue; }
    const minS = scores[lowestIdx] ?? null;
    if (minS !== null && (s as number) < (minS as number)) lowestIdx = idx;
  }

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/mais-elas/perfil/${encodeURIComponent(profile.id)}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-foreground text-base leading-tight">{profile.name}</h3>
          <p className="text-muted-foreground text-sm mt-0.5">{profile.area || "Área não informada"}</p>
          {profile.faixaEtaria && (
            <p className="text-muted-foreground text-xs mt-0.5">{profile.faixaEtaria}</p>
          )}
        </div>
        {avg !== null && (
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-primary">{avg.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">média geral</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {DIMENSOES.map((dim, idx) => (
          <div key={dim.key} className="text-center">
            <div className="text-xs text-muted-foreground truncate">{dim.label.split(" ")[0]}</div>
            <ScoreBadge score={scores[idx] ?? null} />
          </div>
        ))}
      </div>

      {lowestIdx >= 0 && (() => { const s = scores[lowestIdx] ?? null; return s !== null && (s as number) < 6 ? (
        <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
          Atenção: <strong>{DIMENSOES[lowestIdx].label}</strong> ({(s as number).toFixed(1)})
        </div>
      ) : null; })()}
    </div>
  );
}

function GroupAverages({ profiles }: { profiles: RodaProfile[] }) {
  const scoreKeys: (keyof RodaProfile)[] = [
    "scoreCarreira", "scoreFinanceiro", "scoreProposito", "scoreLideranca",
    "scoreRelacionamentos", "scoreDesenvolvimento", "scoreSaude",
    "scoreEquilibrio", "scoreReconhecimento", "scoreAutonomia",
  ];

  const avgs = scoreKeys.map((key, idx) => {
    const vals = profiles.map((p) => p[key] as number | null).filter((v) => v !== null) as number[];
    return {
      label: DIMENSOES[idx].label,
      score: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    };
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Médias do Grupo</h2>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="shrink-0">
          <RodaRadarChart scores={avgs} size={320} profileName="Média do Grupo" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2 w-full">
          {avgs.map((a, idx) => (
            <div key={a.label} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-base">{DIMENSOES[idx].emoji}</span>
                <span className="text-sm text-foreground">{a.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {a.score !== null && (
                  <div className="w-16 bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${(a.score / 10) * 100}%` }}
                    />
                  </div>
                )}
                <ScoreBadge score={a.score} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { data: profiles, isLoading, refetch } = trpc.maisElas.list.useQuery();
  const syncMutation = trpc.maisElas.sync.useMutation({
    onSuccess: (result) => {
      toast.success(`Sincronização concluída: ${result.synced} perfis atualizados`);
      refetch();
    },
    onError: (err) => toast.error(`Erro na sincronização: ${err.message}`),
  });

  const filtered =
    profiles?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.area ?? "").toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="container py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <h1 className="text-xl font-bold text-sidebar-foreground">Mais Elas</h1>
            </div>
            <p className="text-sidebar-foreground/70 text-sm mt-0.5">
              Roda da Vida Profissional · Agro Com Propósito
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent/80"
          >
            {syncMutation.isPending ? "Sincronizando..." : "🔄 Sincronizar"}
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : profiles && profiles.length > 0 ? (
          <GroupAverages profiles={profiles} />
        ) : null}

        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Mentoradas
              {profiles && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {profiles.length}
                </Badge>
              )}
            </h2>
            <Input
              placeholder="Buscar por nome ou área..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">🌱</div>
              {profiles?.length === 0 ? (
                <>
                  <p className="font-medium">Nenhum perfil ainda</p>
                  <p className="text-sm mt-1">
                    Clique em "🔄 Sincronizar" para importar da planilha
                  </p>
                </>
              ) : (
                <p>Nenhuma mentorada encontrada para "{search}"</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="container text-center text-xs text-muted-foreground">
          Mais Elas · Agro Com Propósito · @oagrocomproposito
        </div>
      </footer>
    </div>
  );
}
