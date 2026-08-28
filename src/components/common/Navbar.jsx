import React from 'react';
import { Menu, Sun, Moon, Plus, Sparkles, Cloud, RefreshCw, Smartphone } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import NotificationCenter from './NotificationCenter';

const TAB_TITLES = {
  dashboard: 'Dashboard Utama',
  krs: 'Kartu Rencana Studi (KRS) & Dosen Wali',
  resources: 'Bank Materi Kuliah & Bank Link',
  schedule: 'Jadwal Kuliah & Kalender Akademik',
  grades: 'Rekapan Nilai & Simulator Target IPK',
  tasks: 'Manajemen Tugas & Deadline',
  settings: 'Pengaturan, Cloud Sync & Backup',
};

export default function Navbar({ activeTab, setActiveTab, setMobileOpen, onQuickAdd }) {
  const { theme, toggleTheme, syncConfig, triggerManualSync } = useAppData();

  const handleCloudClick = () => {
    if (syncConfig.enabled) {
      triggerManualSync();
    } else {
      setActiveTab('settings');
    }
  };

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

      {/* Right side: Cloud Sync, Actions, Theme, Notification */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cloud Sync Status Indicator Button */}
        <button
          onClick={handleCloudClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            syncConfig.enabled
              ? syncConfig.isSyncing
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100'
          }`}
          title={
            syncConfig.enabled
              ? `Cloud Sync Aktif (${syncConfig.syncCode}). Klik untuk sinkronisasi manual sekarang.`
              : 'Klik untuk mengaktifkan sinkronisasi otomatis ke HP / Perangkat lain'
          }
        >
          {syncConfig.enabled ? (
            syncConfig.isSyncing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                <span className="hidden sm:inline">Sinkron...</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <Cloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Cloud: {syncConfig.syncCode}</span>
              </>
            )
          ) : (
            <>
              <Smartphone className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Hubungkan HP</span>
            </>
          )}
        </button>

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
