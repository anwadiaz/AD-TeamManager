import { useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Trash2, Plus } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo: string;
  type: 'local' | 'visitor';
}

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'At. Central B', logo: 'https://placehold.co/100x100/1e293b/ef4444?text=AC', type: 'local' },
    { id: '2', name: 'Rival C.F.', logo: 'https://placehold.co/100x100/1e293b/3b82f6?text=RV', type: 'visitor' },
  ]);

  const updateTeamName = (id: string, name: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name } : t));
  };

  const handleLogoChange = (id: string, url: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, logo: url } : t));
  };

  const addTeam = () => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name: 'Nuevo Equipo',
      logo: 'https://placehold.co/100x100/1e293b/slate?text=?',
      type: 'visitor'
    };
    setTeams([...teams, newTeam]);
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          layout
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
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <Upload className="text-slate-700" size={32} />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer rounded-3xl">
              <Upload className="text-white" size={24} />
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    handleLogoChange(team.id, url);
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
                onChange={(e) => updateTeamName(team.id, e.target.value)}
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
                value={team.logo.startsWith('blob:') ? '' : team.logo}
                onChange={(e) => handleLogoChange(team.id, e.target.value)}
              />
            </div>

            <div className="flex justify-center gap-2">
              <button 
                onClick={() => setTeams(teams.map(t => t.id === team.id ? { ...t, type: 'local' } : t))}
                className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-all ${team.type === 'local' ? 'bg-red-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'}`}
              >
                Local
              </button>
              <button 
                onClick={() => setTeams(teams.map(t => t.id === team.id ? { ...t, type: 'visitor' } : t))}
                className={`text-[8px] font-bold uppercase px-3 py-1 rounded-full transition-all ${team.type === 'visitor' ? 'bg-blue-500 text-slate-950' : 'bg-brand-slate-800 text-slate-500'}`}
              >
                Visitante
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      <button 
        onClick={addTeam}
        className="md:col-span-2 bento-card p-12 border-2 border-dashed border-brand-slate-800 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all group bg-transparent"
      >
        <div className="p-4 bg-brand-slate-900 rounded-2xl group-hover:bg-red-500/10 transition-colors">
          <Plus className="group-hover:rotate-90 transition-transform duration-300" size={32} />
        </div>
        <span className="font-black uppercase tracking-widest text-xs">Añadir Nuevo Equipo</span>
      </button>
    </div>
  );
}
