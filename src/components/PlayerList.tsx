import { Edit2, Trash2, User, Eye } from 'lucide-react';
import type { Player } from '../types';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onView: (player: Player) => void;
}

export default function PlayerList({ players, onEdit, onDelete, onView }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bento-card overflow-hidden group hover:shadow-2xl hover:shadow-black/40 transition-all duration-300"
        >
          <div className="relative h-48 overflow-hidden bg-brand-slate-800">
            {player.foto_jugador && player.foto_jugador.trim() !== '' ? (
              <img 
                src={player.foto_jugador} 
                alt={player.nombre} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <User size={64} strokeWidth={1} />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className="w-10 h-10 flex items-center justify-center bg-brand-slate-950/80 backdrop-blur shadow-sm rounded-xl font-bold text-lg text-red-500 border border-brand-slate-800">
                {player.dorsal || '--'}
              </span>
            </div>
            <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onView(player)}
                className="p-2 bg-brand-slate-950/90 backdrop-blur rounded-xl text-slate-400 hover:text-white shadow-sm transition-colors border border-brand-slate-800"
                title="Ver Detalle"
              >
                <Eye size={16} />
              </button>
              <button 
                onClick={() => onEdit(player)}
                className="p-2 bg-brand-slate-950/90 backdrop-blur rounded-xl text-slate-400 hover:text-red-400 shadow-sm transition-colors border border-brand-slate-800"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => onDelete(player.id)}
                className="p-2 bg-brand-slate-950/90 backdrop-blur rounded-xl text-slate-400 hover:text-red-400 shadow-sm transition-colors border border-brand-slate-800"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-5">
            <div className="mb-4">
              <h3 className="text-xl font-display font-bold text-white truncate">
                {player.apodo || `${player.nombre} ${player.apellidos}`}
              </h3>
              <p className="text-sm font-medium flex items-center gap-1 mt-1">
                <span className="text-red-500">{player.demarcacion}</span>
                <span className="text-slate-700">•</span>
                <span className="text-slate-400">{player.equipo || 'Sin equipo'}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-brand-slate-800 pt-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Lateralidad</span>
                <span className="font-semibold text-slate-300">{player.lateralidad}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold">Nacimiento</span>
                <span className="font-semibold text-slate-300">{formatDate(player.fecha_nacimiento)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center bg-brand-slate-950/40 p-2 rounded-xl border border-brand-slate-800">
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">PJ</div>
                <div className="text-[10px] font-bold text-white">{player.partidos_jugados || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">PT</div>
                <div className="text-[10px] font-bold text-white">{player.titularidades || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">MIN</div>
                <div className="text-[10px] font-bold text-blue-400">{player.minutos_jugados || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">G</div>
                <div className="text-[10px] font-bold text-white">{player.goles || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">A</div>
                <div className="text-[10px] font-bold text-white">{player.asistencias || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">TA</div>
                <div className="text-[10px] font-bold text-yellow-500">{player.tarjetas_amarillas || 0}</div>
              </div>
              <div>
                <div className="text-[7px] text-slate-500 font-bold uppercase">TR</div>
                <div className="text-[10px] font-bold text-red-500">{player.tarjetas_rojas || 0}</div>
              </div>
            </div>

            {player.observaciones && (
              <p className="mt-4 text-xs text-slate-500 line-clamp-2 italic">
                "{player.observaciones}"
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
