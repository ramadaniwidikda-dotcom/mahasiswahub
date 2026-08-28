import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderOpen,
  CalendarDays,
  Award,
  CheckSquare,
  Settings,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'krs', label: 'KRS & Dosen Wali', icon: FileSpreadsheet },
  { id: 'resources', label: 'Bank Materi & Link', icon: FolderOpen },
  { id: 'schedule', label: 'Jadwal & Kalender', icon: CalendarDays },
  { id: 'grades', label: 'Rekap IPS / IPK', icon: Award },
  { id: 'tasks', label: 'Tugas Harian', icon: CheckSquare },
  { id: 'settings', label: 'Pengaturan & Backup', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { data, overallIPK, totalEarnedSKS } = useAppData();
  const { studentProfile } = data;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              MahasiswaHub
              <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Portal Studi Terpadu</p>
          </div>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-primary-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-100/60 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
              {studentProfile.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {studentProfile.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                NIM: {studentProfile.nim}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-indigo-100/80 dark:border-slate-700 flex justify-between items-center text-[11px]">
            <span className="text-slate-600 dark:text-slate-400">
              Sem. <strong className="text-slate-800 dark:text-slate-200">{studentProfile.semester}</strong>
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              IPK: <strong className="text-primary-600 dark:text-primary-400">{overallIPK.toFixed(2)}</strong>
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              SKS: <strong className="text-slate-800 dark:text-slate-200">{totalEarnedSKS}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Academic Year Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            T.A. {studentProfile.academicYear}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {studentProfile.prodi}
          </p>
        </div>
      </aside>
    </>
  );
}
