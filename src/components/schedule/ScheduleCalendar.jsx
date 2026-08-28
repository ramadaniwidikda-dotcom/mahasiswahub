import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Download,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Tag,
  BookOpen,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { downloadICSFile } from '../../utils/icsExporter';
import Modal from '../common/Modal';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const EVENT_TYPES = [
  { id: 'academic', label: 'Akademik / Kuliah', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { id: 'krs', label: 'Periode KRS', badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { id: 'exam', label: 'Ujian (UTS / UAS)', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  { id: 'event', label: 'Seminar / Acara', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'holiday', label: 'Libur Perkuliahan', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
];

export default function ScheduleCalendar() {
  const { data, addCalendarEvent, deleteCalendarEvent } = useAppData();
  const { krs, academicCalendar } = data;

  const [activeView, setActiveView] = useState('weekly'); // 'weekly' | 'academic'
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    type: 'academic',
    description: '',
  });

  const handleExportICS = () => {
    // Combine classes and academic events
    const exportList = [
      ...krs.courses.map((c) => ({
        title: `${c.code} - ${c.name}`,
        day: c.day,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        lecturer: c.lecturer,
        description: `Kuliah ${c.name} (${c.sks} SKS, Kelas ${c.classCode})`,
      })),
      ...academicCalendar.map((e) => ({
        title: e.title,
        date: e.date,
        description: e.description,
      })),
    ];
    downloadICSFile(exportList, 'Jadwal_Kuliah_dan_Kalender_Akademik.ics');
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    addCalendarEvent(eventForm);
    setIsAddEventOpen(false);
    setEventForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      type: 'academic',
      description: '',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveView('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Jadwal Kuliah Mingguan</span>
          </button>
          <button
            onClick={() => setActiveView('academic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'academic'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Kalender Akademik ({academicCalendar.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportICS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Download file .ics untuk Google Calendar atau Apple Calendar"
          >
            <Download className="h-4 w-4 text-primary-500" />
            <span>Sinkronisasi Google Calendar (.ics)</span>
          </button>

          {activeView === 'academic' && (
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Agenda</span>
            </button>
          )}
        </div>
      </div>

      {/* --- VIEW 1: JADWAL KULIAH MINGGUAN --- */}
      {activeView === 'weekly' && (
        <div className="space-y-4">
          {/* Day Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedDayFilter === 'all'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Semua Hari
            </button>
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDayFilter(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedDayFilter === day
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Timetable Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS.filter((d) => selectedDayFilter === 'all' || selectedDayFilter === d).map((day) => {
              const dayCourses = krs.courses
                .filter((c) => c.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {day}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {dayCourses.length} Matkul
                    </span>
                  </div>

                  <div className="p-4 flex-1 space-y-3">
                    {dayCourses.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">
                        Tidak ada perkuliahan di hari {day}.
                      </div>
                    ) : (
                      dayCourses.map((course) => (
                        <div
                          key={course.id}
                          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 relative overflow-hidden group hover:border-primary-300 dark:hover:border-primary-800 transition-all"
                        >
                          <div
                            className="absolute top-0 bottom-0 left-0 w-1.5"
                            style={{ backgroundColor: course.color || '#6366f1' }}
                          />
                          <div className="pl-1">
                            <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                              <span className="font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md">
                                {course.code} • {course.sks} SKS
                              </span>
                              <span className="font-semibold text-slate-500">
                                Kelas {course.classCode}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                              {course.name}
                            </h4>

                            <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                              <p className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                <Clock className="h-3.5 w-3.5 text-primary-500" />
                                <span>{course.startTime} - {course.endTime} WIB</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                <span>{course.room}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 truncate pt-1">
                                Dosen: {course.lecturer}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- VIEW 2: KALENDER AKADEMIK & AGENDA --- */}
      {activeView === 'academic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {academicCalendar.map((event) => {
            const eventConfig =
              EVENT_TYPES.find((t) => t.id === event.type) || EVENT_TYPES[0];

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${eventConfig.badge}`}>
                      {eventConfig.label}
                    </span>
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Agenda"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-3">
                    {event.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <CalendarIcon className="h-4 w-4 text-primary-500" />
                    <span>
                      {event.date} {event.endDate ? `s.d. ${event.endDate}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD EVENT MODAL --- */}
      <Modal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        title="Tambah Agenda Kalender Akademik"
      >
        <form onSubmit={handleEventSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Kegiatan / Agenda *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Batas Akhir Submit Tugas Besar RPL"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Berakhir (Opsional)
              </label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Kegiatan *
            </label>
            <select
              value={eventForm.type}
              onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan / Detail Kegiatan
            </label>
            <textarea
              rows={3}
              placeholder="Rincian agenda atau lokasi..."
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEventOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              Simpan Agenda
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
