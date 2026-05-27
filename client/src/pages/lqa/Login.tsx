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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">LQA Dashboard</h1>
          <p className="text-gray-500 text-sm">Leadership Quality Assessment</p>
          <p className="text-gray-400 text-xs mt-1">Acesso restrito — Erica & Monica</p>
        </div>

        <Card className="bg-white border-gray-200 p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de acesso
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Digite a senha"
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Entrar
            </Button>
          </form>
        </Card>

        <p className="text-center text-gray-400 text-xs mt-6">
          LQA · Sistema de Diagnóstico de Liderança · Confidencial
        </p>
      </div>
    </div>
  );
}
