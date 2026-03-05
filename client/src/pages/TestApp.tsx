import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { createProfile } from '@/lib/bigfive';
import { QUESTIONS, DIMENSION_LABELS, DIMENSION_ORDER, SCALE_LABELS } from '@/lib/questions';
import { getFacetsByDimension } from '@/lib/facets';
import { generateProfessionalInsights } from '@/lib/professionalInsights';
import { getQuestionsForDimension } from '@/lib/powerfulQuestions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { BigFiveProfile } from '@/lib/bigfive';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Step = 'welcome' | 'identify' | 'quiz' | 'result';

// ─── Utilitário de ID determinístico ─────────────────────────────────────────
function emailToId(email: string): string {
  const normalized = email.trim().toLowerCase();
  try {
    return 'bf_' + btoa(normalized).replace(/[+/=]/g, c => ({ '+': '-', '/': '_', '=': '' }[c] ?? c));
  } catch {
    return 'bf_' + normalized.replace(/[^a-z0-9]/g, '_').slice(0, 40);
  }
}

// ─── Tela 1: Boas-vindas ──────────────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header colorido */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌿</span>
              <span className="text-sm font-medium tracking-widest uppercase text-slate-300">Teste de Personalidade</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight mb-3">
              Big Five
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Descubra os cinco traços que moldam sua forma de liderar, se relacionar e tomar decisões.
            </p>
          </div>

          {/* Corpo */}
          <div className="px-8 py-8">
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              Olá! Que bom ter você aqui. 🌿
            </p>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Este teste mapeia sua personalidade em cinco dimensões baseadas em décadas de pesquisa em psicologia. Não existe resposta certa ou errada — existe a sua verdade.
            </p>

            {/* Dimensões */}
            <div className="space-y-2 mb-8">
              {DIMENSION_ORDER.map(dim => {
                const { label, emoji, color } = DIMENSION_LABELS[dim];
                return (
                  <div key={dim} className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="text-base">{emoji}</span>
                    <span style={{ color }} className="font-medium">{label}</span>
                  </div>
                );
              })}
            </div>

            {/* Detalhes */}
            <div className="flex items-center gap-6 text-xs text-slate-400 mb-8">
              <span>⏱ ~5 minutos</span>
              <span>📝 30 afirmações</span>
              <span>🔒 Confidencial</span>
            </div>

            <Button
              onClick={onStart}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 text-base font-medium rounded-xl"
            >
              Começar o teste
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Com propósito, Erica 🌾
        </p>
      </div>
    </div>
  );
}

