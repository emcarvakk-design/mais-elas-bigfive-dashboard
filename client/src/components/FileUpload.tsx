import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useBigFive } from '@/contexts/BigFiveContext';
import { toast } from 'sonner';

export function FileUpload() {
  const [loading, setLoading] = useState(false);
  const { processFile } = useFileUpload();
  const { addProfiles } = useBigFive();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const profiles = await processFile(file);
      if (profiles.length === 0) {
        toast.error('Nenhuma resposta válida encontrada no arquivo');
        return;
      }

      addProfiles(profiles);
      toast.success(`${profiles.length} perfil(is) carregado(s) com sucesso!`);
      event.target.value = ''; // Reset input
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div className="flex flex-col items-center gap-4 text-center">
        <Upload className="w-12 h-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-lg">Importar Respostas do Big Five</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Envie o arquivo CSV ou Excel exportado do Google Forms
          </p>
        </div>
        <label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.tsv"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
          <Button
            asChild
            disabled={loading}
            className="cursor-pointer"
          >
            <span>{loading ? 'Processando...' : 'Selecionar Arquivo'}</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: CSV, Excel, TSV
        </p>
      </div>
    </Card>
  );
}
