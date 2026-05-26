import { X, Trophy, Timer, Award, RectangleHorizontal, User as UserIcon, FileDown, Loader2 } from 'lucide-react';
import type { Player } from '../types';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface Props {
  player: Player;
  onClose: () => void;
}

export default function PlayerDetail({ player, onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);

    // Wait a bit for state to propagate if needed (optional)
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const element = contentRef.current;
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 4, // Higher definition
        backgroundColor: '#0f172a',
        width: width,
        height: height,
        filter: (node) => {
          const exclusionClasses = ['export-exclude'];
          if (node instanceof HTMLElement) {
            return !exclusionClasses.some(cls => node.classList.contains(cls));
          }
          return true;
        }
      });

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`Ficha_${player.nombre}_${player.apellidos}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-slate-950/80 backdrop-blur-md">
      <motion.div 
        ref={contentRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-brand-slate-800"
      >
        {/* Header with Background Pattern */}
        <div className="relative h-32 bg-red-500 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          
          <div className="absolute top-4 right-4 flex items-center gap-2 export-exclude">
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="p-2 bg-brand-slate-950/20 hover:bg-brand-slate-950/40 rounded-full text-white transition-all backdrop-blur-sm flex items-center gap-2 px-4 disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest">{isExporting ? 'Exportando...' : 'PDF'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-brand-slate-950/20 hover:bg-brand-slate-950/40 rounded-full text-white transition-all backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-end gap-6 mb-8">
            <div className="w-32 h-32 rounded-3xl bg-brand-slate-800 border-4 border-brand-slate-900 overflow-hidden shadow-xl">
              {player.foto_jugador ? (
                <img src={player.foto_jugador} alt={player.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <UserIcon size={48} />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <span className="text-4xl font-black text-white">{player.dorsal || '--'}</span>
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
                  {player.nombre} {player.apellidos}
                </h2>
              </div>
              <p className="text-red-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center sm:justify-start gap-2">
                {player.demarcacion} <span className="text-slate-700">•</span> {player.equipo || 'Sin Equipo'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stats Grid */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Award size={12} className="text-red-500" /> Rendimiento de Temporada
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Goles" value={player.goles} icon={<Trophy size={14} />} color="red" />
                <StatCard label="Asistencias" value={player.asistencias} icon={<Award size={14} />} color="blue" />
                <StatCard label="Amarillas" value={player.tarjetas_amarillas} icon={<RectangleHorizontal size={14} className="rotate-90" />} color="yellow" />
                <StatCard label="Rojas" value={player.tarjetas_rojas} icon={<RectangleHorizontal size={14} className="rotate-90" />} color="red" />
              </div>

              <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Timer size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Minutos Jugados</span>
                </div>
                <span className="text-2xl font-black text-white">{player.minutos_jugados}</span>
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <UserIcon size={12} className="text-red-500" /> Datos Generales
              </h3>
              
              <div className="bg-brand-slate-950 rounded-2xl border border-brand-slate-800 divide-y divide-brand-slate-800">
                <InfoRow label="Lateralidad" value={player.lateralidad} />
                <InfoRow label="Talla" value={player.talla ? `${player.talla} cm` : '--'} />
                <InfoRow label="Nacimiento" value={formatDate(player.fecha_nacimiento)} />
                <InfoRow label="Fichaje" value={formatDate(player.created_at)} />
              </div>

              {player.observaciones && (
                <div className="p-4 bg-brand-slate-800/30 rounded-2xl border border-brand-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Observaciones Tácticas</p>
                  <p className="text-sm text-slate-300 italic">"{player.observaciones}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10'
  };

  return (
    <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800">
      <div className={`p-1.5 rounded-lg w-fit mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value || 0}</div>
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
