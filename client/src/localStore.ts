// Lapisan data versi bisa-diisi: menggantikan RPC server Muse (bun:sqlite
// lewat @hatch/space-sdk) dengan localStorage di browser masing-masing.
// Kunci: "tka-performance-fillable". TIDAK ada database bersama: dua
// pengunjung yang membuka situs ini menyimpan salinannya masing-masing.
// Aturan hitung yang dipertahankan dari situs kemarin:
//  - akurasi mapel Hari 01 (dan arsip Hari 00) memakai penyebut "dikerjakan",
//    Hari >= 2 memakai penyebut "ditugaskan" (lihat App.tsx: snapshot memakai
//    assigned untuk day >= 2, attempted untuk day < 2).
//  - akurasi total hari mengikuti penyebut yang sama.
//  - rata-rata harian = mean aritmetik akurasi mapel yang ada, BUKAN nol
//    untuk mapel/hari yang kosong; hari tanpa data tidak punya titik grafik
//    (App memakai connectNulls={false}, jadi garisnya putus).

import {
  dashboardTemplate,
  type Bank,
  type Dashboard,
  type Question,
  type Difficulty,
  type FirstTryDay,
  type FirstTrySubject,
  type Reflection,
  type Subject,
} from "./dashboardTemplate";

export type { Bank, Dashboard, Difficulty, FirstTryDay, FirstTrySubject, Reflection, Subject };
export { dashboardTemplate };

export const STORAGE_KEY = "tka-performance-fillable";

const SUBJECTS: Subject[] = ["fisika", "matwa", "matlan"];
const DIFFICULTIES: Difficulty[] = ["LOTS", "MOTS", "HOTS"];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function templateDashboard(): Dashboard {
  return clone(dashboardTemplate);
}

// --- Sanitasi (perbaikan yang sama seperti pada tracker universal) ---
// Angka: koersi ke bilangan finite, dibulatkan, dijepit 0..100000.
// Teks: tag HTML dihapus, dipangkas. Tautan: hanya http(s):// yang lolos;
// tautan lain dibuang (baris refleksi yang tautannya tidak valid ikut dibuang).

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").trim().slice(0, max);
}

function cleanUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim().slice(0, 2000);
  return /^https?:\/\/[^\s]+$/i.test(url) ? url : "";
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100000, Math.round(n)));
}

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  const n = num(value, fallback);
  return Math.max(min, Math.min(max, n));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strArray(value: unknown, maxItem = 500, maxLen = 200): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => cleanText(item, maxItem))
    .filter(Boolean)
    .slice(0, maxLen);
}

function sanitizeSubject(value: unknown): Subject | null {
  return SUBJECTS.includes(value as Subject) ? (value as Subject) : null;
}

function sanitizeReflection(row: unknown): Reflection | null {
  if (!isRecord(row)) return null;
  const subject = sanitizeSubject(row.subject);
  const type = row.type === "note" || row.type === "video" ? row.type : null;
  const href = cleanUrl(row.href);
  if (!subject || !type || !href) return null;
  const gap = row.gap === "wrong" || row.gap === "unanswered" ? row.gap : undefined;
  const out: Reflection = {
    day: intIn(row.day, 0, 15, 0),
    number: intIn(row.number, 1, 999, 1),
    code: cleanText(row.code, 80) || `Hari ${intIn(row.day, 0, 15, 0)} · No. ${intIn(row.number, 1, 999, 1)}`,
    subject,
    type,
    title: cleanText(row.title, 200) || "Refleksi",
    focus: cleanText(row.focus, 500),
    href,
  };
  if (gap) out.gap = gap;
  if (typeof row.duration === "string" && row.duration.trim()) out.duration = cleanText(row.duration, 40);
  const noteText = cleanMultiline(row.noteText, 20000);
  if (noteText) out.noteText = noteText;
  const imageUrl = cleanUrl(row.imageUrl);
  if (imageUrl) out.imageUrl = imageUrl;
  return out;
}