// ─── Tela 2: Identificação ────────────────────────────────────────────────────
function IdentifyScreen({ onNext }: { onNext: (name: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) newErrors.name = 'Por favor, informe seu nome.';
    if (!email.trim()) newErrors.email = 'Por favor, informe seu e-mail.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'E-mail inválido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onNext(name.trim(), email.trim().toLowerCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-8 text-white">
            <p className="text-xs font-medium tracking-widest uppercase text-slate-400 mb-2">Antes de começar</p>
            <h2 className="text-2xl font-bold">Identificação</h2>
            <p className="text-slate-300 text-sm mt-2">Seus dados são usados apenas para gerar seu perfil personalizado.</p>
          </div>

          <div className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seu nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                  errors.name
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:bg-white'
                }`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seu e-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: maria@email.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                  errors.email
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-slate-200 bg-slate-50 focus:border-slate-400 focus:bg-white'
                }`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              🔒 Seus dados são confidenciais e serão usados apenas pela sua mentora para preparar a sessão.
            </p>

            <Button
              onClick={handleSubmit}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 text-base font-medium rounded-xl"
            >
              Continuar para o teste
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tela 3: Questionário ─────────────────────────────────────────────────────
function QuizScreen({
  onComplete,
}: {
  onComplete: (responses: number[]) => void;
}) {
  const [responses, setResponses] = useState<(number | null)[]>(Array(30).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const question = QUESTIONS[currentQuestion];
  const dimInfo = DIMENSION_LABELS[question.dimension];
  const answered = responses[currentQuestion] !== null;
  const progress = Math.round((currentQuestion / 30) * 100);

  // Dimensão atual (para mostrar seção)
  const dimensionQuestions = QUESTIONS.filter(q => q.dimension === question.dimension);
  const questionInDimension = dimensionQuestions.findIndex(q => q.index === question.index) + 1;
  const totalInDimension = dimensionQuestions.length;

  const handleSelect = useCallback((value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);

    // Avançar automaticamente após 300ms
    setTimeout(() => {
      if (currentQuestion < 29) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        // Último — verificar se todas foram respondidas
        const allAnswered = newResponses.every(r => r !== null);
        if (allAnswered) {
          onComplete(newResponses as number[]);
        }
      }
    }, 300);
  }, [responses, currentQuestion, onComplete]);

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const handleFinish = () => {
    const allAnswered = responses.every(r => r !== null);
    if (!allAnswered) {
      const firstUnanswered = responses.findIndex(r => r === null);
      setCurrentQuestion(firstUnanswered);
      toast.error('Por favor, responda todas as perguntas antes de finalizar.');
      return;
    }
    onComplete(responses as number[]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header com progresso */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              {currentQuestion + 1} de 30
            </span>
            <span className="text-xs font-medium" style={{ color: dimInfo.color }}>
              {dimInfo.emoji} {dimInfo.label}
            </span>
            <span className="text-xs text-slate-400">
              {questionInDimension}/{totalInDimension}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          {/* Card da pergunta */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
            {/* Indicador de dimensão */}
            <div
              className="h-1"
              style={{ background: dimInfo.color }}
            />

            <div className="px-8 py-8">
              <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: dimInfo.color }}>
                {dimInfo.emoji} {dimInfo.label}
              </p>
              <h3 className="text-xl font-semibold text-slate-800 leading-relaxed mb-8">
                {question.text}
              </h3>

              {/* Escala */}
              <div className="space-y-2">
                {SCALE_LABELS.map(({ value, label }) => {
                  const isSelected = responses[currentQuestion] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleSelect(value)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-slate-700 bg-slate-800 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isSelected ? 'bg-white text-slate-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {value}
                      </span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 rounded-xl border-slate-200 text-slate-600"
              >
                ← Anterior
              </Button>
            )}
            {currentQuestion === 29 && (
              <Button
                onClick={handleFinish}
                disabled={!answered}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Ver meu resultado →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tela 4: Resultado ────────────────────────────────────────────────────────
const CLASSIFICATION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  very_low:  { label: 'Muito Baixo',  color: '#6b7280', bg: '#f3f4f6' },
  low:       { label: 'Baixo',        color: '#3b82f6', bg: '#eff6ff' },
  moderate:  { label: 'Moderado',     color: '#f59e0b', bg: '#fffbeb' },
  high:      { label: 'Alto',         color: '#10b981', bg: '#ecfdf5' },
  very_high: { label: 'Muito Alto',   color: '#7c3aed', bg: '#f5f3ff' },
};

function ResultScreen({ profile }: { profile: BigFiveProfile }) {
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  const dimensions = DIMENSION_ORDER.map(key => ({
    key,
    dim: profile.dimensions[key],
    info: DIMENSION_LABELS[key],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-400 text-sm tracking-widest uppercase mb-3">Seu Perfil Big Five</p>
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <p className="text-slate-300 text-sm">Resultado gerado em {new Date(profile.timestamp).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Barras das 5 dimensões */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5">Suas 5 Dimensões</h2>
          <div className="space-y-4">
            {dimensions.map(({ key, dim, info }) => {
              const cls = CLASSIFICATION_LABELS[dim.classification];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {info.emoji} {info.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">{dim.score}%</span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ color: cls.color, background: cls.bg }}
                      >
                        {cls.label}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${dim.score}%`, background: info.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Descrições por dimensão */}
        {dimensions.map(({ key, dim, info }) => {
          const isOpen = expandedDim === key;
          const facets = getFacetsByDimension(dim.name, dim.score);
          const allInsights = generateProfessionalInsights(profile);
          const dimQuestions = getQuestionsForDimension(key);
          const questions = dimQuestions?.questions ?? [];

          return (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Header clicável */}
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setExpandedDim(isOpen ? null : key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{info.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{info.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{dim.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold" style={{ color: info.color }}>{dim.score}%</span>
                  <span className="text-slate-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Conteúdo expandido */}
              {isOpen && (
                <div className="border-t border-slate-100 px-6 py-5 space-y-5">
                  {/* Subfacetas */}
                  {facets.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Subfacetas</p>
                      <div className="space-y-3">
                        {facets.map(facet => (
                          <div key={facet.name} className="border border-slate-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-800">{facet.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  color: facet.tendency === 'elevada' ? '#16a34a' : facet.tendency === 'baixa' ? '#6b7280' : '#d97706',
                                  borderColor: facet.tendency === 'elevada' ? '#16a34a' : facet.tendency === 'baixa' ? '#6b7280' : '#d97706',
                                }}
                              >
                                {facet.tendency === 'elevada' ? '↑ Elevada' : facet.tendency === 'baixa' ? '↓ Baixa' : '— Moderada'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{facet.description}</p>
                            {facet.mentorNote && (
                              <p className="text-xs text-slate-400 italic mt-1.5 border-t border-slate-50 pt-1.5">
                                💡 {facet.mentorNote}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights profissionais (geral do perfil, mostrar todos) */}
                  {allInsights.length > 0 && isOpen && key === DIMENSION_ORDER[0] && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Insights para sua carreira</p>
                      <div className="space-y-2">
                        {allInsights.map((insight, i: number) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-slate-700 mb-1">{insight.title}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{insight.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Perguntas poderosas */}
                  {questions && questions.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">
                        🔮 Perguntas para reflexão
                      </p>
                      <div className="space-y-2">
                        {questions.map((q, i: number) => (
                          <p key={i} className="text-xs text-purple-800 leading-relaxed">
                            <span className="font-bold mr-1">{i + 1}.</span>{q.question}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Insights de combinação */}
        {profile.combinationInsights.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Insights do seu Perfil Combinado</h2>
            <div className="space-y-2">
              {profile.combinationInsights.map((insight, i) => (
                <p key={i} className="text-sm text-slate-600 leading-relaxed py-2 border-b border-slate-50 last:border-0">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem final */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white text-center">
          <p className="text-slate-300 text-sm leading-relaxed mb-2">
            Seu perfil foi enviado para sua mentora. Ela chegará à sessão preparada para explorar esses resultados com você.
          </p>
          <p className="text-slate-400 text-xs">Com propósito, Erica 🌾</p>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TestApp() {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<BigFiveProfile | null>(null);

  const upsertMutation = trpc.profiles.upsertBatch.useMutation();
  const notifyMutation = trpc.notifications.newResponse.useMutation();

  const handleIdentify = (n: string, e: string) => {
    setName(n);
    setEmail(e);
    setStep('quiz');
  };

  const handleQuizComplete = async (responses: number[]) => {
    const id = emailToId(email);
    const timestamp = new Date().toISOString();

    const newProfile = createProfile(
      { timestamp, email, name, responses },
      id
    );
    setProfile(newProfile);
    setStep('result');

    // Salvar no banco
    try {
      await upsertMutation.mutateAsync([{
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        timestamp: newProfile.timestamp,
        rawResponses: responses,
        dimensions: newProfile.dimensions,
        combinationInsights: newProfile.combinationInsights,
        recommendations: newProfile.recommendations,
      }]);

      // Notificar a Erica
      await notifyMutation.mutateAsync({
        name: newProfile.name,
        email: newProfile.email,
        scores: {
          openness: newProfile.dimensions.openness.score,
          conscientiousness: newProfile.dimensions.conscientiousness.score,
          extraversion: newProfile.dimensions.extraversion.score,
          agreeableness: newProfile.dimensions.agreeableness.score,
          emotionalStability: newProfile.dimensions.emotionalStability.score,
        },
      });
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      // Não bloquear o resultado mesmo se falhar o save
    }
  };

  if (step === 'welcome') return <WelcomeScreen onStart={() => setStep('identify')} />;
  if (step === 'identify') return <IdentifyScreen onNext={handleIdentify} />;
  if (step === 'quiz') return <QuizScreen onComplete={handleQuizComplete} />;
  if (step === 'result' && profile) return <ResultScreen profile={profile} />;

  return null;
}
