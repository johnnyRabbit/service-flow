import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Snowflake, Loader2, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@climatech.pt');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Erro ao iniciar sessão');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200">
            <Snowflake className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ServiceFlow AI</h1>
          <p className="text-sm text-gray-500 mt-1">Atendimento automatizado para pequenas empresas</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Entrar</h2>
          <p className="text-sm text-gray-500 mb-6">Aceda à sua organização</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Demo info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Contas de demonstração:</p>
            <div className="space-y-1.5">
              <button
                onClick={() => { setEmail('admin@climatech.pt'); setPassword('demo123'); }}
                className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-xs hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">admin@climatech.pt</span>
                <span className="text-gray-500"> — Owner</span>
              </button>
              <button
                onClick={() => { setEmail('carlos@climatech.pt'); setPassword('demo123'); }}
                className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-xs hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">carlos@climatech.pt</span>
                <span className="text-gray-500"> — Técnico</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">Password para todas: <code className="bg-gray-100 px-1.5 py-0.5 rounded">demo123</code></p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 ServiceFlow AI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
