import { useEffect, useMemo, useState, type ReactNode } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { reflectionImages } from "../reflectionImages";
import { reflectionNoteLoaders } from "../reflectionNoteLoaders";
import { reflectionVideos } from "../reflectionVideos";

type Subject = "fisika" | "matwa" | "matlan";
type ReflectionRecord = {
  day: number;
  number: number;
  code: string;
  subject: Subject;
  type: "note" | "video";
  gap?: "wrong" | "unanswered";
  title: string;
  focus: string;
  href: string;
  duration?: string;
  // Diisi hanya oleh formulir isi data (lihat DataEditor.tsx). Baris template
  // tidak punya field ini dan tetap dirender dari loader/berkas lama.
  noteText?: string;
  imageUrl?: string;
};

const subjectShort: Record<Subject, string> = {
  fisika: "Fisika",
  matwa: "Matwa",
  matlan: "Matlan",
};

function Latex({ source, displayMode = false }: { source: string; displayMode?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
      output: "htmlAndMathml",
    }),
    [displayMode, source],
  );

  return (
    <span
      className={displayMode ? "latex-display" : "latex-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function normalizeLatex(source: string) {
  return source
    .replaceAll("½", "\\frac{1}{2}")
    .replaceAll("¼", "\\frac{1}{4}")
    .replaceAll("⅓", "\\frac{1}{3}")
    .replaceAll("⅔", "\\frac{2}{3}")
    .replaceAll("²", "^2")
    .replaceAll("³", "^3")
    .replaceAll("₀", "_0")
    .replaceAll("₁", "_1")
    .replaceAll("₂", "_2")
    .replaceAll("₃", "_3")
    .replaceAll("₄", "_4")
    .replaceAll("₅", "_5")
    .replaceAll("₆", "_6")
    .replaceAll("₇", "_7")
    .replaceAll("₈", "_8")
    .replaceAll("₉", "_9")
    .replaceAll("·", "\\cdot ")
    .replaceAll("×", "\\times ")
    .replaceAll("→", "\\rightarrow ")
    .replaceAll("−", "-")
    .replaceAll("≤", "\\leq ")
    .replaceAll("≥", "\\geq ")
    .replaceAll("≈", "\\approx ")
    .replaceAll("∝", "\\propto ")
    .replaceAll("°", "^\\circ")
    .replace(/([A-Za-z])_([A-Za-z][A-Za-z0-9]*)/g, "$1_{$2}");
}

function looksLikeMath(source: string) {
  return /[=∝√²³₀-₉ηρπτΔ∠]|[A-Za-z]\s*[+−×÷]/.test(source);
}

function looksLikeEquationLine(source: string) {
  return source.length <= 150 && !/[.!?](?:\s|$)/.test(source) && looksLikeMath(source);
}

function InlineMarkdown({ children }: { children: string }) {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(\*\*.+?\*\*|`.+?`|\$[^$]+\$|\*[^*]+\*)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(children)) !== null) {
    if (match.index > cursor) nodes.push(children.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      const content = token.slice(2, -2);
      nodes.push(
        looksLikeMath(content)
          ? <Latex source={normalizeLatex(content)} key={key++} />
          : <strong key={key++}>{content}</strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("$")) {
      nodes.push(<Latex source={normalizeLatex(token.slice(1, -1))} key={key++} />);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    cursor = match.index + token.length;
  }
  if (cursor < children.length) nodes.push(children.slice(cursor));
  return <>{nodes}</>;
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

type QuestionOption = { label: string; text: string; answer: boolean };

function parseQuestionOptions(source: string): QuestionOption[] | null {
  const marker = /(?:^|\s)(\*\*)?([A-E])\.\s/g;
  const matches = [...source.matchAll(marker)];
  if (matches.length < 2 || matches[0]?.[2] !== "A") return null;

  const options = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    const markedAnswer = Boolean(match[1]);
    let text = source.slice(start, end).trim();
    if (markedAnswer && text.endsWith("**")) text = text.slice(0, -2).trim();
    return { label: match[2] ?? "", text, answer: markedAnswer };
  });

  return options.length >= 2 ? options : null;
}

