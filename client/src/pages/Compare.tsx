import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, X, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { BigFiveProfile, IPIP120SubfacetScore } from '@/lib/bigfive';

const PROFILE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

const DIMENSION_KEYS = [
  { key: 'openness', label: 'Abertura', emoji: '🌿' },
  { key: 'conscientiousness', label: 'Conscienciosidade', emoji: '⚡' },
  { key: 'extraversion', label: 'Extroversão', emoji: '☀️' },
  { key: 'agreeableness', label: 'Agradabilidade', emoji: '💚' },
  { key: 'emotionalStability', label: 'Est. Emocional', emoji: '🌊' },
] as const;

type DimensionKey = typeof DIMENSION_KEYS[number]['key'];

const classificationLabel: Record<string, string> = {
  very_low: 'Muito Baixo',
  low: 'Baixo',
  moderate: 'Moderado',
  high: 'Elevado',
  very_high: 'Muito Elevado',
};

interface ComparisonRadarProps {
  profiles: BigFiveProfile[];
}

function ComparisonRadar({ profiles }: ComparisonRadarProps) {
  const data = DIMENSION_KEYS.map(({ key, label }) => {
    const entry: Record<string, string | number> = { dimension: label };
    profiles.forEach((p, i) => {
      entry[`profile_${i}`] = Math.round(p.dimensions[key as DimensionKey].score);
    });
    return entry;
  });

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-sm min-w-[160px]">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium truncate max-w-[100px]">
                {entry.name}
              </span>
              <span className="font-bold">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickCount={5}
          />
          {profiles.map((p, i) => (
            <Radar
              key={p.id}
              name={p.name.split(' ')[0]}
              dataKey={`profile_${i}`}
              stroke={PROFILE_COLORS[i % PROFILE_COLORS.length]}
              fill={PROFILE_COLORS[i % PROFILE_COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ fill: PROFILE_COLORS[i % PROFILE_COLORS.length], r: 4 }}
            />
          ))}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const DIMENSION_COLORS_MAP: Record<string, string> = {
  openness: '#6366f1',
  conscientiousness: '#f59e0b',
  extraversion: '#10b981',
  agreeableness: '#ec4899',
  emotionalStability: '#3b82f6',
};

const SUBFACET_DIMENSION_ORDER = ['emotionalStability', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'] as const;

function SubfacetComparisonTable({ profiles }: { profiles: BigFiveProfile[] }) {
  const ipip120Profiles = profiles.filter(p => p.testVersion === 'ipip120' && p.ipip120Data?.subfacets?.length);
  if (ipip120Profiles.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="font-medium">Comparação de subfacetas requer</p>
        <p className="text-sm mt-1">pelo menos 2 perfis com dados IPIP-NEO-120 selecionados</p>
        <p className="text-xs mt-2 text-muted-foreground/60">
          {ipip120Profiles.length === 1 ? '1 perfil IPIP-120 selecionado — selecione mais 1' : 'Nenhum perfil IPIP-120 selecionado'}
        </p>
      </div>
    );
  }

  // Coletar todas as subfacetas únicas
  const allSubfacetKeys = Array.from(
    new Set(ipip120Profiles.flatMap(p => p.ipip120Data!.subfacets.map((s: IPIP120SubfacetScore) => s.key)))
  );

  return (
    <div className="space-y-6">
      {SUBFACET_DIMENSION_ORDER.map(dimKey => {
        const dimSubfacetKeys = allSubfacetKeys.filter(k => {
          const s = ipip120Profiles[0].ipip120Data!.subfacets.find((sf: IPIP120SubfacetScore) => sf.key === k);
          return s?.dimension === dimKey;
        });
        if (dimSubfacetKeys.length === 0) return null;
        const dimInfo = DIMENSION_KEYS.find(d => d.key === dimKey);
        const dimColor = DIMENSION_COLORS_MAP[dimKey] || '#6366f1';
        return (
          <div key={dimKey}>
            <div
              className="text-sm font-bold px-3 py-2 rounded-t-md text-white mb-0"
              style={{ backgroundColor: dimColor }}
            >
              {dimInfo?.emoji} {dimInfo?.label}
            </div>
            <div className="overflow-x-auto border border-t-0 rounded-b-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground w-40">Subfaceta</th>
                    {ipip120Profiles.map((p, i) => (
                      <th key={p.id} className="text-center py-2 px-3 font-medium" style={{ color: PROFILE_COLORS[i % PROFILE_COLORS.length] }}>
                        {p.name.split(' ')[0]}
                      </th>
                    ))}
                    {ipip120Profiles.length === 2 && (
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Δ Diff</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dimSubfacetKeys.map(sfKey => {
                    const scores = ipip120Profiles.map(p => {
                      const sf = p.ipip120Data!.subfacets.find((s: IPIP120SubfacetScore) => s.key === sfKey);
                      return sf ? sf.score : null;
                    });
                    const label = ipip120Profiles[0].ipip120Data!.subfacets.find((s: IPIP120SubfacetScore) => s.key === sfKey)?.label ?? sfKey;
                    const diff = scores.length === 2 && scores[0] != null && scores[1] != null
                      ? Math.abs(scores[0] - scores[1])
                      : null;
                    return (
                      <tr key={sfKey} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-2 px-3 font-medium text-xs">{label}</td>
                        {scores.map((score, i) => {
                          if (score == null) return <td key={i} className="py-2 px-3 text-center text-muted-foreground text-xs">—</td>;
                          const barColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
                          return (
                            <td key={i} className="py-2 px-3">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-sm" style={{ color: barColor }}>{score}%</span>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: barColor }} />
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        {ipip120Profiles.length === 2 && diff != null && (
                          <td className="py-2 px-3 text-center">
                            <span className={`text-xs font-bold ${diff >= 20 ? 'text-destructive' : diff >= 10 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                              {diff >= 20 ? '⚠️' : diff >= 10 ? '~' : '≈'} {diff}%
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Compare() {
  const { data: dbProfiles = [] } = trpc.profiles.list.useQuery();
  const profiles = dbProfiles as unknown as BigFiveProfile[];
  const [, setLocation] = useLocation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dimensions' | 'subfacets'>('dimensions');

  const selectedProfiles = selectedIds
    .map((id) => profiles.find((p) => p.id === id))
    .filter(Boolean) as BigFiveProfile[];

  const toggleProfile = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Comparação de Perfis
            </h1>
            <p className="text-muted-foreground">
              Selecione até 5 respondentes para comparar lado a lado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seleção de Respondentes */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Selecionar Respondentes
                <Badge variant="secondary">{selectedIds.length}/5</Badge>
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum respondente disponível
                  </p>
                ) : (
                  profiles.map((p, i) => {
                    const isSelected = selectedIds.includes(p.id);
                    const colorIdx = selectedIds.indexOf(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleProfile(p.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PROFILE_COLORS[colorIdx % PROFILE_COLORS.length] }}
                            />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Área de Comparação */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProfiles.length < 2 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  Selecione pelo menos 2 respondentes para comparar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProfiles.length === 1
                    ? 'Selecione mais 1 respondente'
                    : 'Selecione 2 a 5 respondentes à esquerda'}
                </p>
              </Card>
            ) : (
              <>
                {/* Abas de navegação */}
                <div className="flex gap-2 border-b pb-0">
                  <button
                    onClick={() => setActiveTab('dimensions')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'dimensions'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    📊 Dimensões
                  </button>
                  <button
                    onClick={() => setActiveTab('subfacets')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'subfacets'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🔬 Subfacetas IPIP-120
                  </button>
                </div>

                {activeTab === 'dimensions' && (
                <>
                {/* Radar Sobreposto */}
                <Card className="p-6">
                  <h2 className="font-semibold mb-1">Radar Comparativo</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sobreposição das 5 dimensões de personalidade
                  </p>
                  <ComparisonRadar profiles={selectedProfiles} />
                </Card>

                {/* Tabela Comparativa */}
                <Card className="p-6">
                  <h2 className="font-semibold mb-4">Comparação por Dimensão</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                            Dimensão
                          </th>
                          {selectedProfiles.map((p, i) => (
                            <th
                              key={p.id}
                              className="text-center py-2 px-3 font-medium"
                              style={{ color: PROFILE_COLORS[i % PROFILE_COLORS.length] }}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: PROFILE_COLORS[i % PROFILE_COLORS.length] }}
                                />
                                <span className="truncate max-w-[80px]">
                                  {p.name.split(' ')[0]}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DIMENSION_KEYS.map(({ key, label, emoji }) => (
                          <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-3 pr-4">
                              <span className="mr-2">{emoji}</span>
                              <span className="font-medium">{label}</span>
                            </td>
                            {selectedProfiles.map((p, i) => {
                              const dim = p.dimensions[key as DimensionKey];
                              const score = Math.round(dim.score);
                              const color =
                                score >= 70
                                  ? '#10b981'
                                  : score >= 40
                                  ? '#f59e0b'
                                  : '#ef4444';
                              return (
                                <td key={p.id} className="py-3 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="font-bold" style={{ color }}>
                                      {score}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {classificationLabel[dim.classification]}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Destaques por Respondente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProfiles.map((p, i) => {
                    const dims = Object.entries(p.dimensions) as [DimensionKey, typeof p.dimensions.openness][];
                    const strongest = dims.reduce((a, b) => (a[1].score > b[1].score ? a : b));
                    const weakest = dims.reduce((a, b) => (a[1].score < b[1].score ? a : b));
                    return (
                      <Card
                        key={p.id}
                        className="p-4 border-l-4"
                        style={{ borderLeftColor: PROFILE_COLORS[i % PROFILE_COLORS.length] }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PROFILE_COLORS[i % PROFILE_COLORS.length] }}
                          />
                          <h3 className="font-semibold truncate">{p.name}</h3>
                          <button
                            onClick={() => toggleProfile(p.id)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Traço mais forte:</span>
                            <span className="font-medium text-emerald-600">
                              {strongest[1].emoji} {strongest[1].label} ({Math.round(strongest[1].score)}%)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Traço mais baixo:</span>
                            <span className="font-medium text-amber-600">
                              {weakest[1].emoji} {weakest[1].label} ({Math.round(weakest[1].score)}%)
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setLocation(`/profile/${p.id}`)}
                          >
                            Ver Perfil Completo
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                </>
                )}

                {activeTab === 'subfacets' && (
                  <Card className="p-6">
                    <h2 className="font-semibold mb-1">Comparação de Subfacetas IPIP-NEO-120</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Escores reais das 30 subfacetas para perfis com o instrumento completo
                    </p>
                    <SubfacetComparisonTable profiles={selectedProfiles} />
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