function sanitizeDay(row: unknown): FirstTryDay | null {
  if (!isRecord(row) || !Array.isArray(row.subjects)) return null;
  const day = intIn(row.day, 1, 15, 1);
  const subjects: FirstTrySubject[] = [];
  for (const item of row.subjects as unknown[]) {
    if (!isRecord(item)) continue;
    const subject = sanitizeSubject(item.subject);
    if (!subject) continue;
    const assigned = num(item.assigned);
    const attempted = Math.min(num(item.attempted), assigned);
    const correct = Math.min(num(item.correct), attempted);
    const reflectedRaw = item.reflectedCorrect;
    const reflected = reflectedRaw === undefined || reflectedRaw === null || reflectedRaw === ""
      ? undefined
      : Math.min(num(reflectedRaw), assigned);
    subjects.push({
      subject,
      assigned,
      attempted,
      correct,
      accuracy: 0, // dihitung ulang di bawah
      ...(reflected === undefined ? {} : { reflectedCorrect: reflected }),
    });
  }
  if (subjects.length === 0) return null;
  const built = recomputeDay({
    day,
    label: cleanText(row.label, 40) || `Hari ${String(day).padStart(2, "0")}`,
    date: typeof row.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.date) ? row.date : "2026-10-13",
    timer: typeof row.timer === "string" ? cleanText(row.timer, 120) : undefined,
    subjects,
  });
  if (Array.isArray(row.difficultyResults)) {
    const diffs = [];
    for (const d of row.difficultyResults as unknown[]) {
      if (!isRecord(d)) continue;
      const difficulty = DIFFICULTIES.includes(d.difficulty as Difficulty) ? (d.difficulty as Difficulty) : null;
      if (!difficulty) continue;
      const assigned = num(d.assigned);
      diffs.push({ difficulty, correct: Math.min(num(d.correct), assigned), assigned, accuracy: assigned > 0 ? Math.round((Math.min(num(d.correct), assigned) / assigned) * 100) : 0 });
    }
    if (diffs.length > 0) built.difficultyResults = diffs;
  }
  return built;
}

/** Hitung ulang accuracy/averageAccuracy/total sebuah hari dari subjeknya. */
export function recomputeDay(input: {
  day: number;
  label: string;
  date: string;
  timer?: string;
  subjects: FirstTrySubject[];
  difficultyResults?: FirstTryDay["difficultyResults"];
}): FirstTryDay {
  const useAssigned = input.day >= 2;
  const subjects = input.subjects.map((row) => {
    const denominator = useAssigned ? row.assigned : row.attempted;
    return { ...row, accuracy: denominator > 0 ? Math.round((row.correct / denominator) * 100) : 0 };
  });
  const assigned = subjects.reduce((t, r) => t + r.assigned, 0);
  const attempted = subjects.reduce((t, r) => t + r.attempted, 0);
  const correct = subjects.reduce((t, r) => t + r.correct, 0);
  const totalDenominator = useAssigned ? assigned : attempted;
  const out: FirstTryDay = {
    day: input.day,
    label: input.label,
    date: input.date,
    assigned,
    attempted,
    unanswered: Math.max(0, assigned - attempted),
    correct,
    accuracy: totalDenominator > 0 ? Math.round((correct / totalDenominator) * 100) : 0,
    averageAccuracy: subjects.length > 0
      ? Math.round(subjects.reduce((t, r) => t + r.accuracy, 0) / subjects.length)
      : 0,
    subjects,
  };
  if (input.timer) out.timer = input.timer;
  if (input.difficultyResults) out.difficultyResults = input.difficultyResults;
  return out;
}

export function sanitizeDashboard(input: unknown): Dashboard | null {
  if (!isRecord(input)) return null;
  const template = templateDashboard();
  const firstTryDays: FirstTryDay[] = [];
  if (Array.isArray(input.firstTryDays)) {
    for (const row of input.firstTryDays as unknown[]) {
      const day = sanitizeDay(row);
      if (day) firstTryDays.push(day);
    }
  }
  const reflections: Reflection[] = [];
  if (Array.isArray(input.reflections)) {
    for (const row of input.reflections as unknown[]) {
      const ref = sanitizeReflection(row);
      if (ref) reflections.push(ref);
    }
  }
  const banks: Bank[] = [];
  if (Array.isArray(input.banks)) {
    for (const item of input.banks as unknown[]) {
      if (!isRecord(item)) continue;
      const subject = sanitizeSubject(item.subject);
      if (!subject) continue;
      banks.push({
        subject,
        label: cleanText(item.label, 80) || subject,
        lots: num(item.lots),
        mots: num(item.mots),
        hots: num(item.hots),
      });
    }
  }
  // Bagian yang tidak diedit lewat formulir (arsip Hari 00, peta topik,
  // alokasi hari) ikut disanitasi bila diimpor: angka dikoersi, teks dibersihkan
  // dari tag HTML dan dipangkas. Bila bentuknya tidak valid, kembali ke template
  // — tidak pernah dikarang.
  const assessments: Dashboard["assessments"] = [];
  if (Array.isArray(input.assessments)) {
    for (const item of input.assessments as unknown[]) {
      if (!isRecord(item)) continue;
      const subject = sanitizeSubject(item.subject);
      if (!subject || !Array.isArray(item.questions)) continue;
      const questions = [];
      for (const q of item.questions as unknown[]) {
        if (!isRecord(q)) continue;
        const status: Question["status"] | null = q.status === "benar" || q.status === "sebagian" || q.status === "salah" ? q.status : null;
        if (!status) continue;
        questions.push({
          number: num(q.number), topic: cleanText(q.topic, 200), status,
          resolved: q.resolved === true ? true : undefined,
          earned: num(q.earned), possible: num(q.possible), note: cleanText(q.note, 1000),
        });
      }
      assessments.push({
        subject, label: cleanText(item.label, 80) || subject,
        planDay: intIn(item.planDay, 0, 15, 0),
        dayLabel: cleanText(item.dayLabel, 40),
        date: typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : template.updatedAt,
        completed: num(item.completed), questions,
      });
    }
  }
  const skills: Dashboard["skills"] = [];
  if (Array.isArray(input.skills)) {
    for (const item of input.skills as unknown[]) {
      if (!isRecord(item)) continue;
      const subject = sanitizeSubject(item.subject);
      if (!subject) continue;
      skills.push({
        subject, label: cleanText(item.label, 80) || subject,
        correct: num(item.correct), attempted: num(item.attempted), assigned: num(item.assigned),
        accuracy: num(item.accuracy),
        priority: cleanMultiline(item.priority, 2000),
        mastered: strArray(item.mastered), wrongTopics: strArray(item.wrongTopics),
        unansweredTopics: strArray(item.unansweredTopics),
      });
    }
  }
  const days: Dashboard["days"] = [];
  if (Array.isArray(input.days)) {
    for (const item of input.days as unknown[]) {
      if (!isRecord(item)) continue;
      days.push({
        day: intIn(item.day, 1, 15, 1), total: num(item.total), lots: num(item.lots),
        mots: num(item.mots), hots: num(item.hots), fisika: num(item.fisika),
        matwa: num(item.matwa), matlan: num(item.matlan),
      });
    }
  }
  return {
    programDay: intIn(input.programDay, 0, 15, template.programDay),
    planTotal: num(input.planTotal, template.planTotal),
    excludedUnverified: num(input.excludedUnverified, template.excludedUnverified),
    days: days.length > 0 ? days : template.days,
    banks: banks.length > 0 ? banks : template.banks,
    assessments: assessments.length > 0 ? assessments : template.assessments,
    firstTryDays: firstTryDays.length > 0 ? firstTryDays : template.firstTryDays,
    skills: skills.length > 0 ? skills : template.skills,
    reflections: reflections.length > 0 ? reflections : template.reflections,
    reflectionRepositoryUrl: cleanUrl(input.reflectionRepositoryUrl) || template.reflectionRepositoryUrl,
    difficultyOrder: template.difficultyOrder,
    updatedAt: typeof input.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.updatedAt)
      ? input.updatedAt
      : template.updatedAt,
  };
}

