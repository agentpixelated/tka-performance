import { useMemo, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaTopScrim } from "@hatch/space-sdk/client";
import {
CartesianGrid,
Line,
LineChart,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis,
} from "recharts";
import BlurText from "./components/BlurText";
import Counter from "./components/Counter";
import Threads from "./components/Threads";
import { ReflectionViewer } from "./components/ReflectionViewer";
import { api, type ApiResponse } from "./api";

type Dashboard = ApiResponse<typeof api, "getDashboard">;
type Assessment = Dashboard["assessments"][number];
type Question = Assessment["questions"][number];
type FirstTryDay = Dashboard["firstTryDays"][number];
type FirstTrySubject = FirstTryDay["subjects"][number];
type ReflectionRow = Dashboard["reflections"][number];
type Subject = Dashboard["banks"][number]["subject"];
type AccuracyPoint = {
  day: string;
  fisikaFirst?: number;
  fisikaReflected?: number;
  matwaFirst?: number;
  matwaReflected?: number;
  matlanFirst?: number;
  matlanReflected?: number;
  averageFirst?: number;
  averageReflected?: number;
};

type SubjectAccuracy = {
  subject: Subject;
  firstTry: number;
  afterReflection?: number;
};

type MetricProps = {
  value: number;
  suffix?: string;
  label: string;
};

const subjectLabel: Record<Subject, string> = {
  fisika: "Fisika",
  matwa: "Matematika Wajib",
  matlan: "Matematika Lanjutan",
};

const subjectShort: Record<Subject, string> = {
  fisika: "Fisika",
  matwa: "Matwa",
  matlan: "Matlan",
};

function sum<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((total, row) => total + pick(row), 0);
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function statusLabel(status: Question["status"]) {
  if (status === "benar") return "Benar";
  if (status === "sebagian") return "Sebagian";
  return "Salah";
}

function ScoreMark({ status, resolved = false }: { status: Question["status"]; resolved?: boolean }) {
  const label = resolved ? "Sudah dikuasai setelah koreksi" : statusLabel(status);
  return (
    <span className={`score-mark ${resolved ? "resolved" : status}`} aria-label={label} title={label}>
      {resolved || status === "benar" ? "✓" : status === "sebagian" ? "½" : "×"}
    </span>
  );
}

function Metric({ value, suffix = "", label }: MetricProps) {
  return (
    <div className="pulse-metric">
      <span className="metric-number" aria-hidden="true">
        <Counter
          value={value}
          fontSize={38}
          gap={1}
          horizontalPadding={0}
          gradientHeight={9}
          gradientFrom="var(--hero-ink)"
          gradientTo="transparent"
          fontWeight={750}
        />
        {suffix}
      </span>
      <span className="sr-only">{value}{suffix}</span>
      <small>{label}</small>
    </div>
  );
}

function SectionIntro({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <header className="section-intro">
      <h2 id={id}>{title}</h2>
      <p>{note}</p>
    </header>
  );
}

function DayArrow({ direction }: { direction: "previous" | "next" }) {
  const isPrevious = direction === "previous";
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={isPrevious ? "M12.5 4.5 7 10l5.5 5.5" : "M7.5 4.5 13 10l-5.5 5.5"} />
    </svg>
  );
}

