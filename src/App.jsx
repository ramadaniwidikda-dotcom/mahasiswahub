import React, { useState } from 'react';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import DashboardOverview from './components/dashboard/DashboardOverview';
import KRSManager from './components/krs/KRSManager';
import ResourceBank from './components/resources/ResourceBank';
import ScheduleCalendar from './components/schedule/ScheduleCalendar';
import GradeTracker from './components/grades/GradeTracker';
import TaskManager from './components/tasks/TaskManager';
import SettingsBackup from './components/settings/SettingsBackup';
import Modal from './components/common/Modal';
import { Plus, CheckSquare, BookOpen, Link2, Calendar } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          onQuickAdd={() => setIsQuickAddOpen(true)}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              onAddTask={() => setActiveTab('tasks')}
            />
          )}

          {activeTab === 'krs' && <KRSManager />}

          {activeTab === 'resources' && <ResourceBank />}

          {activeTab === 'schedule' && <ScheduleCalendar />}

          {activeTab === 'grades' && <GradeTracker />}

          {activeTab === 'tasks' && <TaskManager />}

          {activeTab === 'settings' && <SettingsBackup />}
        </main>
      </div>

      {/* --- QUICK ACTION MODAL --- */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Pilih Aksi Cepat"
        maxWidth="max-w-md"
      >
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => {
              setActiveTab('tasks');
              setIsQuickAddOpen(false);
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left flex flex-col gap-2 group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 w-fit">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Tambah Tugas
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Catat tugas & deadline
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('resources');
              setIsQuickAddOpen(false);
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left flex flex-col gap-2 group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 w-fit">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Upload Materi
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simpan modul & slide
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('resources');
              setIsQuickAddOpen(false);
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left flex flex-col gap-2 group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 w-fit">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Simpan Link
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Drive, Zoom, Youtube
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('krs');
              setIsQuickAddOpen(false);
            }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-slate-200 dark:border-slate-700 text-left flex flex-col gap-2 group transition-all"
          >
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 w-fit">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                Kelola KRS
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Matkul & Dosen Wali
              </p>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppContent />
    </AppDataProvider>
  );
}
