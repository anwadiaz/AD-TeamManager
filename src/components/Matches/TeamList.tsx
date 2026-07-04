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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 flex flex-col items-center gap-6 group relative"
        >
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
              team.type === 'local' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {team.type === 'local' ? 'Local' : 'Visitante'}
            </span>
          </div>

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
            <input
              type="text"
              value={team.name}
              onChange={(e) => updateTeamName(team.id, e.target.value)}
              className="bg-transparent border-b-2 border-brand-slate-800 focus:border-red-500 outline-none text-2xl font-black text-white text-center w-full pb-2 uppercase tracking-tight"
              placeholder="Nombre del equipo"
            />
            
            <div className="flex gap-2 justify-center">
              <input 
                type="text"
                placeholder="URL del escudo..."
                className="bg-brand-slate-950 border border-brand-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 w-full outline-none focus:border-red-500/50"
                value={team.logo.startsWith('blob:') ? '' : team.logo}
                onChange={(e) => handleLogoChange(team.id, e.target.value)}
              />
            </div>
          </div>
        </motion.div>
      ))}

      <button className="md:col-span-2 bento-card p-6 border-2 border-dashed border-brand-slate-800 flex items-center justify-center gap-3 text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all group">
        <Plus className="group-hover:scale-110 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-xs">Añadir Equipo</span>
      </button>
    </div>
  );
}
