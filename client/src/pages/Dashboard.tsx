import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, BarChart3, Trash2, Cloud, AlertCircle, Bell, GitCompare, SlidersHorizontal, X, RefreshCw, Download } from 'lucide-react';
import DiltsPyramid from '@/components/DiltsPyramid';
import { useBatchExport } from '@/hooks/useBatchExport';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { trpc } from '@/lib/trpc';
import { BigFiveProfile } from '@/lib/bigfive';

const DIMENSION_OPTIONS = [
  { key: 'openness', label: 'Abertura', emoji: '🌿' },
  { key: 'conscientiousness', label: 'Conscienciosidade', emoji: '⚡' },
  { key: 'extraversion', label: 'Extroversão', emoji: '☀️' },
  { key: 'agreeableness', label: 'Agradabilidade', emoji: '💚' },
  { key: 'emotionalStability', label: 'Est. Emocional', emoji: '🌊' },
] as const;

type DimKey = typeof DIMENSION_OPTIONS[number]['key'];

const CLASSIFICATION_OPTIONS = [
  { value: '', label: 'Qualquer nível' },
  { value: 'very_high', label: 'Muito Elevado (>89%)' },
  { value: 'high', label: 'Elevado (70–89%)' },
  { value: 'moderate', label: 'Moderado (40–69%)' },
  { value: 'low', label: 'Baixo (20–39%)' },
  { value: 'very_low', label: 'Muito Baixo (<20%)' },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDimension, setFilterDimension] = useState<DimKey | ''>('');
  const [filterClassification, setFilterClassification] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { fetchSheetData, loading: sheetLoading, lastUpdate } = useGoogleSheets();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const knownEmails = useRef<Set<string>>(new Set());
  const notifyNewResponse = trpc.notifications.newResponse.useMutation();
  const utils = trpc.useUtils();

  // ─── Carregar perfis do banco ────────────────────────────────────────────
  const { data: dbProfiles = [], isLoading: dbLoading } = trpc.profiles.list.useQuery(undefined, {
    staleTime: 30_000, // revalidar a cada 30s
  });

  const upsertBatch = trpc.profiles.upsertBatch.useMutation({
    onSuccess: () => utils.profiles.list.invalidate(),
  });

  const deleteAllMutation = trpc.profiles.deleteAll.useMutation({
    onSuccess: () => utils.profiles.list.invalidate(),
  });

  // Converter os dados do banco para BigFiveProfile
  const profiles: BigFiveProfile[] = dbProfiles as unknown as BigFiveProfile[];

  const hasActiveFilters = filterDimension !== '' || filterClassification !== '';
  const { exportAllPDFs, isExporting, progress } = useBatchExport();

  const clearFilters = () => {
    setFilterDimension('');
    setFilterClassification('');
  };

  // ─── Detectar novos respondentes e notificar ─────────────────────────────
  const detectAndNotifyNewProfiles = (newProfiles: BigFiveProfile[]) => {
    const isFirstLoad = knownEmails.current.size === 0;
    const newOnes = newProfiles.filter(p => !knownEmails.current.has(p.email));
    newProfiles.forEach(p => knownEmails.current.add(p.email));
    if (!isFirstLoad && newOnes.length > 0) {
      newOnes.forEach(p => {
        notifyNewResponse.mutate({
          name: p.name,
          email: p.email,
          scores: {
            openness: p.dimensions.openness.score,
            conscientiousness: p.dimensions.conscientiousness.score,
            extraversion: p.dimensions.extraversion.score,
            agreeableness: p.dimensions.agreeableness.score,
            emotionalStability: p.dimensions.emotionalStability.score,
          },
        });
      });
      toast.success(
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>{newOnes.length} nova(s) resposta(s) detectada(s)! Notificação enviada.</span>
        </div>
      );
    }
    return newOnes;
  };

  // ─── Sincronizar com Google Sheets e salvar no banco ─────────────────────
  const syncFromSheets = async (showToast = false) => {
    if (!autoSyncEnabled) return;
    try {
      setSyncError(null);
      const data = await fetchSheetData();
      if (data.length > 0) {
        // Salvar todos no banco (upsert por email)
        await upsertBatch.mutateAsync(data.map((p: BigFiveProfile) => ({
          ...p,
          rawResponses: (p as any).rawResponses ?? [],
        })));
        detectAndNotifyNewProfiles(data);
        if (showToast) {
          toast.success(`${data.length} perfil(is) sincronizado(s) com o banco!`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar';
      setSyncError(errorMsg);
      if (showToast) toast.error(errorMsg);
    }
  };

  // Sincronização inicial ao montar
  useEffect(() => {
    syncFromSheets(true);
  }, []);

  // Sincronização automática a cada 5 minutos
  useEffect(() => {
    if (!autoSyncEnabled) return;
    const interval = setInterval(() => syncFromSheets(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled]);

  const handleManualSync = () => syncFromSheets(true);

  // ─── Quando um arquivo é importado manualmente, salvar no banco ──────────
  const handleFileImport = async (importedProfiles: BigFiveProfile[]) => {
    if (importedProfiles.length === 0) return;
    try {
      await upsertBatch.mutateAsync(importedProfiles.map((p: BigFiveProfile) => ({
        ...p,
        rawResponses: (p as any).rawResponses ?? [],
      })));
      toast.success(`${importedProfiles.length} perfil(is) importado(s) e salvos no banco!`);
    } catch (error) {
      toast.error('Erro ao salvar perfis importados');
    }
  };

  const handleClearData = async () => {
    await deleteAllMutation.mutateAsync();
    knownEmails.current.clear();
    toast.success('Todos os dados foram removidos.');
  };

  const handleViewProfile = (profileId: string) => {
    setLocation(`/profile/${profileId}`);
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterDimension && filterClassification) {
      return p.dimensions[filterDimension].classification === filterClassification;
    }
    if (filterDimension && !filterClassification) {
      const scores = Object.entries(p.dimensions) as [DimKey, typeof p.dimensions.openness][];
      const dominant = scores.reduce((a, b) => (a[1].score > b[1].score ? a : b));
      return dominant[0] === filterDimension;
    }
    if (!filterDimension && filterClassification) {
      return Object.values(p.dimensions).some(d => d.classification === filterClassification);
    }
    return true;
  });

  const isLoading = dbLoading || sheetLoading || upsertBatch.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">📊 Big Five Dashboard</h1>
          <p className="text-muted-foreground">
            Análise interativa de personalidade baseada no teste Big Five
          </p>
        </div>

        {/* Erro de Sincronização */}
        {syncError && (
          <Card className="p-4 mb-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-destructive">Erro na sincronização</p>
                <p className="text-sm text-muted-foreground mt-1">{syncError}</p>
              </div>
            </div>
          </Card>
        )}

        {profiles.length === 0 && !isLoading ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Cloud className="w-6 h-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Sincronização Automática Ativada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    O dashboard está conectado ao seu Google Forms e buscará as respostas automaticamente a cada 5 minutos. Os dados ficam salvos no banco de dados — disponíveis em qualquer dispositivo.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleManualSync} disabled={isLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}>
                      {autoSyncEnabled ? 'Desativar Auto-Sync' : 'Ativar Auto-Sync'}
                    </Button>
                  </div>
                  {lastUpdate && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Última sincronização: {lastUpdate.toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
            <FileUpload onImport={handleFileImport} />
          </div>
        ) : isLoading && profiles.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando perfis do banco...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Respondentes</p>
                    <p className="text-2xl font-bold">{profiles.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Perfis Analisados</p>
                    <p className="text-2xl font-bold">{profiles.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocation('/compare')} className="w-full">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Comparar Perfis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportAllPDFs(filteredProfiles)}
                  disabled={isExporting || filteredProfiles.length === 0}
                  className="w-full"
                >
                  <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
                  {isExporting ? `Exportando... ${progress}%` : `Exportar ${filteredProfiles.length} PDF(s)`}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleClearData} disabled={deleteAllMutation.isPending} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteAllMutation.isPending ? 'Removendo...' : 'Limpar Dados'}
                </Button>
              </Card>
            </div>

            {/* Barra de busca e filtros */}
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Buscar Respondente</label>
                  <Input
                    placeholder="Digite o nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={hasActiveFilters ? 'border-primary text-primary' : ''}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                    {hasActiveFilters && <Badge variant="default" className="ml-2 text-xs px-1.5 py-0">!</Badge>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSync}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </Button>
                </div>
              </div>

              {lastUpdate && (
                <p className="text-xs text-muted-foreground text-right">
                  Última sync: {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              )}

              {/* Painel de filtros */}
              {showFilters && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold">Filtrar por Dimensão</h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Dimensão dominante</label>
                      <div className="flex flex-wrap gap-2">
                        {DIMENSION_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setFilterDimension(filterDimension === opt.key ? '' : opt.key)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                              filterDimension === opt.key
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Nível de classificação</label>
                      <div className="flex flex-wrap gap-2">
                        {CLASSIFICATION_OPTIONS.slice(1).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setFilterClassification(filterClassification === opt.value ? '' : opt.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                              filterClassification === opt.value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Lista de respondentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Respondentes</h2>
                <Badge variant="secondary">{filteredProfiles.length} respondente{filteredProfiles.length !== 1 ? 's' : ''}</Badge>
              </div>

              {filteredProfiles.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum respondente encontrado com os filtros aplicados.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mt-3">
                      Limpar filtros
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProfiles.map((profile) => (
                    <Card
                      key={profile.id}
                      className="p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                      onClick={() => handleViewProfile(profile.id)}
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-base leading-tight">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {Object.entries(profile.dimensions).map(([key, dim]) => (
                          <div key={key} className="text-center">
                            <div className="text-lg">{dim.emoji}</div>
                            <div className="text-xs font-bold text-primary">{Math.round(dim.score)}%</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Pirâmide de Dilts */}
            <DiltsPyramid />
          </div>
        )}
      </div>
    </div>
  );
}
