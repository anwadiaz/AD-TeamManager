import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Calendar, Users, Save, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Team {
  id: string;
  name: string;
  logo_url: string;
}

export default function MatchCreate() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    equipo_local: '',
    equipo_visitante: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('match_teams')
        .select('id, name, logo_url')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setTeams(data || []);
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          equipo_local: data[0].name,
          equipo_visitante: data.length > 1 ? data[1].name : data[0].name
        }));
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.equipo_local || !formData.equipo_visitante) {
      alert('Por favor selecciona ambos equipos');
      return;
    }

    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from('partidos')
        .insert([{
          equipo_local: formData.equipo_local,
          equipo_visitante: formData.equipo_visitante,
          fecha: formData.fecha,
          resultado_local: 0,
          resultado_visitante: 0
        }]);

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Error al guardar el partido. Asegúrate de tener la tabla "matches" configurada.');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl">
            <Trophy className="text-red-500" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Alta Partido</h2>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Configura el próximo encuentro</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`p-4 rounded-2xl transition-all shadow-2xl active:scale-95 ${
            saved 
              ? 'bg-green-500 text-slate-950' 
              : 'bg-red-500 text-slate-950 hover:bg-red-400 hover:shadow-red-500/20'
          } disabled:opacity-50`}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : saved ? <CheckCircle2 size={24} /> : <Save size={24} />}
        </button>
      </div>

      <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 space-y-8 shadow-2xl shadow-black/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Local Team */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Shield className="text-red-500" size={14} />
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equipo Local</label>
            </div>
            <select
              value={formData.equipo_local}
              onChange={(e) => setFormData({ ...formData, equipo_local: e.target.value })}
              className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-tight text-xl outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
            >
              {teams.map(team => (
                <option key={team.id} value={team.name} className="bg-brand-slate-900">{team.name}</option>
              ))}
            </select>
          </div>

          {/* Visitor Team */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Users className="text-blue-500" size={14} />
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equipo Visitante</label>
            </div>
            <select
              value={formData.equipo_visitante}
              onChange={(e) => setFormData({ ...formData, equipo_visitante: e.target.value })}
              className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-tight text-xl outline-none focus:border-red-500 transition-all appearance-none cursor-pointer"
            >
              {teams.map(team => (
                <option key={team.id} value={team.name} className="bg-brand-slate-900">{team.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selector */}
        <div className="space-y-4 pt-4 border-t border-brand-slate-800/50">
          <div className="flex items-center gap-2 pl-1">
            <Calendar className="text-slate-500" size={14} />
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha del Partido</label>
          </div>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-black tracking-widest outline-none focus:border-red-500 transition-all"
          />
        </div>

        {/* Info Card */}
        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Trophy size={20} />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-medium">
              Selecciona los equipos que participarán en el próximo encuentro. Asegúrate de haber dado de alta previamente a los equipos en la sección correspondiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
