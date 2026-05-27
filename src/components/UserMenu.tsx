import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserMenuProps {
  email?: string;
  isMobile?: boolean;
  onNavigate: (view: 'profile' | 'settings') => void;
  currentView?: string;
}

export function UserMenu({ email, isMobile = false, onNavigate, currentView }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = currentView === 'profile' || currentView === 'settings';

  const initials = email 
    ? email.split('@')[0].substring(0, 2).toUpperCase() 
    : '??';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center rounded-full font-bold transition-all active:scale-95 shadow-lg border-2
          ${isActive ? 'bg-red-500 text-slate-950 border-red-400' : 'bg-brand-slate-800 text-red-500 border-brand-slate-700 hover:border-red-500/30'}
          ${isMobile ? 'w-10 h-10 text-[10px]' : 'w-12 h-12 text-sm'}`}
      >
        {initials}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 10 : -10, scale: 0.95 }}
            className={`absolute z-50 w-64 bg-brand-slate-900 border border-brand-slate-800 rounded-2xl shadow-2xl p-2 
              ${isMobile ? 'bottom-full mb-3 left-0' : 'top-0 left-full ml-4'}`}
          >
            <div className="px-4 py-3 border-b border-brand-slate-800/50 mb-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Cuenta Activa</p>
              <p className="text-sm text-white font-medium truncate">{email}</p>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('profile');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-brand-slate-800 hover:text-white rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-slate-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <User size={18} className="text-slate-500 group-hover:text-red-500" />
                </div>
                <span className="font-semibold">Mi Perfil</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-brand-slate-800 hover:text-white rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-slate-800 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                  <Settings size={18} className="text-slate-500 group-hover:text-red-500" />
                </div>
                <span className="font-semibold">Ajustes</span>
              </button>

              <div className="h-px bg-brand-slate-800 my-2 mx-2" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="font-semibold">Cerrar Sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
