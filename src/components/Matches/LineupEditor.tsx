import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Settings2, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Layout,
  Plus,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Player } from '../../types';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FormationType = '4-4-2' | '4-3-3' | '3-5-2' | '4-2-3-1' | '5-3-2';

interface Position {
  id: string;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
}

const FORMATIONS: Record<FormationType, Position[]> = {
  '4-4-2': [
    { id: 'pos-1', label: 'POR', x: 50, y: 90 },
    { id: 'pos-2', label: 'LD', x: 85, y: 70 },
    { id: 'pos-3', label: 'DFC', x: 65, y: 70 },
    { id: 'pos-4', label: 'DFC', x: 35, y: 70 },
    { id: 'pos-5', label: 'LI', x: 15, y: 70 },
    { id: 'pos-6', label: 'MD', x: 85, y: 40 },
    { id: 'pos-7', label: 'MC', x: 60, y: 45 },
    { id: 'pos-8', label: 'MC', x: 40, y: 45 },
    { id: 'pos-9', label: 'MI', x: 15, y: 40 },
    { id: 'pos-10', label: 'DC', x: 60, y: 15 },
    { id: 'pos-11', label: 'DC', x: 40, y: 15 },
  ],
  '4-3-3': [
    { id: 'pos-1', label: 'POR', x: 50, y: 90 },
    { id: 'pos-2', label: 'LD', x: 85, y: 70 },
    { id: 'pos-3', label: 'DFC', x: 65, y: 70 },
    { id: 'pos-4', label: 'DFC', x: 35, y: 70 },
    { id: 'pos-5', label: 'LI', x: 15, y: 70 },
    { id: 'pos-6', label: 'MC', x: 50, y: 55 },
    { id: 'pos-7', label: 'MC', x: 75, y: 45 },
    { id: 'pos-8', label: 'MC', x: 25, y: 45 },
    { id: 'pos-9', label: 'ED', x: 85, y: 20 },
    { id: 'pos-10', label: 'DC', x: 50, y: 15 },
    { id: 'pos-11', label: 'EI', x: 15, y: 20 },
  ],
  '3-5-2': [
    { id: 'pos-1', label: 'POR', x: 50, y: 90 },
    { id: 'pos-2', label: 'DFC', x: 75, y: 75 },
    { id: 'pos-3', label: 'DFC', x: 50, y: 75 },
    { id: 'pos-4', label: 'DFC', x: 25, y: 75 },
    { id: 'pos-5', label: 'MD', x: 90, y: 45 },
    { id: 'pos-6', label: 'MC', x: 65, y: 50 },
    { id: 'pos-7', label: 'MC', x: 50, y: 60 },
    { id: 'pos-8', label: 'MC', x: 35, y: 50 },
    { id: 'pos-9', label: 'MI', x: 10, y: 45 },
    { id: 'pos-10', label: 'DC', x: 65, y: 20 },
    { id: 'pos-11', label: 'DC', x: 35, y: 20 },
  ],
  '4-2-3-1': [
    { id: 'pos-1', label: 'POR', x: 50, y: 90 },
    { id: 'pos-2', label: 'LD', x: 85, y: 70 },
    { id: 'pos-3', label: 'DFC', x: 65, y: 70 },
    { id: 'pos-4', label: 'DFC', x: 35, y: 70 },
    { id: 'pos-5', label: 'LI', x: 15, y: 70 },
    { id: 'pos-6', label: 'MCD', x: 60, y: 55 },
    { id: 'pos-7', label: 'MCD', x: 40, y: 55 },
    { id: 'pos-8', label: 'MD', x: 85, y: 35 },
    { id: 'pos-9', label: 'MCO', x: 50, y: 35 },
    { id: 'pos-10', label: 'MI', x: 15, y: 35 },
    { id: 'pos-11', label: 'DC', x: 50, y: 15 },
  ],
  '5-3-2': [
    { id: 'pos-1', label: 'POR', x: 50, y: 90 },
    { id: 'pos-2', label: 'CAD', x: 90, y: 65 },
    { id: 'pos-3', label: 'DFC', x: 65, y: 75 },
    { id: 'pos-4', label: 'DFC', x: 50, y: 75 },
    { id: 'pos-5', label: 'DFC', x: 35, y: 75 },
    { id: 'pos-6', label: 'CAI', x: 10, y: 65 },
    { id: 'pos-7', label: 'MC', x: 65, y: 45 },
    { id: 'pos-8', label: 'MC', x: 50, y: 55 },
    { id: 'pos-9', label: 'MC', x: 35, y: 45 },
    { id: 'pos-10', label: 'DC', x: 60, y: 20 },
    { id: 'pos-11', label: 'DC', x: 40, y: 20 },
  ],
};

