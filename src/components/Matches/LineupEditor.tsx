import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  useDroppable,
  useDraggable,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Users, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Star,
  Settings2,
  Layout,
  CheckCircle2,
  Loader2,
  GripVertical,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Player, Formation, Position } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_FORMATIONS: Record<string, Position[]> = {
  '4-4-2': [
    { id: 'GK', x: 50, y: 90, label: 'POR' },
    { id: 'RB', x: 85, y: 70, label: 'LD' },
    { id: 'CB1', x: 65, y: 75, label: 'DFC' },
    { id: 'CB2', x: 35, y: 75, label: 'DFC' },
    { id: 'LB', x: 15, y: 70, label: 'LI' },
    { id: 'RM', x: 85, y: 45, label: 'MD' },
    { id: 'CM1', x: 60, y: 50, label: 'MC' },
    { id: 'CM2', x: 40, y: 50, label: 'MC' },
    { id: 'LM', x: 15, y: 45, label: 'MI' },
    { id: 'ST1', x: 60, y: 20, label: 'DC' },
    { id: 'ST2', x: 40, y: 20, label: 'DC' },
  ],
  '4-3-3': [
    { id: 'GK', x: 50, y: 90, label: 'POR' },
    { id: 'RB', x: 85, y: 70, label: 'LD' },
    { id: 'CB1', x: 65, y: 75, label: 'DFC' },
    { id: 'CB2', x: 35, y: 75, label: 'DFC' },
    { id: 'LB', x: 15, y: 70, label: 'LI' },
    { id: 'CM1', x: 50, y: 55, label: 'MCD' },
    { id: 'CM2', x: 70, y: 45, label: 'MC' },
    { id: 'CM3', x: 30, y: 45, label: 'MC' },
    { id: 'RW', x: 80, y: 20, label: 'ED' },
    { id: 'ST', x: 50, y: 15, label: 'DC' },
    { id: 'LW', x: 20, y: 20, label: 'EI' },
  ],
  '3-5-2': [
    { id: 'GK', x: 50, y: 90, label: 'POR' },
    { id: 'CB1', x: 50, y: 75, label: 'DFC' },
    { id: 'CB2', x: 75, y: 70, label: 'DFC' },
    { id: 'CB3', x: 25, y: 70, label: 'DFC' },
    { id: 'RM', x: 85, y: 45, label: 'MD' },
    { id: 'CM1', x: 50, y: 55, label: 'MC' },
    { id: 'CM2', x: 65, y: 40, label: 'MC' },
    { id: 'CM3', x: 35, y: 40, label: 'MC' },
    { id: 'LM', x: 15, y: 45, label: 'MI' },
    { id: 'ST1', x: 60, y: 20, label: 'DC' },
    { id: 'ST2', x: 40, y: 20, label: 'DC' },
  ]
};

interface LineupEditorProps {
  matchId: string;
  players: Player[];
  initialLineup?: Record<string, string>;
  initialFormation?: string;
}