function FirstTrySnapshot({
  dayNumber,
  day,
  onPrevious,
  onNext,
  reflectionCount,
}: {
  dayNumber: number;
  day?: FirstTryDay;
  onPrevious: () => void;
  onNext: () => void;
  reflectionCount: number;
}) {
  const dayLabel = `Hari ${String(dayNumber).padStart(2, "0")}`;
  const isBaseline = dayNumber === 0;
  const reflectedSubjects = day?.subjects.filter((row) => row.reflectedCorrect !== undefined) ?? [];
  const reflectedAverage = reflectedSubjects.length > 0
    ? Math.round(
        sum(reflectedSubjects, (row) => percent(row.reflectedCorrect ?? 0, row.assigned)) /
          reflectedSubjects.length,
      )
    : 0;
  return (
    <article className="first-try-snapshot" aria-labelledby={`first-try-${dayNumber}`}>
      <div className="snapshot-navigation" aria-label="Navigasi hasil first try">
        <button
          type="button"
          onClick={onPrevious}
          disabled={dayNumber === 0}
          aria-label="Lihat hari sebelumnya"
        >
          <DayArrow direction="previous" />
        </button>
        <strong aria-live="polite">{dayLabel}</strong>
        <button
          type="button"
          onClick={onNext}
          disabled={dayNumber === 15}
          aria-label="Lihat hari berikutnya"
        >
          <DayArrow direction="next" />
        </button>
      </div>
      <header>
        <div>
          <span>{day ? `${day.label} · ${formatDate(day.date)}` : dayLabel}</span>
          <h3 id={`first-try-${dayNumber}`}>First try</h3>
        </div>
        {day ? (
          <div className="snapshot-score">
            <strong>{day.accuracy}%</strong>
            <small>{day.correct}/{day.day >= 2 ? day.assigned : day.attempted} {isBaseline ? "poin" : "benar"}</small>
          </div>
        ) : null}
      </header>
      {day ? (
        <>
          {isBaseline ? (
            <div className="attempt-balance" aria-label={`${day.attempted} poin dinilai pada Hari 00`}>
              <span style={{ flexGrow: 1 }}>{day.attempted} poin dinilai · {day.subjects.length} mapel</span>
            </div>
          ) : (
            <div className="attempt-balance" aria-label={`${day.attempted} dikerjakan dan ${day.unanswered} tidak dikerjakan dari ${day.assigned} soal`}>
              <span style={{ flexGrow: day.attempted }}>{day.attempted} dikerjakan</span>
              <span className="unanswered" style={{ flexGrow: day.unanswered }}>{day.unanswered} tidak</span>
            </div>
          )}
          <ul className="snapshot-subjects">
            {day.subjects.map((row) => (
              <li key={row.subject}>
                <span>{subjectShort[row.subject]}</span>
                <b>{row.correct}/{day.day >= 2 ? row.assigned : row.attempted}</b>
                <strong>{row.accuracy}%</strong>
              </li>
            ))}
          </ul>
          {day.difficultyResults ? (
            <div className="snapshot-details" aria-label={`Rincian kesulitan ${day.label}`}>
              {day.difficultyResults.map((row) => (
                <span key={row.difficulty}><b>{row.difficulty}</b> {row.correct}/{row.assigned} · {row.accuracy}%</span>
              ))}
              {day.timer ? <span className="snapshot-timer">{day.timer}</span> : null}
            </div>
          ) : null}
        </>
      ) : (
        <div className="snapshot-empty" role="status">
          <strong>First try {dayLabel} belum ada data.</strong>
          <span>Gunakan tombol panah untuk melihat hari lain.</span>
        </div>
      )}
      <p>
        {reflectedSubjects.length > 0
          ? `Setelah refleksi: ${reflectedSubjects.map((row) => `${subjectShort[row.subject]} ${row.reflectedCorrect ?? 0}/${row.assigned} (${percent(row.reflectedCorrect ?? 0, row.assigned)}%)`).join(", ")} · rata-rata mapel ${reflectedAverage}%.`
          : reflectionCount > 0
            ? <><strong>{reflectionCount} bahan refleksi siap.</strong> Buka catatan dan video untuk hari ini. <a href="#refleksi">Buka indeks refleksi ↓</a></>
            : `Refleksi ${dayLabel} belum ada data.`}
      </p>
    </article>
  );
}

