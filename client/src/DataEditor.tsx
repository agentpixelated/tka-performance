// Formulir isi/edit versi bisa-diisi. Ini SATU-SATUNYA bagian UI yang baru:
// semua bagian lain App.tsx (hero, lintasan, grafik, bukti, refleksi, topik)
// tidak diubah tampilannya. Data yang disimpan di sini masuk localStorage
// (localStore.ts) dan langsung dipakai grafik + snapshot yang sama persis.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteReflection,
  exportDashboard,
  importDashboard,
  loadDashboard,
  resetDashboard,
  saveDashboard,
  updateBanks,
  upsertDay,
  upsertReflection,
  type Dashboard,
  type Difficulty,
  type FirstTrySubject,
  type Reflection,
  type Subject,
} from "./localStore";

const SUBJECTS: Subject[] = ["fisika", "matwa", "matlan"];
const DIFFICULTIES: Difficulty[] = ["LOTS", "MOTS", "HOTS"];
const SUBJECT_LABEL: Record<Subject, string> = {
  fisika: "Fisika",
  matwa: "Matematika Wajib",
  matlan: "Matematika Lanjutan",
};

type SubjectRow = { assigned: string; attempted: string; correct: string; reflected: string };
type DiffRow = { correct: string; assigned: string };

function emptySubjectRow(): SubjectRow {
  return { assigned: "", attempted: "", correct: "", reflected: "" };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseCount(value: string): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function DataEditor({ dashboard, onSaved }: { dashboard: Dashboard; onSaved: () => void }) {
  const [status, setStatus] = useState("");
  const [day, setDay] = useState(dashboard.programDay >= 1 ? dashboard.programDay : 3);
  const [date, setDate] = useState("");
  const [timer, setTimer] = useState("");
  const [subjectRows, setSubjectRows] = useState<Record<Subject, SubjectRow>>({
    fisika: emptySubjectRow(),
    matwa: emptySubjectRow(),
    matlan: emptySubjectRow(),
  });
  const [diffRows, setDiffRows] = useState<Record<Difficulty, DiffRow>>({
    LOTS: { correct: "", assigned: "" },
    MOTS: { correct: "", assigned: "" },
    HOTS: { correct: "", assigned: "" },
  });

  const [reflectionKey, setReflectionKey] = useState("new");
  const [refDay, setRefDay] = useState(dashboard.programDay >= 1 ? dashboard.programDay : 3);
  const [refNumber, setRefNumber] = useState("1");
  const [refSubject, setRefSubject] = useState<Subject>("fisika");
  const [refType, setRefType] = useState<"note" | "video">("note");
  const [refGap, setRefGap] = useState<"" | "wrong" | "unanswered">("");
  const [refTitle, setRefTitle] = useState("");
  const [refFocus, setRefFocus] = useState("");
  const [refHref, setRefHref] = useState("");
  const [refDuration, setRefDuration] = useState("");
  const [refNoteText, setRefNoteText] = useState("");
  const [refImageUrl, setRefImageUrl] = useState("");

  const [banks, setBanks] = useState(
    dashboard.banks.map((b) => ({ ...b, lots: String(b.lots), mots: String(b.mots), hots: String(b.hots) })),
  );
  const importRef = useRef<HTMLInputElement>(null);

  // Prefill formulir hari dari hari yang sudah ada, atau dari alokasi hari itu.
  useEffect(() => {
    const existing = dashboard.firstTryDays.find((row) => row.day === day);
    const rows: Record<Subject, SubjectRow> = { fisika: emptySubjectRow(), matwa: emptySubjectRow(), matlan: emptySubjectRow() };
    if (existing) {
      setDate(existing.date);
      setTimer(existing.timer ?? "");
      for (const row of existing.subjects) {
        rows[row.subject] = {
          assigned: String(row.assigned),
          attempted: String(row.attempted),
          correct: String(row.correct),
          reflected: row.reflectedCorrect === undefined ? "" : String(row.reflectedCorrect),
        };
      }
      const diffs: Record<Difficulty, DiffRow> = { LOTS: { correct: "", assigned: "" }, MOTS: { correct: "", assigned: "" }, HOTS: { correct: "", assigned: "" } };
      for (const row of existing.difficultyResults ?? []) {
        diffs[row.difficulty] = { correct: String(row.correct), assigned: String(row.assigned) };
      }
      setDiffRows(diffs);
    } else {
      setDate(today());
      setTimer("");
      const plan = dashboard.days.find((row) => row.day === day);
      if (plan) {
        rows.fisika.assigned = String(plan.fisika);
        rows.matwa.assigned = String(plan.matwa);
        rows.matlan.assigned = String(plan.matlan);
      }
      setDiffRows({ LOTS: { correct: "", assigned: "" }, MOTS: { correct: "", assigned: "" }, HOTS: { correct: "", assigned: "" } });
    }
    setSubjectRows(rows);
  }, [day, dashboard]);

  const reflectionOptions = useMemo(
    () =>
      [...dashboard.reflections].sort((a, b) => a.day - b.day || a.number - b.number),
    [dashboard],
  );

  // Prefill formulir refleksi dari baris yang dipilih, atau kosong untuk baru.
  useEffect(() => {
    const selected = reflectionOptions.find((r) => `${r.day}-${r.type}-${r.number}` === reflectionKey);
    if (!selected) {
      setRefDay(dashboard.programDay >= 1 ? dashboard.programDay : 3);
      setRefNumber("1");
      setRefSubject("fisika");
      setRefType("note");
      setRefGap("");
      setRefTitle("");
      setRefFocus("");
      setRefHref("");
      setRefDuration("");
      setRefNoteText("");
      setRefImageUrl("");
      return;
    }
    setRefDay(selected.day);
    setRefNumber(String(selected.number));
    setRefSubject(selected.subject);
    setRefType(selected.type);
    setRefGap(selected.gap ?? "");
    setRefTitle(selected.title);
    setRefFocus(selected.focus);
    setRefHref(selected.href);
    setRefDuration(selected.duration ?? "");
    setRefNoteText(selected.noteText ?? "");
    setRefImageUrl(selected.imageUrl ?? "");
  }, [reflectionKey, dashboard, reflectionOptions]);

  function saveDay(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setStatus("Tanggal hari harus diisi dengan format YYYY-MM-DD.");
      return;
    }
    const subjects: FirstTrySubject[] = [];
    for (const subject of SUBJECTS) {
      const row = subjectRows[subject];
      const assigned = parseCount(row.assigned);
      const attempted = parseCount(row.attempted);
      const correct = parseCount(row.correct);
      if (attempted > assigned) {
        setStatus(`Dikerjakan ${SUBJECT_LABEL[subject]} (${attempted}) melebihi ditugaskan (${assigned}).`);
        return;
      }
      if (correct > attempted) {
        setStatus(`Benar ${SUBJECT_LABEL[subject]} (${correct}) melebihi dikerjakan (${attempted}).`);
        return;
      }
      const reflected = row.reflected.trim() === "" ? undefined : parseCount(row.reflected);
      if (reflected !== undefined && reflected > assigned) {
        setStatus(`Setelah refleksi ${SUBJECT_LABEL[subject]} (${reflected}) melebihi ditugaskan (${assigned}).`);
        return;
      }
      if (assigned > 0) {
        subjects.push({
          subject,
          assigned,
          attempted,
          correct,
          accuracy: 0,
          ...(reflected === undefined ? {} : { reflectedCorrect: reflected }),
        });
      }
    }
    if (subjects.length === 0) {
      setStatus("Isi minimal satu mapel dengan jumlah soal ditugaskan lebih dari 0.");
      return;
    }
    const difficultyResults = [];
    for (const difficulty of DIFFICULTIES) {
      const row = diffRows[difficulty] ?? { correct: "", assigned: "" };
      const assigned = parseCount(row.assigned);
      const correct = parseCount(row.correct);
      if (correct > assigned) {
        setStatus(`Benar ${difficulty} (${correct}) melebihi ditugaskan (${assigned}).`);
        return;
      }
      if (assigned > 0) difficultyResults.push({ difficulty, correct, assigned, accuracy: 0 });
    }
    const next = upsertDay(loadDashboard(), {
      day,
      date,
      timer: timer.trim() || undefined,
      subjects,
      difficultyResults: difficultyResults.length > 0 ? difficultyResults : undefined,
    });
    saveDashboard(next);
    onSaved();
    setStatus(`Hari ${String(day).padStart(2, "0")} tersimpan. Grafik, snapshot, dan rata-rata ikut berubah.`);
  }

  function saveReflection(event: React.FormEvent) {
    event.preventDefault();
    if (!refTitle.trim()) {
      setStatus("Judul refleksi harus diisi.");
      return;
    }
    if (!/^https?:\/\/[^\s]+$/i.test(refHref.trim())) {
      setStatus("Tautan refleksi harus berupa URL http(s):// yang valid.");
      return;
    }
    if (refImageUrl.trim() && !/^https?:\/\/[^\s]+$/i.test(refImageUrl.trim())) {
      setStatus("Tautan gambar diagram harus berupa URL http(s):// yang valid.");
      return;
    }
    const number = Math.max(1, Math.round(Number(refNumber)) || 1);
    const previous = reflectionKey === "new" ? undefined : reflectionKey;
    const existing = previous
      ? dashboard.reflections.find((r) => `${r.day}-${r.type}-${r.number}` === previous)
      : undefined;
    const row: Reflection = {
      day: refDay,
      number,
      code: existing && previous === `${refDay}-${refType}-${number}` ? existing.code : `Hari ${String(refDay).padStart(2, "0")} · No. ${number}`,
      subject: refSubject,
      type: refType,
      title: refTitle.trim(),
      focus: refFocus.trim(),
      href: refHref.trim(),
      ...(refGap ? { gap: refGap } : {}),
      ...(refType === "video" && refDuration.trim() ? { duration: refDuration.trim() } : {}),
      ...(refNoteText.trim() ? { noteText: refNoteText.trim() } : {}),
      ...(refImageUrl.trim() ? { imageUrl: refImageUrl.trim() } : {}),
    };
    const next = upsertReflection(loadDashboard(), row, previous);
    saveDashboard(next);
    onSaved();
    setReflectionKey(`${row.day}-${row.type}-${row.number}`);
    setStatus(`Refleksi Hari ${String(row.day).padStart(2, "0")} No. ${row.number} tersimpan.`);
  }

  function removeReflection() {
    if (reflectionKey === "new") return;
    if (!window.confirm("Hapus baris refleksi ini?")) return;
    const next = deleteReflection(loadDashboard(), reflectionKey);
    saveDashboard(next);
    onSaved();
    setReflectionKey("new");
    setStatus("Baris refleksi dihapus.");
  }

  function saveBanks(event: React.FormEvent) {
    event.preventDefault();
    const next = updateBanks(
      loadDashboard(),
      banks.map((b) => ({ subject: b.subject, label: b.label, lots: parseCount(b.lots), mots: parseCount(b.mots), hots: parseCount(b.hots) })),
    );
    saveDashboard(next);
    onSaved();
    setStatus("Bank soal per mapel tersimpan.");
  }

  function exportJson() {
    const blob = new Blob([exportDashboard(loadDashboard())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tka-performance.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Data diekspor sebagai tka-performance.json.");
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      importDashboard(text);
      onSaved();
      setStatus("Data dari JSON berhasil diimpor dan disimpan di browser ini.");
    } catch {
      setStatus("Impor gagal: berkas bukan JSON data dashboard yang valid.");
    }
  }

  function resetAll() {
    if (!window.confirm("Reset ke template kemarin? Semua isian di browser ini akan hilang (ekspor dulu bila perlu).")) return;
    resetDashboard();
    onSaved();
    setReflectionKey("new");
    setStatus("Data dikembalikan ke template kemarin.");
  }

  return (
    <section className="fillable-section" id="isi-data" aria-labelledby="fillable-title">
      <header className="section-intro">
        <h2 id="fillable-title">Isi &amp; ubah data</h2>
        <p>
          Versi ini bisa diisi siapa saja: isian tersimpan di browser masing-masing
          (localStorage), bukan database bersama. Grafik, snapshot, dan bagian refleksi
          di atas memakai data yang sama — ubah di sini, semua ikut berubah.
          Hari 00 adalah arsip penilaian awal dan tidak diubah lewat formulir ini.
        </p>
      </header>

      {status ? <p className="fillable-status" role="status">{status}</p> : null}

      <div className="fillable-tools" aria-label="Alat data">
        <button type="button" onClick={exportJson}>Ekspor JSON</button>
        <button type="button" onClick={() => importRef.current?.click()}>Impor JSON</button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="Pilih berkas JSON untuk diimpor"
          onChange={(event) => void importFile(event.target.files?.[0])}
        />
        <button type="button" onClick={resetAll}>Reset ke template kemarin</button>
      </div>

      <form className="fillable-form" onSubmit={saveDay} aria-label="Formulir hasil sesi per hari">
        <h3>Hasil sesi per hari</h3>
        <div className="fillable-row">
          <label>
            Hari
            <select value={day} onChange={(event) => setDay(Number(event.target.value))} aria-label="Pilih hari">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>Hari {String(d).padStart(2, "0")}</option>
              ))}
            </select>
          </label>
          <label>
            Tanggal
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <label>
            Durasi (opsional)
            <input type="text" value={timer} onChange={(event) => setTimer(event.target.value)} placeholder="mis. 2 jam · 10:00–12:00 WIB" />
          </label>
        </div>
        <div className="fillable-subjects" role="group" aria-label="Hasil per mapel">
          {SUBJECTS.map((subject) => (
            <fieldset key={subject}>
              <legend>{SUBJECT_LABEL[subject]}</legend>
              <label>Ditugaskan<input type="number" min="0" inputMode="numeric" value={subjectRows[subject].assigned} onChange={(event) => setSubjectRows((cur) => ({ ...cur, [subject]: { ...cur[subject], assigned: event.target.value } }))} /></label>
              <label>Dikerjakan<input type="number" min="0" inputMode="numeric" value={subjectRows[subject].attempted} onChange={(event) => setSubjectRows((cur) => ({ ...cur, [subject]: { ...cur[subject], attempted: event.target.value } }))} /></label>
              <label>Benar<input type="number" min="0" inputMode="numeric" value={subjectRows[subject].correct} onChange={(event) => setSubjectRows((cur) => ({ ...cur, [subject]: { ...cur[subject], correct: event.target.value } }))} /></label>
              <label>Setelah refleksi (opsional)<input type="number" min="0" inputMode="numeric" value={subjectRows[subject].reflected} onChange={(event) => setSubjectRows((cur) => ({ ...cur, [subject]: { ...cur[subject], reflected: event.target.value } }))} /></label>
            </fieldset>
          ))}
        </div>
        <details>
          <summary>Rincian kesulitan LOTS / MOTS / HOTS (opsional)</summary>
          <div className="fillable-row">
            {DIFFICULTIES.map((difficulty) => (
              <span key={difficulty} className="fillable-pair">
                <b>{difficulty}</b>
                <label>Benar<input type="number" min="0" inputMode="numeric" value={(diffRows[difficulty] ?? { correct: "", assigned: "" }).correct} onChange={(event) => setDiffRows((cur) => ({ ...cur, [difficulty]: { ...cur[difficulty], correct: event.target.value } }))} /></label>
                <label>Ditugaskan<input type="number" min="0" inputMode="numeric" value={(diffRows[difficulty] ?? { correct: "", assigned: "" }).assigned} onChange={(event) => setDiffRows((cur) => ({ ...cur, [difficulty]: { ...cur[difficulty], assigned: event.target.value } }))} /></label>
              </span>
            ))}
          </div>
        </details>
        <button type="submit">Simpan hasil hari ini</button>
      </form>

      <form className="fillable-form" onSubmit={saveReflection} aria-label="Formulir refleksi">
        <h3>Refleksi per soal</h3>
        <div className="fillable-row">
          <label>
            Baris refleksi
            <select value={reflectionKey} onChange={(event) => setReflectionKey(event.target.value)} aria-label="Pilih baris refleksi">
              <option value="new">+ Baris baru</option>
              {reflectionOptions.map((row) => (
                <option key={`${row.day}-${row.type}-${row.number}`} value={`${row.day}-${row.type}-${row.number}`}>
                  Hari {String(row.day).padStart(2, "0")} · No. {row.number} · {row.type === "note" ? "Catatan" : "Video"} · {row.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hari
            <select value={refDay} onChange={(event) => setRefDay(Number(event.target.value))} aria-label="Pilih hari refleksi">
              {Array.from({ length: 16 }, (_, i) => i).map((d) => (
                <option key={d} value={d}>Hari {String(d).padStart(2, "0")}</option>
              ))}
            </select>
          </label>
          <label>
            Nomor soal
            <input type="number" min="1" inputMode="numeric" value={refNumber} onChange={(event) => setRefNumber(event.target.value)} required />
          </label>
          <label>
            Mapel
            <select value={refSubject} onChange={(event) => setRefSubject(event.target.value as Subject)} aria-label="Pilih mapel refleksi">
              {SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_LABEL[s]}</option>)}
            </select>
          </label>
          <label>
            Jenis
            <select value={refType} onChange={(event) => setRefType(event.target.value as "note" | "video")} aria-label="Pilih jenis refleksi">
              <option value="note">Catatan</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            Kategori
            <select value={refGap} onChange={(event) => setRefGap(event.target.value as "" | "wrong" | "unanswered")} aria-label="Pilih kategori refleksi">
              <option value="">—</option>
              <option value="wrong">Salah</option>
              <option value="unanswered">Tidak diisi</option>
            </select>
          </label>
        </div>
        <label className="fillable-wide">
          Judul
          <input type="text" value={refTitle} onChange={(event) => setRefTitle(event.target.value)} required />
        </label>
        <label className="fillable-wide">
          Fokus
          <input type="text" value={refFocus} onChange={(event) => setRefFocus(event.target.value)} placeholder="Satu kalimat: konsep yang diperbaiki" />
        </label>
        <label className="fillable-wide">
          Tautan (catatan / video)
          <input type="url" value={refHref} onChange={(event) => setRefHref(event.target.value)} placeholder="https://… — untuk video, pakai tautan MP4 langsung agar bisa diputar di sini" required />
        </label>
        {refType === "video" ? (
          <label className="fillable-wide">
            Durasi video (opsional)
            <input type="text" value={refDuration} onChange={(event) => setRefDuration(event.target.value)} placeholder="mis. 46 dtk" />
          </label>
        ) : null}
        <label className="fillable-wide">
          Isi catatan KaTeX (opsional, untuk catatan baru)
          <textarea value={refNoteText} onChange={(event) => setRefNoteText(event.target.value)} rows={5} placeholder={"Tulis Markdown; rumus di antara $...$, mis. $E_k = \\frac{1}{2}mv^2$. Kosongkan bila catatan hanya berupa tautan."} />
        </label>
        <label className="fillable-wide">
          Tautan gambar diagram TikZ yang sudah dirender (opsional)
          <input type="url" value={refImageUrl} onChange={(event) => setRefImageUrl(event.target.value)} placeholder="https://…/diagram.png — TikZ tidak dirender di browser, unggah dulu hasil rendernya" />
        </label>
        <div className="fillable-actions">
          <button type="submit">Simpan refleksi</button>
          {reflectionKey !== "new" ? <button type="button" onClick={removeReflection}>Hapus baris ini</button> : null}
        </div>
        <p className="fillable-hint">
          Catatan template kemarin tetap dibuka dari berkas aslinya. Catatan baru yang
          diisi di sini ditampilkan dari isi yang kamu tulis di atas.
        </p>
      </form>

      <form className="fillable-form" onSubmit={saveBanks} aria-label="Formulir bank soal per mapel">
        <h3>Bank soal per mapel (opsional)</h3>
        <div className="fillable-row">
          {banks.map((bank, index) => (
            <fieldset key={bank.subject}>
              <legend>{SUBJECT_LABEL[bank.subject]}</legend>
              <label>LOTS<input type="number" min="0" inputMode="numeric" value={bank.lots} onChange={(event) => setBanks((cur) => cur.map((b, i) => i === index ? { ...b, lots: event.target.value } : b))} /></label>
              <label>MOTS<input type="number" min="0" inputMode="numeric" value={bank.mots} onChange={(event) => setBanks((cur) => cur.map((b, i) => i === index ? { ...b, mots: event.target.value } : b))} /></label>
              <label>HOTS<input type="number" min="0" inputMode="numeric" value={bank.hots} onChange={(event) => setBanks((cur) => cur.map((b, i) => i === index ? { ...b, hots: event.target.value } : b))} /></label>
            </fieldset>
          ))}
        </div>
        <button type="submit">Simpan bank soal</button>
      </form>
    </section>
  );
}