export default function LineupEditor({ matchId, players, initialLineup = {}, initialFormation = '4-4-2' }: LineupEditorProps) {
  const [lineup, setLineup] = useState<Record<string, string>>(initialLineup);
  const [formation, setFormation] = useState<string>(initialFormation);
  const [dbFormations, setDbFormations] = useState<Formation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    fetchFormations();
  }, []);

  useEffect(() => {
    setLineup(initialLineup || {});
    setFormation(initialFormation || '4-4-2');
    setSaved(false);
  }, [matchId, initialLineup, initialFormation]);

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('formaciones')
        .select('*')
        .order('nombre');
      
      if (data) setDbFormations(data);
    } catch (e) {
      console.error('Error fetching formations:', e);
    }
  };

  const currentPositions = dbFormations.find(f => f.nombre === formation)?.configuracion || DEFAULT_FORMATIONS[formation] || DEFAULT_FORMATIONS['4-4-2'];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const playerIdOrFieldId = active.id as string;
    const targetPosId = over.id as string;

    let actualPlayerId: string;
    let sourcePosId: string | null = null;

    if (playerIdOrFieldId.startsWith('field-')) {
      sourcePosId = playerIdOrFieldId.replace('field-', '');
      actualPlayerId = lineup[sourcePosId];
    } else {
      actualPlayerId = playerIdOrFieldId;
    }

    if (!actualPlayerId) return;

    // Si soltamos en una posición del campo
    if (currentPositions.some(p => p.id === targetPosId)) {
      setLineup(prev => {
        const newLineup = { ...prev };
        
        // Si ya hay alguien en el destino, ese vuelve a disponibles
        // Si el origen era el campo, limpiamos el origen
        if (sourcePosId) {
          delete newLineup[sourcePosId];
        }

        // Si hay intercambio (movimiento entre campo), el del destino simplemente desaparece de su posición actual
        // Aquí implementamos que el del destino sea reemplazado
        newLineup[targetPosId] = actualPlayerId;
        return newLineup;
      });
    }

    setSaved(false);
  };

  const removeFromLineup = (posId: string) => {
    setLineup(prev => {
      const newLineup = { ...prev };
      delete newLineup[posId];
      return newLineup;
    });
    setSaved(false);
  };

  const resetLineup = () => {
    setLineup({});
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('partidos')
        .update({ 
          alineacion: lineup,
          formacion: formation
        })
        .eq('id', matchId);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving lineup:', e);
      alert('Error al guardar la alineación');
    } finally {
      setSaving(false);
    }
  };

  const usedPlayerIds = Object.values(lineup);
  const activePlayerId = activeId?.startsWith('field-') ? lineup[activeId.replace('field-', '')] : activeId;
  const activePlayer = players.find(p => p.id === activePlayerId);
  const availablePlayers = players.filter(p => !usedPlayerIds.includes(p.id));

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <SortableContext 
              items={availablePlayers.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {availablePlayers.map((player) => (
                <DraggablePlayer key={player.id} player={player} />
              ))}
            </SortableContext>
            
            {availablePlayers.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-brand-slate-800 rounded-3xl">
                <Users size={32} className="mx-auto text-slate-700 mb-2 opacity-20" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No hay más jugadores</p>
              </div>
            )}
          </div>
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
            {currentPositions.map((pos) => {
              const assignedPlayerId = lineup[pos.id];
              const player = players.find(p => p.id === assignedPlayerId);
              
              return (
                <PositionMarker 
                  key={pos.id} 
                  pos={pos} 
                  player={player}
                  onRemove={() => removeFromLineup(pos.id)}
                />
              );
            })}

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
                {[...Object.keys(DEFAULT_FORMATIONS), ...dbFormations.map(f => f.nombre)]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map(fName => (
                    <button
                      key={fName}
                      onClick={() => {
                        setFormation(fName);
                        resetLineup();
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-bold uppercase tracking-tight",
                        formation === fName 
                          ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" 
                          : "bg-brand-slate-950 border-brand-slate-800 text-slate-500 hover:border-slate-700"
                      )}
                    >
                      {fName}
                      {formation === fName && <Layout size={14} />}
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
                  Arrastra a los jugadores al campo. Ahora puedes moverlos entre posiciones.
                </p>
              </div>
            </div>
          </div>
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
      </div>
    </DndContext>
  );
}

interface DraggablePlayerProps {
  player: Player;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners}
      className="flex items-center gap-3 p-3 bg-brand-slate-950 border border-brand-slate-800 rounded-2xl group hover:border-red-500/50 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-slate-900 border border-brand-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:text-red-500 group-hover:border-red-500/30">
        {player.dorsal}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white uppercase truncate tracking-tight">{player.apodo || player.nombre}</p>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest truncate">{player.demarcacion}</p>
      </div>
      <GripVertical size={14} className="text-slate-800 group-hover:text-slate-600" />
    </div>
  );
}

interface PositionMarkerProps {
  pos: Position;
  player?: Player;
  onRemove: () => void;
}

const PositionMarker: React.FC<PositionMarkerProps> = ({ pos, player, onRemove }) => {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: pos.id });
  
  const { 
    attributes, 
    listeners, 
    setNodeRef: setDraggableRef, 
    transform, 
    isDragging 
  } = useDraggable({
    id: `field-${pos.id}`,
    disabled: !player,
  });

  const style = {
    top: `${pos.y}%`,
    left: `${pos.x}%`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 100 : (player ? 20 : 10),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setDroppableRef}
      style={style}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all",
        isOver && !player && "scale-125"
      )}
    >
      <div 
        ref={setDraggableRef}
        {...(player ? attributes : {})}
        {...(player ? listeners : {})}
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all relative group",
          player 
            ? "bg-red-500 border-white text-white cursor-grab active:cursor-grabbing scale-110 shadow-red-500/40" 
            : cn(
                "bg-brand-slate-950/40 border-white/20 text-white/40",
                isOver && "bg-white/20 border-white scale-125 shadow-white/20"
              )
        )}
      >
        {player ? (
          <span className="font-black text-sm">{player.dorsal}</span>
        ) : (
          <span className="text-[8px] font-black uppercase tracking-tighter leading-none text-center px-1">
            {pos.label}
          </span>
        )}

        {player && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-brand-slate-900 border border-brand-slate-800 text-slate-400 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        )}
      </div>
      
      {player && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-slate-950/90 backdrop-blur px-2 py-0.5 rounded-lg border border-brand-slate-800 shadow-xl"
        >
          <p className="text-[9px] font-black text-white uppercase tracking-tighter whitespace-nowrap">
            {player.apodo || player.nombre}
          </p>
        </motion.div>
      )}
    </div>
  );
}
