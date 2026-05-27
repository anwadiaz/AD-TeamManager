import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_CONFIG } from '../lib/config';
import { getDirectImageUrl } from '../lib/utils';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bento-card p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-brand-slate-900 border border-brand-slate-800 text-red-500 mb-4 shadow-xl overflow-hidden p-1">
            {APP_CONFIG.logo ? (
              <img 
                src={getDirectImageUrl(APP_CONFIG.logo)} 
                alt="Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if the image fails to load
                  e.currentTarget.src = '';
                  e.currentTarget.classList.add('hidden');
                  e.currentTarget.parentElement?.classList.add('flex-col');
                }}
              />
            ) : (
              <LogIn className="w-12 h-12" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{APP_CONFIG.name}</h1>
          <p className="text-slate-400">{APP_CONFIG.description}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-brand-slate-800 text-white rounded-xl border border-brand-slate-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-brand-slate-800 text-white rounded-xl border border-brand-slate-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-slate-950 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" /> Iniciar Sesión
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Registrarse
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-red-400 transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
