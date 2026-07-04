import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Player, Evaluation } from '../types';
import { Star, Send, Loader2, User, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  players: Player[];
  session: any;
}

export default function EvaluationManager({ players, session }: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState<(Evaluation & { jugadores: Player })[]>([]);
  const [fetching, setFetching] = useState(true);
  const [detalles, setDetalles] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const criteriaByPosition: Record<string, string[]> = {
    'Portero': ['Reflejos', 'Juego de Pies', 'Salidas', 'Blocaje', 'Comunicación', 'Penaltis', 'Posicionamiento', 'Agilidad', 'Saque de mano', '1 contra 1'],
    'Defensa': ['Marcaje', 'Anticipación', 'Salida de Balón', 'Contundencia', 'Juego Aéreo', 'Velocidad', 'Reacción', 'Disciplina', 'Fuerza', 'Liderazgo'],
    'Centrocampista': ['Visión', 'Pase Corto', 'Control', 'Recuperación', 'Pase Largo', 'Resistencia', 'Toma de Decisiones', 'Conducción', 'Golpeo Lejano', 'Equilibrio'],
    'Delantero': ['Definición', 'Desmarque', 'Regate', 'Finalización', 'Potencia de Tiro', 'Agilidad', 'Cabeceo', 'Presión', 'Velocidad Punta', 'Olfato']
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  useEffect(() => {
    if (selectedPlayer && !editingId) {
      const criteria = criteriaByPosition[selectedPlayer.demarcacion] || [];
      const newDetalles: Record<string, number> = {};
      criteria.forEach(c => {
        newDetalles[c] = 5;
      });
      setDetalles(newDetalles);
    } else if (!selectedPlayer) {
      setDetalles({});
    }
  }, [selectedPlayerId, editingId]);

  const fetchEvaluations = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('evaluaciones')
      .select('*, jugadores(*)')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setEvaluations(data as any);
    }
    setFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId || !session?.user?.id) return;

    setLoading(true);
    
    // Format JSON details within the comment field to avoid schema changes
    const detailedComment = JSON.stringify({
      texto: comentario,
      detalles: detalles
    });

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('evaluaciones')
        .update({
          jugador_id: selectedPlayerId,
          nota,
          comentario: detailedComment,
          fecha: new Date().toISOString().split('T')[0]
        })
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('evaluaciones')
        .insert({
          jugador_id: selectedPlayerId,
          usuario_id: session.user.id,
          nota,
          comentario: detailedComment,
          fecha: new Date().toISOString().split('T')[0]
        });
      error = insertError;
    }

    if (!error) {
      setComentario('');
      setSelectedPlayerId('');
      setNota(5);
      setDetalles({});
      setEditingId(null);
      fetchEvaluations();
      alert(editingId ? 'Evaluación actualizada con éxito' : 'Evaluación publicada con éxito');
    } else {
      console.error('Full evaluation submission error:', error);
      alert(`Error al guardar la evaluación: ${error.message} (${error.code})`);
    }
    setLoading(false);
  };

  const handleEdit = (ev: Evaluation & { jugadores: Player }) => {
    const { texto, detalles: evDetalles } = parseComment(ev.comentario);
    setEditingId(ev.id);
    setSelectedPlayerId(ev.jugador_id);
    setNota(ev.nota);
    setComentario(texto);
    setDetalles(evDetalles || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar esta evaluación?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('evaluaciones')
      .delete()
      .eq('id', id);

    if (!error) {
      setEvaluations(prev => prev.filter(e => e.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setSelectedPlayerId('');
        setNota(5);
        setComentario('');
        setDetalles({});
      }
    } else {
      alert('Error al borrar evaluación: ' + error.message);
    }
    setLoading(false);
  };

  const parseComment = (comment: string) => {
    try {
      const parsed = JSON.parse(comment);
      if (parsed && typeof parsed === 'object' && 'detalles' in parsed) {
        return parsed as { texto: string, detalles: Record<string, number> };
      }
    } catch (e) {
      // Not JSON, return as plain text
    }
    return { texto: comment, detalles: null };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Side */}
      <div className="space-y-6">
        <div className="bento-card bg-brand-slate-900/50 p-6 border border-brand-slate-800">
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tighter flex items-center gap-2">
            <Star className="text-red-500" size={20} /> {editingId ? 'Editar Evaluación' : 'Nueva Evaluación'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 px-1">Seleccionar Jugador</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
              >
                <option value="">-- Elige un jugador --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} {p.apellidos} ({p.demarcacion})</option>
                ))}
              </select>
            </div>

            {selectedPlayer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-brand-slate-800/30 rounded-xl border border-brand-slate-800"
              >
                {Object.keys(detalles).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">{key}</label>
                      <span className="text-[10px] font-bold text-red-500">{detalles[key]}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      className="w-full accent-red-500/50 h-1 bg-brand-slate-800 rounded-lg appearance-none cursor-pointer"
                      value={detalles[key]}
                      onChange={(e) => setDetalles(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 px-1">Calificación Global (1-10)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  className="flex-1 accent-red-500 h-2 bg-brand-slate-800 rounded-lg appearance-none cursor-pointer"
                  value={nota}
                  onChange={(e) => setNota(Number(e.target.value))}
                />
                <span className="w-12 h-12 flex items-center justify-center bg-red-500 text-slate-950 font-black text-xl rounded-xl shadow-lg shadow-red-500/20">
                  {nota}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 px-1">Comentarios / Observaciones</label>
              <textarea
                className="w-full bg-brand-slate-800 border border-brand-slate-700 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
                placeholder="Describe el rendimiento..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !selectedPlayerId}
                className="flex-1 bg-red-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    {editingId ? 'Actualizar Evaluación' : 'Publicar Evaluación'}
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setSelectedPlayerId('');
                    setNota(5);
                    setComentario('');
                    setDetalles({});
                  }}
                  className="px-4 py-3 bg-brand-slate-800 text-slate-400 font-bold rounded-xl hover:bg-brand-slate-700 transition-all border border-brand-slate-700 uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* History Side */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 flex items-center justify-between">
          Historial de Evaluaciones
          {fetching && <Loader2 size={12} className="animate-spin" />}
        </h4>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {evaluations.length === 0 && !fetching ? (
            <div className="text-center py-20 bg-brand-slate-950/20 rounded-2xl border border-dashed border-brand-slate-800">
              <Star className="mx-auto w-10 h-10 text-brand-slate-800 mb-3" />
              <p className="text-slate-500 text-xs">Aún no hay evaluaciones registradas</p>
            </div>
          ) : (
            evaluations.map((ev, idx) => (
              <motion.div 
                key={ev.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "border p-5 rounded-2xl relative overflow-hidden group transition-all",
                  editingId === ev.id 
                    ? "bg-red-500/5 border-red-500/50 shadow-lg shadow-red-500/10" 
                    : "bg-brand-slate-900 border-brand-slate-800 hover:border-brand-slate-700"
                )}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 -mr-8 -mt-8 rounded-full"></div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group/player"
                    onClick={() => handleEdit(ev)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-slate-800 border border-brand-slate-700 flex items-center justify-center shrink-0 overflow-hidden group-hover/player:border-red-500/50 transition-colors">
                      {ev.jugadores?.foto_jugador ? (
                        <img src={ev.jugadores.foto_jugador} alt="" className="w-full h-full object-cover" />
                      ) : <User className="text-slate-600" size={20} />}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white group-hover/player:text-red-500 transition-colors">
                        {ev.jugadores?.nombre} {ev.jugadores?.apellidos}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="bg-brand-slate-800 px-2 py-0.5 rounded border border-brand-slate-700 text-slate-400 capitalize">
                          {ev.jugadores?.demarcacion}
                        </span>
                        <span>•</span>
                        <Calendar size={10} />
                        {new Date(ev.fecha).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl font-black text-lg border border-red-500/20 shadow-inner">
                        {ev.nota}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(ev.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors bg-brand-slate-950/50 rounded-lg border border-brand-slate-800"
                        title="Borrar evaluación"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {(() => {
                  const { texto, detalles: evDetalles } = parseComment(ev.comentario);
                  return (
                    <div className="mt-4 space-y-3">
                      {evDetalles && (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(evDetalles).map(([k, v]) => (
                            <div key={k} className="bg-brand-slate-950/40 p-2 rounded-lg border border-brand-slate-800/50">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 uppercase font-medium">{k}</span>
                                <span className="text-[10px] font-bold text-slate-300">{v}</span>
                              </div>
                              <div className="w-full bg-brand-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div 
                                  className="h-full bg-red-500/40" 
                                  style={{ width: `${(v as number) * 10}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {texto && (
                        <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-red-500/30 pl-3">
                          "{texto}"
                        </p>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
