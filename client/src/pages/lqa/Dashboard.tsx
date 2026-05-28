import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, RefreshCw, AlertCircle, LogOut, BarChart3, Clock, ChevronRight, Shield, Zap, Bell } from 'lucide-react';
import { useLQAData } from '@/lib/lqa/useLQAData';
import { useAlertasLQA } from '@/lib/lqa/useAlertasLQA';
import { MG_COLORS, BLANCHARD_LABELS } from '@/lib/lqa/types';

interface DashboardProps {
  onLogout: () => void;
}

export default function LQADashboard({ onLogout }: DashboardProps) {
  const [, setLocation] = useLocation();
  const { data, loading, error, lastSync, refetch, syncFromSheets, syncing, syncResult } = useLQAData();
  const { totalNovos: totalAlertasNovos } = useAlertasLQA();

  const profiles = data ? Object.entries(data) : [];

  const totalGestores = profiles.length;
  const mgDistribuicao: Record<string, number> = {};
  const blanchardDistribuicao: Record<string, number> = {};
  const alertas: { nome: string; alerta: string }[] = [];

  profiles.forEach(([, p]) => {
    const mg = p.classificacao?.macrogrupo;
    if (mg) mgDistribuicao[mg] = (mgDistribuicao[mg] || 0) + 1;

    const bl = p.classificacao?.blanchard?.quadrante;
    if (bl) blanchardDistribuicao[bl] = (blanchardDistribuicao[bl] || 0) + 1;

    const consolidado = p.classificacao?.lqa_consolidado;
    if (consolidado?.risco_ativado) {
      alertas.push({
        nome: p.respondente.nome,
        alerta: consolidado.risco_ativado.substring(0, 120) + '...',
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LQA Dashboard</h1>
              <p className="text-xs text-gray-500">Leadership Quality Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSync && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Sync: {lastSync.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/lqa/alertas')}
              className="relative text-amber-700 border-amber-200 hover:bg-amber-50 text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              Alertas
              {totalAlertasNovos > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {totalAlertasNovos}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/lqa/motor')}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-medium"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Motor — Inbox
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncFromSheets}
              disabled={syncing || loading}
              className="text-green-700 border-green-200 hover:bg-green-50 text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Erro */}
        {error && (
          <Card className="bg-red-50 border-red-200 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </Card>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalGestores}</p>
                <p className="text-xs text-gray-500">Gestores avaliados</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(mgDistribuicao).length}</p>
                <p className="text-xs text-gray-500">Macrogrupos ativos</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{alertas.length}</p>
                <p className="text-xs text-gray-500">Alertas de risco</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {blanchardDistribuicao['S1'] || 0}
                </p>
                <p className="text-xs text-gray-500">Gestores em S1</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Distribuição por Macrogrupo */}
        {Object.keys(mgDistribuicao).length > 0 && (
          <Card className="bg-white border-gray-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Distribuição por Macrogrupo</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(mgDistribuicao).sort().map(([mg, count]) => (
                <div
                  key={mg}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ backgroundColor: `${MG_COLORS[mg]}15`, border: `1px solid ${MG_COLORS[mg]}50` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MG_COLORS[mg] }} />
                  <span className="text-sm font-medium" style={{ color: MG_COLORS[mg] }}>MG {mg}</span>
                  <span className="text-xs text-gray-500">{count} gestor{count > 1 ? 'es' : ''}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Alertas */}
        {alertas.length > 0 && (
          <Card className="bg-white border-amber-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-amber-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertas de Risco Ativo
            </h2>
            <div className="space-y-3">
              {alertas.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">{a.nome}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.alerta}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Lista de Gestores */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gestores Avaliados
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="ml-3 text-gray-500">Carregando dados...</span>
            </div>
          ) : profiles.length === 0 ? (
            <Card className="bg-white border-gray-200 p-12 text-center shadow-sm">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum gestor avaliado ainda.</p>
              <p className="text-gray-400 text-sm mt-1">Os dados serão carregados automaticamente quando houver respostas na planilha.</p>
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
                    className="bg-white border-gray-200 p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group shadow-sm"
                    onClick={() => setLocation(`/lqa/perfil/${respId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                          style={{ backgroundColor: `${mgColor}20`, border: `2px solid ${mgColor}50` }}
                        >
                          <span style={{ color: mgColor }}>
                            {profile.respondente.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {profile.respondente.nome}
                          </h3>
                          <p className="text-xs text-gray-500">{profile.respondente.email}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {mg && (
                              <Badge
                                className="text-xs px-2 py-0"
                                style={{ backgroundColor: `${mgColor}15`, color: mgColor, border: `1px solid ${mgColor}40` }}
                              >
                                MG {mg}
                              </Badge>
                            )}
                            {cl?.perfil_nome && (
                              <span className="text-xs text-gray-500">{cl.perfil_nome}</span>
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
                            <p className="text-xs text-gray-400">{blInfo.label}</p>
                          </div>
                        )}
                        {cl?.confianca && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              cl.confianca === 'alta' ? 'border-emerald-400 text-emerald-700 bg-emerald-50' :
                              cl.confianca === 'media' ? 'border-amber-400 text-amber-700 bg-amber-50' :
                              'border-red-400 text-red-700 bg-red-50'
                            }`}
                          >
                            {cl.confianca === 'alta' ? 'Alta confiança' :
                             cl.confianca === 'media' ? 'Confiança média' : 'Baixa confiança'}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
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