export function loadDashboard(): Dashboard {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return templateDashboard();
    const parsed = sanitizeDashboard(JSON.parse(raw) as unknown);
    return parsed ?? templateDashboard();
  } catch {
    return templateDashboard();
  }
}

export function saveDashboard(data: Dashboard): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDashboard(): Dashboard {
  const data = templateDashboard();
  saveDashboard(data);
  return data;
}

export function exportDashboard(data: Dashboard): string {
  return JSON.stringify(data, null, 2);
}

export function importDashboard(text: string): Dashboard {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Berkas JSON bukan data dashboard yang valid.");
  }
  const parsed = sanitizeDashboard(raw);
  if (!parsed) throw new Error("Berkas JSON bukan data dashboard yang valid.");
  saveDashboard(parsed);
  return parsed;
}

/** Sisipkan/perbarui satu hari (1–15). Hari aktif ikut maju ke hari terbaru. */
export function upsertDay(
  data: Dashboard,
  input: { day: number; date: string; timer?: string; subjects: FirstTrySubject[]; difficultyResults?: FirstTryDay["difficultyResults"] },
): Dashboard {
  const next = clone(data);
  const day = recomputeDay({
    day: input.day,
    label: `Hari ${String(input.day).padStart(2, "0")}`,
    date: input.date,
    timer: input.timer,
    subjects: input.subjects,
    difficultyResults: input.difficultyResults,
  });
  const index = next.firstTryDays.findIndex((row) => row.day === input.day);
  if (index >= 0) next.firstTryDays[index] = day;
  else next.firstTryDays.push(day);
  next.firstTryDays.sort((a, b) => a.day - b.day);
  next.programDay = Math.max(...next.firstTryDays.map((row) => row.day), next.programDay);
  next.updatedAt = input.date;
  return next;
}

export function upsertReflection(data: Dashboard, row: Reflection, previousKey?: string): Dashboard {
  const next = clone(data);
  if (previousKey) {
    next.reflections = next.reflections.filter((r) => `${r.day}-${r.type}-${r.number}` !== previousKey);
  }
  const key = `${row.day}-${row.type}-${row.number}`;
  const index = next.reflections.findIndex((r) => `${r.day}-${r.type}-${r.number}` === key);
  if (index >= 0) next.reflections[index] = row;
  else next.reflections.push(row);
  next.reflections.sort((a, b) => a.day - b.day || a.number - b.number);
  return next;
}

export function deleteReflection(data: Dashboard, key: string): Dashboard {
  const next = clone(data);
  next.reflections = next.reflections.filter((r) => `${r.day}-${r.type}-${r.number}` !== key);
  return next;
}

export function updateBanks(data: Dashboard, banks: Bank[]): Dashboard {
  const next = clone(data);
  next.banks = banks;
  return next;
}

export { strArray };
