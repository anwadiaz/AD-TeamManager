import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  logo_url: string;
  type: 'local' | 'visitor';
}

export interface TeamListHandle {
  addTeam: () => Promise<void>;
}

const TeamList = forwardRef<TeamListHandle, {}>((props, ref) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    addTeam
  }));

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('match_teams')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async () => {
    const newTeam = {
      name: 'Nuevo Equipo',
      logo_url: 'https://placehold.co/100x100/1e293b/slate?text=?',
      type: 'visitor' as const
    };

    try {
      const { data, error } = await supabase
        .from('match_teams')
        .insert([newTeam])
        .select()
        .single();
      
      if (error) throw error;
      if (data) setTeams([...teams, data]);
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Error al añadir equipo: Asegúrate de haber ejecutado el SQL en Supabase.');
    }
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      const { error } = await supabase
        .from('match_teams')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      setTeams(teams.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Error al actualizar: Asegúrate de haber ejecutado el SQL en Supabase.');
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('match_teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setTeams(teams.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Error al borrar: Asegúrate de haber ejecutado el SQL en Supabase.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <AnimatePresence mode="popLayout">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 flex flex-col items-center gap-6 group relative"
          >
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                team.type === 'local' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                {team.type === 'local' ? 'Local' : 'Visitante'}
              </span>
            </div>

            <button 
              onClick={() => deleteTeam(team.id)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>

            <div className="relative group/logo">
              <div className="w-32 h-32 rounded-3xl bg-brand-slate-950 flex items-center justify-center overflow-hidden border-2 border-brand-slate-800 group-hover:border-red-500/50 transition-colors">
                {team.logo_url && team.logo_url.trim() !== '' ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <Upload className="text-slate-700" size={32} />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                <Upload className="text-white" size={24} />
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Note: In a production app, you'd upload this to Supabase Storage
                      // For now we'll use a local object URL to demonstrate
                      const url = URL.createObjectURL(file);
                      updateTeam(team.id, { logo_url: url });
                    }
                  }}
                />
              </label>
            </div>

            <div className="w-full text-center space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase text-left pl-1">Nombre</label>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                  onBlur={(e) => updateTeam(team.id, { name: e.target.value })}
                  className="bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 text-xl font-black text-white text-center w-full outline-none focus:border-red-500 uppercase tracking-tight transition-all"
                  placeholder="Nombre del equipo"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase text-left pl-1">URL Escudo</label>
                <input 
                  type="text"
                  placeholder="https://..."
                  className="bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 w-full outline-none focus:border-red-500/50"
                  value={team.logo_url.startsWith('blob:') ? '' : team.logo_url}
                  onChange={(e) => updateTeam(team.id, { logo_url: e.target.value })}
                />
              </div>

              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => updateTeam(team.id, { type: 'local' })}
                  className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-all ${team.type === 'local' ? 'bg-red-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'}`}
                >
                  Local
                </button>
                <button 
                  onClick={() => updateTeam(team.id, { type: 'visitor' })}
                  className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-all ${team.type === 'visitor' ? 'bg-blue-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'}`}
                >
                  Visitante
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

export default TeamList;
