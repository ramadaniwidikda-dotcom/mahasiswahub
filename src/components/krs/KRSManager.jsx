import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  MapPin,
  Calendar,
  MessageCircle,
  Mail,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Modal from '../common/Modal';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const COLOR_OPTIONS = ['#6366f1', '#0ea5e9', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

export default function KRSManager() {
  const {
    data,
    currentKRS_SKS,
    maxAllowedSKS,
    addCourse,
    updateCourse,
    deleteCourse,
    updateDoswal,
    uploadKRSFile,
  } = useAppData();

  const { studentProfile, doswal, krs } = data;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDoswalModalOpen, setIsDoswalModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form State for Course
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sks: 3,
    classCode: 'IF-5A',
    lecturer: '',
    day: 'Senin',
    startTime: '08:00',
    endTime: '10:30',
    room: '',
    color: '#6366f1',
  });

  // Form State for Doswal
  const [doswalFormData, setDoswalFormData] = useState({
    name: doswal.name,
    nip: doswal.nip,
    email: doswal.email,
    phone: doswal.phone,
    whatsapp: doswal.whatsapp,
    office: doswal.office,
    consultationHours: doswal.consultationHours,
    notes: doswal.notes,
  });

  const fileInputRef = useRef(null);

  // Open Edit Course
  const handleEditClick = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      name: course.name,
      sks: course.sks,
      classCode: course.classCode || '',
      lecturer: course.lecturer || '',
      day: course.day,
      startTime: course.startTime,
      endTime: course.endTime,
      room: course.room || '',
      color: course.color || '#6366f1',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      sks: 3,
      classCode: 'IF-5A',
      lecturer: '',
      day: 'Senin',
      startTime: '08:00',
      endTime: '10:30',
      room: '',
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)],
    });
    setIsAddModalOpen(true);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse(formData);
    }
    setIsAddModalOpen(false);
  };

  const handleDoswalSubmit = (e) => {
    e.preventDefault();
    updateDoswal(doswalFormData);
    setIsDoswalModalOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileSizeKB = (file.size / 1024).toFixed(0);
      const sizeStr = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
      uploadKRSFile(file.name, sizeStr);
      setIsUploadModalOpen(false);
    }
  };

  const handlePrintKRS = () => {
    window.print();
  };

  const isExceedingSKS = currentKRS_SKS > maxAllowedSKS;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Kartu Rencana Studi (KRS)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {krs.status || 'Disetujui'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Semester {krs.semester} • Tahun Ajaran {krs.academicYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="h-4 w-4 text-primary-500" />
            <span>Upload Berkas KRS</span>
          </button>

          <button
            onClick={handlePrintKRS}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Cetak KRS</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs shadow-primary-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* 2. Top Info Cards: SKS Tracker & Dosen Wali Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SKS Summary & Limit Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                BEBAN SKS SEMESTER INI
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                Limit: {maxAllowedSKS} SKS
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {currentKRS_SKS}
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                dari batas maksimal {maxAllowedSKS} SKS
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceedingSKS ? 'bg-rose-500' : 'bg-primary-600'
                }`}
                style={{ width: `${Math.min(100, (currentKRS_SKS / maxAllowedSKS) * 100)}%` }}
              />
            </div>

            {isExceedingSKS ? (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Pengambilan SKS melebihi batas yang diizinkan ({maxAllowedSKS} SKS)!</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Tersedia <strong>{maxAllowedSKS - currentKRS_SKS} SKS</strong> yang masih dapat diambil.
              </p>
            )}
          </div>

          {/* Uploaded File Info */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {krs.uploadedFileName || 'Belum ada dokumen diunggah'}
                </span>
              </div>
              {krs.uploadedFileSize && (
                <span className="text-slate-400 text-[11px]">{krs.uploadedFileSize}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dosen Wali (Doswal) Full Profile */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/70 to-primary-50/40 dark:from-slate-900 dark:to-slate-800/80 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary-600 text-white shadow-xs">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Dosen Pembimbing Akademik / Dosen Wali
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Konsultasi rencana studi & persetujuan KRS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDoswalModalOpen(true)}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Info
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-100/80 dark:border-slate-700/60 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {doswal.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  NIP: {doswal.nip}
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doswal.office}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doswal.consultationHours}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-100/80 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                    Catatan Bimbingan Doswal:
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic line-clamp-3">
                    "{doswal.notes || 'Belum ada catatan khusus.'}"
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={`https://wa.me/${doswal.whatsapp}?text=Halo%20Bapak%20Dosen%20Wali,%20saya%20${encodeURIComponent(studentProfile.name)}%20(NIM:%20${studentProfile.nim})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${doswal.email}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daftar Mata Kuliah Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Daftar Mata Kuliah Terpilih ({krs.courses.length} Matkul)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian jadwal perkuliahan, ruang, dosen, dan bobot SKS
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 hover:bg-primary-100 text-xs font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Tambah Matkul
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Kode & Mata Kuliah</th>
                <th className="px-4 py-4 text-center">SKS</th>
                <th className="px-4 py-4">Kelas</th>
                <th className="px-4 py-4">Dosen Pengampu</th>
                <th className="px-4 py-4">Jadwal (Hari & Jam)</th>
                <th className="px-4 py-4">Ruangan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {krs.courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Belum ada mata kuliah yang ditambahkan ke KRS semester ini.
                  </td>
                </tr>
              ) : (
                krs.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: course.color || '#6366f1' }}
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {course.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {course.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {course.sks} SKS
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-600 dark:text-slate-400">
                      {course.classCode || '-'}
                    </td>
                    <td className="px-4 py-4">
                      {course.lecturer || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {course.day}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {course.startTime} - {course.endTime} WIB
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      {course.room || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditClick(course)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Mata Kuliah"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus Mata Kuliah"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50/80 dark:bg-slate-800/40 font-bold border-t border-slate-200 dark:border-slate-800">
              <tr>
                <td className="px-6 py-4 text-slate-900 dark:text-white">TOTAL SKS DIAMBIL</td>
                <td className="px-4 py-4 text-center text-primary-600 dark:text-primary-400 text-sm">
                  {currentKRS_SKS} SKS
                </td>
                <td colSpan={5} className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                  Batas Maksimal Pengambilan: {maxAllowedSKS} SKS
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT COURSE MODAL --- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah ke KRS'}
      >
        <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Mata Kuliah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: IF501"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Mata Kuliah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pemrograman Web Lanjut"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bobot SKS *
              </label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={formData.sks}
                onChange={(e) => setFormData({ ...formData, sks: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kelas
              </label>
              <input
                type="text"
                placeholder="Contoh: IF-5A"
                value={formData.classCode}
                onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hari *
              </label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Mulai *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Selesai *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dosen Pengampu
              </label>
              <input
                type="text"
                placeholder="Contoh: Prof. Budi Santoso, Ph.D."
                value={formData.lecturer}
                onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Lab RPL 2"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Warna Penanda Jadwal
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    formData.color === c ? 'scale-110 border-slate-900 dark:border-white shadow-xs' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
            >
              {editingCourse ? 'Simpan Perubahan' : 'Tambah ke KRS'}
            </button>
          </div>
        </form>
      </Modal>

      {/* --- UPLOAD KRS MODAL --- */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Berkas KRS Resmi"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Unggah file Kartu Rencana Studi (PDF, JPG, atau PNG) yang telah dicetak dari SIAKAD / portal kampus untuk arsip digital Anda.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
          >
            <Upload className="h-10 w-10 text-primary-500 mx-auto mb-3" />
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Klik atau Seret Berkas KRS ke Sini
            </p>
            <p className="text-slate-400 text-[11px] mt-1">
              Mendukung format PDF, JPG, PNG (Maks. 10 MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
          </div>

          {krs.uploadedFileName && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {krs.uploadedFileName}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {krs.uploadedFileSize}
              </span>
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* --- EDIT DOSWAL MODAL --- */}
      <Modal
        isOpen={isDoswalModalOpen}
        onClose={() => setIsDoswalModalOpen(false)}
        title="Edit Data Dosen Wali"
      >
        <form onSubmit={handleDoswalSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={doswalFormData.name}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP / NIDN
              </label>
              <input
                type="text"
                value={doswalFormData.nip}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, nip: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Dosen
              </label>
              <input
                type="email"
                value={doswalFormData.email}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp (Contoh: 6281234567890)
              </label>
              <input
                type="text"
                value={doswalFormData.whatsapp}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ruangan Kantor
              </label>
              <input
                type="text"
                value={doswalFormData.office}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, office: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jadwal Konsultasi
              </label>
              <input
                type="text"
                value={doswalFormData.consultationHours}
                onChange={(e) => setDoswalFormData({ ...doswalFormData, consultationHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Arahan Bimbingan
            </label>
            <textarea
              rows={3}
              value={doswalFormData.notes}
              onChange={(e) => setDoswalFormData({ ...doswalFormData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDoswalModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              Simpan Doswal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