function QuestionOptions({ options }: { options: QuestionOption[] }) {
  return (
    <ol className="question-options" aria-label="Pilihan jawaban">
      {options.map((option) => (
        <li className={option.answer ? "answer" : ""} key={option.label}>
          <span aria-hidden="true">{option.label}</span>
          <div><InlineMarkdown>{option.text}</InlineMarkdown></div>
        </li>
      ))}
    </ol>
  );
}

function MarkdownNote({ source }: { source: string }) {
  const blocks = useMemo(() => {
    const lines = source.replace(/\r/g, "").split("\n");
    const output: ReactNode[] = [];
    let index = 0;
    let key = 0;

    while (index < lines.length) {
      const line = lines[index] ?? "";
      const trimmed = line.trim();
      if (!trimmed) {
        index += 1;
        continue;
      }

      const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
      if (heading) {
        const level = heading[1]?.length ?? 2;
        const text = heading[2] ?? "";
        if (level === 1) output.push(<h2 key={key++}><InlineMarkdown>{text}</InlineMarkdown></h2>);
        else if (level === 2) output.push(<h3 key={key++}><InlineMarkdown>{text}</InlineMarkdown></h3>);
        else output.push(<h4 key={key++}><InlineMarkdown>{text}</InlineMarkdown></h4>);
        index += 1;
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        output.push(<hr key={key++} />);
        index += 1;
        continue;
      }

      if (trimmed.startsWith("$$")) {
        const singleLine = trimmed.length > 4 && trimmed.endsWith("$$");
        const equation: string[] = [trimmed.replace(/^\$\$/, "").replace(/\$\$$/, "")];
        index += 1;
        if (!singleLine) {
          while (index < lines.length) {
            const next = (lines[index] ?? "").trim();
            if (next.endsWith("$$")) {
              equation.push(next.replace(/\$\$$/, ""));
              index += 1;
              break;
            }
            equation.push(next);
            index += 1;
          }
        }
        output.push(<div className="display-math" key={key++}><Latex source={equation.join(" ")} displayMode /></div>);
        continue;
      }

      if (looksLikeEquationLine(trimmed)) {
        const equation: string[] = [trimmed];
        index += 1;
        while (index < lines.length) {
          const next = (lines[index] ?? "").trim();
          if (!next || !looksLikeEquationLine(next)) break;
          equation.push(next);
          index += 1;
        }
        output.push(
          <div className="display-math equation-stack" key={key++}>
            <Latex source={normalizeLatex(equation.join(" \\\\ ").replaceAll("**", ""))} displayMode />
          </div>,
        );
        continue;
      }

      if (trimmed.startsWith("|") && (lines[index + 1] ?? "").trim().match(/^\|?\s*:?-+/)) {
        const header = splitTableRow(trimmed);
        index += 2;
        const rows: string[][] = [];
        while (index < lines.length && (lines[index] ?? "").trim().startsWith("|")) {
          rows.push(splitTableRow(lines[index] ?? ""));
          index += 1;
        }
        output.push(
          <div className="note-table-wrap" key={key++}>
            <table>
              <thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}><InlineMarkdown>{cell}</InlineMarkdown></th>)}</tr></thead>
              <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><InlineMarkdown>{cell}</InlineMarkdown></td>)}</tr>)}</tbody>
            </table>
          </div>,
        );
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const items: string[] = [];
        while (index < lines.length) {
          const item = /^[-*]\s+(.+)$/.exec((lines[index] ?? "").trim());
          if (!item) break;
          items.push(item[1] ?? "");
          index += 1;
        }
        output.push(<ul key={key++}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown>{item}</InlineMarkdown></li>)}</ul>);
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items: string[] = [];
        while (index < lines.length) {
          const item = /^\d+\.\s+(.+)$/.exec((lines[index] ?? "").trim());
          if (!item) break;
          items.push(item[1] ?? "");
          index += 1;
        }
        output.push(<ol key={key++}>{items.map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown>{item}</InlineMarkdown></li>)}</ol>);
        continue;
      }

      if (trimmed.startsWith(">")) {
        const quote: string[] = [];
        while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
          quote.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
          index += 1;
        }
        output.push(<blockquote key={key++}><InlineMarkdown>{quote.join(" ")}</InlineMarkdown></blockquote>);
        continue;
      }

      const paragraph: string[] = [trimmed];
      index += 1;
      while (index < lines.length) {
        const next = (lines[index] ?? "").trim();
        if (!next || /^(#{1,3})\s+/.test(next) || /^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next) || next.startsWith(">") || next.startsWith("|") || next.startsWith("$$") || /^---+$/.test(next)) break;
        paragraph.push(next);
        index += 1;
      }
      const paragraphText = paragraph.join(" ");
      const options = parseQuestionOptions(paragraphText);
      output.push(
        options
          ? <QuestionOptions options={options} key={key++} />
          : <p key={key++}><InlineMarkdown>{paragraphText}</InlineMarkdown></p>,
      );
    }
    return output;
  }, [source]);

  return <article className="markdown-note">{blocks}</article>;
}

