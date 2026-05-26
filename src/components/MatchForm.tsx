import { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, Trophy, Users } from 'lucide-react';
import type { Match, Player, Lineup } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
  onSave: () => void;
  initialData?: Match | null;
}

export default function MatchForm({ onClose, onSave, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fecha: initialData?.fecha ? new Date(initialData.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    equipo_local: initialData?.equipo_local || '',
    equipo_visitante: initialData?.equipo_visitante || '',
    resultado_local: initialData?.resultado_local || 0,
    resultado_visitante: initialData?.resultado_visitante || 0,
  });

  useEffect(() => {
    fetchPlayers();
    if (initialData?.id) {
      fetchLineup(initialData.id);
    }
  }, [initialData]);

  const fetchPlayers = async () => {
    const { data } = await supabase.from('jugadores').select('*').order('nombre');
    setPlayers(data || []);
  };

  const fetchLineup = async (matchId: string) => {
    const { data } = await supabase.from('alineaciones').select('jugador_id').eq('partido_id', matchId);
    if (data) {
      setSelectedPlayers(data.map(l => l.jugador_id));
    }
  };

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let matchId = initialData?.id;

      if (matchId) {
        const { error } = await supabase.from('partidos').update(formData).eq('id', matchId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('partidos').insert([formData]).select();
        if (error) throw error;
        matchId = data[0].id;
      }

      // Update Lineup
      await supabase.from('alineaciones').delete().eq('partido_id', matchId);
      const lineupPayload = selectedPlayers.map(pid => ({
        partido_id: matchId,
        jugador_id: pid,
        es_titular: true
      }));
      
      if (lineupPayload.length > 0) {
        const { error: luError } = await supabase.from('alineaciones').insert(lineupPayload);
        if (luError) throw luError;
      }

      onSave();
      onClose();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-brand-slate-800"
      >
        <div className="px-6 py-4 border-b border-brand-slate-800 flex items-center justify-between bg-brand-slate-950/50">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            {initialData ? 'Editar Partido' : 'Registrar Partido'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[85vh] overflow-y-auto">
          {/* Info Partido */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <Trophy size={18} />
              <h3 className="text-sm font-black uppercase tracking-wider">Detalles del Encuentro</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Equipo Local</label>
                <input
                  required
                  className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.equipo_local}
                  onChange={(e) => setFormData({ ...formData, equipo_local: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Resultado Local</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.resultado_local}
                  onChange={(e) => setFormData({ ...formData, resultado_local: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Equipo Visitante</label>
                <input
                  required
                  className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.equipo_visitante}
                  onChange={(e) => setFormData({ ...formData, equipo_visitante: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Resultado Visitante</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                  value={formData.resultado_visitante}
                  onChange={(e) => setFormData({ ...formData, resultado_visitante: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Calendar size={12} /> Fecha del Encuentro
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 color-scheme-dark"
                value={formData.fecha}
                style={{ colorScheme: 'dark' }}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
          </div>

          {/* Alineacion Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-red-500">
                <Users size={18} />
                <h3 className="text-sm font-black uppercase tracking-wider">Convocatoria</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-brand-slate-950 rounded-lg">
                {selectedPlayers.length} SELECCIONADOS
              </span>
            </div>

            <div className="bg-brand-slate-950/40 border border-brand-slate-800 rounded-2xl p-4 h-[300px] overflow-y-auto grid grid-cols-1 gap-2">
              {players.map(player => (
                <div 
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPlayers.includes(player.id) 
                    ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                    : 'bg-brand-slate-900 border-brand-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedPlayers.includes(player.id) ? 'bg-red-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'
                  }`}>
                    {player.dorsal}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold truncate">{player.nombre} {player.apellidos}</p>
                    <p className="text-[10px] opacity-70 uppercase tracking-tighter">{player.demarcacion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-brand-slate-800 text-slate-400 rounded-xl font-medium hover:bg-brand-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-red-500 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-400 transition-all disabled:opacity-50 shadow-lg shadow-red-500/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Encuentro
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
