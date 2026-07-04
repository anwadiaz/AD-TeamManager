import React from 'react';
import { Calendar, Users, Trophy, ChevronRight, Plus, MapPin, Clock } from 'lucide-react';
import type { Match } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface MatchListProps {
  matches: Match[];
  onAddMatch: () => void;
  onSelectMatch?: (id: string) => void;
}

export default function MatchList({ matches, onAddMatch, onSelectMatch }: MatchListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Calendario</h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de próximos encuentros</p>
        </div>
        <button
          onClick={onAddMatch}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-red-500/20"
        >
          <Plus size={16} />
          Nuevo Partido
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {matches.length === 0 ? (
          <div className="text-center py-20 bg-brand-slate-950/20 rounded-[40px] border-2 border-dashed border-brand-slate-800">
            <Calendar className="mx-auto w-16 h-16 text-brand-slate-800 mb-4 opacity-20" />
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">No hay partidos programados</p>
          </div>
        ) : (
          matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div 
                onClick={() => onSelectMatch?.(match.id)}
                className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 hover:border-red-500/30 transition-all cursor-pointer overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Trophy size={120} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center w-20 h-20 bg-brand-slate-950 rounded-2xl border border-brand-slate-800 shrink-0">
                    <span className="text-[10px] font-black text-red-500 uppercase">
                      {new Date(match.fecha).toLocaleString('es-ES', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black text-white">
                      {new Date(match.fecha).getDate()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600">
                      {new Date(match.fecha).getFullYear()}
                    </span>
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-red-500/20">
                        {match.equipo_local === 'Mis Equipos' ? 'Local' : 'Visitante'}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase">
                          {new Date(match.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                        {match.equipo_local}
                      </h4>
                      <div className="px-3 py-1 bg-brand-slate-950 rounded-lg border border-brand-slate-800 text-slate-400 font-black text-xs">
                        VS
                      </div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight italic">
                        {match.equipo_visitante || match.rival}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-red-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {match.equipo_local === 'Mis Equipos' ? 'Ciudad Deportiva' : 'Campo Rival'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-blue-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {match.alineacion ? Object.keys(match.alineacion).length : 0} convocados
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    {match.resultado_local !== undefined && (
                      <div className="flex items-center gap-1 px-4 py-2 bg-brand-slate-950 rounded-xl border border-brand-slate-800">
                        <span className="text-lg font-black text-white">{match.resultado_local}</span>
                        <span className="text-slate-600">-</span>
                        <span className="text-lg font-black text-white">{match.resultado_visitante}</span>
                      </div>
                    )}
                    <div className="p-3 bg-brand-slate-950 text-slate-600 rounded-xl border border-brand-slate-800 group-hover:text-red-500 group-hover:border-red-500/50 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
