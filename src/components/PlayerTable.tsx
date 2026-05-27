import { Edit2, Trash2, Eye, User, Trophy, Award, Timer, RectangleHorizontal } from 'lucide-react';
import type { Player } from '../types';
import { motion } from 'motion/react';

interface Props {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onView: (player: Player) => void;
}

export default function PlayerTable({ players, onEdit, onDelete, onView }: Props) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-brand-slate-800 bg-brand-slate-950/40">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-brand-slate-800 bg-brand-slate-900/50">
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Jugador</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Pos</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Talla</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><Trophy size={12} className="inline mr-1" /> G</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><Award size={12} className="inline mr-1" /> A</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><RectangleHorizontal size={10} className="inline rotate-90 text-yellow-500" /></th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><RectangleHorizontal size={10} className="inline rotate-90 text-red-500" /></th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center"><Timer size={12} className="inline mr-1" /> MIN</th>
            <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-slate-800">
          {players.map((player, index) => (
            <motion.tr 
              key={player.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-brand-slate-900/40 transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-slate-800 border border-brand-slate-700 flex items-center justify-center font-bold text-xs text-red-500 shrink-0 overflow-hidden">
                    {player.foto_jugador ? (
                      <img src={player.foto_jugador} alt="" className="w-full h-full object-cover" />
                    ) : player.dorsal || '--'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white leading-none">{player.nombre} {player.apellidos}</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-1">Dorsal {player.dorsal}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-slate-800 text-slate-400 border border-brand-slate-700">
                  {player.demarcacion?.substring(0, 3).toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-xs font-mono text-slate-400">
                {player.talla ? `${player.talla}cm` : '--'}
              </td>
              <td className="px-4 py-3 text-center font-mono text-sm text-white font-bold">{player.goles || 0}</td>
              <td className="px-4 py-3 text-center font-mono text-sm text-slate-400">{player.asistencias || 0}</td>
              <td className="px-4 py-3 text-center font-mono text-sm text-yellow-500/80">{player.tarjetas_amarillas || 0}</td>
              <td className="px-4 py-3 text-center font-mono text-sm text-red-500/80">{player.tarjetas_rojas || 0}</td>
              <td className="px-4 py-3 text-center font-mono text-sm text-blue-400">{player.minutos_jugados || 0}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onView(player)} className="p-2 text-slate-500 active:text-white transition-colors">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onEdit(player)} className="p-2 text-slate-500 active:text-red-500 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(player.id)} className="p-2 text-slate-500 active:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
