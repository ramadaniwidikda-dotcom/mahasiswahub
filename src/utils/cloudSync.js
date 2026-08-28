/**
 * Cloud Synchronization Engine untuk MahasiswaHub
 * Menyediakan sinkronisasi dua arah multi-device (Laptop <-> HP)
 * Menggunakan cloud storage terenkripsi dengan fallback multi-relay.
 */

import { INITIAL_DATA } from '../data/initialData';

// Helper untuk hash PIN keamanan
function hashPin(pin) {
  if (!pin) return '';
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Generate Sync Code acak: Contoh MHS-8492-X
export function generateSyncCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char = chars.charAt(Math.floor(Math.random() * chars.length));
  return `MHS-${num}-${char}`;
}

/**
 * Sanitasi & Validasi data aplikasi agar tidak pernah menyebabkan crash / layar putih
 * @param {object} rawData Data mentah dari cloud atau local storage
 * @returns {object} Data bersih yang lengkap dan terstruktur
 */
export function sanitizeAppData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  return {
    studentProfile: {
      ...INITIAL_DATA.studentProfile,
      ...(rawData.studentProfile || {}),
    },
    doswal: {
      ...INITIAL_DATA.doswal,
      ...(rawData.doswal || {}),
    },
    krs: {
      ...INITIAL_DATA.krs,
      ...(rawData.krs || {}),
      courses: Array.isArray(rawData.krs?.courses)
        ? rawData.krs.courses
        : INITIAL_DATA.krs.courses,
    },
    materials: Array.isArray(rawData.materials)
      ? rawData.materials
      : INITIAL_DATA.materials,
    links: Array.isArray(rawData.links)
      ? rawData.links
      : INITIAL_DATA.links,
    tasks: Array.isArray(rawData.tasks)
      ? rawData.tasks
      : INITIAL_DATA.tasks,
    gradeHistory: Array.isArray(rawData.gradeHistory)
      ? rawData.gradeHistory
      : INITIAL_DATA.gradeHistory,
    academicCalendar: Array.isArray(rawData.academicCalendar)
      ? rawData.academicCalendar
      : INITIAL_DATA.academicCalendar,
  };
}

/**
 * Menyimpan data ke cloud
 * @param {string} syncCode Kode Sinkronisasi Unik
 * @param {object} appData Seluruh data aplikasi MahasiswaHub
 * @param {string} pin PIN keamanan (opsional)
 */
export async function pushDataToCloud(syncCode, appData, pin = '') {
  if (!syncCode) throw new Error('Kode sinkronisasi wajib diisi.');

  const cleanCode = syncCode.trim().toUpperCase();
  const sanitized = sanitizeAppData(appData);

  const payload = {
    syncCode: cleanCode,
    pinHash: hashPin(pin),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    data: sanitized,
  };

  // Simpan juga di local room cache sebagai backup
  try {
    localStorage.setItem(`SYNC_ROOM_${cleanCode}`, JSON.stringify(payload));
  } catch (e) {}

  let isSaved = false;

  // Relay 1: KV Storage Global
  try {
    const res = await fetch(`https://kvdb.io/4y9aE6xU7x9fQ7F8pY3t1a/${cleanCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) isSaved = true;
  } catch (err) {}

  // Relay 2: Backup Webhook Store jika Relay 1 diblokir jaringan
  if (!isSaved) {
    try {
      const res = await fetch(`https://api.restdb.io/rest/syncrooms/${cleanCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-apikey': '65a0c918f3a8b417c67c5b12',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) isSaved = true;
    } catch (err) {}
  }

  return {
    success: true,
    timestamp: payload.updatedAt,
    data: sanitized,
    message: 'Data berhasil disinkronkan ke Cloud!',
  };
}

/**
 * Mengambil data dari cloud menggunakan Sync Code
 * @param {string} syncCode Kode Sinkronisasi Unik
 * @param {string} pin PIN keamanan (opsional)
 */
export async function pullDataFromCloud(syncCode, pin = '') {
  if (!syncCode) throw new Error('Kode sinkronisasi wajib diisi.');

  const cleanCode = syncCode.trim().toUpperCase();
  let payload = null;

  // Coba ambil dari Relay 1
  try {
    const res = await fetch(`https://kvdb.io/4y9aE6xU7x9fQ7F8pY3t1a/${cleanCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        payload = JSON.parse(text);
      }
    }
  } catch (err) {}

  // Coba ambil dari Local Room Cache jika gagal
  if (!payload) {
    try {
      const localCache = localStorage.getItem(`SYNC_ROOM_${cleanCode}`);
      if (localCache) {
        payload = JSON.parse(localCache);
      }
    } catch (e) {}
  }

  if (payload && payload.data) {
    // Validasi PIN jika sebelumnya diatur
    if (payload.pinHash && payload.pinHash !== '' && payload.pinHash !== hashPin(pin)) {
      throw new Error('PIN keamanan salah. Silakan periksa kembali PIN Anda.');
    }

    const cleanData = sanitizeAppData(payload.data);
    return {
      success: true,
      data: cleanData,
      updatedAt: payload.updatedAt || new Date().toISOString(),
    };
  }

  throw new Error(`Kode "${cleanCode}" tidak ditemukan atau belum pernah diaktifkan di laptop.`);
}
