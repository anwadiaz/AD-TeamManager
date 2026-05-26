import { Trophy, Calendar, Users, Edit2, Trash2 } from 'lucide-react';
import type { Match } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (id: string) => void;
}

export default function MatchList({ matches, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {matches.map((match, index) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bento-card p-6 bg-brand-slate-900 flex flex-col gap-6 group hover:shadow-2xl hover:shadow-black/40 transition-all border-none"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={14} />
              <span className="text-xs font-mono">{formatDate(match.fecha)}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(match)}
                className="p-1.5 bg-brand-slate-950 rounded-lg text-slate-400 hover:text-red-400 border border-brand-slate-800"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => onDelete(match.id)}
                className="p-1.5 bg-brand-slate-950 rounded-lg text-slate-400 hover:text-red-400 border border-brand-slate-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 bg-brand-slate-800 rounded-2xl mx-auto mb-3 flex items-center justify-center text-red-500 font-bold">
                L
              </div>
              <h4 className="text-sm font-black uppercase text-white truncate">{match.equipo_local}</h4>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-white">{match.resultado_local}</span>
                <span className="text-slate-700 font-black text-2xl">-</span>
                <span className="text-4xl font-black text-white">{match.resultado_visitante}</span>
              </div>
              <div className="px-3 py-1 bg-brand-slate-950 rounded-full border border-brand-slate-800">
                <Trophy size={12} className="text-yellow-500" />
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="w-12 h-12 bg-brand-slate-800 rounded-2xl mx-auto mb-3 flex items-center justify-center text-blue-500 font-bold">
                V
              </div>
              <h4 className="text-sm font-black uppercase text-white truncate">{match.equipo_visitante}</h4>
            </div>
          </div>

          <div className="mt-auto px-4 py-2.5 bg-brand-slate-950 rounded-xl border border-brand-slate-800 flex items-center justify-center gap-2 text-slate-500 hover:text-red-400 cursor-pointer transition-colors">
            <Users size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ver Alineación</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
