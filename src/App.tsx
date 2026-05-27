import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import PlayerList from './components/PlayerList';
import PlayerForm from './components/PlayerForm';
import PlayerDetail from './components/PlayerDetail';
import PlayerTable from './components/PlayerTable';
import EvaluationManager from './components/EvaluationManager';
import MatchList from './components/MatchList';
import MatchForm from './components/MatchForm';
import { Plus, Users, LogOut, Loader2, Search, Filter, Trophy, Bell, Settings, LayoutGrid, List, Star } from 'lucide-react';
import type { Player, Match, Evaluation } from './types';
import { motion, AnimatePresence } from 'motion/react';

import { APP_CONFIG } from './lib/config';

type ViewMode = 'players' | 'matches' | 'notifications' | 'evaluations';
type PlayoutMode = 'grid' | 'table';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('players');
  const [playoutMode, setPlayoutMode] = useState<PlayoutMode>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPos, setFilterPos] = useState<string>('Todas');
  const [filterTalla, setFilterTalla] = useState<string>('Todas');

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('refresh_token_not_found') || error.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
          }
          throw error;
        }
        setSession(session);
      } catch (err) {
        console.error('Auth check error:', err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, viewMode]);

  const loadData = async () => {
    setLoading(true);
    if (viewMode === 'players') {
      await fetchPlayers();
    } else if (viewMode === 'matches') {
      await fetchMatches();
    } else if (viewMode === 'evaluations') {
      await fetchEvaluations();
    }
    setLoading(false);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPlayers(data || []);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: false });
    if (!error) setMatches(data || []);
  };

  const fetchEvaluations = async () => {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setEvaluations(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro?')) return;
    const table = viewMode === 'players' ? 'jugadores' : 'partidos';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (viewMode === 'players') setPlayers(players.filter(p => p.id !== id));
      else setMatches(matches.filter(m => m.id !== id));
    }
  };

  const filteredPlayers = players.filter(p => {
    const fullName = `${p.nombre} ${p.apellidos}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         p.equipo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPos = filterPos === 'Todas' || p.demarcacion === filterPos;
    const matchesTalla = filterTalla === 'Todas' || (
      filterTalla === 'Bajos' ? (p.talla || 0) < 175 :
      filterTalla === 'Medios' ? (p.talla || 0) >= 175 && (p.talla || 0) <= 185 :
      filterTalla === 'Altos' ? (p.talla || 0) > 185 : false
    );
    return matchesSearch && matchesPos && matchesTalla;
  });

  const filteredMatches = matches.filter(m => 
    m.equipo_local.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.equipo_visitante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-brand-slate-950 flex p-4 gap-4 overflow-hidden">
      {/* Navigation Sidebar */}
      <nav className="w-20 bento-card flex flex-col items-center py-8 gap-8 shrink-0 hidden lg:flex">
        <div 
          onClick={() => setViewMode('players')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
            viewMode === 'players' ? 'bg-red-500 text-slate-950 shadow-lg shadow-red-500/20' : 'bg-brand-slate-800 text-slate-500'
          }`}
        >
          <Users size={24} />
        </div>
        
        <div className="flex flex-col gap-6">
          <div 
            onClick={() => setViewMode('matches')}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              viewMode === 'matches' ? 'bg-brand-slate-800 text-red-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Trophy size={24} />
          </div>
          <div 
            onClick={() => setViewMode('notifications')}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              viewMode === 'notifications' ? 'bg-brand-slate-800 text-red-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Bell size={24} />
          </div>
          <div 
            onClick={() => setViewMode('evaluations')}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              viewMode === 'evaluations' ? 'bg-brand-slate-800 text-red-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Star size={24} />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => supabase.auth.signOut()}
            className="p-3 text-slate-500 hover:text-red-500 transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header Bento Item */}
        <header className="bento-card bg-brand-slate-900/50 px-6 sm:px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              {viewMode === 'players' ? 'Plantilla' : viewMode === 'matches' ? 'Partidos' : viewMode === 'notifications' ? 'Notificaciones' : 'Evaluaciones'}
              <span className="text-red-500">{APP_CONFIG.name.split(' ').pop()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-brand-slate-800 border-none rounded-full px-10 py-2.5 text-sm w-64 focus:ring-2 focus:ring-red-500 text-white outline-none"
              />
            </div>
            
            {viewMode !== 'notifications' && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold px-4 sm:px-6 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-red-500/20 active:scale-95"
              >
                + {viewMode === 'players' ? 'Nuevo Jugador' : 'Nuevo Partido'}
              </button>
            )}
          </div>
        </header>

        {/* Inner Grid Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
            <section className="md:col-span-8 lg:col-span-9 bento-card p-6 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                    {viewMode === 'players' ? 'Gestión de Jugadores' : 'Registro de Resultados'}
                  </h2>
                </div>

                {viewMode === 'players' && (
                  <div className="flex items-center gap-2">
                    <div className="flex bg-brand-slate-800 p-1 rounded-lg border border-brand-slate-700 mr-2">
                      <button 
                        onClick={() => setPlayoutMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${playoutMode === 'grid' ? 'bg-red-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button 
                        onClick={() => setPlayoutMode('table')}
                        className={`p-1.5 rounded-md transition-all ${playoutMode === 'table' ? 'bg-red-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <List size={14} />
                      </button>
                    </div>
                    <select
                      value={filterPos}
                      onChange={(e) => setFilterPos(e.target.value)}
                      className="bg-brand-slate-800 text-slate-400 text-xs px-4 py-2 rounded-lg border border-brand-slate-700 outline-none focus:border-red-500"
                    >
                      <option value="Todas">Posiciones</option>
                      <option value="Portero">Portero</option>
                      <option value="Defensa">Defensa</option>
                      <option value="Centrocampista">Centrocampista</option>
                      <option value="Delantero">Delantero</option>
                    </select>

                    <select
                      value={filterTalla}
                      onChange={(e) => setFilterTalla(e.target.value)}
                      className="bg-brand-slate-800 text-slate-400 text-xs px-4 py-2 rounded-lg border border-brand-slate-700 outline-none focus:border-red-500"
                    >
                      <option value="Todas">Altura (Cualquiera)</option>
                      <option value="Bajos">Bajos (&lt; 175cm)</option>
                      <option value="Medios">Medios (175-185cm)</option>
                      <option value="Altos">Altos (&gt; 185cm)</option>
                    </select>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                </div>
              ) : (
                <>
                  {viewMode === 'players' && (
                    filteredPlayers.length > 0 ? (
                      playoutMode === 'grid' ? (
                        <PlayerList 
                          players={filteredPlayers} 
                          onEdit={(p) => { setEditingItem(p); setIsFormOpen(true); }} 
                          onDelete={handleDelete} 
                          onView={(p) => setSelectedPlayer(p)}
                        />
                      ) : (
                        <PlayerTable
                          players={filteredPlayers}
                          onEdit={(p) => { setEditingItem(p); setIsFormOpen(true); }} 
                          onDelete={handleDelete} 
                          onView={(p) => setSelectedPlayer(p)}
                        />
                      )
                    ) : <NoItems />
                  )}
                  {viewMode === 'matches' && (
                    filteredMatches.length > 0 ? (
                      <MatchList 
                        matches={filteredMatches} 
                        onEdit={(m) => { setEditingItem(m); setIsFormOpen(true); }} 
                        onDelete={handleDelete} 
                      />
                    ) : <NoItems />
                  )}
                  {viewMode === 'notifications' && <NotificationCenter />}
                  {viewMode === 'evaluations' && <EvaluationManager players={players} session={session} />}
                </>
              )}
            </section>

            <section className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
              <StatsSidebar players={players} />
              
              <div className="bento-card p-6 bg-red-400 border-none text-slate-950 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <h4 className="text-lg font-black uppercase leading-tight">Admin Elite</h4>
                  <p className="text-[10px] uppercase font-bold opacity-70 mt-1 tracking-wider">Firebase Cloud Messaging</p>
                </div>
                <div className="mt-8">
                  <div className="text-4xl font-black text-slate-950/20 mb-2">PRO</div>
                  <div className="text-[10px] font-bold uppercase tracking-tight">Push Notifications Ready</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          viewMode === 'players' ? (
            <PlayerForm initialData={editingItem} onClose={() => setIsFormOpen(false)} onSave={loadData} />
          ) : (
            <MatchForm initialData={editingItem} onClose={() => setIsFormOpen(false)} onSave={loadData} />
          )
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlayer && (
          <PlayerDetail 
            player={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-10 left-4 right-4 h-16 bg-brand-slate-900/90 backdrop-blur-xl border border-brand-slate-800 flex items-center justify-center gap-2 px-4 z-40 rounded-2xl shadow-2xl safe-area-pb">
        <button 
          onClick={() => setViewMode('players')}
          className={`relative p-3 rounded-xl transition-all ${viewMode === 'players' ? 'text-red-500 scale-110' : 'text-slate-500'}`}
        >
          <Users size={24} />
          {viewMode === 'players' && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setViewMode('matches')}
          className={`relative p-3 rounded-xl transition-all ${viewMode === 'matches' ? 'text-red-500 scale-110' : 'text-slate-500'}`}
        >
          <Trophy size={24} />
          {viewMode === 'matches' && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setViewMode('notifications')}
          className={`relative p-3 rounded-xl transition-all ${viewMode === 'notifications' ? 'text-red-500 scale-110' : 'text-slate-500'}`}
        >
          <Bell size={24} />
          {viewMode === 'notifications' && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setViewMode('evaluations')}
          className={`relative p-3 rounded-xl transition-all ${viewMode === 'evaluations' ? 'text-red-500 scale-110' : 'text-slate-500'}`}
        >
          <Star size={24} />
          {viewMode === 'evaluations' && <motion.div layoutId="nav-pill" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />}
        </button>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="p-3 rounded-xl transition-all text-slate-500 active:text-red-500 active:scale-90"
        >
          <LogOut size={24} />
        </button>
      </nav>
    </div>
  );
}

function NoItems() {
  return (
    <div className="text-center py-20 bg-brand-slate-950/20 rounded-3xl border-2 border-dashed border-brand-slate-800">
      <Users className="mx-auto w-12 h-12 text-brand-slate-800 mb-4" />
      <p className="text-slate-500 text-sm font-medium">No se encontraron datos</p>
    </div>
  );
}

function NotificationCenter() {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const sendNotification = () => {
    setSending(true);
    setTimeout(() => {
      alert('Notificación enviada a todos los jugadores (Simulado hasta completar setup Firebase)');
      setMsg('');
      setSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-slate-950 p-6 rounded-2xl border border-brand-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
          <Bell className="text-red-500" size={20} /> Enviar Aviso Global
        </h3>
        <textarea
          className="w-full bg-brand-slate-900 border border-brand-slate-800 rounded-xl p-4 text-white outline-none focus:ring-1 focus:ring-red-500 mb-4"
          placeholder="Escribe el mensaje para el equipo..."
          rows={4}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button
          onClick={sendNotification}
          disabled={!msg || sending}
          className="w-full bg-red-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-red-400 transition-all disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Notificar al Equipo'}
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Historial Reciente</h4>
        {[1,2].map(id => (
          <div key={id} className="bg-brand-slate-900 border border-brand-slate-800 p-4 rounded-xl flex gap-4">
            <div className="w-1 bg-red-500 rounded-full shrink-0"></div>
            <div>
              <p className="text-sm text-slate-300">Entrenamiento programado para mañana a las 10:00 AM.</p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">26/05/2026 14:12</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSidebar({ players }: { players: Player[] }) {
  const totalGoals = players.reduce((acc, p) => acc + (p.goles || 0), 0);
  const totalAssists = players.reduce((acc, p) => acc + (p.asistencias || 0), 0);

  return (
    <div className="bento-card p-6 bg-brand-slate-900 border-none relative overflow-hidden flex-1 min-h-[300px]">
      <div className="absolute -top-6 -right-6 text-8xl font-black text-white/5 select-none uppercase">TEAM</div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Analítica de Equipo</h3>
      
      <div className="space-y-6 relative z-10">
        <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800">
          <div className="text-[10px] text-red-500 uppercase font-bold mb-1">Goles Totales</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-black text-white">{totalGoals}</div>
            <Trophy className="text-red-500/20" size={32} />
          </div>
        </div>

        <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800">
          <div className="text-[10px] text-blue-500 uppercase font-bold mb-1">Asistencias</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-black text-white">{totalAssists}</div>
            <Users className="text-blue-500/20" size={32} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800">
            <div className="text-[10px] text-yellow-500 uppercase font-bold mb-1">Amarillas</div>
            <div className="text-2xl font-black text-white">{players.reduce((acc, p) => acc + (p.tarjetas_amarillas || 0), 0)}</div>
          </div>
          <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800">
            <div className="text-[10px] text-red-500 uppercase font-bold mb-1">Rojas</div>
            <div className="text-2xl font-black text-white">{players.reduce((acc, p) => acc + (p.tarjetas_rojas || 0), 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