function ReflectionVideo({ src, number, title }: { src: string; number: number; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="video-fallback" role="alert">
        <strong>Video gagal diputar di pemutar ini.</strong>
        <p>Buka berkas videonya langsung, lalu kembali ke halaman ini untuk lanjut ke nomor berikutnya.</p>
        <a href={src} target="_blank" rel="noreferrer">Buka video No. {number} ↗</a>
      </div>
    );
  }

  return (
    <video
      controls
      playsInline
      preload="metadata"
      src={src}
      aria-label={`Video refleksi soal ${number}: ${title}`}
      onError={() => setFailed(true)}
    >
      Browser ini tidak mendukung pemutar video.
    </video>
  );
}

export function ReflectionViewer({
  rows,
  selectedDay,
  onDayChange,
}: {
  rows: ReflectionRecord[];
  selectedDay: number;
  onDayChange: (day: number) => void;
}) {
  const orderedRows = useMemo(
    () => rows.filter((row) => row.day === selectedDay).sort((a, b) => a.number - b.number),
    [rows, selectedDay],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [noteState, setNoteState] = useState<{ key: string; content?: string; error?: boolean } | null>(null);
  const activeIndex = Math.min(selectedIndex, Math.max(orderedRows.length - 1, 0));
  const active = orderedRows[activeIndex];

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedDay]);

  useEffect(() => {
    if (!active || active.type !== "note") {
      setNoteState(null);
      return;
    }
    let cancelled = false;
    const reflectionKey = `${active.day}-${active.number}`;
    const loader = reflectionNoteLoaders[reflectionKey];
    setNoteState({ key: reflectionKey });
    if (!loader) {
      setNoteState({ key: reflectionKey, error: true });
      return;
    }
    void loader()
      .then((module) => {
        if (!cancelled) setNoteState({ key: reflectionKey, content: module.default });
      })
      .catch(() => {
        if (!cancelled) setNoteState({ key: reflectionKey, error: true });
      });
    return () => { cancelled = true; };
  }, [active]);

  const dayLabel = `Hari ${String(selectedDay).padStart(2, "0")}`;

  if (!active) {
    return (
      <div className="reflection-browser">
        <label className="reflection-day-picker">
          <span>Pilih hari</span>
          <select
            value={selectedDay}
            onChange={(event) => onDayChange(Number(event.target.value))}
            aria-label="Pilih hari refleksi"
          >
            {Array.from({ length: 16 }, (_, day) => (
              <option key={day} value={day}>Hari {String(day).padStart(2, "0")}</option>
            ))}
          </select>
        </label>
        <div className="reflection-viewer empty-day">
          <p className="reflection-empty">Belum ada bahan refleksi untuk {dayLabel}.</p>
        </div>
      </div>
    );
  }

  const activeKey = `${active.day}-${active.number}`;
  const customNote = active.type === "note" ? active.noteText : undefined;
  const note = customNote ?? (active.type === "note" && noteState?.key === activeKey ? noteState.content : undefined);
  const noteFailed = active.type === "note" && noteState?.key === activeKey && noteState.error;
  const noteImage = active.type === "note" ? reflectionImages[activeKey] : undefined;
  // Video template dari berkas MP4 lokal; video yang ditambahkan lewat formulir
  // memakai tautan MP4 langsungnya (href) bila tidak ada berkas lokal.
  const video = active.type === "video"
    ? (reflectionVideos[activeKey] ?? (active.href.endsWith(".mp4") ? active.href : undefined))
    : undefined;

  return (
    <div className="reflection-browser">
      <label className="reflection-day-picker">
        <span>Pilih hari</span>
        <select
          value={selectedDay}
          onChange={(event) => onDayChange(Number(event.target.value))}
          aria-label="Pilih hari refleksi"
        >
          {Array.from({ length: 16 }, (_, day) => (
            <option key={day} value={day}>Hari {String(day).padStart(2, "0")}</option>
          ))}
        </select>
      </label>

      <div className="reflection-number-panel">
        <div className="reflection-number-heading">
          <span>Nomor soal</span>
          <div className="reflection-kind-legend" aria-label="Jenis bahan refleksi">
            <span className="note"><i />Catatan</span>
            <span className="video"><i />Video</span>
          </div>
        </div>
        <div className="reflection-number-grid" role="list" aria-label={`Daftar nomor soal ${dayLabel}`}>
          {orderedRows.map((row, index) => (
            <button
              key={`${row.day}-${row.type}-${row.number}`}
              type="button"
              className={`${row.type}${index === activeIndex ? " active" : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Soal ${row.number}, ${row.type === "note" ? "catatan" : "video"}: ${row.title}`}
              aria-pressed={index === activeIndex}
              role="listitem"
            >
              {String(row.number).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      <div className={`reflection-viewer ${active.type}`}>
        <div className="reflection-position" aria-live="polite">
          <span>{activeIndex + 1} / {orderedRows.length}</span>
          <i aria-hidden="true"><b style={{ width: `${((activeIndex + 1) / orderedRows.length) * 100}%` }} /></i>
        </div>

        <header className="reflection-active-header">
          <span className="reflection-number">{String(active.number).padStart(2, "0")}</span>
          <div>
            <span>{subjectShort[active.subject]} · {active.code} · {active.type === "note" ? "Catatan dasar" : active.duration}</span>
            <h3>{active.title}</h3>
            <p>{active.focus}</p>
          </div>
        </header>

        <div className="reflection-media" key={`${active.day}-${active.type}-${active.number}`}>
          {active.type === "note" ? (
            note ? (
              <div className="reflection-note-scroll">
                {active.imageUrl ? (
                  <figure className="reflection-visual">
                    <img src={active.imageUrl} alt={`Diagram refleksi soal ${active.number}`} />
                  </figure>
                ) : noteImage ? (
                  <figure className="reflection-visual">
                    <img src={noteImage.src} alt={noteImage.alt} />
                  </figure>
                ) : null}
                <MarkdownNote source={note} />
              </div>
            ) : (
              <p className="reflection-empty" role="status">{noteFailed ? "Isi catatan gagal dimuat." : "Memuat catatan nomor ini…"}</p>
            )
          ) : video ? (
            <ReflectionVideo src={video} number={active.number} title={active.title} />
          ) : (
            <p className="reflection-empty">Video belum tersedia.</p>
          )}
        </div>

        <a className="reflection-source" href={active.href} target="_blank" rel="noreferrer">
          Lihat berkas sumber di GitHub ↗
        </a>
      </div>
    </div>
  );
}
