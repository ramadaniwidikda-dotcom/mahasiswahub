/**
 * Utility untuk mengekspor jadwal kuliah dan kalender akademik ke format .ics (iCalendar)
 * Dapat diimpor langsung ke Google Calendar, Apple Calendar, atau Outlook.
 */

function formatICSDate(dateStr, timeStr = '08:00') {
  const d = new Date(dateStr);
  const [hours, minutes] = (timeStr || '08:00').split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  return `${year}${month}${day}T${hh}${mm}${ss}`;
}

export function generateICS(events, title = 'Jadwal_MahasiswaHub') {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MahasiswaHub//Student Academic Portal//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${title}`,
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const nowStamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  events.forEach((item, index) => {
    const uid = `event-${Date.now()}-${index}@mahasiswahub.local`;
    const summary = item.title || item.name || 'Kegiatan Akademik';
    const description = item.description || `Dosen: ${item.lecturer || '-'}, Ruang: ${item.room || '-'}`;
    const location = item.room || item.location || 'Kampus';

    let dtStart = '';
    let dtEnd = '';

    if (item.date) {
      dtStart = formatICSDate(item.date, item.startTime || '08:00');
      dtEnd = formatICSDate(item.date, item.endTime || '10:00');
    } else if (item.day) {
      // Recurring weekly class schedule: generate next occurrence date
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const targetDayIndex = days.indexOf(item.day);
      const todayIndex = now.getDay();
      let diff = (targetDayIndex - todayIndex + 7) % 7;
      if (diff === 0) diff = 7; // Next occurrence
      
      const classDate = new Date();
      classDate.setDate(now.getDate() + diff);
      const classDateStr = classDate.toISOString().split('T')[0];

      dtStart = formatICSDate(classDateStr, item.startTime || '08:00');
      dtEnd = formatICSDate(classDateStr, item.endTime || '10:00');
    }

    if (dtStart && dtEnd) {
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
        `LOCATION:${location}`,
        'STATUS:CONFIRMED',
        ...(item.day ? ['RRULE:FREQ=WEEKLY;COUNT=16'] : []), // 16 weeks per semester
        'END:VEVENT'
      );
    }
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadICSFile(events, filename = 'Jadwal_Kuliah_MahasiswaHub.ics') {
  const icsData = generateICS(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
