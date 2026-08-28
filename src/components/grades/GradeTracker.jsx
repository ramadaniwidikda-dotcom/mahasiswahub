import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calculator,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';
import { useAppData } from '../../context/AppDataContext';
import {
  GRADE_SCALE,
  GRADE_OPTIONS,
  getAcademicStanding,
  simulateRequiredIPS,
  calculateIPS,
} from '../../utils/gradeCalculator';
import Modal from '../common/Modal';

export default function GradeTracker() {
  const {
    data,
    overallIPK,
    totalEarnedSKS,
    addSemesterGrade,
    updateSemesterGrade,
    deleteSemesterGrade,
    updateProfile,
  } = useAppData();

  const { studentProfile, gradeHistory } = data;
  const standing = getAcademicStanding(overallIPK);

  const [expandedSemester, setExpandedSemester] = useState(gradeHistory[gradeHistory.length - 1]?.semester || 1);
  const [isAddSemesterOpen, setIsAddSemesterOpen] = useState(false);
  const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
  const [editingSemesterObj, setEditingSemesterObj] = useState(null);

  // Target Simulator State
  const [targetIPKInput, setTargetIPKInput] = useState(studentProfile.targetIPK || 3.80);
  const totalRequiredSKS = studentProfile.totalRequiredSKS || 144;
  const remainingSKS = Math.max(0, totalRequiredSKS - totalEarnedSKS);

  const simulationResult = simulateRequiredIPS(
    overallIPK,
    totalEarnedSKS,
    targetIPKInput,
    remainingSKS
  );

  // Chart Data Preparation: calculate cumulative IPK at each semester point
  let runningPoints = 0;
  let runningSKS = 0;
  const chartData = gradeHistory.map((sem) => {
    sem.courses.forEach((c) => {
      if (c.grade && GRADE_SCALE[c.grade] !== undefined) {
        const sks = Number(c.sks) || 0;
        runningPoints += sks * GRADE_SCALE[c.grade];
        runningSKS += sks;
      }
    });
    const semIPK = runningSKS > 0 ? Number((runningPoints / runningSKS).toFixed(2)) : 0;
    return {
      name: `Sem ${sem.semester}`,
      ips: Number(sem.ips.toFixed(2)),
      ipk: semIPK,
      academicYear: sem.academicYear,
    };
  });

  // New Semester Form
  const [newSemesterNumber, setNewSemesterNumber] = useState(gradeHistory.length + 1);
  const [newAcademicYear, setNewAcademicYear] = useState('2026/2027 Ganjil');
  const [newCoursesList, setNewCoursesList] = useState([
    { code: 'IF501', name: 'Pemrograman Web Lanjut', sks: 3, grade: 'A' },
    { code: 'IF502', name: 'Rekayasa Perangkat Lunak', sks: 3, grade: 'A' },
  ]);

  const handleAddCourseRow = () => {
    setNewCoursesList([...newCoursesList, { code: '', name: '', sks: 3, grade: 'A' }]);
  };

  const handleRemoveCourseRow = (index) => {
    setNewCoursesList(newCoursesList.filter((_, i) => i !== index));
  };

  const handleCourseRowChange = (index, field, value) => {
    const updated = [...newCoursesList];
    updated[index][field] = field === 'sks' ? Number(value) : value;
    setNewCoursesList(updated);
  };

  const handleSaveNewSemester = (e) => {
    e.preventDefault();
    addSemesterGrade({
      semester: Number(newSemesterNumber),
      academicYear: newAcademicYear,
      courses: newCoursesList,
    });
    setIsAddSemesterOpen(false);
  };

  const handleOpenEditSemester = (sem) => {
    setEditingSemesterObj(JSON.parse(JSON.stringify(sem)));
    setIsEditGradeModalOpen(true);
  };

  const handleSaveEditSemester = (e) => {
    e.preventDefault();
    if (editingSemesterObj) {
      updateSemesterGrade(editingSemesterObj.semester, editingSemesterObj.courses);
      setIsEditGradeModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: IPK & Predikat */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-primary-500/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200">INDEKS PRESTASI KUMULATIF</span>
              <Award className="h-5 w-5 text-amber-300" />
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-black">{overallIPK.toFixed(2)}</span>
              <span className="text-sm font-semibold text-indigo-200">/ 4.00</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              {standing.title}
            </span>
          </div>
        </div>

        {/* Card 2: SKS Progress to Graduation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">TOTAL SKS LULUS</span>
              <BookOpen className="h-5 w-5 text-primary-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalEarnedSKS}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                / {totalRequiredSKS} SKS
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalEarnedSKS / totalRequiredSKS) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Sisa <strong>{remainingSKS} SKS</strong> lagi menuju syarat sidang skripsi.
          </p>
        </div>

        {/* Card 3: Target IPK Simulator Summary */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-slate-900 dark:to-slate-800/80 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                SIMULATOR TARGET
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Target: {targetIPKInput.toFixed(2)}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {simulationResult.message}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Min. IPS Sisa:</span>
            <span className="font-bold text-base text-primary-600 dark:text-primary-400">
              {simulationResult.requiredIPS > 0 ? simulationResult.requiredIPS.toFixed(2) : 'Aman'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive IPK & IPS Progression Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Grafik Perkembangan IPS & IPK Kumulatif
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tren nilai semester per semester hingga saat ini
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="text-slate-600 dark:text-slate-400">IPS Semester</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">IPK Kumulatif</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ipsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ipkColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888888' }} />
              <YAxis domain={[2.0, 4.0]} tick={{ fontSize: 12, fill: '#888888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Area
                type="monotone"
                dataKey="ips"
                name="IPS Semester"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#ipsColor)"
              />
              <Line
                type="monotone"
                dataKey="ipk"
                name="IPK Kumulatif"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Interactive Target Simulator Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-900 shadow-md">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Simulator Target Nilai Kelulusan</h3>
            <p className="text-xs text-indigo-200">
              Ketahui berapa IPS rata-rata yang harus diraih pada sisa mata kuliah untuk mencapai predikat impian
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-4 border-t border-white/10">
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-2">
              Target IPK Impian (Skala 4.00)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="3.00"
                max="4.00"
                step="0.01"
                value={targetIPKInput}
                onChange={(e) => setTargetIPKInput(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="font-extrabold text-xl text-amber-300 w-14 text-right">
                {targetIPKInput.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-2">
              Sisa Beban SKS Hingga Lulus
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{remainingSKS} SKS</span>
              <span className="text-xs text-indigo-300">
                (dari total {totalRequiredSKS} SKS)
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <p className="text-xs text-indigo-200 font-semibold mb-1">Rekomendasi Strategi:</p>
            <p className="text-xs text-white leading-relaxed font-medium">
              {simulationResult.message}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Riwayat Nilai per Semester (Accordions) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Riwayat Nilai Semester (KHS)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daftar mata kuliah dan indeks prestasi per semester
            </p>
          </div>
          <button
            onClick={() => setIsAddSemesterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Semester Baru</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {gradeHistory.map((sem) => {
            const isExpanded = expandedSemester === sem.semester;

            return (
              <div key={sem.semester} className="p-5">
                {/* Semester Accordion Header */}
                <div className="flex items-center justify-between gap-4 cursor-pointer">
                  <div
                    onClick={() => setExpandedSemester(isExpanded ? null : sem.semester)}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center shrink-0">
                      {sem.semester}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Semester {sem.semester} ({sem.academicYear})
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sem.courses.length} Mata Kuliah • {sem.sks} SKS
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">IPS Semester</span>
                      <span className="text-base font-bold text-primary-600 dark:text-primary-400">
                        {sem.ips.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditSemester(sem)}
                      className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Nilai Semester"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setExpandedSemester(isExpanded ? null : sem.semester)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Course Table */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5">Kode</th>
                          <th className="py-2.5">Mata Kuliah</th>
                          <th className="py-2.5 text-center">SKS</th>
                          <th className="py-2.5 text-center">Nilai Huruf</th>
                          <th className="py-2.5 text-center">Bobot</th>
                          <th className="py-2.5 text-right">Mutu (SKS × Bobot)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        {sem.courses.map((course, idx) => {
                          const point = GRADE_SCALE[course.grade] || 0;
                          const mutu = course.sks * point;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-2.5 font-bold text-slate-500">{course.code}</td>
                              <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{course.name}</td>
                              <td className="py-2.5 text-center">{course.sks} SKS</td>
                              <td className="py-2.5 text-center">
                                <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                  {course.grade}
                                </span>
                              </td>
                              <td className="py-2.5 text-center font-medium">{point.toFixed(2)}</td>
                              <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{mutu.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ADD SEMESTER MODAL --- */}
      <Modal
        isOpen={isAddSemesterOpen}
        onClose={() => setIsAddSemesterOpen(false)}
        title="Tambah Riwayat Nilai Semester"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveNewSemester} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester Ke- *
              </label>
              <input
                type="number"
                min={1}
                max={14}
                required
                value={newSemesterNumber}
                onChange={(e) => setNewSemesterNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Ajaran *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 2026/2027 Ganjil"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Daftar Mata Kuliah & Nilai:
              </span>
              <button
                type="button"
                onClick={handleAddCourseRow}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {newCoursesList.map((c, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Kode (IF501)"
                    value={c.code}
                    onChange={(e) => handleCourseRowChange(index, 'code', e.target.value)}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nama Mata Kuliah"
                    value={c.name}
                    onChange={(e) => handleCourseRowChange(index, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    placeholder="SKS"
                    value={c.sks}
                    onChange={(e) => handleCourseRowChange(index, 'sks', e.target.value)}
                    className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    value={c.grade}
                    onChange={(e) => handleCourseRowChange(index, 'grade', e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {newCoursesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCourseRow(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddSemesterOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              Simpan Semester
            </button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT SEMESTER MODAL --- */}
      <Modal
        isOpen={isEditGradeModalOpen}
        onClose={() => setIsEditGradeModalOpen(false)}
        title={`Edit Nilai Semester ${editingSemesterObj?.semester || ''}`}
        maxWidth="max-w-2xl"
      >
        {editingSemesterObj && (
          <form onSubmit={handleSaveEditSemester} className="space-y-4 text-xs">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {editingSemesterObj.courses.map((c, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.code}
                    onChange={(e) => {
                      const list = [...editingSemesterObj.courses];
                      list[index].code = e.target.value;
                      setEditingSemesterObj({ ...editingSemesterObj, courses: list });
                    }}
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => {
                      const list = [...editingSemesterObj.courses];
                      list[index].name = e.target.value;
                      setEditingSemesterObj({ ...editingSemesterObj, courses: list });
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={c.sks}
                    onChange={(e) => {
                      const list = [...editingSemesterObj.courses];
                      list[index].sks = Number(e.target.value);
                      setEditingSemesterObj({ ...editingSemesterObj, courses: list });
                    }}
                    className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    value={c.grade}
                    onChange={(e) => {
                      const list = [...editingSemesterObj.courses];
                      list[index].grade = e.target.value;
                      setEditingSemesterObj({ ...editingSemesterObj, courses: list });
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  deleteSemesterGrade(editingSemesterObj.semester);
                  setIsEditGradeModalOpen(false);
                }}
                className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Hapus Semester Ini
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