interface SortablePlayerItemProps {
  player: Player | null;
  isPlaceholder?: boolean;
}

const SortablePlayerItem: React.FC<SortablePlayerItemProps> = ({ player, isPlaceholder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player?.id || 'placeholder' });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!player) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 p-3 bg-brand-slate-900 border border-brand-slate-800 rounded-xl cursor-grab active:cursor-grabbing hover:border-red-500/50 transition-all",
        isPlaceholder && "opacity-50 border-dashed"
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-brand-slate-950 flex items-center justify-center font-bold text-xs text-red-500 border border-brand-slate-800">
        {player.dorsal}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate uppercase">{player.apodo || player.nombre}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.demarcacion}</p>
      </div>
    </div>
  );
}

export default function LineupEditor() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineup, setLineup] = useState<Record<string, string | null>>({}); // posId -> playerId
  const [formation, setFormation] = useState<FormationType>('4-4-2');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: playersData, error: playersError } = await supabase
        .from('jugadores')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Initialize empty lineup
      const initialLineup: Record<string, string | null> = {};
      FORMATIONS[formation].forEach(pos => {
        initialLineup[pos.id] = null;
      });
      setLineup(initialLineup);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const playerId = active.id as string;
    const overId = over.id as string;

    // If dropped over a position
    if (overId.startsWith('pos-')) {
      // Check if player is already in another position
      const prevPos = Object.keys(lineup).find(key => lineup[key] === playerId);
      
      setLineup(prev => {
        const next = { ...prev };
        if (prevPos) next[prevPos] = null;
        next[overId] = playerId;
        return next;
      });
    }
  };

  const removeFromLineup = (posId: string) => {
    setLineup(prev => ({ ...prev, [posId]: null }));
  };

  const handleSave = async () => {
    setSaving(true);
    // In a real app, we would save this to a 'lineups' table linked to a match
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const resetLineup = () => {
    const nextLineup: Record<string, string | null> = {};
    FORMATIONS[formation].forEach(pos => {
      nextLineup[pos.id] = null;
    });
    setLineup(nextLineup);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  const activePlayer = players.find(p => p.id === activeId);
  const usedPlayerIds = Object.values(lineup).filter(id => id !== null) as string[];
  const availablePlayers = players.filter(p => !usedPlayerIds.includes(p.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
      {/* Sidebar: Available Players */}
      <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="text-red-500" size={20} />
            <h3 className="font-black text-white uppercase tracking-tight italic">Disponibles</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-brand-slate-900 px-2 py-1 rounded-lg border border-brand-slate-800">
            {availablePlayers.length}
          </span>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <SortableContext 
              items={availablePlayers.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {availablePlayers.map(player => (
                <SortablePlayerItem key={player.id} player={player} />
              ))}
            </SortableContext>
            
            {availablePlayers.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-brand-slate-800 rounded-2xl">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest leading-loose">
                  No hay más jugadores disponibles
                </p>
              </div>
            )}
          </div>

          {/* Drag Overlay for smooth dragging */}
          <DragOverlay>
            {activeId && activePlayer ? (
              <div className="flex items-center gap-3 p-3 bg-red-500 border border-red-400 rounded-xl shadow-2xl scale-105 rotate-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs text-white">
                  {activePlayer.dorsal}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white uppercase">{activePlayer.apodo || activePlayer.nombre}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Main Stage: Soccer Field */}
      <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
        <div className="bento-card relative aspect-[3/4] bg-emerald-900 rounded-[40px] overflow-hidden border-8 border-brand-slate-900 shadow-2xl shadow-black/60 group">
          {/* Field Markings */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-[30px]" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white/20 border-t-0 rounded-b-2xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-white/20 border-b-0 rounded-t-2xl" />
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/20 rounded-full" />
          
          {/* Grass Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.2) 80px)' }} 
          />

          {/* Player Positions */}
          <DndContext 
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            {FORMATIONS[formation].map((pos) => {
              const assignedPlayerId = lineup[pos.id];
              const player = players.find(p => p.id === assignedPlayerId);
              
              return (
                <PositionMarker 
                  key={pos.id} 
                  pos={pos} 
                  player={player || null} 
                  onRemove={() => removeFromLineup(pos.id)} 
                />
              );
            })}
          </DndContext>

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button 
              onClick={resetLineup}
              className="p-3 bg-brand-slate-950/80 backdrop-blur text-slate-400 hover:text-white rounded-xl border border-brand-slate-800 transition-all hover:scale-110 active:scale-95"
              title="Reiniciar"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-xl",
                saved ? "bg-green-500 text-slate-950" : "bg-red-500 text-white hover:bg-red-400 active:scale-95"
              )}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saved ? "Guardado" : "Guardar 11"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar: Formation & Controls */}
      <div className="lg:col-span-3 space-y-6 order-3">
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="text-red-500" size={18} />
            <h4 className="font-black text-white uppercase tracking-tight text-sm">Configuración</h4>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">Sistema de Juego</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(FORMATIONS) as FormationType[]).map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setFormation(f);
                    resetLineup();
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-tight",
                    formation === f 
                      ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" 
                      : "bg-brand-slate-950 border-brand-slate-800 text-slate-500 hover:border-slate-700"
                  )}
                >
                  {f}
                  {formation === f && <Layout size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-brand-slate-800 space-y-4">
            <div className="p-4 bg-brand-slate-950/50 rounded-2xl">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Resumen Alineación</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-white">{usedPlayerIds.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/ 11 Jugadores</span>
              </div>
              <div className="mt-2 h-1 bg-brand-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(usedPlayerIds.length / 11) * 100}%` }}
                  className="h-full bg-red-500"
                />
              </div>
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
              <p className="text-[10px] text-red-500/70 leading-relaxed font-bold uppercase tracking-tight">
                Arrastra a los jugadores desde la lista de disponibles hasta las posiciones indicadas en el campo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PositionMarkerProps {
  pos: Position;
  player: Player | null;
  onRemove: () => void;
}

const PositionMarker: React.FC<PositionMarkerProps> = ({ pos, player, onRemove }) => {
  const { isOver, setNodeRef } = useSortable({ id: pos.id });

  return (
    <div 
      ref={setNodeRef}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/pos"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <div className={cn(
        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-xl relative",
        player 
          ? "bg-brand-slate-900 border-red-500 scale-110" 
          : isOver 
            ? "bg-red-500/20 border-red-500 scale-125 border-dashed" 
            : "bg-white/5 border-white/20 hover:border-white/40"
      )}>
        {player ? (
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-brand-slate-950">
             {player.foto_jugador ? (
               <img src={player.foto_jugador} alt={player.nombre} className="w-full h-full object-cover" />
             ) : (
               <span className="text-white font-black text-sm">{player.dorsal}</span>
             )}
          </div>
        ) : (
          <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">{pos.label}</span>
        )}

        {player && (
          <button 
            onClick={onRemove}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/pos:opacity-100 transition-opacity shadow-lg"
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>
      
      {player && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-slate-950/90 backdrop-blur px-2 py-0.5 rounded-md border border-brand-slate-800 shadow-lg whitespace-nowrap"
        >
          <p className="text-[9px] font-black text-white uppercase tracking-tight truncate max-w-[60px]">
            {player.apodo || player.nombre}
          </p>
        </motion.div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
