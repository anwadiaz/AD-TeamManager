import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Layout, Activity, Shield, Trophy, Plus, ClipboardList, Calendar, Copy, Trash2 } from 'lucide-react';
import TeamList, { TeamListHandle } from './TeamList';
import RivalReport from './RivalReport';
import MatchPlan from './MatchPlan';
import LiveEvents from './LiveEvents';
import MatchCreate from './MatchCreate';
import LineupEditor from './LineupEditor';
import FormationsManager from './FormationsManager';
import MatchList from './MatchList';
import type { Player, Match } from '../../types';

type TabType = 'equipos' | 'partidos' | 'alineacion' | 'formaciones' | 'rival' | 'plan' | 'eventos';

interface MatchesManagerProps {
  players: Player[];
  matches: Match[];
}

export default function MatchesManager({ players, matches }: MatchesManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('partidos');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const teamListRef = useRef<TeamListHandle>(null);

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  const tabs = [
    { id: 'partidos', label: 'Partidos', icon: Calendar },
    { id: 'alineacion', label: 'Alineación', icon: ClipboardList },
    { id: 'rival', label: 'Informe Rival', icon: FileText },
    { id: 'plan', label: 'Plan Partido', icon: Shield },
    { id: 'eventos', label: 'Eventos', icon: Activity },
    { id: 'formaciones', label: 'Sistemas', icon: Layout },
    { id: 'equipos', label: 'Equipos', icon: Users },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Tab Navigation & Action Buttons */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 sm:pb-0">
        <div className="flex bg-brand-slate-900 p-1 rounded-2xl border border-brand-slate-800 overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-500 text-slate-950 shadow-lg shadow-red-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'equipos' && (
          <div className="flex gap-2">
            <button
              onClick={() => teamListRef.current?.addTeam()}
              className="p-3 bg-brand-slate-900 hover:bg-brand-slate-800 text-red-500 border border-brand-slate-800 rounded-2xl transition-all active:scale-95 shadow-xl"
              title="Añadir Equipo"
            >
              <Plus size={20} />
            </button>
            {selectedTeamId && (
              <>
                <button
                  onClick={() => teamListRef.current?.duplicateTeam(selectedTeamId)}
                  className="p-3 bg-brand-slate-900 hover:bg-brand-slate-800 text-blue-500 border border-brand-slate-800 rounded-2xl transition-all active:scale-95 shadow-xl"
                  title="Duplicar Equipo"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={() => teamListRef.current?.deleteTeam(selectedTeamId)}
                  className="p-3 bg-brand-slate-900 hover:bg-brand-slate-800 text-red-400 border border-brand-slate-800 rounded-2xl transition-all active:scale-95 shadow-xl"
                  title="Borrar Equipo"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'equipos' && (
              <TeamList 
                ref={teamListRef} 
                onSelectTeam={setSelectedTeamId}
                selectedTeamId={selectedTeamId}
              />
            )}
            {activeTab === 'partidos' && (
              showCreateForm ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button 
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 bg-brand-slate-900 border border-brand-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      ← Volver al Listado
                    </button>
                  </div>
                  <MatchCreate />
                </div>
              ) : (
                <MatchList 
                  matches={matches} 
                  onAddMatch={() => setShowCreateForm(true)} 
                  onSelectMatch={(id) => {
                    setSelectedMatchId(id);
                    setActiveTab('alineacion');
                  }}
                />
              )
            )}
            {(activeTab === 'alineacion' || activeTab === 'rival' || activeTab === 'plan') && (
              <div className="space-y-6">
                <div className="bg-brand-slate-950 p-4 rounded-2xl border border-brand-slate-800 flex items-center gap-4">
                  <Calendar className="text-red-500" size={20} />
                  <select 
                    value={selectedMatchId || ''} 
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="bg-brand-slate-900 border border-brand-slate-800 text-white rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none flex-1"
                  >
                    <option value="">Selecciona un partido...</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>{m.rival || `${m.equipo_local} vs ${m.equipo_visitante}`} ({new Date(m.fecha).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>
                
                {selectedMatchId ? (
                  <>
                    {activeTab === 'alineacion' && (
                      <LineupEditor 
                        matchId={selectedMatchId} 
                        players={players} 
                        initialLineup={selectedMatch?.alineacion}
                        initialFormation={selectedMatch?.formacion}
                      />
                    )}
                    {activeTab === 'rival' && (
                      <RivalReport 
                        matchId={selectedMatchId}
                        initialData={selectedMatch?.informe_rival}
                      />
                    )}
                    {activeTab === 'plan' && (
                      <MatchPlan 
                        matchId={selectedMatchId}
                        initialData={selectedMatch?.plan_partido}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 bg-brand-slate-950/20 rounded-3xl border-2 border-dashed border-brand-slate-800">
                    <ClipboardList className="mx-auto w-12 h-12 text-brand-slate-800 mb-4" />
                    <p className="text-slate-500 text-sm font-medium">Selecciona un partido para continuar</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'formaciones' && <FormationsManager />}
            {activeTab === 'eventos' && <LiveEvents />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
