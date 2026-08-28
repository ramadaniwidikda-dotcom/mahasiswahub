import React from 'react';
import { Menu, Sun, Moon, Plus, Sparkles } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import NotificationCenter from './NotificationCenter';

const TAB_TITLES = {
  dashboard: 'Dashboard Utama',
  krs: 'Kartu Rencana Studi (KRS) & Dosen Wali',
  resources: 'Bank Materi Kuliah & Bank Link',
  schedule: 'Jadwal Kuliah & Kalender Akademik',
  grades: 'Rekapan Nilai & Simulator Target IPK',
  tasks: 'Manajemen Tugas & Deadline',
  settings: 'Pengaturan & Cadangan Data',
};

export default function Navbar({ activeTab, setActiveTab, setMobileOpen, onQuickAdd }) {
  const { theme, toggleTheme } = useAppData();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {TAB_TITLES[activeTab] || 'MahasiswaHub'}
          </h2>
        </div>
      </div>

      {/* Right side: Actions, Theme, Notification */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onQuickAdd}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs shadow-primary-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Cepat</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <NotificationCenter setActiveTab={setActiveTab} />
      </div>
    </header>
  );
}
