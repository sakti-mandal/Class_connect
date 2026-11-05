import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { isFirebaseActive } = useAuth();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">ClassConnect</span>
          <span>•</span>
          <span className="text-[11px] text-slate-400">Connecting Students, Simplifying Campus Life</span>
        </div>

        <div className="text-[11px] text-slate-400">
          <span>{isFirebaseActive ? 'Firebase Connected' : 'Demo Mode (Local Storage)'}</span>
        </div>
      </div>
    </footer>
  );
}
