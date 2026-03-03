import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useBigFive } from '@/contexts/BigFiveContext';
import { toast } from 'sonner';

export function FileUpload() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      toast.error(errorMessage);
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      fileInputRef.current.files = files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  return (
    <Card 
      className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Upload className="w-12 h-12 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-lg">Importar Respostas do Big Five</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste o arquivo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Arquivo CSV ou Excel exportado do Google Forms
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="cursor-pointer"
        >
          {loading ? 'Processando...' : 'Selecionar Arquivo'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: CSV, Excel (.xlsx, .xls), TSV
        </p>
      </div>
    </Card>
  );
}
