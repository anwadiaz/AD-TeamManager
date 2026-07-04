import { useState } from 'react';
import { motion } from 'motion/react';
import { Youtube, Shield, Sword, RefreshCw } from 'lucide-react';

export default function RivalReport() {
  const [report, setReport] = useState({
    offensive: '',
    defensive: '',
    transitions: '',
    youtubeUrl: ''
  });

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(report.youtubeUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-6">
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <Sword size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Fase Ofensiva</h3>
          </div>
          <textarea
            value={report.offensive}
            onChange={(e) => setReport({ ...report, offensive: e.target.value })}
            className="w-full h-32 bg-brand-slate-950 border border-brand-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500/50 transition-colors resize-none"
            placeholder="Describe el comportamiento ofensivo del rival..."
          />
        </div>

        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Shield size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Fase Defensiva</h3>
          </div>
          <textarea
            value={report.defensive}
            onChange={(e) => setReport({ ...report, defensive: e.target.value })}
            className="w-full h-32 bg-brand-slate-950 border border-brand-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500/50 transition-colors resize-none"
            placeholder="Describe el comportamiento defensivo del rival..."
          />
        </div>

        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-yellow-500 mb-2">
            <RefreshCw size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Transiciones</h3>
          </div>
          <textarea
            value={report.transitions}
            onChange={(e) => setReport({ ...report, transitions: e.target.value })}
            className="w-full h-32 bg-brand-slate-950 border border-brand-slate-800 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500/50 transition-colors resize-none"
            placeholder="Describe las transiciones ataque-defensa y defensa-ataque..."
          />
        </div>
      </div>

      <div className="space-y-6 flex flex-col h-full">
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-4 flex flex-col h-full">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <Youtube size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Análisis de Video</h3>
          </div>
          
          <input
            type="text"
            value={report.youtubeUrl}
            onChange={(e) => setReport({ ...report, youtubeUrl: e.target.value })}
            className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
            placeholder="Introduce la URL de YouTube (ej: https://www.youtube.com/watch?v=...)"
          />

          <div className="flex-1 bg-brand-slate-950 rounded-2xl border border-brand-slate-800 overflow-hidden relative min-h-[300px]">
            {youtubeId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-4">
                <Youtube size={48} />
                <span className="text-xs font-bold uppercase tracking-widest">Introduce una URL válida</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
