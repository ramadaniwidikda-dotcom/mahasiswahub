import React from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  Mail,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getAcademicStanding } from '../../utils/gradeCalculator';
import { getDeadlineInfo } from '../../utils/notificationHelper';
import confetti from 'canvas-confetti';

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function DashboardOverview({ setActiveTab, onAddTask }) {
  const {
    data,
    overallIPK = 0,
    totalEarnedSKS = 0,
    currentKRS_SKS = 0,
    maxAllowedSKS = 24,
    toggleTaskStatus,
  } = useAppData();

  const studentProfile = data?.studentProfile || {};
  const doswal = data?.doswal || {};
  const krs = data?.krs || { courses: [] };
  const tasks = data?.tasks || [];
  const links = data?.links || [];
  const academicCalendar = data?.academicCalendar || [];

  const standing = getAcademicStanding(overallIPK || 0);

  // Today's classes with safe access
  const todayName = INDO_DAYS[new Date().getDay()];
  const todayCourses = (krs?.courses || []).filter(
    (c) => (c?.day || '').toLowerCase() === todayName.toLowerCase()
  );

  // Upcoming unfinished tasks sorted by deadline
  const pendingTasks = (tasks || [])
    .filter((t) => t && t.status !== 'done')
    .sort((a, b) => new Date(a?.deadline || 0) - new Date(b?.deadline || 0))
    .slice(0, 4);

  // Graduation SKS Progress
  const totalRequired = Number(studentProfile?.totalRequiredSKS) || 144;
  const safeEarned = Number(totalEarnedSKS) || 0;
  const progressPercent = Math.min(100, Math.round((safeEarned / totalRequired) * 100));

  const handleTaskToggle = (taskId) => {
    if (toggleTaskStatus) {
      toggleTaskStatus(taskId);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const displayName = studentProfile?.name ? studentProfile.name.split(' ')[0] : 'Mahasiswa';
  const displayIPK = (Number(overallIPK) || 0).toFixed(2);
  const targetIPK = (Number(studentProfile?.targetIPK) || 3.8).toFixed(2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-indigo-100 mb-3 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Semester {studentProfile?.semester || 1} • {studentProfile?.academicYear || '2026/2027'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Semangat Belajar, {displayName}! 🚀
            </h2>
            <p className="text-indigo-100/90 text-sm mt-1 max-w-xl">
              {studentProfile?.prodi || 'Program Studi'} • {studentProfile?.universitas || 'Universitas'}
            </p>
          </div>

          {/* Target IPK Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="h-11 w-11 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black text-lg shadow-md">
              {displayIPK}
            </div>
            <div>
              <p className="text-xs text-indigo-200 font-medium">IPK Kumulatif</p>
              <p className="text-xs font-bold text-amber-300">
                Target: {targetIPK}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: SKS Semester Ini */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SKS Semester Ini</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{currentKRS_SKS}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ {maxAllowedSKS} SKS Max</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentKRS_SKS / (maxAllowedSKS || 24)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Total SKS Lulus */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progres Kelulusan</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{safeEarned}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ {totalRequired} SKS ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Predikat Akademik */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Akademik</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {standing?.title || 'Memuaskan'}
            </p>
            <span className={`inline-block px-2 py-0.5 mt-2 rounded-md text-[11px] font-semibold ${standing?.badgeBg || ''}`}>
              Standar Dikti
            </span>
          </div>
        </div>

        {/* Card 4: Tugas Belum Selesai */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tugas Aktif</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {(tasks || []).filter((t) => t?.status !== 'done').length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Tugas Pending</span>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {(tasks || []).filter((t) => t?.status !== 'done' && t?.priority === 'high').length} Prioritas Tinggi
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Today's Schedule & Doswal Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Jadwal Hari Ini */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Jadwal Kuliah Hari Ini ({todayName})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {todayCourses.length > 0 ? `${todayCourses.length} mata kuliah terjadwal` : 'Tidak ada jadwal kuliah hari ini'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {todayCourses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Hari ini bebas kelas kuliah!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gunakan waktu untuk menyelesaikan tugas atau mengulang materi di Bank Materi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayCourses.map((course) => (
                  <div
                    key={course?.id || Math.random()}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-primary-200 dark:hover:border-primary-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1.5 self-stretch rounded-full shrink-0"
                        style={{ backgroundColor: course?.color || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {course?.code || 'MATKUL'}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {course?.sks || 3} SKS • Kelas {course?.classCode || '-'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {course?.name || 'Mata Kuliah'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Dosen: {course?.lecturer || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course?.startTime || '08:00'} - {course?.endTime || '10:00'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{course?.room || 'Ruang Kuliah'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Tugas & Deadline Terdekat
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selesaikan tepat waktu untuk menjaga konsistensi nilai
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua ({tasks.length}) <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                🎉 Hebat! Semua tugas telah terselesaikan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map((task) => {
                  const deadlineInfo = getDeadlineInfo(task?.deadline, task?.deadlineTime);

                  return (
                    <div
                      key={task?.id || Math.random()}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleTaskToggle(task.id)}
                          className="h-5 w-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-primary-500 flex items-center justify-center shrink-0 transition-colors"
                          title="Tandai Selesai"
                        >
                          {task?.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {task?.title || 'Tugas'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {task?.courseName || 'Mata Kuliah'} • <span className="font-medium text-slate-600 dark:text-slate-300">{task?.type || 'Tugas'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${deadlineInfo?.badgeBg || ''}`}>
                          {deadlineInfo?.label || 'Deadline'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Dosen Wali & Quick Links */}
        <div className="space-y-6">
          {/* Dosen Wali Card */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Dosen Wali (Doswal)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {doswal?.status || 'Disetujui'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {doswal?.name || 'Dosen Pembimbing'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                NIP: {doswal?.nip || '-'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{doswal?.office || 'Gedung Dekanat'}</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{doswal?.consultationHours || 'Jam Bimbingan'}</span>
                </p>
              </div>
            </div>

            {/* Doswal Consultation Note */}
            {doswal?.notes && (
              <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                <p className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Catatan Bimbingan:
                </p>
                <p className="text-indigo-800/90 dark:text-indigo-200/90 leading-relaxed italic">
                  "{doswal.notes}"
                </p>
              </div>
            )}

            {/* Quick Contact Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/${doswal?.whatsapp || ''}?text=Halo%20Bapak%20Dosen%20Wali`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`mailto:${doswal?.email || ''}?subject=Konsultasi%20Akademik`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Quick Bank Links Widget */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tautan Cepat Belajar
              </h3>
              <button
                onClick={() => setActiveTab('resources')}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Semua Link
              </button>
            </div>
            <div className="space-y-2">
              {(links || []).slice(0, 3).map((link) => (
                <a
                  key={link?.id || Math.random()}
                  href={link?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                      {link?.title || 'Tautan'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {link?.category || 'Link'} • {link?.courseName || 'Umum'}
                    </p>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
