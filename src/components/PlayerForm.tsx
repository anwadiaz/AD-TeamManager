import React, { useState } from 'react';
import { X, Upload, Loader2, Save, Trash2 } from 'lucide-react';
import type { PlayerFormData, Demarcacion, Lateralidad } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
  onSave: () => void;
  initialData?: any;
}

export default function PlayerForm({ onClose, onSave, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>(
    initialData || {
      nombre: '',
      apellidos: '',
      dorsal: '',
      fecha_nacimiento: '',
      demarcacion: 'Centrocampista',
      lateralidad: 'Diestro',
      equipo: '',
      foto_jugador: '',
      observaciones: '',
      talla: 175
    }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('jugadores')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jugadores')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto_jugador: publicUrl }));
    } catch (error: any) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        dorsal: formData.dorsal ? Number(formData.dorsal) : null
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('jugadores')
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('jugadores')
          .insert([payload]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error: any) {
      alert('Error guardando jugador: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-slate-950/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-brand-slate-800"
      >
        <div className="px-6 py-4 border-b border-brand-slate-800 flex items-center justify-between bg-brand-slate-950/50">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Editar Jugador' : 'Nuevo Jugador'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Foto Secion */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-brand-slate-800 rounded-2xl bg-brand-slate-950/30 hover:border-red-500/50 transition-colors cursor-pointer relative group">
              {formData.foto_jugador ? (
                <div className="relative mb-4 group/photo">
                  <img 
                    src={formData.foto_jugador} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover shadow-lg ring-2 ring-red-500/20"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, foto_jugador: '' });
                    }}
                    className="absolute -top-1 -right-1 p-2 bg-brand-slate-950 border border-brand-slate-800 text-red-500 rounded-full hover:bg-red-500 hover:text-slate-950 transition-all shadow-xl z-20"
                    title="Eliminar foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-brand-slate-800 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-slate-500" />
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              <p className="text-sm font-medium text-slate-300">
                {uploading ? 'Subiendo...' : 'Haz clic para subir foto'}
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG hasta 5MB</p>
            </div>

            <div className="relative">
              <input
                type="url"
                placeholder="O pega la URL de la foto aquí..."
                className="w-full px-4 py-2.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-xs"
                value={formData.foto_jugador}
                onChange={(e) => setFormData({ ...formData, foto_jugador: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Nombre</label>
            <input
              required
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Apellidos</label>
            <input
              required
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
              value={formData.apellidos}
              onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Dorsal</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
              value={formData.dorsal}
              onChange={(e) => setFormData({ ...formData, dorsal: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Equipo</label>
            <input
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
              value={formData.equipo}
              onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Fecha Nacimiento</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm color-scheme-dark"
              style={{ colorScheme: 'dark' }}
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Demarcación</label>
            <select
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm cursor-pointer"
              value={formData.demarcacion}
              onChange={(e) => setFormData({ ...formData, demarcacion: e.target.value as Demarcacion })}
            >
              <option value="Portero">Portero</option>
              <option value="Defensa">Defensa</option>
              <option value="Centrocampista">Centrocampista</option>
              <option value="Delantero">Delantero</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Lateralidad</label>
            <select
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm cursor-pointer"
              value={formData.lateralidad}
              onChange={(e) => setFormData({ ...formData, lateralidad: e.target.value as Lateralidad })}
            >
              <option value="Diestro">Diestro</option>
              <option value="Zurdo">Zurdo</option>
              <option value="Ambidiestro">Ambidiestro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Talla (CM)</label>
            <select
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm cursor-pointer"
              value={formData.talla || 175}
              onChange={(e) => setFormData({ ...formData, talla: Number(e.target.value) })}
            >
              {Array.from({ length: 51 }, (_, i) => 160 + i).map(h => (
                <option key={h} value={h}>{h} cm</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-semibold text-slate-400 lowercase tracking-wider uppercase">Observaciones</label>
            <textarea
              className="w-full px-4 py-2 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm resize-none"
              rows={2}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-brand-slate-950/40 rounded-2xl border border-brand-slate-800">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Goles</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-lg outline-none text-sm"
                value={formData.goles || 0}
                onChange={(e) => setFormData({ ...formData, goles: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Asist.</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-lg outline-none text-sm"
                value={formData.asistencias || 0}
                onChange={(e) => setFormData({ ...formData, asistencias: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">T. Amarillas</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-lg outline-none text-sm"
                value={formData.tarjetas_amarillas || 0}
                onChange={(e) => setFormData({ ...formData, tarjetas_amarillas: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">T. Rojas</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-lg outline-none text-sm"
                value={formData.tarjetas_rojas || 0}
                onChange={(e) => setFormData({ ...formData, tarjetas_rojas: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Minutos</label>
              <input
                type="number"
                className="w-full px-3 py-1.5 bg-brand-slate-800 border border-brand-slate-700 text-white rounded-lg outline-none text-sm"
                value={formData.minutos_jugados || 0}
                onChange={(e) => setFormData({ ...formData, minutos_jugados: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-brand-slate-800 text-slate-400 rounded-xl font-medium hover:bg-brand-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-3 bg-red-500 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-400 transition-all disabled:opacity-50 shadow-lg shadow-red-500/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Guardar Jugador
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
