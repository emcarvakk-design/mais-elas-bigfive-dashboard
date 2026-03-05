import { useState, useEffect, useRef } from 'react';
import { useBigFive } from '@/contexts/BigFiveContext';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, BarChart3, Trash2, RefreshCw, Cloud, AlertCircle, Bell } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { trpc } from '@/lib/trpc';
import { BigFiveProfile } from '@/lib/bigfive';

export default function Dashboard() {
  const { profiles, clearData, setSelectedProfile, addProfiles } = useBigFive();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchSheetData, loading: sheetLoading, lastUpdate } = useGoogleSheets();
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const knownProfileIds = useRef<Set<string>>(new Set());
  const notifyNewResponse = trpc.notifications.newResponse.useMutation();

  // Detectar novos respondentes e notificar
  const detectAndNotifyNewProfiles = (newProfiles: BigFiveProfile[]) => {
    const isFirstLoad = knownProfileIds.current.size === 0;
    const newOnes = newProfiles.filter(p => !knownProfileIds.current.has(p.id));
    
    // Atualizar IDs conhecidos
    newProfiles.forEach(p => knownProfileIds.current.add(p.id));
    
    // Só notifica se não for o primeiro carregamento (evita spam na inicialização)
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

  // Buscar dados do Google Sheets ao carregar a página
  useEffect(() => {
    const loadDataFromSheet = async () => {
      if (!autoSyncEnabled) return;
      
      try {
        setSyncError(null);
        const data = await fetchSheetData();
        if (data.length > 0) {
          addProfiles(data);
          // Registrar IDs no primeiro carregamento (sem notificar)
          data.forEach(p => knownProfileIds.current.add(p.id));
          toast.success(`${data.length} perfil(is) sincronizado(s) do Google Sheets!`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro ao sincronizar';
        setSyncError(errorMsg);
        console.error('Erro ao buscar Google Sheets:', error);
      }
    };

    loadDataFromSheet();
  }, []);

  // Sincronizar a cada 5 minutos e detectar novas respostas
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
        console.error('Erro ao sincronizar Google Sheets:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

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

  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Mensagem de Erro de Sincronização */}
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
            {/* Card de Sincronização Automática */}
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-start gap-4">
                <Cloud className="w-6 h-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Sincronização Automática Ativada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    O dashboard está conectado ao seu Google Forms e buscará as respostas automaticamente a cada 5 minutos.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleManualSync}
                      disabled={sheetLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${sheetLoading ? 'animate-spin' : ''}`} />
                      {sheetLoading ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                    >
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
              <Card className="p-6">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearData}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Dados
                </Button>
              </Card>
            </div>

            {/* Controles */}
            <div className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Buscar Respondente</label>
                  <Input
                    placeholder="Digite o nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleManualSync}
                  disabled={sheetLoading}
                >
                  <Cloud className={`w-4 h-4 mr-2 ${sheetLoading ? 'animate-spin' : ''}`} />
                  {sheetLoading ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm">
                {searchTerm && (
                  <div className="text-muted-foreground">
                    Mostrando {filteredProfiles.length} de {profiles.length} respondentes
                  </div>
                )}
                {lastUpdate && !searchTerm && (
                  <div className="text-muted-foreground text-xs">
                    Última sincronização: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </div>
                )}
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
                  <p className="text-muted-foreground">Nenhum respondente encontrado</p>
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
                        <div>
                          <div className="text-lg">{profile.dimensions.openness.emoji}</div>
                          <div className="font-bold text-primary text-sm">{profile.dimensions.openness.score}%</div>
                        </div>
                        <div>
                          <div className="text-lg">{profile.dimensions.conscientiousness.emoji}</div>
                          <div className="font-bold text-primary text-sm">{profile.dimensions.conscientiousness.score}%</div>
                        </div>
                        <div>
                          <div className="text-lg">{profile.dimensions.extraversion.emoji}</div>
                          <div className="font-bold text-primary text-sm">{profile.dimensions.extraversion.score}%</div>
                        </div>
                        <div>
                          <div className="text-lg">{profile.dimensions.agreeableness.emoji}</div>
                          <div className="font-bold text-primary text-sm">{profile.dimensions.agreeableness.score}%</div>
                        </div>
                        <div>
                          <div className="text-lg">{profile.dimensions.emotionalStability.emoji}</div>
                          <div className="font-bold text-primary text-sm">{profile.dimensions.emotionalStability.score}%</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
