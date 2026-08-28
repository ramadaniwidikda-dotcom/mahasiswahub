import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/initialData';
import { calculateIPK, calculateIPS, getMaxSKSLimit } from '../utils/gradeCalculator';
import { getDeadlineInfo, sendBrowserNotification } from '../utils/notificationHelper';

const AppDataContext = createContext(null);
const STORAGE_KEY = 'MAHASISWA_HUB_DATA_V1';

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Failed to load local storage data:', err);
    }
    return INITIAL_DATA;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('THEME') || 'light';
  });

  const [notifications, setNotifications] = useState([]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  }, [data]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('THEME', theme);
  }, [theme]);

  // Auto-generate active notifications from tasks & academic events
  useEffect(() => {
    const list = [];
    const now = new Date();

    // Check tasks for deadlines
    data.tasks.forEach((task) => {
      if (task.status !== 'done' && task.deadline) {
        const info = getDeadlineInfo(task.deadline, task.deadlineTime);
        if (info.status === 'overdue') {
          list.push({
            id: `notif-task-overdue-${task.id}`,
            title: `Tugas Terlambat: ${task.title}`,
            message: `Mata kuliah: ${task.courseName}. Segera kumpulkan!`,
            type: 'urgent',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        } else if (info.status === 'today') {
          list.push({
            id: `notif-task-today-${task.id}`,
            title: `Deadline Hari Ini: ${task.title}`,
            message: `Mata kuliah: ${task.courseName} (${info.label}).`,
            type: 'warning',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        } else if (info.status === 'soon' && info.diffHours <= 48) {
          list.push({
            id: `notif-task-soon-${task.id}`,
            title: `Tugas Mendekati Batas: ${task.title}`,
            message: `Mata kuliah: ${task.courseName} - ${info.label}.`,
            type: 'info',
            timestamp: task.deadline,
            read: false,
            linkTo: 'tasks',
          });
        }
      }
    });

    // Check Academic Calendar events within next 7 days
    data.academicCalendar.forEach((event) => {
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
    });

    setNotifications(list);
  }, [data.tasks, data.academicCalendar]);

  // Derived calculations
  const currentKRS_SKS = data.krs.courses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
  
  const { ipk: overallIPK, totalSKS: totalEarnedSKS } = calculateIPK(data.gradeHistory);
  
  const latestFinishedSemester = data.gradeHistory[data.gradeHistory.length - 1];
  const latestIPS = latestFinishedSemester ? latestFinishedSemester.ips : 3.50;
  const maxAllowedSKS = getMaxSKSLimit(latestIPS);

  // Handlers
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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
        courses: [...prev.krs.courses, newCourse],
      },
    }));
  };

  const updateCourse = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        courses: prev.krs.courses.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
      },
    }));
  };

  const deleteCourse = (id) => {
    setData((prev) => ({
      ...prev,
      krs: {
        ...prev.krs,
        courses: prev.krs.courses.filter((c) => c.id !== id),
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
      materials: [newMaterial, ...prev.materials],
    }));
  };

  const deleteMaterial = (id) => {
    setData((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
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
      links: [newLink, ...prev.links],
    }));
  };

  const deleteLink = (id) => {
    setData((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
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
      tasks: [newTask, ...prev.tasks],
    }));

    // Trigger sample browser notification if permitted
    sendBrowserNotification(`Tugas Baru: ${task.title}`, {
      body: `Deadline: ${task.deadline} ${task.deadlineTime || ''}`,
    });
  };

  const updateTask = (id, updatedFields) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
    }));
  };

  const toggleTaskStatus = (id) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
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
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // --- GRADE & SEMESTER ACTIONS ---
  const addSemesterGrade = (semesterObj) => {
    const ips = calculateIPS(semesterObj.courses);
    const totalSKS = semesterObj.courses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
    const newSem = {
      ...semesterObj,
      ips,
      sks: totalSKS,
    };
    setData((prev) => ({
      ...prev,
      gradeHistory: [...prev.gradeHistory, newSem],
    }));
  };

  const updateSemesterGrade = (semesterNumber, updatedCourses) => {
    setData((prev) => {
      const updatedHistory = prev.gradeHistory.map((sem) => {
        if (sem.semester === semesterNumber) {
          const ips = calculateIPS(updatedCourses);
          const totalSKS = updatedCourses.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
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
      gradeHistory: prev.gradeHistory.filter((sem) => sem.semester !== semesterNumber),
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
      academicCalendar: [...prev.academicCalendar, newEvent],
    }));
  };

  const deleteCalendarEvent = (id) => {
    setData((prev) => ({
      ...prev,
      academicCalendar: prev.academicCalendar.filter((e) => e.id !== id),
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
    link.download = `Backup_MahasiswaHub_${data.studentProfile.nim}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataFromJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.studentProfile && parsed.krs) {
        setData(parsed);
        return { success: true, message: 'Data berhasil diimpor sepenuhnya!' };
      }
      return { success: false, message: 'Format data JSON tidak valid atau struktur tidak cocok.' };
    } catch (err) {
      return { success: false, message: `Gagal membaca file JSON: ${err.message}` };
    }
  };

  const resetToDefaultData = () => {
    setData(INITIAL_DATA);
    localStorage.removeItem(STORAGE_KEY);
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
