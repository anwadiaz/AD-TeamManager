import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  MapPin, 
  Building2, 
  Trophy, 
  CloudUpload, 
  Camera, 
  Globe, 
  Link as LinkIcon,
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TeamProfile {
  id?: string;
  team_name: string;
  logo_url: string;
  stadium_name: string;
  city_name: string;
  stadium_image_url: string;
  google_maps_url: string;
  apple_maps_url: string;
}

export default function MyTeamProfile() {
  const [profile, setProfile] = useState<TeamProfile>({
    team_name: 'Mi Equipo de Fútbol',
    logo_url: '',
    stadium_name: 'Estadio Municipal',
    city_name: 'Sevilla',
    stadium_image_url: '',
    google_maps_url: '',
    apple_maps_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mapEmbedUrl, setMapEmbedUrl] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const stadiumInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Basic logic to try and extract an embeddable URL or show a placeholder
    if (profile.google_maps_url) {
      if (profile.google_maps_url.includes('pb=')) {
        // Already an embed URL
        setMapEmbedUrl(profile.google_maps_url);
      } else {
        // Try to generate a generic search embed based on city or URL
        const query = encodeURIComponent(profile.city_name + ' ' + profile.stadium_name);
        setMapEmbedUrl(`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}`);
        // Note: Without a real API key, this is a mock. In a real app, we'd use a free embed or the URL directly.
      }
    }
  }, [profile.google_maps_url, profile.city_name, profile.stadium_name]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('team_profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (data && !error) {
        setProfile(data);
      }
    } catch (error) {
      console.warn('Profile not found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { id, ...profileWithoutId } = profile;
      const dataToSave = id ? profile : profileWithoutId;

      const { data, error } = await supabase
        .from('team_profiles')
        .upsert([{
          ...dataToSave,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) setProfile(data);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar: Ejecuta el script SQL para la tabla "team_profiles"');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (type: 'logo' | 'stadium', file: File) => {
    const url = URL.createObjectURL(file);
    if (type === 'logo') {
      setProfile({ ...profile, logo_url: url });
    } else {
      setProfile({ ...profile, stadium_image_url: url });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl">
            <Trophy className="text-red-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Mi Equipo</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">Gestión de Identidad y Sede</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          title={saved ? '¡Guardado!' : 'Guardar Perfil'}
          className={`p-4 rounded-2xl transition-all shadow-2xl active:scale-95 ${
            saved 
              ? 'bg-green-500 text-slate-950' 
              : 'bg-red-500 text-slate-950 hover:bg-red-400 hover:shadow-red-500/20'
          } disabled:opacity-50`}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : saved ? <CheckCircle2 size={24} /> : <Save size={24} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info & Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 flex flex-col items-center gap-8">
            <div className="relative group">
              <div 
                className="w-48 h-48 rounded-[40px] bg-brand-slate-950 border-2 border-brand-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-red-500/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageUpload('logo', file);
                }}
              >
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-700">
                    <CloudUpload size={48} />
                    <span className="text-[10px] font-bold uppercase">Logo del Equipo</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-4 bg-red-500 text-slate-950 rounded-2xl shadow-xl hover:bg-red-400 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
              >
                <Camera size={20} />
              </button>
              <input 
                type="file" 
                ref={logoInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload('logo', e.target.files[0])}
              />
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre del Equipo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.team_name}
                    onChange={(e) => setProfile({ ...profile, team_name: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-black uppercase tracking-tight text-xl outline-none focus:border-red-500 transition-all"
                    placeholder="Escribe el nombre..."
                  />
                  <Trophy className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={24} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL Escudo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.logo_url.startsWith('blob:') ? '' : profile.logo_url}
                    onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 outline-none focus:border-red-500 transition-all font-mono"
                    placeholder="https://..."
                  />
                  <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={16} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stadium & City */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Estadio</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.stadium_name}
                    onChange={(e) => setProfile({ ...profile, stadium_name: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-bold text-lg outline-none focus:border-red-500 transition-all"
                    placeholder="Nombre del estadio..."
                  />
                  <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Ciudad</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.city_name}
                    onChange={(e) => setProfile({ ...profile, city_name: e.target.value })}
                    className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-white font-bold text-lg outline-none focus:border-red-500 transition-all"
                    placeholder="Ciudad..."
                  />
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 relative group">
                <div 
                  className="w-full h-72 bg-brand-slate-950 border-2 border-brand-slate-800 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all group-hover:border-red-500/30 overflow-hidden"
                  onClick={() => stadiumInputRef.current?.click()}
                >
                  {profile.stadium_image_url ? (
                    <img src={profile.stadium_image_url} alt="Stadium" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="p-4 bg-brand-slate-900 rounded-2xl text-slate-600 group-hover:text-red-500 transition-colors">
                        <CloudUpload size={40} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white uppercase tracking-widest">Sube la foto del estadio</p>
                        <p className="text-[10px] text-slate-500 uppercase mt-1">Arrastra la imagen o haz clic aquí</p>
                      </div>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={stadiumInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload('stadium', e.target.files[0])}
                />
              </div>

              <div className="md:col-span-1 flex flex-col justify-center gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL Foto Estadio</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.stadium_image_url.startsWith('blob:') ? '' : profile.stadium_image_url}
                      onChange={(e) => setProfile({ ...profile, stadium_image_url: e.target.value })}
                      className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-4 py-4 text-xs text-slate-400 outline-none focus:border-red-500 transition-all font-mono"
                      placeholder="https://..."
                    />
                    <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={16} />
                  </div>
                </div>
                <div className="p-4 bg-brand-slate-950/50 border border-brand-slate-800 rounded-2xl">
                  <p className="text-[9px] text-slate-600 uppercase font-bold leading-relaxed">
                    Puedes subir una imagen localmente o pegar un enlace directo a una imagen web.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Map Integration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bento-card p-8 bg-brand-slate-900 border border-brand-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 text-red-500 mb-2">
                  <Globe size={20} />
                  <h3 className="font-black uppercase tracking-widest text-sm">Integración de Mapas</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL Google Maps</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.google_maps_url}
                        onChange={(e) => setProfile({ ...profile, google_maps_url: e.target.value })}
                        className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-xs text-slate-400 outline-none focus:border-red-500 transition-all font-mono"
                        placeholder="https://www.google.com/maps/..."
                      />
                      <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">URL Apple Maps</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profile.apple_maps_url}
                        onChange={(e) => setProfile({ ...profile, apple_maps_url: e.target.value })}
                        className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-2xl px-5 py-4 text-xs text-slate-400 outline-none focus:border-red-500 transition-all font-mono"
                        placeholder="https://maps.apple.com/..."
                      />
                      <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800" size={16} />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-slate-950 border border-brand-slate-800 rounded-3xl">
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-medium">
                    La URL de Google Maps permite que el sistema muestre automáticamente una previsualización de tu estadio en los informes de partido.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 h-80 lg:h-auto min-h-[400px] bg-brand-slate-950 rounded-[40px] border border-brand-slate-800 overflow-hidden relative shadow-inner">
                {profile.google_maps_url && mapEmbedUrl ? (
                  <iframe
                    className="w-full h-full grayscale-[80%] invert-[90%] opacity-80"
                    src={mapEmbedUrl}
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 gap-4">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-900 flex items-center justify-center">
                      <MapPin size={40} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Mapa no configurado</span>
                  </div>
                )}
                
                {/* Visual Overlay for theme consistency */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-brand-slate-950 mix-blend-multiply opacity-20"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
