import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw, Inbox, Copy, Check, Send, Trash2,
  Clock, User, MessageSquare, ChevronDown, ChevronUp,
  AlertCircle, Zap, ArrowLeft, Bot, Pencil, Eye, StickyNote
} from 'lucide-react';
import { useMotorQueue, TIPO_LABELS, MotorQueueItem } from '@/lib/lqa/useMotorQueue';

// ─── Cores por tipo de mensagem ──────────────────────────────────────────────
const TIPO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  abertura_semana:   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  mapa_semana:       { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  checkout_analise:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  checkout_pergunta: { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
  microlearning:     { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  encerramento:      { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
};
function getTipoColor(tipo: string) {
  return TIPO_COLORS[tipo] ?? { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Card individual de mensagem ─────────────────────────────────────────────
function QueueCard({ item, onAprovar, onDescartar }: {
  item: MotorQueueItem;
  onAprovar: (id: string, texto: string, original: string, notas?: string, observacaoMonica?: string) => Promise<void>;
  onDescartar: (id: string) => Promise<void>;
}) {
  const [textoEditado, setTextoEditado] = useState(item.texto_gerado);
  const [notasErica, setNotasErica] = useState('');
  const [observacaoMonica, setObservacaoMonica] = useState('');
  const [expandido, setExpandido] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [aprovando, setAprovando] = useState(false);
  const [descartando, setDescartando] = useState(false);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [mostrarMonica, setMostrarMonica] = useState(false);

  const foiEditado = textoEditado.trim() !== item.texto_gerado.trim();
  const cor = getTipoColor(item.tipo);

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoEditado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleAprovar = async () => {
    setAprovando(true);
    try {
      await onAprovar(item.id, textoEditado, item.texto_gerado, notasErica || undefined, observacaoMonica || undefined);
    } finally {
      setAprovando(false);
    }
  };

  const handleDescartar = async () => {
    if (!confirm('Descartar esta mensagem?')) return;
    setDescartando(true);
    try {
      await onDescartar(item.id);
    } finally {
      setDescartando(false);
    }
  };

  return (
    <Card className={`bg-white border shadow-sm overflow-hidden ${cor.border}`}>
      {/* ── Cabeçalho ── */}
      <div
        className={`px-5 py-3 flex items-center justify-between cursor-pointer ${cor.bg}`}
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={`text-xs px-2 py-0.5 font-medium ${cor.bg} ${cor.text} ${cor.border} border`}>
            {TIPO_LABELS[item.tipo] ?? item.tipo}
          </Badge>
          <div className="flex items-center gap-1.5 text-gray-600">
            <User className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{item.nome_gestor}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">MG{item.macrogrupo} · {item.perfil}</span>
          </div>
          {item.semana_numero && (
            <span className="text-xs text-gray-400 bg-white/60 px-1.5 py-0.5 rounded">S{item.semana_numero}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(item.created_at)}
          </span>
          {foiEditado && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              Editado
            </Badge>
          )}
          {expandido
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* ── Corpo ── */}
      {expandido && (
        <div className="px-5 py-5 space-y-5">
          {/* Destino */}
          {item.whatsapp_destino && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Enviar para: <strong className="text-gray-700">{item.whatsapp_destino}</strong></span>
            </div>
          )}

          {/* ── BLOCO 1: O que o motor gerou ── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                Motor gerou
              </span>
              <span className="text-xs text-gray-400">(somente leitura)</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono select-text">
              {item.texto_gerado}
            </div>
          </div>

          {/* ── BLOCO 2: Edição Erica ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                  Edição Erica
                </span>
                {!foiEditado && (
                  <span className="text-xs text-gray-400">(igual ao motor — edite se necessário)</span>
                )}
              </div>
              {foiEditado && (
                <button
                  className="text-xs text-indigo-500 hover:text-indigo-700 underline flex items-center gap-1"
                  onClick={() => setTextoEditado(item.texto_gerado)}
                >
                  <RefreshCw className="w-3 h-3" />
                  Restaurar original
                </button>
              )}
            </div>
            <textarea
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              rows={Math.max(4, textoEditado.split('\n').length + 1)}
              className={`w-full text-sm text-gray-800 border rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 font-mono leading-relaxed transition-colors ${
                foiEditado
                  ? 'bg-violet-50 border-violet-200'
                  : 'bg-white border-gray-200'
              }`}
              placeholder="Edite a mensagem aqui antes de enviar..."
            />
          </div>

          {/* ── BLOCO 3: Notas da edição (Erica) — colapsável ── */}
          <div>
            <button
              onClick={() => setMostrarNotas(!mostrarNotas)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span className="font-medium">Notas da edição</span>
              <span className="text-gray-400">(opcional — por que você editou?)</span>
              {mostrarNotas
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
            {mostrarNotas && (
              <textarea
                value={notasErica}
                onChange={(e) => setNotasErica(e.target.value)}
                rows={2}
                className="mt-2 w-full text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-400"
                placeholder="Ex: Tom estava muito formal para o perfil deste gestor..."
              />
            )}
          </div>

          {/* ── BLOCO 4: Observação Monica ── */}
          <div>
            <button
              onClick={() => setMostrarMonica(!mostrarMonica)}
              className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-800 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="font-semibold">Observação Monica</span>
              <span className="text-purple-400">(contexto clínico / metodológico)</span>
              {mostrarMonica
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>
            {mostrarMonica && (
              <textarea
                value={observacaoMonica}
                onChange={(e) => setObservacaoMonica(e.target.value)}
                rows={3}
                className="mt-2 w-full text-sm text-purple-900 bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-purple-300"
                placeholder="Observação metodológica ou clínica sobre este gestor / esta mensagem..."
              />
            )}
          </div>

          {/* ── Ações ── */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDescartar}
              disabled={descartando}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Descartar
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopiar}
                className={`text-xs transition-all ${
                  copiado
                    ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700'
                }`}
              >
                {copiado
                  ? <><Check className="w-3.5 h-3.5 mr-1.5" />Copiado!</>
                  : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copiar texto</>
                }
              </Button>

              <Button
                size="sm"
                onClick={handleAprovar}
                disabled={aprovando}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {aprovando
                  ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />Aprovando...</>
                  : <><Check className="w-3.5 h-3.5 mr-1.5" />Aprovar e Arquivar</>
                }
              </Button>
            </div>
          </div>

          {/* Instrução piloto */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>Piloto manual:</strong> copie o texto da edição e envie no WhatsApp do gestor.
              Clique em <strong>Aprovar e Arquivar</strong> após o envio.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function LQAMotorQueue() {
  const [, setLocation] = useLocation();
  const { items, loading, error, refetch, aprovar, descartar } = useMotorQueue();

  const totalPendente = items.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
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
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Motor LQA — Inbox</h1>
                <p className="text-xs text-gray-500">Mensagens aguardando aprovação</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalPendente > 0 && (
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 border text-xs px-2.5">
                {totalPendente} pendente{totalPendente !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="text-gray-500 hover:text-gray-900"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <Card className="bg-red-50 border-red-200 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Erro ao carregar a fila</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={refetch} className="ml-auto text-red-600">
              Tentar novamente
            </Button>
          </Card>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="ml-3 text-gray-500 text-sm">Carregando fila...</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma mensagem pendente</p>
            <p className="text-gray-400 text-sm mt-1">
              O motor ainda não gerou mensagens ou todas já foram aprovadas.
            </p>
            <Button variant="ghost" size="sm" onClick={refetch} className="mt-4 text-indigo-500">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-5">
            {/* Legenda dos campos */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="text-indigo-700"><strong>Motor gerou</strong> — somente leitura</span>
              </div>
              <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                <Pencil className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span className="text-violet-700"><strong>Edição Erica</strong> — edite e copie</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                <Eye className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="text-purple-700"><strong>Observação Monica</strong> — contexto</span>
              </div>
            </div>

            {items.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                onAprovar={aprovar}
                onDescartar={descartar}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
