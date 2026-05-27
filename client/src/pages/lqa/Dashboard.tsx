import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, AlertCircle, LogOut, BarChart3, Clock, ChevronRight, Shield } from 'lucide-react';
import { useLQAData } from '@/lib/lqa/useLQAData';
import { MG_COLORS, BLANCHARD_LABELS } from '@/lib/lqa/types';

interface DashboardProps {
  onLogout: () => void;
}

export default function LQADashboard({ onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { data, loading, error, lastSync, refetch } = useLQAData();

  const profiles = data ? Object.entries(data) : [];

  // Estatísticas gerais
  const totalGestores = profiles.length;
  const mgDistribuicao: Record<string, number> = {};
  const blanchardDistribuicao: Record<string, number> = {};
  const alertas: { nome: string; alerta: string }[] = [];

  profiles.forEach(([, p]) => {
    const mg = p.classificacao?.macrogrupo;
    if (mg) mgDistribuicao[mg] = (mgDistribuicao[mg] || 0) + 1;

    const bl = p.classificacao?.blanchard?.quadrante;
    if (bl) blanchardDistribuicao[bl] = (blanchardDistribuicao[bl] || 0) + 1;

    // Alertas: combinações de risco
    const consolidado = p.classificacao?.lqa_consolidado;
    if (consolidado?.risco_ativado) {
      alertas.push({
        nome: p.respondente.nome,
        alerta: consolidado.risco_ativado.substring(0, 120) + '...',
      });
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">LQA Dashboard</h1>
              <p className="text-xs text-slate-400">Leadership Quality Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSync && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Sync: {lastSync.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Erro */}
        {error && (
          <Card className="bg-red-950 border-red-800 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalGestores}</p>
                <p className="text-xs text-slate-400">Gestores avaliados</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Object.keys(mgDistribuicao).length}</p>
                <p className="text-xs text-slate-400">Macrogrupos ativos</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{alertas.length}</p>
                <p className="text-xs text-slate-400">Alertas de risco</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {blanchardDistribuicao['S1'] || 0}
                </p>
                <p className="text-xs text-slate-400">Gestores em S1</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Distribuição por Macrogrupo */}
        {Object.keys(mgDistribuicao).length > 0 && (
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Distribuição por Macrogrupo</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(mgDistribuicao).sort().map(([mg, count]) => (
                <div
                  key={mg}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${MG_COLORS[mg]}20`, border: `1px solid ${MG_COLORS[mg]}40` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MG_COLORS[mg] }} />
                  <span className="text-sm font-medium" style={{ color: MG_COLORS[mg] }}>MG {mg}</span>
                  <span className="text-xs text-slate-400">{count} gestor{count > 1 ? 'es' : ''}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <Card className="bg-slate-900 border-amber-900/50 p-6">
            <h2 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertas de Risco Ativo
            </h2>
            <div className="space-y-3">
              {alertas.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/30 border border-amber-900/30">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">{a.nome}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.alerta}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lista de Gestores */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gestores Avaliados
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="ml-3 text-slate-400">Carregando dados...</span>
            </div>
          ) : profiles.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800 p-12 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum gestor avaliado ainda.</p>
              <p className="text-slate-600 text-sm mt-1">Os dados serão carregados automaticamente quando houver respostas na planilha.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {profiles.map(([respId, profile]) => {
                const cl = profile.classificacao;
                const mg = cl?.macrogrupo;
                const mgColor = mg ? MG_COLORS[mg] : '#6366f1';
                const blanchard = cl?.blanchard?.quadrante;
                const blInfo = blanchard ? BLANCHARD_LABELS[blanchard] : null;

                return (
                  <Card
                    key={respId}
                    className="bg-slate-900 border-slate-800 p-5 cursor-pointer hover:border-indigo-700 transition-all group"
                    onClick={() => setLocation(`/lqa/perfil/${respId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Avatar com cor do MG */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ backgroundColor: `${mgColor}30`, border: `2px solid ${mgColor}60` }}
                        >
                          <span style={{ color: mgColor }}>
                            {profile.respondente.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {profile.respondente.nome}
                          </h3>
                          <p className="text-xs text-slate-400">{profile.respondente.email}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {mg && (
                              <Badge
                                className="text-xs px-2 py-0"
                                style={{ backgroundColor: `${mgColor}20`, color: mgColor, border: `1px solid ${mgColor}40` }}
                              >
                                MG {mg}
                              </Badge>
                            )}
                            {cl?.perfil_nome && (
                              <span className="text-xs text-slate-400">{cl.perfil_nome}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {blInfo && (
                          <div className="text-right hidden md:block">
                            <p className="text-xs font-medium" style={{ color: blInfo.color }}>
                              Blanchard {blanchard}
                            </p>
                            <p className="text-xs text-slate-500">{blInfo.label}</p>
                          </div>
                        )}
                        {cl?.confianca && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              cl.confianca === 'alta' ? 'border-emerald-700 text-emerald-400' :
                              cl.confianca === 'media' ? 'border-amber-700 text-amber-400' :
                              'border-red-700 text-red-400'
                            }`}
                          >
                            {cl.confianca === 'alta' ? 'Alta confiança' :
                             cl.confianca === 'media' ? 'Confiança média' : 'Baixa confiança'}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
