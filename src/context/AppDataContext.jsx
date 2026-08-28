import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import { calculateIPK, calculateIPS, getMaxSKSLimit } from '../utils/gradeCalculator';
import { getDeadlineInfo, sendBrowserNotification } from '../utils/notificationHelper';
import { generateSyncCode, pushDataToCloud, pullDataFromCloud, sanitizeAppData } from '../utils/cloudSync';

const AppDataContext = createContext(null);
const STORAGE_KEY = 'MAHASISWA_HUB_DATA_V1';
const SYNC_CONFIG_KEY = 'MAHASISWA_HUB_SYNC_CONFIG_V1';

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return sanitizeAppData(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load local storage data:', err);
    }
    return sanitizeAppData(INITIAL_DATA);
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('THEME') || 'light';
  });

  // Cloud Sync State
  const [syncConfig, setSyncConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(SYNC_CONFIG_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load sync config:', err);
    }
    return {
      enabled: false,
      syncCode: '',
      pin: '',
      lastSyncedAt: null,
      syncStatus: 'disconnected', // 'synced' | 'syncing' | 'error' | 'disconnected'
      isSyncing: false,
    };
  });

  const [notifications, setNotifications] = useState([]);
  const isInitialMount = useRef(true);
  const isRemoteUpdate = useRef(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  }, [data]);

  // Sync config to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
    } catch (err) {
      console.error('Failed to save sync config:', err);
    }
  }, [syncConfig]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('THEME', theme);
  }, [theme]);

  // Auto Cloud Sync Debounce on local data change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (!syncConfig.enabled || !syncConfig.syncCode) return;

    setSyncConfig((prev) => ({ ...prev, isSyncing: true, syncStatus: 'syncing' }));

    const timer = setTimeout(async () => {
      try {
        const res = await pushDataToCloud(syncConfig.syncCode, data, syncConfig.pin);
        if (res.success) {
          setSyncConfig((prev) => ({
            ...prev,
            isSyncing: false,
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString(),
          }));
        }
      } catch (err) {
        setSyncConfig((prev) => ({
          ...prev,
          isSyncing: false,
          syncStatus: 'error',
        }));
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [data, syncConfig.enabled, syncConfig.syncCode]);

  // Periodic Cloud Sync Polling (every 20s or on window focus)
  useEffect(() => {
    if (!syncConfig.enabled || !syncConfig.syncCode) return;

    const pullRemote = async () => {
      try {
        const res = await pullDataFromCloud(syncConfig.syncCode, syncConfig.pin);
        if (res.success && res.data) {
          const remoteTime = new Date(res.updatedAt || 0).getTime();
          const localTime = new Date(syncConfig.lastSyncedAt || 0).getTime();

          if (remoteTime > localTime + 2000) {
            isRemoteUpdate.current = true;
            setData(sanitizeAppData(res.data));
            setSyncConfig((prev) => ({
              ...prev,
              syncStatus: 'synced',
              lastSyncedAt: res.updatedAt,
            }));
          }
        }
      } catch (err) {
        // silent fail on background poll
      }
    };

    const interval = setInterval(pullRemote, 20000);
    const handleFocus = () => pullRemote();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncConfig.enabled, syncConfig.syncCode, syncConfig.pin, syncConfig.lastSyncedAt]);

  // Auto-generate notifications (with safe defensive checks)
  useEffect(() => {
    const list = [];
    const now = new Date();
    const taskList = data?.tasks || [];
    const calendarList = data?.academicCalendar || [];

    taskList.forEach((task) => {
      if (task && task.status !== 'done' && task.deadline) {
        const info = getDeadlineInfo(task.deadline, task.deadlineTime);
        if (info.status === 'overdue') {
          list.push({
            id: `notif-task-overdue-${task.id}`,
            title: `Tugas Terlambat: ${task.title}`,
            message: `Mata kuliah: ${task.courseName || 'Umum'}. Segera kumpulkan!`,
            type: 'urgent',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        } else if (info.status === 'today') {
          list.push({
            id: `notif-task-today-${task.id}`,
            title: `Deadline Hari Ini: ${task.title}`,
            message: `Mata kuliah: ${task.courseName || 'Umum'} (${info.label}).`,
            type: 'warning',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        } else if (info.status === 'soon' && info.diffHours <= 48) {
          list.push({
            id: `notif-task-soon-${task.id}`,
            title: `Tugas Mendekati Batas: ${task.title}`,
            message: `Mata kuliah: ${task.courseName || 'Umum'} - ${info.label}.`,
            type: 'info',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        }
      }
    });

    calendarList.forEach((event) => {
      if (event && event.date) {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          list.push({
            id: `notif-event-${event.id}`,
            title: `Agenda: ${event.title}`,
            message: diffDays === 0 ? 'Berlangsung hari ini!' : `Akan berlangsung dalam ${diffDays} hari.`,
            type: 'event',
            timestamp: event.date,
            read: false,
            linkTo: 'schedule',
          });
        }
      }
    });

    setNotifications(list);
  }, [data.tasks, data.academicCalendar]);

  // Safe Calculations
  const currentKRS_SKS = (data?.krs?.courses || []).reduce(
    (sum, c) => sum + (Number(c?.sks) || 0),
    0
  );
  const { ipk: overallIPK, totalSKS: totalEarnedSKS } = calculateIPK(data?.gradeHistory || []);
  const gradeList = data?.gradeHistory || [];
  const latestFinishedSemester = gradeList[gradeList.length - 1];
  const latestIPS = latestFinishedSemester ? Number(latestFinishedSemester.ips) || 3.50 : 3.50;
  const maxAllowedSKS = getMaxSKSLimit(latestIPS);

  // Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // --- CLOUD SYNC ACTIONS ---
  const startCloudSync = async (pin = '') => {
    const code = generateSyncCode();
    setSyncConfig({
      enabled: true,
      syncCode: code,
      pin,
      lastSyncedAt: null,
      syncStatus: 'syncing',
      isSyncing: true,
    });

    try {
      const res = await pushDataToCloud(code, data, pin);
      setSyncConfig({
        enabled: true,
        syncCode: code,
        pin,
        lastSyncedAt: res.timestamp || new Date().toISOString(),
        syncStatus: 'synced',
        isSyncing: false,
      });
      return { success: true, syncCode: code };
    } catch (err) {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        isSyncing: false,
      }));
      return { success: false, message: err.message };
    }
  };

  const joinSyncSession = async (syncCode, pin = '') => {
    if (!syncCode) return { success: false, message: 'Kode sinkronisasi wajib diisi.' };

    const cleanCode = syncCode.trim().toUpperCase();
    setSyncConfig((prev) => ({ ...prev, isSyncing: true, syncStatus: 'syncing' }));

    try {
      const res = await pullDataFromCloud(cleanCode, pin);
      if (res.success && res.data) {
        const cleanData = sanitizeAppData(res.data);
        isRemoteUpdate.current = true;
        setData(cleanData);
        setSyncConfig({
          enabled: true,
          syncCode: cleanCode,
          pin,
          lastSyncedAt: res.updatedAt || new Date().toISOString(),
          syncStatus: 'synced',
          isSyncing: false,
        });
        return { success: true, message: 'Berhasil terhubung ke sesi Cloud Sync!' };
      }
      throw new Error('Data tidak valid atau kosong.');
    } catch (err) {
      setSyncConfig((prev) => ({
        ...prev,
        isSyncing: false,
        syncStatus: 'error',
      }));
      return { success: false, message: err.message || 'Gagal menyinkronkan data.' };
    }
  };

  const triggerManualSync = async () => {
    if (!syncConfig.enabled || !syncConfig.syncCode) return;

    setSyncConfig((prev) => ({ ...prev, isSyncing: true, syncStatus: 'syncing' }));

    try {
      const pushRes = await pushDataToCloud(syncConfig.syncCode, data, syncConfig.pin);
      setSyncConfig((prev) => ({
        ...prev,
        isSyncing: false,
        syncStatus: 'synced',
        lastSyncedAt: pushRes.timestamp || new Date().toISOString(),
      }));
      return { success: true, message: 'Data berhasil disinkronkan ke Cloud!' };
    } catch (err) {
      setSyncConfig((prev) => ({
        ...prev,
        isSyncing: false,
        syncStatus: 'error',
      }));
      return { success: false, message: err.message };
    }
  };

  const disconnectCloudSync = () => {
    setSyncConfig({
      enabled: false,
      syncCode: '',
      pin: '',
      lastSyncedAt: null,
      syncStatus: 'disconnected',
      isSyncing: false,
    });
  };

  // --- KRS ACTIONS ---
  const addCourse = (course) => {
    const newCourse = {
      ...course,
      id: `c_${Date.now()}`,
      sks: Number(course.sks) || 3,
    };
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        courses: [...(prev.krs?.courses || []), newCourse],
      },
    }));
  };

  const updateCourse = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        courses: (prev.krs?.courses || []).map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
      },
    }));
  };

  const deleteCourse = (id) => {
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        courses: (prev.krs?.courses || []).filter((c) => c.id !== id),
      },
    }));
  };

  const updateDoswal = (doswalData) => {
    setData((prev) => ({
      ...prev,
      doswal: {
        ...prev.doswal,
        ...doswalData,
      },
    }));
  };

  const uploadKRSFile = (fileName, fileSize) => {
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        uploadedFileName: fileName,
        uploadedFileSize: fileSize,
        uploadDate: new Date().toISOString(),
      },
    }));
  };

  // --- MATERIAL ACTIONS ---
  const addMaterial = (material) => {
    const newMaterial = {
      ...material,
      id: `m_${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      tags: Array.isArray(material.tags) ? material.tags : (material.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    };
    setData((prev) => ({
      ...prev,
      materials: [newMaterial, ...(prev.materials || [])],
    }));
  };

  const deleteMaterial = (id) => {
    setData((prev) => ({
      ...prev,
      materials: (prev.materials || []).filter((m) => m.id !== id),
    }));
  };

  // --- LINK ACTIONS ---
  const addLink = (link) => {
    const newLink = {
      ...link,
      id: `l_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      links: [newLink, ...(prev.links || [])],
    }));
  };

  const deleteLink = (id) => {
    setData((prev) => ({
      ...prev,
      links: (prev.links || []).filter((l) => l.id !== id),
    }));
  };

  // --- TASK ACTIONS ---
  const addTask = (task) => {
    const newTask = {
      ...task,
      id: `t_${Date.now()}`,
      status: task.status || 'todo',
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...(prev.tasks || [])],
    }));

    sendBrowserNotification(`Tugas Baru: ${task.title}`, {
      body: `Deadline: ${task.deadline} ${task.deadlineTime || ''}`,
    });
  };

  const updateTask = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
    }));
  };

  const toggleTaskStatus = (id) => {
    setData((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'done' ? 'todo' : 'done';
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    }));
  };

  const deleteTask = (id) => {
    setData((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).filter((t) => t.id !== id),
    }));
  };

  // --- GRADE & SEMESTER ACTIONS ---
  const addSemesterGrade = (semesterObj) => {
    const ips = calculateIPS(semesterObj.courses);
    const totalSKS = (semesterObj.courses || []).reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
    const newSem = {
      ...semesterObj,
      ips,
      sks: totalSKS,
    };
    setData((prev) => ({
      ...prev,
      gradeHistory: [...(prev.gradeHistory || []), newSem],
    }));
  };

  const updateSemesterGrade = (semesterNumber, updatedCourses) => {
    setData((prev) => {
      const updatedHistory = (prev.gradeHistory || []).map((sem) => {
        if (sem.semester === semesterNumber) {
          const ips = calculateIPS(updatedCourses);
          const totalSKS = (updatedCourses || []).reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
          return {
            ...sem,
            courses: updatedCourses,
            ips,
            sks: totalSKS,
          };
        }
        return sem;
      });
      return {
        ...prev,
        gradeHistory: updatedHistory,
      };
    });
  };

  const deleteSemesterGrade = (semesterNumber) => {
    setData((prev) => ({
      ...prev,
      gradeHistory: (prev.gradeHistory || []).filter((sem) => sem.semester !== semesterNumber),
    }));
  };

  // --- ACADEMIC CALENDAR ACTIONS ---
  const addCalendarEvent = (event) => {
    const newEvent = {
      ...event,
      id: `ac_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      academicCalendar: [...(prev.academicCalendar || []), newEvent],
    }));
  };

  const deleteCalendarEvent = (id) => {
    setData((prev) => ({
      ...prev,
      academicCalendar: (prev.academicCalendar || []).filter((e) => e.id !== id),
    }));
  };

  // --- PROFILE ACTIONS ---
  const updateProfile = (profileData) => {
    setData((prev) => ({
      ...prev,
      studentProfile: {
        ...prev.studentProfile,
        ...profileData,
      },
    }));
  };

  // --- BACKUP & RESTORE ---
  const exportDataAsJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_MahasiswaHub_${data?.studentProfile?.nim || 'student'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataFromJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed) {
        const cleaned = sanitizeAppData(parsed);
        setData(cleaned);
        return { success: true, message: 'Data berhasil diimpor sepenuhnya!' };
      }
      return { success: false, message: 'Format data JSON tidak valid.' };
    } catch (err) {
      return { success: false, message: `Gagal membaca file JSON: ${err.message}` };
    }
  };

  const resetToDefaultData = () => {
    setData(sanitizeAppData(INITIAL_DATA));
    localStorage.removeItem(STORAGE_KEY);
    disconnectCloudSync();
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value = {
    data,
    theme,
    toggleTheme,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    currentKRS_SKS,
    totalEarnedSKS,
    overallIPK,
    latestIPS,
    maxAllowedSKS,
    // Cloud Sync
    syncConfig,
    startCloudSync,
    joinSyncSession,
    triggerManualSync,
    disconnectCloudSync,
    // Actions
    addCourse,
    updateCourse,
    deleteCourse,
    updateDoswal,
    uploadKRSFile,
    addMaterial,
    deleteMaterial,
    addLink,
    deleteLink,
    addTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
    addSemesterGrade,
    updateSemesterGrade,
    deleteSemesterGrade,
    addCalendarEvent,
    deleteCalendarEvent,
    updateProfile,
    exportDataAsJSON,
    importDataFromJSON,
    resetToDefaultData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
