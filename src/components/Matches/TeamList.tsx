import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, Plus, Loader2, LayoutGrid, List, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface Team {
  id: string;
  name: string;
  logo_url: string;
  type: 'local' | 'visitor';
}

export interface TeamListHandle {
  addTeam: () => Promise<void>;
  duplicateTeam: (id: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

interface TeamListProps {
  onSelectTeam?: (id: string | null) => void;
  selectedTeamId?: string | null;
}

const TeamList = forwardRef<TeamListHandle, TeamListProps>(({ onSelectTeam, selectedTeamId }, ref) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useImperativeHandle(ref, () => ({
    addTeam,
    duplicateTeam,
    deleteTeam
  }), [teams, selectedTeamId, onSelectTeam]);

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

  const duplicateTeam = async (id: string) => {
    const teamToCopy = teams.find(t => t.id === id);
    if (!teamToCopy) return;

    const newTeam = {
      name: `${teamToCopy.name} (Copia)`,
      logo_url: teamToCopy.logo_url,
      type: teamToCopy.type
    };

    try {
      const { data, error } = await supabase
        .from('match_teams')
        .insert([newTeam])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setTeams([...teams, data]);
        onSelectTeam?.(data.id);
      }
    } catch (error) {
      console.error('Error duplicating team:', error);
      alert('Error al duplicar equipo.');
    }
  };

  const deleteTeam = async (id: string) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('match_teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTeams(prev => prev.filter(t => t.id !== id));
      if (selectedTeamId === id) {
        onSelectTeam?.(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
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
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <div className="bg-brand-slate-900 p-1 rounded-xl border border-brand-slate-800 flex gap-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-red-500 text-slate-950" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-red-500 text-slate-950" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      )}>
        <AnimatePresence mode="popLayout">
          {teams.map((team) => (
            <motion.div
              key={team.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onSelectTeam?.(selectedTeamId === team.id ? null : team.id)}
              className={cn(
                "bento-card bg-brand-slate-900 border transition-all group relative cursor-pointer",
                selectedTeamId === team.id 
                  ? "border-red-500 ring-2 ring-red-500/20 shadow-2xl shadow-red-500/10" 
                  : "border-brand-slate-800 hover:border-brand-slate-700",
                viewMode === 'grid' ? "p-8 flex flex-col items-center gap-6" : "p-4 flex items-center gap-6"
              )}
            >
              <div className={cn(
                "flex items-center gap-2",
                viewMode === 'grid' ? "absolute top-4 left-4" : ""
              )}>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                  team.type === 'local' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                )}>
                  {team.type === 'local' ? 'Local' : 'Visitante'}
                </span>
                {selectedTeamId === team.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-slate-950 rounded-full p-0.5"
                  >
                    <CheckCircle2 size={12} />
                  </motion.div>
                )}
              </div>

              <div className="relative group/logo">
                <div className={cn(
                  "rounded-3xl bg-brand-slate-950 flex items-center justify-center overflow-hidden border-2 border-brand-slate-800 group-hover:border-red-500/50 transition-colors",
                  viewMode === 'grid' ? "w-32 h-32" : "w-16 h-16"
                )}>
                  {team.logo_url && team.logo_url.trim() !== '' ? (
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-slate-700" size={viewMode === 'grid' ? 32 : 20} />
                  )}
                </div>
                <label className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer rounded-3xl",
                )}>
                  <Upload className="text-white" size={viewMode === 'grid' ? 24 : 16} />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        updateTeam(team.id, { logo_url: url });
                      }
                    }}
                  />
                </label>
              </div>

              <div className={cn(
                "space-y-4",
                viewMode === 'grid' ? "w-full text-center" : "flex-1 flex items-center gap-4 space-y-0"
              )}>
                <div className="flex flex-col gap-1 flex-1">
                  {viewMode === 'grid' && <label className="text-[10px] font-bold text-slate-500 uppercase text-left pl-1">Nombre</label>}
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                    className={cn(
                      "bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 font-black text-white outline-none focus:border-red-500 uppercase tracking-tight transition-all",
                      viewMode === 'grid' ? "text-xl text-center w-full" : "text-sm text-left w-full max-w-md py-2"
                    )}
                    placeholder="Nombre del equipo"
                  />
                </div>
                
                {viewMode === 'grid' && (
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
                )}

                <div className={cn(
                  "flex gap-2",
                  viewMode === 'grid' ? "justify-center" : "justify-end"
                )}>
                  <button 
                    onClick={() => updateTeam(team.id, { type: 'local' })}
                    className={cn(
                      "font-bold uppercase px-3 py-1 rounded-full transition-all",
                      viewMode === 'grid' ? "text-[8px]" : "text-[10px]",
                      team.type === 'local' ? 'bg-red-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'
                    )}
                  >
                    Local
                  </button>
                  <button 
                    onClick={() => updateTeam(team.id, { type: 'visitor' })}
                    className={cn(
                      "font-bold uppercase px-3 py-1 rounded-full transition-all",
                      viewMode === 'grid' ? "text-[8px]" : "text-[10px]",
                      team.type === 'visitor' ? 'bg-blue-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'
                    )}
                  >
                    Visitante
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default TeamList;
