import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Eye,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { useAlertasLQA, AlertaLQA, TIPO_LABEL, TIPO_COR } from '@/lib/lqa/useAlertasLQA';

// ─── Card de Alerta Individual ────────────────────────────────────────────────

function AlertaCard({ alerta, onVisto, onEmAnalise, onResolvido }: {
  alerta: AlertaLQA;
  onVisto: (id: string) => void;
  onEmAnalise: (id: string) => void;
  onResolvido: (id: string, notas?: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const [notas, setNotas] = useState('');
  const [confirmandoResolucao, setConfirmandoResolucao] = useState(false);

  const cor = TIPO_COR[alerta.tipo] || 'amber';
  const label = TIPO_LABEL[alerta.tipo] || alerta.tipo;

  const corMap: Record<string, { bg: string; border: string; badge: string; text: string }> = {
    amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800',  text: 'text-amber-800' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-800',      text: 'text-red-800' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', text: 'text-orange-800' },
    gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-700',    text: 'text-gray-700' },
  };
  const c = corMap[cor] || corMap.amber;

  const dataFormatada = new Date(alerta.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  });

  return (
    <Card className={`${c.bg} ${c.border} border p-5 shadow-sm`}>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${c.text}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{alerta.nome_gestor}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{label}</span>
              {alerta.status === 'novo' && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">Novo</span>
              )}
              {alerta.status === 'em_analise' && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Em análise</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              MG {alerta.macrogrupo} · {dataFormatada}
              {alerta.semanas_consecutivas > 0 && ` · ${alerta.semanas_consecutivas} semanas consecutivas`}
            </p>
            <p className={`text-sm mt-1.5 ${c.text}`}>{alerta.descricao}</p>
          </div>
        </div>
        <button
          onClick={() => setExpandido(!expandido)}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          {/* Comportamento observado */}
          {alerta.comportamento_observado && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Comportamento observado</p>
              <p className="text-sm text-gray-700">{alerta.comportamento_observado}</p>
            </div>
          )}

          {/* Prioridades abertas */}
          {alerta.prioridades_abertas && alerta.prioridades_abertas.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Prioridades em aberto</p>
              <div className="space-y-1.5">
                {alerta.prioridades_abertas.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                      {p.ordem}- {p.descricao}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      p.semanas >= 3 ? 'bg-red-100 text-red-700' :
                      p.semanas >= 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.semanas} sem.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campo de notas para resolução */}
          {confirmandoResolucao && (
            <div className="space-y-2">
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Notas sobre a resolução (opcional)..."
                className="w-full text-sm border border-gray-200 rounded-lg p-2.5 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => { onResolvido(alerta.id, notas); setConfirmandoResolucao(false); }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Confirmar resolução
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmandoResolucao(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Ações */}
          {!confirmandoResolucao && (
            <div className="flex gap-2 flex-wrap">
              {alerta.status === 'novo' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVisto(alerta.id)}
                  className="text-xs border-gray-300"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Marcar como visto
                </Button>
              )}
              {(alerta.status === 'novo' || alerta.status === 'visto') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEmAnalise(alerta.id)}
                  className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Em análise
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmandoResolucao(true)}
                className="text-xs border-green-300 text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Resolver
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function LQAAlertas() {
  const [, setLocation] = useLocation();
  const { alertas, loading, error, refetch, marcarVisto, marcarEmAnalise, marcarResolvido, totalNovos } = useAlertasLQA();

  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('ativos');

  const alertasFiltrados = alertas.filter(a => {
    const passaTipo = filtroTipo === 'todos' || a.tipo === filtroTipo;
    const passaStatus =
      filtroStatus === 'todos' ||
      (filtroStatus === 'ativos' && (a.status === 'novo' || a.status === 'em_analise')) ||
      a.status === filtroStatus;
    return passaTipo && passaStatus;
  });

  const totalPorTipo = alertas.reduce<Record<string, number>>((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/lqa')}
              className="text-gray-500 hover:text-gray-700 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Alertas do Motor</h1>
                <p className="text-xs text-gray-500">Padrões e desvios detectados</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalNovos > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                {totalNovos} novo{totalNovos > 1 ? 's' : ''}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="text-gray-600 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Erro */}
        {error && (
          <Card className="bg-red-50 border-red-200 p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </Card>
        )}

        {/* Resumo por tipo */}
        {alertas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalPorTipo).map(([tipo, count]) => {
              const cor = TIPO_COR[tipo as keyof typeof TIPO_COR] || 'gray';
              const corMap: Record<string, string> = {
                amber: 'bg-amber-50 border-amber-200 text-amber-800',
                red: 'bg-red-50 border-red-200 text-red-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800',
                gray: 'bg-gray-50 border-gray-200 text-gray-700',
              };
              return (
                <Card
                  key={tipo}
                  className={`${corMap[cor] || corMap.gray} border p-4 cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? 'todos' : tipo)}
                >
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-0.5">{TIPO_LABEL[tipo as keyof typeof TIPO_LABEL] || tipo}</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-500 self-center">Filtrar:</span>
          {['ativos', 'novo', 'em_analise', 'todos'].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filtroStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {s === 'ativos' ? 'Ativos' : s === 'novo' ? 'Novos' : s === 'em_analise' ? 'Em análise' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Lista de alertas */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : alertasFiltrados.length === 0 ? (
          <Card className="bg-white border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">
              {alertas.length === 0
                ? 'Nenhum alerta ativo no momento'
                : 'Nenhum alerta para os filtros selecionados'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {alertas.length === 0
                ? 'O motor vai criar alertas automaticamente quando detectar padrões recorrentes'
                : 'Ajuste os filtros para ver outros alertas'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {alertasFiltrados.map(alerta => (
              <AlertaCard
                key={alerta.id}
                alerta={alerta}
                onVisto={marcarVisto}
                onEmAnalise={marcarEmAnalise}
                onResolvido={marcarResolvido}
              />
            ))}
          </div>
        )}

        {/* Instrução do piloto */}
        <Card className="bg-indigo-50 border-indigo-200 p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-indigo-800 mb-1">Como usar os alertas</p>
              <p className="text-xs text-indigo-700">
                O motor cria alertas automaticamente quando um gestor tem prioridades abertas por 3 semanas consecutivas.
                Marque como <strong>Em análise</strong> quando for conversar com o gestor, e <strong>Resolver</strong>
                após a conversa — com suas notas sobre o desvio observado.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
