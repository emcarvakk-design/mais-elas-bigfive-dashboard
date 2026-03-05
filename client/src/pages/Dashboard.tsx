import { useState, useEffect, useRef } from 'react';
import { useBigFive } from '@/contexts/BigFiveContext';
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
  const { profiles, clearData, setSelectedProfile, addProfiles } = useBigFive();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDimension, setFilterDimension] = useState<DimKey | ''>('');
  const [filterClassification, setFilterClassification] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { fetchSheetData, loading: sheetLoading, lastUpdate } = useGoogleSheets();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const knownProfileIds = useRef<Set<string>>(new Set());
  const notifyNewResponse = trpc.notifications.newResponse.useMutation();

  const hasActiveFilters = filterDimension !== '' || filterClassification !== '';
  const { exportAllPDFs, isExporting, progress } = useBatchExport();

  const clearFilters = () => {
    setFilterDimension('');
    setFilterClassification('');
  };

  // Detectar novos respondentes e notificar
  const detectAndNotifyNewProfiles = (newProfiles: BigFiveProfile[]) => {
    const isFirstLoad = knownProfileIds.current.size === 0;
    const newOnes = newProfiles.filter(p => !knownProfileIds.current.has(p.id));
    newProfiles.forEach(p => knownProfileIds.current.add(p.id));
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

  useEffect(() => {
    const loadDataFromSheet = async () => {
      if (!autoSyncEnabled) return;
      try {
        setSyncError(null);
        const data = await fetchSheetData();
        if (data.length > 0) {
          addProfiles(data);
          data.forEach(p => knownProfileIds.current.add(p.id));
          toast.success(`${data.length} perfil(is) sincronizado(s) do Google Sheets!`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar';
        setSyncError(errorMsg);
      }
    };
    loadDataFromSheet();
  }, []);

  useEffect(() => {
    if (!autoSyncEnabled) return;
    const interval = setInterval(async () => {
      try {
        setSyncError(null);
        const data = await fetchSheetData();
        if (data.length > 0) {
          addProfiles(data);
          detectAndNotifyNewProfiles(data);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar';
        setSyncError(errorMsg);
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoSyncEnabled]);

  const handleManualSync = async () => {
    try {
      setSyncError(null);
      const data = await fetchSheetData();
      if (data.length > 0) {
        addProfiles(data);
        toast.success(`${data.length} perfil(is) sincronizado(s)!`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar';
      setSyncError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleViewProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setLocation(`/profile/${profileId}`);
    }
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

        {profiles.length === 0 ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Cloud className="w-6 h-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Sincronização Automática Ativada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    O dashboard está conectado ao seu Google Forms e buscará as respostas automaticamente a cada 5 minutos.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleManualSync} disabled={sheetLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${sheetLoading ? 'animate-spin' : ''}`} />
                      {sheetLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
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
            <FileUpload />
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
                <Button variant="destructive" size="sm" onClick={clearData} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Dados
                </Button>
              </Card>
            </div>

            {/* Controles de Busca e Filtros */}
            <div className="space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Buscar Respondente</label>
                  <Input
                    placeholder="Digite o nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Button>
                <Button variant="outline" onClick={handleManualSync} disabled={sheetLoading}>
                  <Cloud className={`w-4 h-4 mr-2 ${sheetLoading ? 'animate-spin' : ''}`} />
                  {sheetLoading ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </div>

              {/* Painel de Filtros Avançados */}
              {showFilters && (
                <Card className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Filtros Avançados
                    </h3>
                    {hasActiveFilters && (
                      <Button size="sm" variant="ghost" onClick={clearFilters} className="h-7 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro por Dimensão */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Dimensão Dominante / Filtrar por
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DIMENSION_OPTIONS.map(({ key, label, emoji }) => (
                          <button
                            key={key}
                            onClick={() => setFilterDimension(filterDimension === key ? '' : key)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              filterDimension === key
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtro por Nível */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Nível de Classificação
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CLASSIFICATION_OPTIONS.filter(o => o.value !== '').map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setFilterClassification(filterClassification === value ? '' : value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              filterClassification === value
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Status dos filtros */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {filterDimension && (
                        <Badge variant="secondary" className="gap-1">
                          {DIMENSION_OPTIONS.find(d => d.key === filterDimension)?.emoji}
                          {DIMENSION_OPTIONS.find(d => d.key === filterDimension)?.label}
                          <button onClick={() => setFilterDimension('')} className="ml-1 hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                      {filterClassification && (
                        <Badge variant="secondary" className="gap-1">
                          {CLASSIFICATION_OPTIONS.find(c => c.value === filterClassification)?.label}
                          <button onClick={() => setFilterClassification('')} className="ml-1 hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  {filteredProfiles.length !== profiles.length
                    ? `${filteredProfiles.length} de ${profiles.length} respondentes`
                    : lastUpdate
                    ? `Última sync: ${lastUpdate.toLocaleTimeString('pt-BR')}`
                    : ''}
                </div>
              </div>
            </div>

            {/* Lista de Respondentes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Respondentes</h2>
                <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                  {filteredProfiles.length} {filteredProfiles.length === 1 ? 'respondente' : 'respondentes'}
                </span>
              </div>
              {filteredProfiles.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum respondente encontrado com os filtros aplicados</p>
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
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer hover:border-primary"
                      onClick={() => handleViewProfile(profile.id)}
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center text-xs mt-3">
                        {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotionalStability'] as const).map(dim => (
                          <div key={dim}>
                            <div className="text-lg">{profile.dimensions[dim].emoji}</div>
                            <div className="font-bold text-primary text-sm">{Math.round(profile.dimensions[dim].score)}%</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            {/* Pirâmide dos Níveis Neurológicos */}
            <Card className="p-6 mt-4">
              <DiltsPyramid />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
