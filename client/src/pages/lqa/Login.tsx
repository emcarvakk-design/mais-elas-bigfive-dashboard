import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

// Senha fixa — Erica e Monica têm acesso
const VALID_PASSWORDS = ['lqa2026@erica', 'lqa2026@monica'];

interface LoginProps {
  onLogin: () => void;
}

export default function LQALogin({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_PASSWORDS.includes(password.trim())) {
      sessionStorage.setItem('lqa_auth', 'true');
      onLogin();
    } else {
      setError('Senha incorreta. Verifique com Erica ou Monica.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">LQA Dashboard</h1>
          <p className="text-slate-400 text-sm">Leadership Quality Assessment</p>
          <p className="text-slate-500 text-xs mt-1">Acesso restrito — Erica & Monica</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Senha de acesso
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Digite a senha"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              Entrar
            </Button>
          </form>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-6">
          LQA · Sistema de Diagnóstico de Liderança · Confidencial
        </p>
      </div>
    </div>
  );
}
