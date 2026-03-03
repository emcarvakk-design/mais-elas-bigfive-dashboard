import { useState } from 'react';
import { useBigFive } from '@/contexts/BigFiveContext';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, BarChart3, Trash2, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Dashboard() {
  const { profiles, clearData, setSelectedProfile } = useBigFive();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

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

        {profiles.length === 0 ? (
          <div className="max-w-2xl mx-auto">
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
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Importar Mais
              </Button>
            </div>

            {/* Lista de Respondentes */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Respondentes</h2>
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
