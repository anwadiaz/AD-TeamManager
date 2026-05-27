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
            initial={{ opacity: 0, y: isMobile ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? -10 : 10, scale: 0.95 }}
            className={`absolute z-50 w-48 bg-brand-slate-900 border border-brand-slate-800 rounded-xl shadow-2xl p-1 overflow-hidden
              ${isMobile ? 'bottom-full mb-4 left-1/2 -translate-x-1/2' : 'bottom-full mb-4 left-0'}`}
          >
            <div className="px-3 py-2 border-b border-brand-slate-800 mb-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Sesión iniciada</p>
              <p className="text-xs text-slate-300 truncate">{email}</p>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('profile');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-brand-slate-800 hover:text-white rounded-lg transition-colors group"
            >
              <User size={16} className="text-slate-500 group-hover:text-red-500" />
              <span>Mi Perfil</span>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('settings');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-brand-slate-800 hover:text-white rounded-lg transition-colors group"
            >
              <Settings size={16} className="text-slate-500 group-hover:text-red-500" />
              <span>Ajustes</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group mt-1"
            >
              <LogOut size={16} className="text-red-500" />
              <span>Cerrar Sesión</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
