import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Layout, Activity, Shield, Trophy } from 'lucide-react';
import TeamList from './TeamList';
import RivalReport from './RivalReport';
import MatchPlan from './MatchPlan';
import LiveEvents from './LiveEvents';

type TabType = 'equipos' | 'rival' | 'plan' | 'eventos';

export default function MatchesManager() {
  const [activeTab, setActiveTab] = useState<TabType>('equipos');

  const tabs = [
    { id: 'equipos', label: 'Lista de Equipos', icon: Users },
    { id: 'rival', label: 'Informe Rival', icon: FileText },
    { id: 'plan', label: 'Plan Partido', icon: Layout },
    { id: 'eventos', label: 'Eventos', icon: Activity },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Tab Navigation */}
      <div className="flex bg-brand-slate-900 p-1 rounded-2xl border border-brand-slate-800 self-start overflow-x-auto max-w-full">
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
            {activeTab === 'equipos' && <TeamList />}
            {activeTab === 'rival' && <RivalReport />}
            {activeTab === 'plan' && <MatchPlan />}
            {activeTab === 'eventos' && <LiveEvents />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
