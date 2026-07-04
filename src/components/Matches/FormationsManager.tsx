import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Layout, 
  CheckCircle2, 
  Loader2, 
  Move,
  AlertCircle,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Formation, Position } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_POSITIONS: Position[] = [
  { id: 'GK', x: 50, y: 90, label: 'POR' },
  { id: 'P2', x: 25, y: 70, label: 'DEF' },
  { id: 'P3', x: 75, y: 70, label: 'DEF' },
  { id: 'P4', x: 50, y: 75, label: 'DEF' },
  { id: 'P5', x: 50, y: 55, label: 'MC' },
  { id: 'P6', x: 25, y: 45, label: 'MC' },
  { id: 'P7', x: 75, y: 45, label: 'MC' },
  { id: 'P8', x: 50, y: 35, label: 'MP' },
  { id: 'P9', x: 25, y: 20, label: 'DC' },
  { id: 'P10', x: 75, y: 20, label: 'DC' },
  { id: 'P11', x: 50, y: 15, label: 'DC' },
];

export default function FormationsManager() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingConfig, setEditingConfig] = useState<Position[]>(INITIAL_POSITIONS);
  const [saving, setSaving] = useState(false);
  const [draggingPosId, setDraggingPosId] = useState<string | null>(null);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('formaciones')
        .select('*')
        .order('nombre');
      if (data) setFormations(data);
    } catch (e) {
      console.error('Error fetching formations:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (f: Formation) => {
    setSelectedId(f.id);
    setEditingName(f.nombre);
    setEditingConfig(f.configuracion);
  };

  const handleCreate = () => {
    setSelectedId(null);
    setEditingName('Nueva Formación');
    setEditingConfig(INITIAL_POSITIONS);
  };

  const handleSave = async () => {
    if (!editingName.trim()) return alert('Nombre requerido');
    
    setSaving(true);
    try {
      if (selectedId) {
        const { error } = await supabase
          .from('formaciones')
          .update({ 
            nombre: editingName,
            configuracion: editingConfig
          })
          .eq('id', selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('formaciones')
          .insert([{ 
            nombre: editingName,
            configuracion: editingConfig
          }]);
        if (error) throw error;
      }
      
      await fetchFormations();
      alert('Sistema guardado correctamente');
    } catch (e) {
      console.error('Error saving formation:', e);
      alert('Error al guardar el sistema. Asegúrate de que la tabla "formaciones" existe.');
    } finally {
      setSaving(false);
    }
  };

  const addPosition = () => {
    const newId = `P${editingConfig.length + 1}_${Date.now()}`;
    setEditingConfig(prev => [...prev, { id: newId, x: 50, y: 50, label: 'NUE' }]);
  };

  const removePosition = (id: string) => {
    setEditingConfig(prev => prev.filter(p => p.id !== id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este sistema?')) return;
    
    try {
      const { error } = await supabase
        .from('formaciones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      if (selectedId === id) {
        setSelectedId(null);
        setEditingName('');
        setEditingConfig(INITIAL_POSITIONS);
      }
      await fetchFormations();
    } catch (e) {
      console.error('Error deleting formation:', e);
    }
  };

  const handleFieldMouseDown = (e: React.MouseEvent, posId: string) => {
    setDraggingPosId(posId);
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!draggingPosId) return;

    const field = e.currentTarget.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - field.left) / field.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - field.top) / field.height) * 100));

    setEditingConfig(prev => prev.map(p => 
      p.id === draggingPosId ? { ...p, x, y } : p
    ));
  };

  const handleFieldMouseUp = () => {
    setDraggingPosId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto h-full">
      {/* List sidebar */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white uppercase tracking-tight italic flex items-center gap-2">
            <Layout className="text-red-500" size={20} />
            Sistemas Guardados
          </h3>
          <button 
            onClick={handleCreate}
            className="p-2 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-red-500/20"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-red-500" size={32} />
            </div>
          ) : formations.length === 0 ? (
            <div className="text-center py-20 bg-brand-slate-950/20 rounded-3xl border-2 border-dashed border-brand-slate-800">
              <AlertCircle className="mx-auto w-12 h-12 text-brand-slate-800 mb-4" />
              <p className="text-slate-500 text-sm font-medium mb-4">No hay sistemas personalizados</p>
              <button 
                onClick={handleCreate}
                className="px-6 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all"
              >
                Crear Primero
              </button>
            </div>
          ) : (
            formations.map(f => (
              <div 
                key={f.id}
                onClick={() => handleSelect(f)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                  selectedId === f.id 
                    ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" 
                    : "bg-brand-slate-900 border-brand-slate-800 text-slate-400 hover:border-slate-600"
                )}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm uppercase tracking-tight">{f.nombre}</span>
                  <span className={cn(
                    "text-[10px] font-medium uppercase tracking-widest",
                    selectedId === f.id ? "text-red-100" : "text-slate-600"
                  )}>
                    {f.configuracion.length} Posiciones
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(f.id);
                  }}
                  className={cn(
                    "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-slate-800",
                    selectedId === f.id ? "text-white hover:bg-red-400" : "text-slate-500 hover:text-red-500"
                  )}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor stage */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 pl-1">Nombre del Sistema</label>
            <input 
              type="text" 
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full bg-brand-slate-950 border border-brand-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-red-500 outline-none transition-all"
              placeholder="Ej: 4-4-2 Rombo"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-red-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {selectedId ? "Actualizar" : "Guardar"}
          </button>
        </div>

        <div className="flex gap-4 items-start">
          <div 
            className="flex-1 relative aspect-[3/4] bg-emerald-900 rounded-[40px] overflow-hidden border-8 border-brand-slate-900 shadow-2xl shadow-black/60 cursor-crosshair select-none"
            onMouseMove={handleFieldMouseMove}
            onMouseUp={handleFieldMouseUp}
            onMouseLeave={handleFieldMouseUp}
          >
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
            {editingConfig.map(pos => (
              <div 
                key={pos.id}
                onMouseDown={(e) => handleFieldMouseDown(e, pos.id)}
                style={{ 
                  top: `${pos.y}%`, 
                  left: `${pos.x}%`,
                  cursor: draggingPosId === pos.id ? 'grabbing' : 'grab'
                }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 group transition-transform",
                  draggingPosId === pos.id ? "scale-125 z-50" : "hover:scale-110 z-10"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-lg relative group/item",
                  draggingPosId === pos.id 
                    ? "bg-red-500 border-white text-white shadow-red-500/50" 
                    : "bg-brand-slate-950 border-white/20 text-white/60 hover:border-red-500"
                )}>
                  <Move size={12} className={cn(draggingPosId === pos.id ? "opacity-100" : "opacity-40")} />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removePosition(pos.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-brand-slate-900 border border-brand-slate-800 text-slate-500 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <X size={8} />
                  </button>
                </div>
                <div className="mt-1 bg-brand-slate-950/80 backdrop-blur px-2 py-0.5 rounded-lg border border-brand-slate-800 shadow-xl">
                  <input 
                    type="text" 
                    value={pos.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingConfig(prev => prev.map(p => p.id === pos.id ? { ...p, label: val } : p));
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="bg-transparent border-none text-[8px] font-black text-white uppercase tracking-tighter text-center w-8 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-48 bento-card p-4 bg-brand-slate-900 border border-brand-slate-800 space-y-4">
            <button 
              onClick={addPosition}
              className="w-full py-3 bg-brand-slate-950 border border-brand-slate-800 text-red-500 hover:text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 mb-2"
            >
              <Plus size={14} />
              Añadir Posición
            </button>
            
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-brand-slate-800 pb-2">Ayuda</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <Move size={10} />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  Arrastra los círculos rojos para posicionar a los jugadores.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                  <Layout size={10} />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  Haz clic en el texto bajo el círculo para cambiar la etiqueta del rol.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