function SubjectReflectionReview({
  result,
  rows,
  open,
  dayLabel,
  date,
  scoreAgainstAssigned,
}: {
  result: FirstTrySubject;
  rows: ReflectionRow[];
  open: boolean;
  dayLabel: string;
  date: string;
  scoreAgainstAssigned: boolean;
}) {
  const subjectRows = rows.filter((row) => row.subject === result.subject);
  const wrongRows = subjectRows.filter((row) => row.gap === "wrong" || (!row.gap && row.type === "video"));
  const unansweredRows = subjectRows.filter((row) => row.gap === "unanswered" || (!row.gap && row.type === "note"));
  const focusRows = [...wrongRows, ...unansweredRows];
  const focusSummary = focusRows.length > 0
    ? focusRows.slice(0, 4).map((row) => row.title).join(" · ")
    : "Belum ada bahan koreksi untuk mapel ini pada hari yang dipilih.";
  return (
    <details className={`day-review ${result.subject}`} open={open}>
      <summary>
        <div>
          <span>{dayLabel} · {formatDate(date)}</span>
          <h3>{subjectLabel[result.subject]}</h3>
          <small>{result.correct}/{scoreAgainstAssigned ? result.assigned : result.attempted} benar · {result.assigned - result.attempted} kosong</small>
        </div>
        <div className="assessment-score">
          <strong>{result.accuracy}%</strong>
          <small>first try</small>
        </div>
      </summary>
      <div className="day-review-body">
        <p className="review-priority"><strong>Fokus berikutnya.</strong> {focusSummary}</p>
        <div className="review-columns">
          <section>
            <header><b>{wrongRows.length} salah</b><span>Refleksi dengan Manim</span></header>
            <ul>
              {wrongRows.map((row) => (
                <li key={`wrong-${row.number}`}>
                  <span>{String(row.number).padStart(2, "0")}</span>
                  <div><b>{row.title}</b><small>{row.focus}</small></div>
                </li>
              ))}
            </ul>
          </section>
          <section className="unanswered-review">
            <header><b>{unansweredRows.length} tidak diisi</b><span>Pelajari dasar, lalu aplikasi</span></header>
            <ul>
              {unansweredRows.map((row) => (
                <li key={`blank-${row.number}`}>
                  <span>{String(row.number).padStart(2, "0")}</span>
                  <div><b>{row.title}</b><small>{row.focus}</small></div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </details>
  );
}

function AssessmentDetail({ assessment }: { assessment: Assessment }) {
  const earned = sum(assessment.questions, (question) => question.earned);
  const possible = sum(assessment.questions, (question) => question.possible);
  const accuracy = percent(earned, possible);

  return (
    <details className={`assessment-leaf ${assessment.subject}`}>
      <summary>
        <div>
          <span>{assessment.dayLabel} · {formatDate(assessment.date)}</span>
          <h3>{assessment.label}</h3>
        </div>
        <div className="assessment-score">
          <strong>{accuracy}%</strong>
          <small>{earned}/{possible} poin</small>
        </div>
      </summary>
      <ol className="question-ledger">
        {assessment.questions.map((question) => (
          <li key={question.number}>
            <ScoreMark status={question.status} resolved={question.resolved} />
            <div>
              <div className="question-line">
                <b>{String(question.number).padStart(2, "0")} · {question.topic}</b>
                <span>{question.earned}/{question.possible}{question.resolved ? " awal" : ""}</span>
              </div>
              {question.resolved ? <em className="resolved-label">Sudah dikuasai</em> : null}
              <p>{question.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function App() {
  const [selectedFirstTryDay, setSelectedFirstTryDay] = useState(3);
  const [selectedReflectionDay, setSelectedReflectionDay] = useState(3);
  const dashboardQuery = useQuery({
    queryKey: ["tka-dashboard"],
    queryFn: () => api.getDashboard({}),
  });

  const computed = useMemo(() => {
    const data = dashboardQuery.data;
    if (!data) return null;

    const baselineAssessments = data.assessments.filter((assessment) => assessment.planDay === 0);
    const baselineCompleted = sum(baselineAssessments, (assessment) => assessment.completed);
    const completed = sum(data.firstTryDays, (day) => day.attempted);
    const latestDay = data.firstTryDays.find((day) => day.day === data.programDay) ?? data.firstTryDays.at(-1);
    const baselineSubjects = (["fisika", "matwa", "matlan"] as const).flatMap((subject) => {
      const assessments = baselineAssessments.filter((assessment) => assessment.subject === subject);
      const attempted = sum(assessments, (assessment) => sum(assessment.questions, (question) => question.possible));
      if (attempted === 0) return [];
      const correct = sum(assessments, (assessment) => sum(assessment.questions, (question) => question.earned));
      const hasReflection = assessments.some((assessment) => assessment.questions.some((question) => question.resolved));
      const reflectedCorrect = sum(assessments, (assessment) =>
        sum(assessment.questions, (question) => question.resolved ? question.possible : question.earned),
      );
      return [{
        subject,
        assigned: attempted,
        attempted,
        correct,
        reflectedCorrect: hasReflection ? reflectedCorrect : undefined,
      }];
    });
    const baselineDay: FirstTryDay | undefined = baselineSubjects.length > 0 ? {
      day: 0,
      label: "Hari 00",
      date: baselineAssessments.map((assessment) => assessment.date).sort().at(-1) ?? data.updatedAt,
      assigned: sum(baselineSubjects, (row) => row.assigned),
      attempted: sum(baselineSubjects, (row) => row.attempted),
      unanswered: 0,
      correct: sum(baselineSubjects, (row) => row.correct),
      accuracy: percent(sum(baselineSubjects, (row) => row.correct), sum(baselineSubjects, (row) => row.attempted)),
      averageAccuracy: Math.round(sum(baselineSubjects, (row) => percent(row.correct, row.attempted)) / baselineSubjects.length),
      subjects: baselineSubjects.map((row) => ({ ...row, accuracy: percent(row.correct, row.attempted) })),
    } : undefined;
    const perSubject = data.banks.map((bank) => {
      const total = bank.lots + bank.mots + bank.hots;
      const firstTryDone = sum(data.firstTryDays, (day) => {
        return day.subjects.find((item) => item.subject === bank.subject)?.attempted ?? 0;
      });
      const latestSubject = latestDay?.subjects.find((item) => item.subject === bank.subject);
      const done = firstTryDone;
      return {
        ...bank,
        total,
        done,
        remaining: Math.max(0, total - done),
        accuracy: latestSubject?.accuracy ?? null,
      };
    });

    const subjectAccuracies: SubjectAccuracy[] = latestDay
      ? latestDay.subjects.map((row) => ({
          subject: row.subject,
          firstTry: row.accuracy,
          afterReflection: row.reflectedCorrect === undefined
            ? undefined
            : percent(row.reflectedCorrect, row.assigned),
        }))
      : [];

    const chartData: AccuracyPoint[] = Array.from({ length: 16 }, (_, day) => {
      const point: AccuracyPoint = { day: `H${String(day).padStart(2, "0")}` };
      const firstTryDay = data.firstTryDays.find((item) => item.day === day);

      if (firstTryDay) {
        for (const row of firstTryDay.subjects) {
          const first = row.accuracy;
          const reflected = row.reflectedCorrect === undefined
            ? undefined
            : percent(row.reflectedCorrect, row.assigned);
          if (row.subject === "fisika") {
            point.fisikaFirst = first;
            point.fisikaReflected = reflected;
          } else if (row.subject === "matwa") {
            point.matwaFirst = first;
            point.matwaReflected = reflected;
          } else {
            point.matlanFirst = first;
            point.matlanReflected = reflected;
          }
        }
        point.averageFirst = firstTryDay.averageAccuracy;
        const reflectedRows = firstTryDay.subjects.filter((row) => row.reflectedCorrect !== undefined);
        if (reflectedRows.length === firstTryDay.subjects.length) {
          point.averageReflected = Math.round(
            sum(reflectedRows, (row) => percent(row.reflectedCorrect ?? 0, row.assigned)) /
              reflectedRows.length,
          );
        }
        return point;
      }

      const dayRows: SubjectAccuracy[] = [];
      for (const subject of ["fisika", "matwa", "matlan"] as const) {
        const assessments = data.assessments.filter(
          (assessment) => assessment.planDay === day && assessment.subject === subject,
        );
        const dayEarned = sum(assessments, (item) => sum(item.questions, (question) => question.earned));
        const dayPossible = sum(assessments, (item) => sum(item.questions, (question) => question.possible));
        if (dayPossible === 0) continue;

        const resolvedQuestions = assessments.flatMap((item) => item.questions).filter((question) => question.resolved);
        const reflectedEarned = sum(assessments, (item) =>
          sum(item.questions, (question) => question.resolved ? question.possible : question.earned),
        );
        const row: SubjectAccuracy = {
          subject,
          firstTry: percent(dayEarned, dayPossible),
          afterReflection: resolvedQuestions.length > 0 ? percent(reflectedEarned, dayPossible) : undefined,
        };
        dayRows.push(row);
        if (subject === "fisika") {
          point.fisikaFirst = row.firstTry;
          point.fisikaReflected = row.afterReflection;
        } else if (subject === "matwa") {
          point.matwaFirst = row.firstTry;
          point.matwaReflected = row.afterReflection;
        } else {
          point.matlanFirst = row.firstTry;
          point.matlanReflected = row.afterReflection;
        }
      }

      if (dayRows.length > 0) {
        point.averageFirst = Math.round(sum(dayRows, (row) => row.firstTry) / dayRows.length);
      }
      const reflectedRows = dayRows.filter((row) => row.afterReflection !== undefined);
      if (reflectedRows.length > 0) {
        point.averageReflected = Math.round(
          sum(reflectedRows, (row) => row.afterReflection ?? 0) / reflectedRows.length,
        );
      }
      return point;
    });

    const latestReflectedSubjects = latestDay?.subjects.filter(
      (row) => row.reflectedCorrect !== undefined,
    ) ?? [];
    const reflectedAccuracy = latestDay && latestReflectedSubjects.length === latestDay.subjects.length
      ? Math.round(
          sum(latestReflectedSubjects, (row) => percent(row.reflectedCorrect ?? 0, row.assigned)) /
            latestReflectedSubjects.length,
        )
      : undefined;

    return {
      baselineCompleted,
      completed,
      accuracy: latestDay?.accuracy ?? 0,
      averageAccuracy: latestDay?.averageAccuracy ?? 0,
      reflectedAccuracy,
      remaining: Math.max(0, data.planTotal - completed),
      planProgress: percent(completed, data.planTotal),
      perSubject,
      chartData,
      subjectAccuracies,
      latestDay,
      baselineDay,
    };
  }, [dashboardQuery.data]);

  const selectedEvidenceRecord = computed && dashboardQuery.data
    ? selectedFirstTryDay === 0
      ? computed.baselineDay
      : dashboardQuery.data.firstTryDays.find((day) => day.day === selectedFirstTryDay)
    : undefined;
  const selectedEvidenceLabel = `Hari ${String(selectedFirstTryDay).padStart(2, "0")}`;

  return (
    <div className="app-shell">
      <SafeAreaTopScrim backgroundColor="var(--bg)" />
      <main>
        {dashboardQuery.isPending ? (
          <div className="loading-orbit" aria-live="polite"><i /><span>Membuka progres…</span></div>
        ) : dashboardQuery.error || !dashboardQuery.data || !computed ? (
          <section className="error-state" role="alert">
            <strong>Data progres tidak terbaca.</strong>
            <button type="button" onClick={() => dashboardQuery.refetch()}>Muat ulang</button>
          </section>
        ) : (
          <>
            <nav className="page-nav" aria-label="Bagian dashboard">
              <a href="#lintasan">15 hari</a>
              <a href="#akurasi">Akurasi</a>
              <a href="#hasil">Hasil</a>
              <a href="#refleksi">Refleksi</a>
              <a href="#topik">Topik</a>
            </nav>

            <section className="hero-field" aria-labelledby="hero-title">
              <Threads
                className="hero-threads"
                color="var(--thread-a)"
                accentColor="var(--thread-b)"
                amplitude={0.95}
                distance={0.32}
                lineCount={64}
                thickness={0.72}
                speed={0.22}
                waves={1.4}
                fray={0.34}
                angle={-12}
                parting={0.18}
                fade={0.08}
                opacity={0.52}
                enableMouseInteraction
              />
              <div className="hero-copy">
                <BlurText
                  text={computed.latestDay
                    ? `${computed.latestDay.correct}/${computed.latestDay.assigned} benar pada first try · ${computed.latestDay.unanswered} soal belum dikerjakan.`
                    : `${computed.baselineCompleted} soal tercatat di Hari 00.`}
                  className="hero-statement"
                  delay={45}
                  stepDuration={0.28}
                  direction="bottom"
                  animationFrom={{ filter: "blur(8px)", opacity: 0, y: 12 }}
                  animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
                />
                <h1 id="hero-title">Hari <span>{String(dashboardQuery.data.programDay).padStart(2, "0")}</span> dari 15</h1>
                <p>{computed.latestDay ? `First try ${computed.latestDay.label}: ${computed.latestDay.correct} dari ${computed.latestDay.assigned} benar (${computed.latestDay.accuracy}%). Rata-rata tiga mapel ${computed.latestDay.averageAccuracy}% · ${computed.latestDay.attempted} dikerjakan · ${computed.latestDay.unanswered} kosong${computed.latestDay.timer ? ` · ${computed.latestDay.timer.split(" · ")[0]}` : ""}.` : "Belum ada hasil first try untuk lintasan ini."}</p>
              </div>

              <div className="hero-progress" aria-label={`${computed.planProgress} persen rencana selesai`}>
                <div className="progress-orbit" style={{ "--progress": `${computed.planProgress * 3.6}deg` } as CSSProperties}>
                  <strong>{computed.planProgress}%</strong>
                  <span>selesai</span>
                </div>
                <div className="hero-plan-copy">
                  <b>{computed.completed} / {dashboardQuery.data.planTotal}</b>
                  <span>soal dalam lintasan</span>
                </div>
              </div>

              <div className="metric-stream">
                <Metric value={computed.latestDay?.attempted ?? 0} label={`dikerjakan Hari ${String(dashboardQuery.data.programDay).padStart(2, "0")}`} />
                <Metric value={computed.accuracy} suffix="%" label="akurasi total first try" />
                <Metric value={computed.latestDay?.unanswered ?? 0} label="tidak dikerjakan" />
              </div>
            </section>

            <section className="journey-section" id="lintasan" aria-labelledby="journey-title">
              <SectionIntro
                id="journey-title"
                title="Lintasan 15 hari"
                note="Hari 01 dan Hari 02 masing-masing memakai 46 soal dari alokasi. LOTS turun perlahan; HOTS mengambil ruang lebih besar menjelang akhir."
              />
              <ol className="river-days">
                {dashboardQuery.data.days.map((day) => (
                  <li className={day.day === dashboardQuery.data.programDay ? "current" : ""} key={day.day}>
                    <div className="day-orb">
                      <span>H{String(day.day).padStart(2, "0")}</span>
                      <strong>{day.total}</strong>
                      <small>soal</small>
                    </div>
                    <div className="day-current">
                      <div className="difficulty-flow" aria-label={`Hari ${day.day}: LOTS ${day.lots}, MOTS ${day.mots}, HOTS ${day.hots}`}>
                        <i className="lots" style={{ flexGrow: day.lots }} />
                        <i className="mots" style={{ flexGrow: day.mots }} />
                        <i className="hots" style={{ flexGrow: day.hots }} />
                      </div>
                      <div className="day-values"><span>L {day.lots}</span><span>M {day.mots}</span><span>H {day.hots}</span></div>
                      <small>Fis {day.fisika} · Wjb {day.matwa} · Ljt {day.matlan}</small>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="difficulty-legend" aria-label="Legenda kesulitan">
                <span><i className="lots" />LOTS</span>
                <span><i className="mots" />MOTS</span>
                <span><i className="hots" />HOTS</span>
              </div>
            </section>

            <section className="accuracy-section" id="akurasi" aria-labelledby="accuracy-title">
              <SectionIntro
                id="accuracy-title"
                title="First try vs setelah refleksi"
                note="Nilai awal tetap utuh. Nilai setelah refleksi hanya naik ketika soal yang salah sudah dikerjakan ulang dengan benar."
              />
              <div className="chart-legend" aria-label="Legenda grafik">
                <span><i className="fisika" />Fisika</span>
                <span><i className="matwa" />Matwa</span>
                <span><i className="matlan" />Matlan</span>
                <span><i className="average" />Rata-rata mapel</span>
                <span className="phase-key"><i />First try</span>
                <span className="phase-key reflected"><i />Setelah refleksi</span>
              </div>
              <div className="chart-cove" role="img" aria-label="Grafik akurasi Hari 00 sampai Hari 15 untuk Fisika, Matematika Wajib, Matematika Lanjutan, serta rata-rata mapel. Garis penuh menunjukkan first try dan garis putus-putus menunjukkan hasil setelah refleksi. Hari tanpa data tetap ditampilkan pada sumbu horizontal.">
                <ResponsiveContainer width="100%" height={330}>
                  <LineChart data={computed.chartData} margin={{ top: 22, right: 13, bottom: 8, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="2 8" />
                    <XAxis
                      dataKey="day"
                      interval={0}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--dim)", fontSize: 8, fontWeight: 700 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickLine={false}
                      axisLine={false}
                      width={42}
                      tick={{ fill: "var(--dim)", fontSize: 10 }}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <Tooltip
                      cursor={{ stroke: "var(--text)", strokeDasharray: "2 5", strokeOpacity: 0.35 }}
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ background: "var(--surface-strong)", border: 0, borderRadius: 18, boxShadow: "0 14px 35px rgba(16, 38, 35, .16)", fontSize: 12 }}
                      labelStyle={{ color: "var(--text)", fontWeight: 800 }}
                    />
                    <Line type="linear" dataKey="fisikaFirst" name="Fisika · first try" stroke="var(--chart-fisika)" strokeWidth={3.5} connectNulls={false} dot={{ r: 5, fill: "var(--surface-strong)", strokeWidth: 3 }} activeDot={{ r: 7 }} isAnimationActive />
                    <Line type="linear" dataKey="fisikaReflected" name="Fisika · setelah refleksi" stroke="var(--chart-fisika)" strokeWidth={3} strokeDasharray="7 5" connectNulls={false} dot={{ r: 4, fill: "var(--surface-strong)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive />
                    <Line type="linear" dataKey="matwaFirst" name="Matwa · first try" stroke="var(--chart-matwa)" strokeWidth={3.5} connectNulls={false} dot={{ r: 5, fill: "var(--surface-strong)", strokeWidth: 3 }} activeDot={{ r: 7 }} isAnimationActive />
                    <Line type="linear" dataKey="matwaReflected" name="Matwa · setelah refleksi" stroke="var(--chart-matwa)" strokeWidth={3} strokeDasharray="7 5" connectNulls={false} dot={{ r: 4, fill: "var(--surface-strong)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive />
                    <Line type="linear" dataKey="matlanFirst" name="Matlan · first try" stroke="var(--chart-matlan)" strokeWidth={3.5} connectNulls={false} dot={{ r: 5, fill: "var(--surface-strong)", strokeWidth: 3 }} activeDot={{ r: 7 }} isAnimationActive />
                    <Line type="linear" dataKey="matlanReflected" name="Matlan · setelah refleksi" stroke="var(--chart-matlan)" strokeWidth={3} strokeDasharray="7 5" connectNulls={false} dot={{ r: 4, fill: "var(--surface-strong)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive />
                    <Line type="linear" dataKey="averageFirst" name="Rata-rata · first try" stroke="var(--chart-average)" strokeWidth={2.5} connectNulls={false} dot={{ r: 4, fill: "var(--surface-strong)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive />
                    <Line type="linear" dataKey="averageReflected" name="Rata-rata · setelah refleksi" stroke="var(--chart-average)" strokeWidth={2.5} strokeDasharray="7 5" connectNulls={false} dot={{ r: 4, fill: "var(--surface-strong)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="actual-strip">
                <b>Hari {String(dashboardQuery.data.programDay).padStart(2, "0")}</b>
                {computed.subjectAccuracies.map((row) => (
                  <span key={row.subject}>
                    {subjectShort[row.subject]} <strong>{row.firstTry}%</strong>
                    {row.afterReflection !== undefined ? <> → <strong>{row.afterReflection}%</strong></> : null}
                  </span>
                ))}
                <span>
                  Rata-rata <strong>{computed.averageAccuracy}%</strong>
                  {computed.reflectedAccuracy !== undefined ? <> → <strong>{computed.reflectedAccuracy}%</strong></> : null}
                </span>
              </div>
              <p className="method-note">Hari 03 · first try: Fisika 6/18 (33%), Matwa 8/17 (47%), Matlan 2/11 (18%); rata-rata mapel 33%, total 16/46 (35%). Sebanyak 25 soal dikerjakan dan 21 kosong dalam 2 jam (10:00–12:00 WIB). Hari 01–02 tetap tampil sebagai riwayat; garis refleksi hanya muncul jika hasil koreksi sudah tercatat.</p>
            </section>

            <section className="subject-section" aria-labelledby="subject-title">
              <SectionIntro
                id="subject-title"
                title="Beban tiga mapel"
                note={`Diperbarui ${formatDate(dashboardQuery.data.updatedAt)}. Komposisi kategori tetap terlihat, bukan disembunyikan dalam total.`}
              />
              <div className="subject-ribbons">
                {computed.perSubject.map((row) => (
                  <article className={row.subject} key={row.subject}>
                    <header>
                      <div><h3>{subjectLabel[row.subject]}</h3><p>{row.done} soal tercatat · {row.remaining} tersisa di bank</p></div>
                      <div className="ribbon-accuracy"><strong>{row.accuracy === null ? "—" : `${row.accuracy}%`}</strong><small>first try H{String(dashboardQuery.data.programDay).padStart(2, "0")}</small></div>
                    </header>
                    <div className="subject-composition" aria-label={`${subjectLabel[row.subject]}: LOTS ${row.lots}, MOTS ${row.mots}, HOTS ${row.hots}`}>
                      <span className="lots" style={{ flexGrow: row.lots }}>L {row.lots}</span>
                      <span className="mots" style={{ flexGrow: row.mots }}>M {row.mots}</span>
                      <span className="hots" style={{ flexGrow: row.hots }}>H {row.hots}</span>
                    </div>
                    <small>{row.total} soal terpetakan</small>
                  </article>
                ))}
              </div>
              <p className="source-gap">Total lintasan dan bank kategori sudah cocok: {dashboardQuery.data.planTotal} soal · Fisika 221 · Matwa 250 · Matlan 206.</p>
            </section>

            <section className="evidence-section" id="hasil" aria-labelledby="evidence-title">
              <SectionIntro
                id="evidence-title"
                title={`Bukti ${selectedEvidenceLabel}`}
                note="Pilih satu hari untuk melihat ringkasan first try dan bukti per mapel tanpa menumpuk kartu dari hari lain. Hari 00 memuat arsip penilaian awal."
              />
              <label className="evidence-day-picker">
                <span>Pilih hari</span>
                <select
                  value={selectedFirstTryDay}
                  onChange={(event) => setSelectedFirstTryDay(Number(event.target.value))}
                  aria-label="Pilih hari bukti"
                >
                  {Array.from({ length: 16 }, (_, day) => (
                    <option key={day} value={day}>Hari {String(day).padStart(2, "0")}</option>
                  ))}
                </select>
              </label>
              <div className="assessment-grove">
                <FirstTrySnapshot
                  dayNumber={selectedFirstTryDay}
                  day={selectedEvidenceRecord}
                  onPrevious={() => setSelectedFirstTryDay((current) => Math.max(0, current - 1))}
                  onNext={() => setSelectedFirstTryDay((current) => Math.min(15, current + 1))}
                  reflectionCount={dashboardQuery.data.reflections.filter((row) => row.day === selectedFirstTryDay).length}
                />
                {selectedFirstTryDay === 0
                  ? dashboardQuery.data.assessments
                      .filter((assessment) => assessment.planDay === 0)
                      .map((assessment) => (
                        <AssessmentDetail assessment={assessment} key={`${assessment.subject}-${assessment.date}`} />
                      ))
                  : selectedEvidenceRecord?.subjects.map((result, index) => {
                      return (
                        <SubjectReflectionReview
                          key={`day-review-${selectedFirstTryDay}-${result.subject}`}
                          result={result}
                          rows={dashboardQuery.data.reflections.filter((row) => row.day === selectedFirstTryDay)}
                          open={index === 0}
                          dayLabel={selectedEvidenceLabel}
                          date={selectedEvidenceRecord.date}
                          scoreAgainstAssigned={selectedFirstTryDay >= 2}
                        />
                      );
                    })}
              </div>
            </section>

            <section className="reflection-section" id="refleksi" aria-labelledby="reflection-title">
              <SectionIntro
                id="reflection-title"
                title={`Refleksi Hari ${String(selectedReflectionDay).padStart(2, "0")}`}
                note="Pilih hari, lalu buka satu nomor soal. Catatan mulai dari dasar dan video membedah kesalahan first try tanpa memuat semua bahan sekaligus."
              />
              <div className="reflection-summary" aria-label={`Ringkasan bahan refleksi Hari ${String(selectedReflectionDay).padStart(2, "0")}`}>
                <div>
                  <strong>{dashboardQuery.data.reflections.filter((row) => row.day === selectedReflectionDay && row.type === "note").length}</strong>
                  <span>catatan dasar + aplikasi</span>
                </div>
                <div>
                  <strong>{dashboardQuery.data.reflections.filter((row) => row.day === selectedReflectionDay && row.type === "video").length}</strong>
                  <span>video Manim</span>
                </div>
                <a href={dashboardQuery.data.reflectionRepositoryUrl} target="_blank" rel="noreferrer">Buka framework di GitHub ↗</a>
              </div>
              <ReflectionViewer
                rows={dashboardQuery.data.reflections}
                selectedDay={selectedReflectionDay}
                onDayChange={setSelectedReflectionDay}
              />
            </section>

            <section className="skills-section" id="topik" aria-labelledby="skills-title">
              <SectionIntro
                id="skills-title"
                title="Yang harus diperbaiki per materi"
                note="Peta ini memakai rekap terbaru Hari 03. Salah dan kosong dipisahkan karena tindak lanjutnya berbeda; Matlan menjadi prioritas, sementara geometri menara dan balok dibantu visualisasi."
              />
              <div className="skill-petals">
                {dashboardQuery.data.skills.map((skill, index) => (
                  <details key={skill.subject} open={index === 0} className={skill.subject}>
                    <summary>
                      <span>
                        <b>{subjectLabel[skill.subject]}</b>
                        <small>{skill.correct}/{skill.assigned} benar · {skill.assigned - skill.attempted} kosong · {skill.accuracy}%</small>
                      </span>
                      <strong>{skill.accuracy}%</strong>
                      <i aria-hidden="true" />
                    </summary>
                    <div className="skill-priority"><strong>Prioritas</strong><p>{skill.priority}</p></div>
                    <div className="skill-columns">
                      <div className="wrong-column">
                        <h3>Salah — refleksi via Manim</h3>
                        <ul>{skill.wrongTopics.map((item) => <li key={item}>{item}</li>)}</ul>
                      </div>
                      <div className="gap-column">
                        <h3>Kosong — dasar + aplikasi</h3>
                        <ul>{skill.unansweredTopics.map((item) => <li key={item}>{item}</li>)}</ul>
                      </div>
                    </div>
                    <div className="mastered-archive">
                      <strong>Pegangan yang sudah terverifikasi sebelumnya</strong>
                      <ul>{skill.mastered.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <footer>
              <strong>{dashboardQuery.data.excludedUnverified}</strong>
              <span>soal tidak terverifikasi karena data benar-benar hilang pada gambar sumber, bukan karena masalah ekstraksi. Tidak dihitung sebagai progres.</span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
