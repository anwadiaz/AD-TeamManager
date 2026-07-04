import { AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-slate-950">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bento-card p-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Configuración Requerida</h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          Para que la aplicación funcione, necesitas configurar tu proyecto de <strong>Supabase</strong>. 
          Añade las siguientes variables en el panel de <strong>Settings &gt; Secrets</strong>:
        </p>
        
        <div className="space-y-3 mb-8 text-left">
          <div className="p-3 bg-brand-slate-900 rounded-lg border border-brand-slate-800">
            <code className="text-xs text-red-400">VITE_SUPABASE_URL</code>
          </div>
          <div className="p-3 bg-brand-slate-900 rounded-lg border border-brand-slate-800">
            <code className="text-xs text-red-400">VITE_SUPABASE_ANON_KEY</code>
          </div>
        </div>

        <a 
          href="https://supabase.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Ir a Supabase <ExternalLink size={14} />
        </a>
      </motion.div>
    </div>
  );
}
