import React, { useState, useRef } from 'react';
import {
  Settings,
  User,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import confetti from 'canvas-confetti';

export default function SettingsBackup() {
  const {
    data,
    updateProfile,
    exportDataAsJSON,
    importDataFromJSON,
    resetToDefaultData,
  } = useAppData();

  const { studentProfile } = data;

  const [profileForm, setProfileForm] = useState({
    name: studentProfile.name,
    nim: studentProfile.nim,
    universitas: studentProfile.universitas,
    fakultas: studentProfile.fakultas,
    prodi: studentProfile.prodi,
    semester: studentProfile.semester,
    academicYear: studentProfile.academicYear,
    targetIPK: studentProfile.targetIPK,
    totalRequiredSKS: studentProfile.totalRequiredSKS || 144,
  });

  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({
      ...profileForm,
      semester: Number(profileForm.semester),
      targetIPK: Number(profileForm.targetIPK),
      totalRequiredSKS: Number(profileForm.totalRequiredSKS),
    });
    setFeedbackMessage({ type: 'success', text: 'Profil mahasiswa berhasil diperbarui!' });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = importDataFromJSON(event.target.result);
        if (result.success) {
          setFeedbackMessage({ type: 'success', text: result.message });
          confetti({ particleCount: 50, spread: 60 });
        } else {
          setFeedbackMessage({ type: 'error', text: result.message });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang data ke default contoh awal?')) {
      resetToDefaultData();
      setFeedbackMessage({ type: 'info', text: 'Data telah direset ke contoh default!' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              : feedbackMessage.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
              : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 1. Profile Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Profil Mahasiswa & Informasi Akademik
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ubah identitas perkuliahan, program studi, dan target kelulusan Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Induk Mahasiswa (NIM) *
              </label>
              <input
                type="text"
                required
                value={profileForm.nim}
                onChange={(e) => setProfileForm({ ...profileForm, nim: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Universitas / Institut *
              </label>
              <input
                type="text"
                required
                value={profileForm.universitas}
                onChange={(e) => setProfileForm({ ...profileForm, universitas: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fakultas
              </label>
              <input
                type="text"
                value={profileForm.fakultas}
                onChange={(e) => setProfileForm({ ...profileForm, fakultas: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Program Studi *
              </label>
              <input
                type="text"
                required
                value={profileForm.prodi}
                onChange={(e) => setProfileForm({ ...profileForm, prodi: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Aktif
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={profileForm.semester}
                onChange={(e) => setProfileForm({ ...profileForm, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={profileForm.academicYear}
                onChange={(e) => setProfileForm({ ...profileForm, academicYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target IPK Impian
              </label>
              <input
                type="number"
                step="0.01"
                min={2.0}
                max={4.0}
                value={profileForm.targetIPK}
                onChange={(e) => setProfileForm({ ...profileForm, targetIPK: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-primary-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total SKS Kelulusan
              </label>
              <input
                type="number"
                min={100}
                max={160}
                value={profileForm.totalRequiredSKS}
                onChange={(e) => setProfileForm({ ...profileForm, totalRequiredSKS: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-xs"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* 2. Backup & Data Management */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Cadangan & Pemulihan Data (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seluruh data tersimpan secara lokal dan aman di browser Anda. Ekspor cadangan JSON agar tidak hilang saat berganti perangkat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Export JSON */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-primary-500" />
                Ekspor Cadangan (JSON)
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Unduh seluruh data KRS, jadwal, nilai, tugas, dan tautan dalam 1 file JSON ringan.
              </p>
            </div>
            <button
              onClick={exportDataAsJSON}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              Download File Backup
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-500" />
                Impor Data Cadangan
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Pulihkan data dari file backup JSON yang sebelumnya Anda simpan.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
              >
                Pilih File JSON
              </button>
            </div>
          </div>

          {/* Reset Data */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset ke Demo Default
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Kembalikan data ke contoh data mahasiswa bawaan.
              </p>
            </div>
            <button
              onClick={handleResetConfirm}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900 transition-colors"
            >
              Reset Data Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
