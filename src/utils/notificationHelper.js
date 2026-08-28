/**
 * Helper untuk integrasi notifikasi browser dan kalkulasi deadline tugas harian
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, status: 'unsupported' };
  }
  
  if (Notification.permission === 'granted') {
    return { supported: true, status: 'granted' };
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return { supported: true, status: permission };
  }

  return { supported: true, status: 'denied' };
}

export function sendBrowserNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (err) {
    console.error('Error dispatching browser notification:', err);
  }
}

/**
 * Menghitung selisih waktu dan status urgensi tugas
 * @param {string} deadlineStr YYYY-MM-DD or ISO string
 * @param {string} timeStr HH:MM
 * @returns {{status: 'overdue'|'today'|'soon'|'later', label: string, color: string, badgeBg: string, diffHours: number}}
 */
export function getDeadlineInfo(deadlineStr, timeStr = '23:59') {
  if (!deadlineStr) {
    return { status: 'later', label: 'Tanpa Batas', color: 'text-slate-500', badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', diffHours: 9999 };
  }

  const [hours, minutes] = (timeStr || '23:59').split(':').map(Number);
  const deadlineDate = new Date(deadlineStr);
  deadlineDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.ceil(diffHours / 24);

  if (diffMs < 0) {
    const pastDays = Math.abs(diffDays);
    return {
      status: 'overdue',
      label: pastDays === 0 ? 'Terlambat beberapa jam' : `Terlambat ${pastDays} hari`,
      color: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      diffHours
    };
  }

  if (diffHours <= 12) {
    const roundedHours = Math.max(1, Math.round(diffHours));
    return {
      status: 'today',
      label: `Segera: ${roundedHours} jam lagi`,
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      diffHours
    };
  }

  if (diffDays === 1) {
    return {
      status: 'today',
      label: 'Hari ini',
      color: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      diffHours
    };
  }

  if (diffDays === 2) {
    return {
      status: 'soon',
      label: 'Besok',
      color: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      diffHours
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'soon',
      label: `${diffDays} hari lagi`,
      color: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      diffHours
    };
  }

  return {
    status: 'later',
    label: `${diffDays} hari lagi`,
    color: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    diffHours
  };
}
