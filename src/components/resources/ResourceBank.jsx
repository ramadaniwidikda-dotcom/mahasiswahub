import React, { useState } from 'react';
import {
  FolderOpen,
  Link2,
  FileText,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Filter,
  Video,
  FileCode,
  GraduationCap,
  FolderGit2,
  BookOpen,
  Tag,
  Download,
  Share2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import Modal from '../common/Modal';

const MATERIAL_TYPES = ['Slide', 'Modul', 'Catatan', 'E-Book', 'Dokumen', 'Lainnya'];
const LINK_CATEGORIES = [
  { id: 'Drive', label: 'Google Drive', icon: FolderOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950' },
  { id: 'Zoom', label: 'Zoom / GMeet', icon: Video, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  { id: 'YouTube', label: 'YouTube Video', icon: Video, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950' },
  { id: 'GitHub', label: 'GitHub / GitLab', icon: FolderGit2, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  { id: 'Scholar', label: 'Google Scholar / Paper', icon: GraduationCap, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950' },
  { id: 'Documentation', label: 'Dokumentasi Web', icon: FileCode, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950' },
  { id: 'Other', label: 'Tautan Lain', icon: Link2, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800' },
];

export default function ResourceBank() {
  const { data, addMaterial, deleteMaterial, addLink, deleteLink } = useAppData();
  const { materials, links, krs } = data;

  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'links'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Modals
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

  // Forms
  const [materialForm, setMaterialForm] = useState({
    title: '',
    courseId: krs.courses[0]?.id || '',
    type: 'Slide',
    fileName: '',
    fileUrl: '',
    fileSize: '2.5 MB',
    tags: '',
  });

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    category: 'Drive',
    courseId: krs.courses[0]?.id || '',
    description: '',
  });

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    const course = krs.courses.find((c) => c.id === materialForm.courseId);
    addMaterial({
      ...materialForm,
      courseName: course ? course.name : 'Umum',
    });
    setIsAddMaterialOpen(false);
    setMaterialForm({
      title: '',
      courseId: krs.courses[0]?.id || '',
      type: 'Slide',
      fileName: '',
      fileUrl: '',
      fileSize: '2.5 MB',
      tags: '',
    });
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    const course = krs.courses.find((c) => c.id === linkForm.courseId);
    addLink({
      ...linkForm,
      courseName: course ? course.name : 'Umum',
    });
    setIsAddLinkOpen(false);
    setLinkForm({
      title: '',
      url: '',
      category: 'Drive',
      courseId: krs.courses[0]?.id || '',
      description: '',
    });
  };

  // Filtered lists
  const filteredMaterials = materials.filter((m) => {
    const matchesQuery =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.courseName && m.courseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCourse = selectedCourseFilter === 'all' || m.courseId === selectedCourseFilter;
    return matchesQuery && matchesCourse;
  });

  const filteredLinks = links.filter((l) => {
    const matchesQuery =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.courseName && l.courseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter;
    return matchesQuery && matchesCourse;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar: Tabs & Search & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'materials'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Bank Materi ({materials.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'links'
                ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Bank Link ({links.length})</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {activeTab === 'materials' ? (
            <button
              onClick={() => setIsAddMaterialOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Materi Kuliah</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddLinkOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Tautan Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'materials'
                ? 'Cari materi, slide, modul, judul, atau tag...'
                : 'Cari tautan, Google Drive, Zoom, YouTube, repositori...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="sm:col-span-1">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Semua Mata Kuliah</option>
            {krs.courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- CONTENT: BANK MATERI TAB --- */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada materi kuliah ditemukan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Klik tombol "Tambah Materi Kuliah" untuk mengunggah slide atau modul baru.
              </p>
            </div>
          ) : (
            filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary-300 dark:hover:border-primary-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      {mat.type}
                    </span>
                    <button
                      onClick={() => deleteMaterial(mat.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Materi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-2">
                    {mat.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {mat.courseName}
                  </p>

                  {/* Tags */}
                  {mat.tags && mat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {mat.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    <span>{mat.fileName || 'Dokumen'}</span> • <span>{mat.fileSize || 'PDF'}</span>
                  </div>
                  <a
                    href={mat.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <span>Buka</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- CONTENT: BANK LINK TAB --- */}
      {activeTab === 'links' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Link2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-primary-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada tautan sumber belajar ditemukan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Klik tombol "Tambah Tautan Link" untuk menyimpan link Drive, Zoom, atau GitHub.
              </p>
            </div>
          ) : (
            filteredLinks.map((link) => {
              const categoryConfig =
                LINK_CATEGORIES.find((c) => c.id === link.category) || LINK_CATEGORIES[LINK_CATEGORIES.length - 1];
              const Icon = categoryConfig.icon;
              const isCopied = copiedLinkId === link.id;

              return (
                <div
                  key={link.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-primary-300 dark:hover:border-primary-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${categoryConfig.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {link.category}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Hapus Link"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-2">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {link.courseName}
                    </p>
                    {link.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic">
                        {link.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(link.id, link.url)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin URL'}</span>
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-semibold transition-colors"
                    >
                      <span>Buka Link</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- ADD MATERIAL MODAL --- */}
      <Modal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        title="Tambah Materi Kuliah Baru"
      >
        <form onSubmit={handleMaterialSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Materi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Slide Pertemuan 3 - Normalisasi Database"
              value={materialForm.title}
              onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Kuliah *
              </label>
              <select
                value={materialForm.courseId}
                onChange={(e) => setMaterialForm({ ...materialForm, courseId: e.target.value })}
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
                Tipe Materi *
              </label>
              <select
                value={materialForm.type}
                onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {MATERIAL_TYPES.map((t) => (
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
                Nama Berkas / File
              </label>
              <input
                type="text"
                placeholder="Contoh: Modul-Pertemuan-3.pdf"
                value={materialForm.fileName}
                onChange={(e) => setMaterialForm({ ...materialForm, fileName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tautan Berkas / URL Download
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={materialForm.fileUrl}
                onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tag / Kata Kunci (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: SQL, Normalisasi, Database, Pertemuan 3"
              value={materialForm.tags}
              onChange={(e) => setMaterialForm({ ...materialForm, tags: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddMaterialOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              Simpan Materi
            </button>
          </div>
        </form>
      </Modal>

      {/* --- ADD LINK MODAL --- */}
      <Modal
        isOpen={isAddLinkOpen}
        onClose={() => setIsAddLinkOpen(false)}
        title="Tambah Tautan Sumber Belajar (Bank Link)"
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Tautan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Google Drive Folder Tugas Kelompok"
              value={linkForm.title}
              onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL / Tautan Lengkap *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/..."
              value={linkForm.url}
              onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Link *
              </label>
              <select
                value={linkForm.category}
                onChange={(e) => setLinkForm({ ...linkForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {LINK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mata Kuliah Terkait
              </label>
              <select
                value={linkForm.courseId}
                onChange={(e) => setLinkForm({ ...linkForm, courseId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {krs.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Catatan Tambahan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan penggunaan tautan ini..."
              value={linkForm.description}
              onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddLinkOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold"
            >
              Simpan Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
