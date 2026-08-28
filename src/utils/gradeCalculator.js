export const GRADE_SCALE = {
  'A': 4.0,
  'AB': 3.5,
  'B': 3.0,
  'BC': 2.5,
  'C': 2.0,
  'D': 1.0,
  'E': 0.0,
};

export const GRADE_OPTIONS = ['A', 'AB', 'B', 'BC', 'C', 'D', 'E'];

/**
 * Menghitung Indeks Prestasi Semester (IPS)
 * @param {Array<{sks: number, grade: string}>} courses
 * @returns {number}
 */
export function calculateIPS(courses) {
  if (!courses || courses.length === 0) return 0.0;
  
  let totalPoints = 0;
  let totalSKS = 0;

  for (const course of courses) {
    if (course.grade && GRADE_SCALE[course.grade] !== undefined) {
      const sks = Number(course.sks) || 0;
      const point = GRADE_SCALE[course.grade];
      totalPoints += sks * point;
      totalSKS += sks;
    }
  }

  if (totalSKS === 0) return 0.0;
  return Number((totalPoints / totalSKS).toFixed(2));
}

/**
 * Menghitung Indeks Prestasi Kumulatif (IPK)
 * @param {Array<{semester: number, courses: Array<{sks: number, grade: string}>}>} semesters
 * @returns {{ipk: number, totalSKS: number, totalPoints: number}}
 */
export function calculateIPK(semesters) {
  if (!semesters || semesters.length === 0) {
    return { ipk: 0.0, totalSKS: 0, totalPoints: 0 };
  }

  let totalPoints = 0;
  let totalSKS = 0;

  for (const sem of semesters) {
    if (sem.courses && Array.isArray(sem.courses)) {
      for (const course of sem.courses) {
        if (course.grade && GRADE_SCALE[course.grade] !== undefined) {
          const sks = Number(course.sks) || 0;
          const point = GRADE_SCALE[course.grade];
          totalPoints += sks * point;
          totalSKS += sks;
        }
      }
    }
  }

  const ipk = totalSKS > 0 ? Number((totalPoints / totalSKS).toFixed(2)) : 0.0;
  return { ipk, totalSKS, totalPoints: Number(totalPoints.toFixed(2)) };
}

/**
 * Batas maksimal pengambilan SKS berdasarkan IPS semester sebelumnya
 * Standar DIKTI / Perguruan Tinggi di Indonesia
 * @param {number} previousIPS
 * @returns {number}
 */
export function getMaxSKSLimit(previousIPS) {
  const ips = Number(previousIPS) || 0;
  if (ips >= 3.00) return 24;
  if (ips >= 2.50) return 21;
  if (ips >= 2.00) return 18;
  return 15;
}

/**
 * Mendapatkan Predikat Kelulusan / Academic Standing
 * @param {number} ipk
 * @returns {{title: string, color: string, badgeBg: string}}
 */
export function getAcademicStanding(ipk) {
  const val = Number(ipk) || 0;
  if (val >= 3.51) {
    return { title: 'Dengan Pujian (Cum Laude)', color: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
  }
  if (val >= 3.00) {
    return { title: 'Sangat Memuaskan', color: 'text-blue-600 dark:text-blue-400', badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
  }
  if (val >= 2.76) {
    return { title: 'Memuaskan', color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
  }
  return { title: 'Cukup / Perlu Peningkatan', color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
}

/**
 * Simulasi Target IPK
 * Menghitung rata-rata IPS yang harus dicapai pada sisa SKS untuk meraih target IPK tertentu
 * @param {number} currentIPK
 * @param {number} earnedSKS
 * @param {number} targetIPK
 * @param {number} remainingSKS
 * @returns {{requiredIPS: number, isPossible: boolean, message: string}}
 */
export function simulateRequiredIPS(currentIPK, earnedSKS, targetIPK, remainingSKS) {
  const currentEarned = Number(earnedSKS) || 0;
  const rem = Number(remainingSKS) || 0;
  const currentVal = Number(currentIPK) || 0;
  const targetVal = Number(targetIPK) || 0;

  if (rem <= 0) {
    return {
      requiredIPS: currentVal,
      isPossible: currentVal >= targetVal,
      message: currentVal >= targetVal ? 'Target sudah tercapai!' : 'Sisa SKS sudah habis untuk meningkatkan IPK.'
    };
  }

  const totalTargetSKS = currentEarned + rem;
  const currentPoints = currentVal * currentEarned;
  const targetPoints = targetVal * totalTargetSKS;
  const neededPoints = targetPoints - currentPoints;
  const requiredIPS = Number((neededPoints / rem).toFixed(2));

  if (requiredIPS > 4.00) {
    return {
      requiredIPS,
      isPossible: false,
      message: `Dibutuhkan IPS ${requiredIPS.toFixed(2)} (melebihi batas maksimal 4.00). Pertimbangkan mengulang mata kuliah atau menyesuaikan target.`
    };
  }

  if (requiredIPS <= 0) {
    return {
      requiredIPS: 0.0,
      isPossible: true,
      message: 'IPK Anda saat ini sudah sangat aman untuk mencapai target!'
    };
  }

  return {
    requiredIPS,
    isPossible: true,
    message: `Anda perlu mempertahankan rata-rata IPS minimal ${requiredIPS.toFixed(2)} pada ${rem} SKS tersisa.`
  };
}
