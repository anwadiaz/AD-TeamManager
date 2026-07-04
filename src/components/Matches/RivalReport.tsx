import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Youtube, Shield, Sword, RefreshCw, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function RivalReport() {
  const [report, setReport] = useState<{
    id?: string;
    offensive: string;
    defensive: string;
    transitions: string;
    youtube_url: string;
  }>({
    offensive: '',
    defensive: '',
    transitions: '',
    youtube_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load initial data if exists
  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data, error } = await supabase
          .from('match_reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data && !error) {
          setReport(data);
        }
      } catch (error) {
        console.warn('Could not load report:', error);
      }
    };
    loadReport();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const reportToSave = {
        offensive: report.offensive,
        defensive: report.defensive,
        transitions: report.transitions,
        youtube_url: report.youtube_url,
        updated_at: new Date().toISOString()
      };

      let result;
      if (report.id) {
        result = await supabase
          .from('match_reports')
          .update(reportToSave)
          .eq('id', report.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('match_reports')
          .insert([reportToSave])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      if (result.data) setReport(result.data);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error al guardar: Ejecuta el script SQL en Supabase para crear la tabla "match_reports".');
    } finally {
      setSaving(false);
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(report.youtube_url);

  return (
    <div className="flex flex-col gap-6 h-full pb-20 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
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
              value={report.youtube_url}
              onChange={(e) => setReport({ ...report, youtube_url: e.target.value })}
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

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={handleSave}
          disabled={saving}
          title={saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar Informe'}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-2xl active:scale-95 ${
            saved 
              ? 'bg-green-500 text-slate-950' 
              : 'bg-red-500 text-slate-950 hover:bg-red-400 hover:shadow-red-500/20'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <Loader2 className="animate-spin" size={24} />
          ) : saved ? (
            <CheckCircle2 size={24} />
          ) : (
            <Save size={24} />
          )}
        </button>
      </div>
    </div>
  );
}
