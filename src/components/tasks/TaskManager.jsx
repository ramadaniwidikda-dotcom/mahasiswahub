import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  Bell,
  CheckCircle2,
  Calendar,
  LayoutGrid,
  List,
  Filter,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getDeadlineInfo, requestNotificationPermission } from '../../utils/notificationHelper';
import Modal from '../common/Modal';
import confetti from 'canvas-confetti';

const TASK_TYPES = ['Tugas Mandiri', 'Tugas Kelompok', 'Praktikum', 'Tugas Besar / Proyek', 'Kuis / Latihan'];
const PRIORITIES = [
  { id: 'high', label: 'Tinggi', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  { id: 'medium', label: 'Sedang', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { id: 'low', label: 'Rendah', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
];

export default function TaskManager() {
  const { data, addTask, updateTask, toggleTaskStatus, deleteTask } = useAppData();
  const { tasks, krs } = data;

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [notifPermissionStatus, setNotifPermissionStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    courseId: krs.courses[0]?.id || '',
    type: 'Tugas Mandiri',
    deadline: new Date().toISOString().split('T')[0],
    deadlineTime: '23:59',
    priority: 'medium',
    status: 'todo',
    notes: '',
  });

  const handleRequestNotif = async () => {
    const res = await requestNotificationPermission();
    setNotifPermissionStatus(res.status);
    if (res.status === 'granted') {
      confetti({
        particleCount: 40,
        spread: 50,
      });
    }
  };

  const handleToggleComplete = (taskId, currentStatus) => {
    toggleTaskStatus(taskId);
    if (currentStatus !== 'done') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });
    }
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      courseId: krs.courses[0]?.id || '',
      type: 'Tugas Mandiri',
      deadline: new Date().toISOString().split('T')[0],
      deadlineTime: '23:59',
      priority: 'medium',
      status: 'todo',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      courseId: task.courseId,
      type: task.type,
      deadline: task.deadline,
      deadlineTime: task.deadlineTime || '23:59',
      priority: task.priority,
      status: task.status,
      notes: task.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const course = krs.courses.find((c) => c.id === taskForm.courseId);
    const courseName = course ? course.name : 'Umum';

    if (editingTask) {
      updateTask(editingTask.id, {
        ...taskForm,
        courseName,
      });
    } else {
      addTask({
        ...taskForm,
        courseName,
      });
    }
    setIsAddModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesCourse = selectedCourseFilter === 'all' || t.courseId === selectedCourseFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || t.priority === selectedPriorityFilter;
    return matchesCourse && matchesPriority;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Manajemen Tugas & Deadline
            <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pantau seluruh tugas kuliah dengan alarm pengingat terintegrasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Notification Permission Button */}
          {notifPermissionStatus !== 'granted' && (
            <button
              onClick={handleRequestNotif}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span>Aktifkan Notifikasi Desktop</span>
            </button>
          )}

          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Tampilan List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs' : 'text-slate-500'
              }`}
              title="Tampilan Kanban Board"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Tugas Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Semua Mata Kuliah ({tasks.length} Tugas)</option>
            {krs.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Semua Tingkat Prioritas</option>
            <option value="high">Prioritas Tinggi (Mendesak)</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>
      </div>

      {/* --- VIEW 1: LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada tugas yang sesuai filter
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan tombol "Tambah Tugas Baru" untuk mencatat tugas kuliah berikutnya.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const deadlineInfo = getDeadlineInfo(task.deadline, task.deadlineTime);
              const priorityConfig =
                PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isDone ? 'bg-slate-50/50 dark:bg-slate-900/40 opacity-70' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      className={`mt-0.5 h-5 w-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="h-4 w-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityConfig.color}`}>
                          Prioritas {priorityConfig.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {task.type}
                        </span>
                      </div>

                      <h4
                        className={`font-bold text-sm text-slate-900 dark:text-white mt-1.5 ${
                          isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.courseName}
                      </p>

                      {task.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${deadlineInfo.badgeBg}`}>
                        {deadlineInfo.label}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {task.deadline} {task.deadlineTime || ''}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Tugas"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- VIEW 2: KANBAN BOARD --- */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Belum Dikerjakan (To-Do) */}
          <div className="bg-slate-100/70 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-xs uppercase text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Belum Dikerjakan
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTasks.filter((t) => t.status === 'todo').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'todo')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleComplete(task.id, task.status)}
                    onEdit={() => handleOpenEdit(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Sedang Dikerjakan (In Progress) */}
          <div className="bg-indigo-50/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-indigo-100 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-xs uppercase text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
                Sedang Dikerjakan
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300">
                {filteredTasks.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'in_progress')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleComplete(task.id, task.status)}
                    onEdit={() => handleOpenEdit(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Selesai (Completed) */}
          <div className="bg-emerald-50/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-emerald-100 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-xs uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Selesai
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300">
                {filteredTasks.filter((t) => t.status === 'done').length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {filteredTasks
                .filter((t) => t.status === 'done')
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleComplete(task.id, task.status)}
                    onEdit={() => handleOpenEdit(task)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT TASK MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Tugas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Tugas 01 - Implementasi JWT Auth"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Kuliah *
              </label>
              <select
                value={taskForm.courseId}
                onChange={(e) => setTaskForm({ ...taskForm, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {krs.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Tugas *
              </label>
              <select
                value={taskForm.type}
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Pengumpulan (Deadline) *
              </label>
              <input
                type="date"
                required
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Batas (Jam)
              </label>
              <input
                type="time"
                value={taskForm.deadlineTime}
                onChange={(e) => setTaskForm({ ...taskForm, deadlineTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat Prioritas *
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="high">Tinggi (Sangat Mendesak)</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Pengerjaan *
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="todo">Belum Dikerjakan</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="done">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Instruksi Tugas
            </label>
            <textarea
              rows={3}
              placeholder="Catatan tambahan atau link dokumen tugas..."
              value={taskForm.notes}
              onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              {editingTask ? 'Simpan Tugas' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Kanban Single Task Card
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const deadlineInfo = getDeadlineInfo(task.deadline, task.deadlineTime);
  const priorityConfig = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];
  const isDone = task.status === 'done';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-primary-300 dark:hover:border-primary-800 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${priorityConfig.color}`}>
            {priorityConfig.label}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-1 text-slate-400 hover:text-primary-600">
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="p-1 text-slate-400 hover:text-rose-600">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <h5 className={`font-bold text-xs text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
          {task.courseName}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${deadlineInfo.badgeBg}`}>
          {deadlineInfo.label}
        </span>
        <button
          onClick={onToggle}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        >
          {isDone ? 'Buka Kembali' : 'Selesai'}
        </button>
      </div>
    </div>
  );
}
