import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Youtube, Trophy, Zap, AlertCircle, History } from 'lucide-react';

interface EventLog {
  id: string;
  type: string;
  timestamp: string;
  color: string;
}

export default function LiveEvents() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [stats, setStats] = useState({
    golesFavor: 0,
    ocasionesFavor: 0,
    golesContra: 0,
    ocasionesContra: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addEvent = (type: string, color: string, statKey?: keyof typeof stats) => {
    const newLog: EventLog = {
      id: Date.now().toString(),
      type,
      timestamp: formatTime(time),
      color
    };
    setLogs([newLog, ...logs]);
    if (statKey) {
      setStats(prev => ({ ...prev, [statKey]: prev[statKey] + 1 }));
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(youtubeUrl);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
      {/* Left Column: Video */}
      <div className="xl:col-span-8 space-y-6">
        {/* Video Player */}
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-4">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full bg-brand-slate-950 border border-brand-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500/50 transition-colors"
            placeholder="Introduce la URL de YouTube..."
          />
          <div className="aspect-video bg-brand-slate-950 rounded-2xl border border-brand-slate-800 overflow-hidden relative">
            {youtubeId ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-4">
                <Youtube size={48} />
                <span className="text-xs font-bold uppercase tracking-widest">Esperando señal de video...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Controls & Logs */}
      <div className="xl:col-span-4 space-y-6 flex flex-col h-full">
        {/* Unified Control Panel (Timer + Buttons) */}
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-4xl font-black font-mono text-white tracking-tighter tabular-nums">
              {formatTime(time)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-3 rounded-xl transition-all active:scale-95 ${
                  isRunning ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-red-500 text-slate-950 shadow-lg shadow-red-500/20'
                }`}
              >
                {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTime(0);
                  setLogs([]);
                  setStats({ golesFavor: 0, ocasionesFavor: 0, golesContra: 0, ocasionesContra: 0 });
                }}
                className="p-3 bg-brand-slate-800 text-slate-500 rounded-xl border border-brand-slate-700 hover:text-white transition-all active:scale-95"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => addEvent('Gol a Favor', 'text-green-400', 'golesFavor')}
              className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-all group flex flex-col items-center gap-1"
            >
              <Trophy size={18} className="text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-green-500 tracking-wider">Gol Favor</span>
              <span className="text-xl font-black text-white">{stats.golesFavor}</span>
            </button>

            <button
              onClick={() => addEvent('Ocasión a Favor', 'text-blue-400', 'ocasionesFavor')}
              className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group flex flex-col items-center gap-1"
            >
              <Zap size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-blue-500 tracking-wider">Ocasión +</span>
              <span className="text-xl font-black text-white">{stats.ocasionesFavor}</span>
            </button>

            <button
              onClick={() => addEvent('Gol en Contra', 'text-red-400', 'golesContra')}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all group flex flex-col items-center gap-1"
            >
              <AlertCircle size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-red-500 tracking-wider">Gol Contra</span>
              <span className="text-xl font-black text-white">{stats.golesContra}</span>
            </button>

            <button
              onClick={() => addEvent('Ocasión en Contra', 'text-orange-400', 'ocasionesContra')}
              className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl hover:bg-orange-500/20 transition-all group flex flex-col items-center gap-1"
            >
              <Zap size={18} className="text-orange-500 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider">Ocasión -</span>
              <span className="text-xl font-black text-white">{stats.ocasionesContra}</span>
            </button>
          </div>
        </div>

        {/* History Logs */}
        <div className="bento-card p-6 bg-brand-slate-900 border border-brand-slate-800 flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-brand-slate-950 border border-brand-slate-800 rounded-xl"
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>
                      {log.type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Min {log.timestamp}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2 opacity-50">
                  <History size={32} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sin eventos registrados</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
