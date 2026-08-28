import React, { useState, Component } from 'react';
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
import { Plus, CheckSquare, BookOpen, Link2, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

// ErrorBoundary to prevent blank/white screen on mobile
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MahasiswaHub Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('MAHASISWA_HUB_DATA_V1');
    localStorage.removeItem('MAHASISWA_HUB_SYNC_CONFIG_V1');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Terjadi Kesalahan Tampilan
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Data yang disinkronkan sedang disesuaikan atau terjadi kendala memori browser. Klik tombol di bawah untuk memulihkan tampilan.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors"
              >
                Reset Pengaturan & Data Awal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <AppDataProvider>
        <AppContent />
      </AppDataProvider>
    </ErrorBoundary>
  );
}
