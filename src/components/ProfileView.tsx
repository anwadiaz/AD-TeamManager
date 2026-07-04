import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Mail, 
  Shield, 
  IdCard,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id?: string;
  nickname: string;
  avatar_url: string;
  updated_at?: string;
}

export default function ProfileView({ session }: { session: any }) {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: session?.user?.email?.split('@')[0] || '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data && !error) {
        setProfile(data);
      }
    } catch (error) {
      console.warn('Profile not found, using default');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([{
          id: session.user.id,
          nickname: profile.nickname,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil. Asegúrate de ejecutar el script SQL.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setProfile({ ...profile, avatar_url: url });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl">
            <User className="text-red-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Mi Perfil</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Configuración de Usuario</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar & Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 space-y-6"
        >
          <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 flex flex-col items-center gap-8">
            <div className="relative group">
              <div 
                className="w-40 h-40 rounded-full bg-brand-slate-950 border-4 border-brand-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-red-500/50 shadow-2xl shadow-black"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageUpload(file);
                }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-700">
                    <User size={48} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Sin Foto</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-red-500 text-slate-950 rounded-full shadow-xl hover:bg-red-400 transition-all scale-90 hover:scale-100"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
            </div>

            <div className="w-full text-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{profile.nickname || 'Usuario'}</h3>
              <p className="text-xs text-slate-500 font-mono">{session?.user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nickname / Apodo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-bold text-lg outline-none focus:border-red-500 transition-all uppercase tracking-tight"
                    placeholder="Tu apodo..."
                  />
                  <IdCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL Imagen de Perfil</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.avatar_url.startsWith('blob:') ? '' : profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-xs text-slate-400 outline-none focus:border-red-500 transition-all font-mono"
                    placeholder="https://..."
                  />
                  <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-brand-slate-800/50">
              <div className="p-4 bg-brand-slate-950/50 rounded-2xl flex items-start gap-3">
                <Mail className="text-slate-700 mt-1" size={16} />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Email Registrado</p>
                  <p className="text-xs text-slate-300 font-medium truncate">{session?.user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-brand-slate-950/50 rounded-2xl flex items-start gap-3">
                <Shield className="text-slate-700 mt-1" size={16} />
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Rol del Sistema</p>
                  <p className="text-xs text-slate-300 font-medium">Administrador del Equipo</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                <IdCard size={20} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-medium">
                Tu apodo y foto de perfil aparecerán en las evaluaciones y reportes que generes dentro de la plataforma. Asegúrate de que sean representativos de tu identidad en el club.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
