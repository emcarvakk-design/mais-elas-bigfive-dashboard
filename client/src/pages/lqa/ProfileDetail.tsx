import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, RefreshCw, Brain, Target, Layers,
  Zap, BarChart3, Star, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { useLQAData } from '@/lib/lqa/useLQAData';
import { MG_COLORS, BLANCHARD_LABELS, DILTS_LEVELS } from '@/lib/lqa/types';

type TabKey = 'bigfive' | 'blanchard' | 'dilts' | 'metaprogramas' | 'fpc' | 'consolidado';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'bigfive', label: 'Big Five', icon: <Brain className="w-4 h-4" /> },
  { key: 'blanchard', label: 'Blanchard SLII', icon: <Target className="w-4 h-4" /> },
  { key: 'dilts', label: 'Dilts', icon: <Layers className="w-4 h-4" /> },
  { key: 'metaprogramas', label: 'Meta-Programas', icon: <Zap className="w-4 h-4" /> },
  { key: 'fpc', label: 'FPC', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'consolidado', label: 'LQA Consolidado', icon: <Shield className="w-4 h-4" /> },
];

function InfoCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-white" style={color ? { color } : {}}>
        {value || '—'}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

export default function LQAProfileDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/lqa/perfil/:id');
  const [activeTab, setActiveTab] = useState<TabKey>('consolidado');
  const [showEvidencias, setShowEvidencias] = useState(false);
  const { data, loading } = useLQAData();

  if (!match) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="ml-3 text-slate-400">Carregando perfil...</span>
      </div>
    );
  }

  const respId = params?.id ?? '';
  const profile = data?.[respId];

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-800 p-8 text-center">
          <p className="text-slate-400 mb-4">Perfil não encontrado</p>
          <Button onClick={() => setLocation('/lqa')} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </Card>
      </div>
    );
  }

  const cl = profile.classificacao;
  const mg = cl?.macrogrupo;
  const mgColor = mg ? MG_COLORS[mg] : '#6366f1';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/lqa')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="text-right">
            <p className="text-xs text-slate-500">LQA Dashboard · Confidencial</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Perfil Header */}
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ backgroundColor: `${mgColor}25`, border: `2px solid ${mgColor}50` }}
            >
              <span style={{ color: mgColor }}>
                {profile.respondente.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{profile.respondente.nome}</h1>
                  <p className="text-sm text-slate-400">{profile.respondente.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Assessment: {new Date(profile.respondente.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mg && (
                    <Badge
                      className="text-sm px-3 py-1"
                      style={{ backgroundColor: `${mgColor}20`, color: mgColor, border: `1px solid ${mgColor}40` }}
                    >
                      MG {mg} — {cl.macrogrupo_nome?.split('—')[1]?.trim() || ''}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-sm px-3 py-1 ${
                      cl?.confianca === 'alta' ? 'border-emerald-700 text-emerald-400' :
                      cl?.confianca === 'media' ? 'border-amber-700 text-amber-400' :
                      'border-red-700 text-red-400'
                    }`}
                  >
                    Confiança {cl?.confianca}
                  </Badge>
                </div>
              </div>

              {/* Evidências colapsáveis */}
              {cl?.evidencias_chave?.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowEvidencias(!showEvidencias)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showEvidencias ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showEvidencias ? 'Ocultar' : 'Ver'} evidências da classificação
                  </button>
                  {showEvidencias && (
                    <div className="mt-2 space-y-1">
                      {cl.evidencias_chave.map((ev, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                          {ev}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* ABA 1 — BIG FIVE */}
          {activeTab === 'bigfive' && (
            <Card className="bg-slate-900 border-slate-800 p-6">
              <SectionTitle>Big Five — Hipótese de Perfil</SectionTitle>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {cl?._biblioteca ? (
                  <span>
                    <strong className="text-white">Hipótese Big Five:</strong>{' '}
                    {cl._biblioteca?.forcas ? '' : ''}
                    {String(cl?._biblioteca?.forcas || '')}
                  </span>
                ) : null}
              </p>
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Hipótese baseada no perfil LQA</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {/* Extrair do campo Big Five Hipótese da biblioteca */}
                  {cl?.perfil_codigo && (
                    <span>
                      O perfil <strong className="text-indigo-400">{cl.perfil_codigo} — {cl.perfil_nome}</strong> está
                      associado a um padrão específico de traços Big Five. A análise completa das facetas
                      requer o assessment IPIP-120 complementar.
                    </span>
                  )}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard label="Forças identificadas" value={cl?._biblioteca?.forcas || '—'} />
                <InfoCard label="Riscos do perfil" value={cl?._biblioteca?.riscos || '—'} />
                <InfoCard label="Impacto na equipe" value={cl?._biblioteca?.impacto_equipe || '—'} />
                <InfoCard label="Frases típicas" value={cl?._biblioteca?.frases_tipicas || '—'} />
              </div>
            </Card>
          )}

          {/* ABA 2 — BLANCHARD */}
          {activeTab === 'blanchard' && (
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
              <div>
                <SectionTitle>Blanchard SLII — Nível de Maturidade</SectionTitle>
                {cl?.blanchard && (
                  <>
                    {/* Quadrante visual */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {(['S4', 'S3', 'S1', 'S2'] as const).map((q) => {
                        const isActive = cl.blanchard.quadrante === q;
                        const info = BLANCHARD_LABELS[q];
                        return (
                          <div
                            key={q}
                            className={`p-4 rounded-xl border transition-all ${
                              isActive
                                ? 'border-2'
                                : 'border border-slate-700 opacity-40'
                            }`}
                            style={isActive ? {
                              backgroundColor: `${info.color}15`,
                              borderColor: info.color,
                            } : {}}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold" style={isActive ? { color: info.color } : { color: '#64748b' }}>
                                {q}
                              </span>
                              <span className="text-xs text-slate-400">{info.label}</span>
                              {isActive && <CheckCircle className="w-4 h-4 ml-auto" style={{ color: info.color }} />}
                            </div>
                            <p className="text-xs text-slate-500">{info.desc}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        label="Estilo de liderança recomendado"
                        value={cl.blanchard.estilo_recomendado}
                        color={BLANCHARD_LABELS[cl.blanchard.quadrante]?.color}
                      />
                      <InfoCard label="Nível de competência" value={cl.blanchard.nivel_competencia} />
                      <InfoCard label="Nível de comprometimento" value={cl.blanchard.nivel_comprometimento} />
                      <InfoCard label="Justificativa" value={cl.blanchard.justificativa} />
                    </div>

                    {cl._blanchard_biblioteca && (
                      <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50">
                        <p className="text-xs text-indigo-400 font-medium mb-2">Padrão central (biblioteca LQA)</p>
                        <p className="text-sm text-slate-300">{cl._blanchard_biblioteca.padrao}</p>
                        <p className="text-xs text-slate-500 mt-2">{cl._blanchard_biblioteca.porque}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          )}

          {/* ABA 3 — DILTS */}
          {activeTab === 'dilts' && (
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
              <SectionTitle>Dilts — Níveis Lógicos de PNL</SectionTitle>
              {cl?.dilts && (
                <>
                  {/* Pirâmide visual */}
                  <div className="space-y-2">
                    {[...DILTS_LEVELS].reverse().map((nivel, i) => {
                      const isDominante = nivel === cl.dilts.nivel_dominante;
                      const isGap = nivel === cl.dilts.nivel_gap;
                      const width = `${50 + (i * 7)}%`;
                      return (
                        <div key={nivel} className="flex items-center gap-3">
                          <div
                            className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                              isDominante ? 'text-white' : isGap ? 'text-white' : 'text-slate-400'
                            }`}
                            style={{
                              width,
                              backgroundColor: isDominante ? '#6366f1' : isGap ? '#ef444440' : '#1e293b',
                              border: isDominante ? '2px solid #6366f1' : isGap ? '2px solid #ef4444' : '1px solid #334155',
                            }}
                          >
                            {nivel}
                          </div>
                          <div className="flex gap-2">
                            {isDominante && (
                              <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-700 text-xs">
                                Opera aqui
                              </Badge>
                            )}
                            {isGap && (
                              <Badge className="bg-red-600/20 text-red-400 border-red-700 text-xs">
                                Gap
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InfoCard label="Nível dominante (onde opera)" value={cl.dilts.nivel_dominante} color="#6366f1" />
                    <InfoCard label="Nível de gap" value={cl.dilts.nivel_gap} color="#ef4444" />
                    <div className="md:col-span-2">
                      <InfoCard label="Descrição" value={cl.dilts.descricao} />
                    </div>
                    <div className="md:col-span-2">
                      <InfoCard label="Impacto na liderança" value={cl.dilts.impacto_lideranca} />
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* ABA 4 — META-PROGRAMAS */}
          {activeTab === 'metaprogramas' && (
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
              <SectionTitle>Meta-Programas — Padrões de Processamento</SectionTitle>
              {cl?.meta_programas && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Aproximação / Evitação', value: cl.meta_programas.aproximacao_evitacao },
                      { label: 'Interno / Externo', value: cl.meta_programas.interno_externo },
                      { label: 'Opções / Procedimentos', value: cl.meta_programas.opcoes_procedimentos },
                      { label: 'Global / Detalhe', value: cl.meta_programas.global_detalhe },
                      { label: 'Proativo / Reativo', value: cl.meta_programas.proativo_reativo },
                    ].map((item) => {
                      const isMisto = item.value === 'Misto';
                      return (
                        <div key={item.label} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-2">{item.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">{item.value}</span>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: isMisto ? '#f59e0b' :
                                  ['Aproximação', 'Interno', 'Opções', 'Global', 'Proativo'].includes(item.value)
                                    ? '#10b981' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-900/50">
                    <p className="text-xs text-indigo-400 font-medium mb-2">Padrão dominante</p>
                    <p className="text-sm font-semibold text-white mb-3">{cl.meta_programas.padrao_dominante}</p>
                    <p className="text-xs text-slate-400 font-medium mb-1">Implicação operacional</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{cl.meta_programas.implicacao_operacional}</p>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* ABA 5 — FPC */}
          {activeTab === 'fpc' && (
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
              <SectionTitle>FPC — Perfil Comportamental</SectionTitle>
              {cl?.fpc && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Dimensão dominante</p>
                    <p className="text-lg font-bold text-white">{cl.fpc.dimensao_dominante}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="Padrão dominante" value={cl.fpc.padrao_dominante} />
                    <InfoCard label="Força central" value={cl.fpc.forca_central} color="#10b981" />
                    <div className="md:col-span-2">
                      <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40">
                        <p className="text-xs text-red-400 font-medium mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Risco operacional
                        </p>
                        <p className="text-sm text-slate-300">{cl.fpc.risco_operacional}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ABA 6 — LQA CONSOLIDADO */}
          {activeTab === 'consolidado' && (
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
              <SectionTitle>LQA Consolidado — Visão Integrada</SectionTitle>
              {cl?.lqa_consolidado && (
                <div className="space-y-4">
                  {/* Perfil resumo */}
                  <div className="p-5 rounded-xl border-2 border-indigo-700/50 bg-indigo-950/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${mgColor}25`, color: mgColor }}
                      >
                        {cl.perfil_codigo}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{cl.perfil_nome}</p>
                        <p className="text-xs text-slate-400">{cl.macrogrupo_nome}</p>
                      </div>
                    </div>
                    {cl.perfil_secundario && (
                      <p className="text-xs text-slate-500">
                        Perfil secundário: <span className="text-slate-400">{cl.perfil_secundario}</span>
                      </p>
                    )}
                  </div>

                  {/* Gap, Força, Risco */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40">
                      <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Gap prioritário
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">{cl.lqa_consolidado.gap_prioritario}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
                      <p className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3" /> Força dominante
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">{cl.lqa_consolidado.forca_dominante}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/40">
                      <p className="text-xs text-amber-400 font-medium mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Risco ativado
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">{cl.lqa_consolidado.risco_ativado}</p>
                    </div>
                  </div>

                  {/* Ação e Evidência */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                      <p className="text-xs text-indigo-400 font-medium mb-2">Ação inicial sugerida</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{cl.lqa_consolidado.acao_inicial}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                      <p className="text-xs text-slate-400 font-medium mb-2">Evidência esperada de evolução</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{cl.lqa_consolidado.evidencia_esperada}</p>
                    </div>
                  </div>

                  {/* Trilha específica */}
                  {cl._biblioteca?.trilha_especifica && (
                    <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
                      <p className="text-xs text-slate-400 font-medium mb-3">Trilha específica de desenvolvimento</p>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {cl._biblioteca.trilha_especifica}
                      </p>
                    </div>
                  )}

                  {/* Nota metodológica — apenas para Erica e Monica */}
                  {cl.lqa_consolidado.nota_metodologica && (
                    <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/40">
                      <p className="text-xs text-purple-400 font-medium mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Nota metodológica (uso interno)
                      </p>
                      <p className="text-sm text-slate-400 leading-relaxed italic">
                        {cl.lqa_consolidado.nota_metodologica}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
