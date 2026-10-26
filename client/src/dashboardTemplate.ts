// Data template kemarin (14 Okt 2026, commit 6135b7a), disalin verbatim dari
// server/src/actions.ts. Versi bisa-diisi TIDAK mengubah template ini di repo:
// template hanya dibaca sebagai nilai awal localStorage dan sebagai target
// tombol "Reset ke template kemarin". Perubahan pengguna hidup di browser
// (lihat localStore.ts), bukan di berkas ini.

export type Subject = "fisika" | "matwa" | "matlan";
export type Difficulty = "LOTS" | "MOTS" | "HOTS";

export type DayPlan = {
  day: number; total: number; lots: number; mots: number; hots: number;
  fisika: number; matwa: number; matlan: number;
};
export type Bank = { subject: Subject; label: string; lots: number; mots: number; hots: number };
export type Question = {
  number: number; topic: string; status: "benar" | "sebagian" | "salah";
  resolved?: boolean; earned: number; possible: number; note: string;
};
export type Assessment = {
  subject: Subject; label: string; planDay: number; dayLabel: string; date: string;
  completed: number; questions: Question[];
};
export type FirstTrySubject = {
  subject: Subject; assigned: number; attempted: number; correct: number;
  accuracy: number; reflectedCorrect?: number;
};
export type DifficultyResult = { difficulty: Difficulty; correct: number; assigned: number; accuracy: number };
export type FirstTryDay = {
  day: number; label: string; date: string; assigned: number; attempted: number;
  unanswered: number; correct: number; accuracy: number; averageAccuracy: number;
  timer?: string; difficultyResults?: DifficultyResult[]; subjects: FirstTrySubject[];
};
export type Skill = {
  subject: Subject; label: string; correct: number; attempted: number; assigned: number;
  accuracy: number; priority: string; mastered: string[]; wrongTopics: string[]; unansweredTopics: string[];
};
export type Reflection = {
  day: number; number: number; code: string; subject: Subject; type: "note" | "video";
  gap?: "wrong" | "unanswered"; title: string; focus: string; href: string; duration?: string;
  // Hanya untuk baris yang ditambahkan/diubah lewat formulir isi data:
  // isi catatan KaTeX (Markdown + $...$) dan/atau tautan gambar diagram.
  // Baris template tidak punya field ini dan tetap dirender dari loader lama.
  noteText?: string; imageUrl?: string;
};
export type Dashboard = {
  programDay: number; planTotal: number; excludedUnverified: number;
  days: DayPlan[]; banks: Bank[]; assessments: Assessment[];
  firstTryDays: FirstTryDay[]; skills: Skill[]; reflections: Reflection[];
  reflectionRepositoryUrl: string; difficultyOrder: Difficulty[]; updatedAt: string;
};

export const dashboardTemplate: Dashboard = {
  programDay: 3,
  planTotal: 677,
  excludedUnverified: 32,
  updatedAt: "2026-10-13",
  difficultyOrder: ["LOTS", "MOTS", "HOTS"],
  days: [
    { day: 1, total: 46, lots: 26, mots: 17, hots: 3, fisika: 18, matwa: 17, matlan: 11 },
    { day: 2, total: 46, lots: 26, mots: 17, hots: 3, fisika: 17, matwa: 18, matlan: 11 },
    { day: 3, total: 45, lots: 26, mots: 16, hots: 3, fisika: 17, matwa: 17, matlan: 11 },
    { day: 4, total: 45, lots: 18, mots: 21, hots: 6, fisika: 17, matwa: 16, matlan: 12 },
    { day: 5, total: 45, lots: 18, mots: 21, hots: 6, fisika: 17, matwa: 16, matlan: 12 },
    { day: 6, total: 45, lots: 18, mots: 21, hots: 6, fisika: 15, matwa: 17, matlan: 13 },
    { day: 7, total: 45, lots: 12, mots: 23, hots: 10, fisika: 14, matwa: 17, matlan: 14 },
    { day: 8, total: 45, lots: 12, mots: 23, hots: 10, fisika: 14, matwa: 17, matlan: 14 },
    { day: 9, total: 45, lots: 12, mots: 23, hots: 10, fisika: 13, matwa: 18, matlan: 14 },
    { day: 10, total: 45, lots: 8, mots: 23, hots: 14, fisika: 12, matwa: 17, matlan: 16 },
    { day: 11, total: 45, lots: 8, mots: 23, hots: 14, fisika: 15, matwa: 17, matlan: 13 },
    { day: 12, total: 45, lots: 8, mots: 23, hots: 14, fisika: 14, matwa: 15, matlan: 16 },
    { day: 13, total: 45, lots: 5, mots: 22, hots: 18, fisika: 13, matwa: 16, matlan: 16 },
    { day: 14, total: 45, lots: 4, mots: 23, hots: 18, fisika: 13, matwa: 16, matlan: 16 },
    { day: 15, total: 45, lots: 3, mots: 24, hots: 18, fisika: 12, matwa: 16, matlan: 17 },
  ],
  banks: [
    { subject: "fisika", label: "Fisika", lots: 82, mots: 113, hots: 26 },
    { subject: "matwa", label: "Matematika Wajib", lots: 70, mots: 120, hots: 60 },
    { subject: "matlan", label: "Matematika Lanjutan", lots: 52, mots: 87, hots: 67 },
  ],
  firstTryDays: [
    {
      day: 1,
      label: "Hari 01",
      date: "2026-10-11",
      assigned: 46,
      attempted: 28,
      unanswered: 18,
      correct: 17,
      accuracy: 61,
      averageAccuracy: 61,
      subjects: [
        { subject: "fisika", assigned: 18, attempted: 9, correct: 2, accuracy: 22, reflectedCorrect: 15 },
        { subject: "matwa", assigned: 17, attempted: 11, correct: 8, accuracy: 73, reflectedCorrect: 16 },
        { subject: "matlan", assigned: 11, attempted: 8, correct: 7, accuracy: 88, reflectedCorrect: 11 },
      ],
    },
    {
      day: 2,
      label: "Hari 02",
      date: "2026-10-12",
      assigned: 46,
      attempted: 29,
      unanswered: 17,
      correct: 18,
      accuracy: 39,
      averageAccuracy: 40,
      timer: "2 jam 6 menit · 12:24–14:30 WIB",
      difficultyResults: [
        { difficulty: "LOTS", correct: 12, assigned: 26, accuracy: 46 },
        { difficulty: "MOTS", correct: 3, assigned: 17, accuracy: 18 },
        { difficulty: "HOTS", correct: 3, assigned: 3, accuracy: 100 },
      ],
      subjects: [
        { subject: "fisika", assigned: 17, attempted: 8, correct: 4, accuracy: 24 },
        { subject: "matwa", assigned: 18, attempted: 13, correct: 9, accuracy: 50 },
        { subject: "matlan", assigned: 11, attempted: 8, correct: 5, accuracy: 45 },
      ],
    },
    {
      day: 3,
      label: "Hari 03",
      date: "2026-10-13",
      assigned: 46,
      attempted: 25,
      unanswered: 21,
      correct: 16,
      accuracy: 35,
      averageAccuracy: 33,
      timer: "2 jam · 10:00–12:00 WIB",
      subjects: [
        { subject: "fisika", assigned: 18, attempted: 9, correct: 6, accuracy: 33 },
        { subject: "matwa", assigned: 17, attempted: 12, correct: 8, accuracy: 47 },
        { subject: "matlan", assigned: 11, attempted: 4, correct: 2, accuracy: 18 },
      ],
    },
  ],
  assessments: [
    {
      subject: "fisika",
      label: "Fisika",
      planDay: 0,
      dayLabel: "Hari 00",
      date: "2026-10-09",
      completed: 5,
      questions: [
        { number: 1, topic: "Katrol + gesekan", status: "benar", earned: 1, possible: 1, note: "Setup dua persamaan dan koreksi gaya gesek tepat." },
        { number: 2, topic: "Gaya minimum bidang miring", status: "sebagian", earned: 2, possible: 3, note: "Pernyataan (3) salah: F minimum = 150√2, bukan 100√2." },
        { number: 3, topic: "Tumbukan elastik", status: "benar", earned: 1, possible: 1, note: "Momentum + e = 1 memberi v₁′ = −3 m/s." },
        { number: 4, topic: "Usaha / gaya miring", status: "sebagian", earned: 3, possible: 4, note: "s = 25 m sudah benar; keraguan pada penandaan yang keliru." },
        { number: 5, topic: "Energi kinetik proyektil", status: "salah", resolved: true, earned: 0, possible: 1, note: "Catatan 10 Okt: benar memakai ½mv²; di puncak vᵧ = 0 dan Eₖ = E/4. Sudah dikuasai setelah koreksi." },
      ],
    },
    {
      subject: "matlan",
      label: "Matematika Lanjutan",
      planDay: 0,
      dayLabel: "Hari 00",
      date: "2026-10-10",
      completed: 6,
      questions: [
        { number: 1, topic: "Matriks invers", status: "benar", earned: 1, possible: 1, note: "p = 2q; pilihan (1, 3, 5)." },
        { number: 2, topic: "Fungsi eksponen", status: "benar", earned: 1, possible: 1, note: "S, B, B." },
        { number: 3, topic: "Vektor", status: "benar", earned: 1, possible: 1, note: "w = u − v; pilihan (1, 2, 4)." },
        { number: 4, topic: "Dilatasi", status: "benar", earned: 1, possible: 1, note: "Luas × k²; hasil 90." },
        { number: 5, topic: "Limit piecewise", status: "benar", earned: 1, possible: 1, note: "Limit kiri-kanan diperiksa tepat." },
        { number: 6, topic: "Limit trigonometri", status: "salah", resolved: true, earned: 0, possible: 1, note: "Catatan 10 Okt: hasil −1/3 dengan tanda minus tepat. Sudah dikuasai setelah koreksi." },
      ],
    },
  ],
  reflectionRepositoryUrl: "https://github.com/agentpixelated/tka-refleksi",
  reflections: [
    { day: 1, number: 2, code: "F1-No.2", subject: "fisika", type: "note", title: "Menyusul", focus: "GLB vs GLBB; menyusul berarti posisi sama", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no02-menyusul.md" },
    { day: 1, number: 5, code: "F1-No.11", subject: "fisika", type: "note", title: "Tumbukan", focus: "Momentum kekal dan koefisien restitusi", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no05-tumbukan.md" },
    { day: 1, number: 8, code: "F1-No.14", subject: "fisika", type: "note", title: "Pegas", focus: "Energi potensial pegas menjadi energi kinetik", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no08-pegas.md" },
    { day: 1, number: 9, code: "F1-No.18", subject: "fisika", type: "note", title: "Fase gelombang", focus: "Beda fase dibanding beda jarak", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no09-fase-gelombang.md" },
    { day: 1, number: 10, code: "F1-No.19", subject: "fisika", type: "note", title: "Gelombang berjalan", focus: "Membaca persamaan gelombang berjalan", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no10-gelombang-berjalan.md" },
    { day: 1, number: 17, code: "W1-No.18", subject: "matwa", type: "note", title: "Peluang kombinasi", focus: "Kombinasi dan arti paling sedikit", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no17-peluang-kombinasi.md" },
    { day: 1, number: 19, code: "L1-No.7", subject: "matlan", type: "note", title: "Persamaan lingkaran", focus: "Pusat, jari-jari, dan bentuk baku lingkaran", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no19-lingkaran.md" },
    { day: 1, number: 21, code: "L1-No.21", subject: "matlan", type: "note", title: "Titik pada lingkaran", focus: "Menguji kedudukan titik terhadap lingkaran", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no21-titik-pada-lingkaran.md" },
    { day: 1, number: 25, code: "W6-No.15", subject: "matwa", type: "note", title: "Peluang dari tabel", focus: "Membaca tabel kontingensi", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no25-peluang-tabel.md" },
    { day: 1, number: 28, code: "F1-No.6", subject: "fisika", type: "note", title: "Tikungan", focus: "Gaya sentripetal dan kecepatan maksimum", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no28-tikungan.md" },
    { day: 1, number: 29, code: "F1-No.7", subject: "fisika", type: "note", title: "Momentum sudut", focus: "Kekekalan momentum sudut", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no29-momentum-sudut.md" },
    { day: 1, number: 30, code: "F1-No.8", subject: "fisika", type: "note", title: "Impuls", focus: "Impuls sebagai perubahan momentum", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no30-impuls.md" },
    { day: 1, number: 34, code: "W1-No.6", subject: "matwa", type: "note", title: "Fungsi invers", focus: "Invers sebagai fungsi pembalik", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no34-fungsi-invers.md" },
    { day: 1, number: 35, code: "W1-No.7", subject: "matwa", type: "note", title: "Barisan aritmetika", focus: "Suku dan beda tetap", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no35-barisan-aritmetika.md" },
    { day: 1, number: 36, code: "W1-No.9", subject: "matwa", type: "note", title: "Program linear", focus: "Daerah layak dan nilai optimum", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no36-program-linear.md" },
    { day: 1, number: 40, code: "L1-No.3", subject: "matlan", type: "note", title: "Persamaan garis", focus: "Gradien dan bentuk persamaan garis", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no40-persamaan-garis.md" },
    { day: 1, number: 42, code: "F2-No.7", subject: "fisika", type: "note", title: "Hukum Archimedes", focus: "Gaya angkat dan syarat melayang", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no42-archimedes.md" },
    { day: 1, number: 44, code: "W1-No.3", subject: "matwa", type: "note", title: "Teori bilangan", focus: "Kongruensi dan sisa pembagian", href: "https://github.com/agentpixelated/tka-refleksi/blob/main/notes/no44-teori-bilangan.md" },
    { day: 1, number: 3, code: "F1-No.3", subject: "fisika", type: "video", title: "Proyektil", focus: "Waktu jatuh dari gerak vertikal; horizontal mengikuti Hukum I", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no03-proyektil-46s.mp4", duration: "46 dtk" },
    { day: 1, number: 4, code: "F1-No.4", subject: "fisika", type: "video", title: "Kecukupan data", focus: "Jangan memasukkan konstanta yang tidak diberikan", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no04-kecukupan-46s.mp4", duration: "46 dtk" },
    { day: 1, number: 6, code: "F1-No.12", subject: "fisika", type: "video", title: "Katrol bermassa", focus: "Torsi pada katrol membuat T₁ berbeda dari T₂", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no06-katrol-46s.mp4", duration: "46 dtk" },
    { day: 1, number: 7, code: "F1-No.13", subject: "fisika", type: "video", title: "Torsi", focus: "Keseimbangan ditentukan torsi, bukan massa saja", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no07-torsi-47s.mp4", duration: "47 dtk" },
    { day: 1, number: 16, code: "W1-No.17", subject: "matwa", type: "video", title: "Identitas sin 2x", focus: "Faktor dua sudah ada dalam identitas sin 2x", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no16-sin2x-45s.mp4", duration: "45 dtk" },
    { day: 1, number: 23, code: "F3-No.3", subject: "fisika", type: "video", title: "Iklim", focus: "Uji satu per satu dampaknya terhadap CO₂", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no23-iklim-42s.mp4", duration: "42 dtk" },
    { day: 1, number: 27, code: "F1-No.5", subject: "fisika", type: "video", title: "Lift diperlambat", focus: "Percepatan berlawanan arah dengan kecepatan", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no27-lift-46s.mp4", duration: "46 dtk" },
    { day: 1, number: 31, code: "F1-No.9", subject: "fisika", type: "video", title: "Hukum III Newton", focus: "Aksi-reaksi bekerja pada benda yang berbeda", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no31-hukum3-46s.mp4", duration: "46 dtk" },
    { day: 1, number: 33, code: "W1-No.5", subject: "matwa", type: "video", title: "Domain fungsi", focus: "Penyebut tidak boleh nol; ujung interval terbuka", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no33-domain-48s.mp4", duration: "48 dtk" },
    { day: 1, number: 37, code: "W1-No.11", subject: "matwa", type: "video", title: "Sudut garis dan bidang", focus: "Periksa dahulu apakah garis berada di dalam bidang", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no37-sudut-51s.mp4", duration: "51 dtk" },
    { day: 1, number: 41, code: "L1-No.4", subject: "matlan", type: "video", title: "Akar kembar", focus: "Tanda ± selalu menghasilkan dua kasus", href: "https://raw.githubusercontent.com/agentpixelated/tka-refleksi/main/videos/no41-akarkembar-47s.mp4", duration: "47 dtk" },
    { day: 2, number: 3, code: "Hari 02 · No. 3", subject: "fisika", type: "note", title: "Bernoulli pada sayap", focus: "Kecepatan aliran, selisih tekanan, dan gaya angkat", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 7, code: "Hari 02 · No. 7", subject: "fisika", type: "note", title: "GLBB pengereman", focus: "Tanda percepatan saat kendaraan melambat", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 8, code: "Hari 02 · No. 8", subject: "fisika", type: "note", title: "Katrol bermassa", focus: "Dua tegangan dan dinamika rotasi katrol", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 9, code: "Hari 02 · No. 9", subject: "fisika", type: "note", title: "Hukum I Newton", focus: "Resultan nol dan keadaan gerak benda", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 27, code: "Hari 02 · No. 27", subject: "fisika", type: "note", title: "Energi gerak harmonik", focus: "Energi kinetik dan potensial pada GHS", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 28, code: "Hari 02 · No. 28", subject: "fisika", type: "note", title: "Periode bandul", focus: "Hubungan panjang, gravitasi, dan periode", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 30, code: "Hari 02 · No. 30", subject: "fisika", type: "note", title: "Taraf intensitas", focus: "Skala desibel dan perbandingan intensitas", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 31, code: "Hari 02 · No. 31", subject: "fisika", type: "note", title: "Mesin kalor", focus: "Efisiensi dari kerja dan kalor", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 32, code: "Hari 02 · No. 32", subject: "fisika", type: "note", title: "Kalorimetri", focus: "Asas Black dan keseimbangan termal", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 13, code: "Hari 02 · No. 13", subject: "matwa", type: "note", title: "Round-robin", focus: "Menghitung pasangan pertandingan tanpa duplikasi", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 17, code: "Hari 02 · No. 17", subject: "matwa", type: "note", title: "Menabung dan deret", focus: "Menerjemahkan pola tabungan menjadi deret", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 19, code: "Hari 02 · No. 19", subject: "matwa", type: "note", title: "Jarak dalam ruang", focus: "Jarak titik, garis, dan bidang pada geometri 3D", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 34, code: "Hari 02 · No. 34", subject: "matwa", type: "note", title: "Jurusan dan aturan cosinus", focus: "Sudut arah lalu panjang dengan aturan cosinus", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 35, code: "Hari 02 · No. 35", subject: "matwa", type: "note", title: "Peluang bersyarat", focus: "Membatasi ruang sampel pada syarat", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 39, code: "Hari 02 · No. 39", subject: "matlan", type: "note", title: "Rumus Vieta", focus: "Jumlah dan hasil kali akar tanpa menyelesaikan persamaan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 41, code: "Hari 02 · No. 41", subject: "matlan", type: "note", title: "Refleksi dan luas", focus: "Transformasi titik lalu hitung luas bayangan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 43, code: "Hari 02 · No. 43", subject: "matlan", type: "note", title: "Rotasi berpusat (1,1)", focus: "Translasi ke pusat, rotasi, lalu translasi balik", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 2, number: 1, code: "Hari 02 · No. 1", subject: "fisika", type: "video", title: "Linierisasi Coulomb", focus: "Membaca opsi sebelum menyusun bentuk linear", href: "https://github.com/agentpixelated/tka-refleksi", duration: "40 dtk" },
    { day: 2, number: 4, code: "Hari 02 · No. 4", subject: "fisika", type: "video", title: "Pemuaian lubang", focus: "Lubang ikut memuai, bukan menyusut", href: "https://github.com/agentpixelated/tka-refleksi", duration: "39 dtk" },
    { day: 2, number: 6, code: "Hari 02 · No. 6", subject: "fisika", type: "video", title: "Kinematika berpapasan", focus: "Samakan posisi lalu verifikasi angka", href: "https://github.com/agentpixelated/tka-refleksi", duration: "35 dtk" },
    { day: 2, number: 29, code: "Hari 02 · No. 29", subject: "fisika", type: "video", title: "Efek Doppler", focus: "Dua persamaan untuk dua besaran yang belum diketahui", href: "https://github.com/agentpixelated/tka-refleksi", duration: "37 dtk" },
    { day: 2, number: 12, code: "Hari 02 · No. 12", subject: "matwa", type: "video", title: "Deret geometri", focus: "Bedakan jumlah deret dari suku ke-n", href: "https://github.com/agentpixelated/tka-refleksi", duration: "31 dtk" },
    { day: 2, number: 14, code: "Hari 02 · No. 14", subject: "matwa", type: "video", title: "Eksponen", focus: "Jaga operasi pangkat saat menyamakan basis", href: "https://github.com/agentpixelated/tka-refleksi", duration: "32 dtk" },
    { day: 2, number: 36, code: "Hari 02 · No. 36", subject: "matwa", type: "video", title: "Koreksi rata-rata", focus: "Tentukan arah koreksi agar tanda tidak terbalik", href: "https://github.com/agentpixelated/tka-refleksi", duration: "31 dtk" },
    { day: 2, number: 38, code: "Hari 02 · No. 38", subject: "matwa", type: "video", title: "Kedudukan garis kubus", focus: "Uji kedudukan garis secara spasial dalam kubus", href: "https://github.com/agentpixelated/tka-refleksi", duration: "41 dtk" },
    { day: 2, number: 22, code: "Hari 02 · No. 22", subject: "matlan", type: "video", title: "Periode trigonometri", focus: "Turunkan periode dari bentuk fungsi", href: "https://github.com/agentpixelated/tka-refleksi", duration: "40 dtk" },
    { day: 2, number: 23, code: "Hari 02 · No. 23", subject: "matlan", type: "video", title: "Limit", focus: "Lacak tanda minus sampai hasil akhir", href: "https://github.com/agentpixelated/tka-refleksi", duration: "41 dtk" },
    { day: 2, number: 40, code: "Hari 02 · No. 40", subject: "matlan", type: "video", title: "Persamaan akar", focus: "Periksa akar dengan substitusi kembali", href: "https://github.com/agentpixelated/tka-refleksi", duration: "42 dtk" },
    { day: 3, number: 3, code: "Hari 03 · No. 3", subject: "fisika", type: "note", gap: "unanswered", title: "Entropi", focus: "Ekspansi bebas: entropi naik saat ruang gerak molekul bertambah", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 6, code: "Hari 03 · No. 6", subject: "fisika", type: "note", gap: "unanswered", title: "Tegangan tali katrol", focus: "Turunkan tegangan dari Hukum II Newton pada tiap benda", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 7, code: "Hari 03 · No. 7", subject: "fisika", type: "note", gap: "unanswered", title: "Proyektil pesawat SAR", focus: "Pisahkan gerak horizontal dan vertikal lalu satukan lewat waktu", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 14, code: "Hari 03 · No. 14", subject: "matwa", type: "note", gap: "unanswered", title: "Diagram batang", focus: "Baca skala, jumlahkan data yang ada, lalu kurangi dari total", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 17, code: "Hari 03 · No. 17", subject: "matwa", type: "note", gap: "unanswered", title: "Kenaikan month-on-month", focus: "Bandingkan setiap bulan dengan bulan tepat sebelumnya", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 22, code: "Hari 03 · No. 22", subject: "matlan", type: "note", gap: "unanswered", title: "Matriks invers", focus: "Dari persamaan matriks, kalikan invers pada sisi yang tepat", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 24, code: "Hari 03 · No. 24", subject: "matlan", type: "note", gap: "unanswered", title: "Vektor dan SPLDV", focus: "Samakan komponen vektor lalu selesaikan sistem persamaan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 27, code: "Hari 03 · No. 27", subject: "fisika", type: "note", gap: "unanswered", title: "Transfer daya maksimum", focus: "Daya maksimum terjadi saat beban sama dengan hambatan dalam", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 30, code: "Hari 03 · No. 30", subject: "fisika", type: "note", gap: "unanswered", title: "Gesek dua benda", focus: "Benda atas dipercepat oleh gaya gesek statis", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 31, code: "Hari 03 · No. 31", subject: "fisika", type: "note", gap: "unanswered", title: "Gerak melingkar vertikal", focus: "Susun resultan radial dari gaya sentripetal dan berat", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 32, code: "Hari 03 · No. 32", subject: "fisika", type: "note", gap: "unanswered", title: "Mesin Carnot", focus: "Gunakan suhu mutlak Kelvin dalam efisiensi Carnot", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 33, code: "Hari 03 · No. 33", subject: "fisika", type: "note", gap: "unanswered", title: "Tikungan miring", focus: "Uraikan gaya normal tanpa mengandalkan gaya gesek", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 34, code: "Hari 03 · No. 34", subject: "matwa", type: "note", gap: "unanswered", title: "SPLTV", focus: "Eliminasi satu variabel pada satu waktu", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 39, code: "Hari 03 · No. 39", subject: "matlan", type: "note", gap: "unanswered", title: "Turunan implisit", focus: "Turunkan kedua ruas lalu substitusi titik yang diberikan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 40, code: "Hari 03 · No. 40", subject: "matlan", type: "note", gap: "unanswered", title: "Rasionalisasi", focus: "Sederhanakan bentuk akar sebelum menguadratkan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 41, code: "Hari 03 · No. 41", subject: "matlan", type: "note", gap: "unanswered", title: "Nilai mutlak", focus: "Pecah kasus pada titik yang membuat isi nilai mutlak nol", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 43, code: "Hari 03 · No. 43", subject: "matlan", type: "note", gap: "unanswered", title: "Titik puncak parabola", focus: "Gunakan informasi bahwa koordinat puncak adalah (m, m)", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 44, code: "Hari 03 · No. 44", subject: "matlan", type: "note", gap: "unanswered", title: "Energi getaran", focus: "Hubungkan energi potensial, amplitudo, dan simpangan", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 46, code: "Hari 03 · No. 46", subject: "matlan", type: "note", gap: "unanswered", title: "Garis singgung bersama", focus: "Dua kurva bersinggungan jika titik dan gradiennya sama", href: "https://github.com/agentpixelated/tka-refleksi" },
    { day: 3, number: 8, code: "Hari 03 · No. 8", subject: "fisika", type: "video", gap: "wrong", title: "Usaha", focus: "Mulai dari W = F s cos θ dan lacak arah gaya", href: "https://github.com/agentpixelated/tka-refleksi", duration: "31 dtk" },
    { day: 3, number: 19, code: "Hari 03 · No. 19", subject: "matwa", type: "video", gap: "wrong", title: "Off-by-one pola bilangan", focus: "Bedakan banyak suku dengan selisih indeks", href: "https://github.com/agentpixelated/tka-refleksi", duration: "29 dtk" },
    { day: 3, number: 20, code: "Hari 03 · No. 20", subject: "matwa", type: "video", gap: "wrong", title: "Keliling dan aritmetika uang", focus: "Jaga faktor dua saat menerjemahkan keliling ke biaya", href: "https://github.com/agentpixelated/tka-refleksi", duration: "27 dtk" },
    { day: 3, number: 21, code: "Hari 03 · No. 21", subject: "matwa", type: "video", gap: "wrong", title: "Modus data kelompok", focus: "Ambil d₁ dan d₂ dari selisih frekuensi kelas modus", href: "https://github.com/agentpixelated/tka-refleksi", duration: "28 dtk" },
    { day: 3, number: 23, code: "Hari 03 · No. 23", subject: "matlan", type: "video", gap: "wrong", title: "Eksponen", focus: "Samakan basis lalu jaga operasi pada pangkat", href: "https://github.com/agentpixelated/tka-refleksi", duration: "32 dtk" },
    { day: 3, number: 26, code: "Hari 03 · No. 26", subject: "matlan", type: "video", gap: "wrong", title: "Lingkaran", focus: "Visualkan pusat dan radius sebelum ekspansi kuadrat", href: "https://github.com/agentpixelated/tka-refleksi", duration: "33 dtk" },
    { day: 3, number: 28, code: "Hari 03 · No. 28", subject: "fisika", type: "video", gap: "wrong", title: "Rangkaian paralel", focus: "Tegangan cabang sama; arus terbagi", href: "https://github.com/agentpixelated/tka-refleksi", duration: "32 dtk" },
    { day: 3, number: 29, code: "Hari 03 · No. 29", subject: "fisika", type: "video", gap: "wrong", title: "Gaya kontak", focus: "Pisahkan sistem keseluruhan dari satu benda", href: "https://github.com/agentpixelated/tka-refleksi", duration: "32 dtk" },
    { day: 3, number: 36, code: "Hari 03 · No. 36", subject: "matwa", type: "video", gap: "unanswered", title: "Sudut elevasi menara", focus: "Visualisasi segitiga siku-siku dari garis pandang", href: "https://github.com/agentpixelated/tka-refleksi", duration: "26 dtk" },
    { day: 3, number: 38, code: "Hari 03 · No. 38", subject: "matwa", type: "video", gap: "unanswered", title: "Balok 3D", focus: "Visualisasi diagonal dan kedudukan unsur pada balok", href: "https://github.com/agentpixelated/tka-refleksi", duration: "30 dtk" },
    { day: 3, number: 45, code: "Hari 03 · No. 45", subject: "matlan", type: "video", gap: "wrong", title: "Operator fungsi", focus: "Kerjakan operasi sesuai definisi sebelum substitusi", href: "https://github.com/agentpixelated/tka-refleksi", duration: "32 dtk" },
  ],
  skills: [
    {
      subject: "fisika",
      label: "Fisika",
      correct: 6,
      attempted: 9,
      assigned: 18,
      accuracy: 33,
      priority: "Mulai dari hukum dasar sebelum memilih rumus. Fokus pada entropi, dinamika katrol dan gerak proyektil, lalu rapikan pemodelan usaha, rangkaian paralel, serta gaya kontak.",
      mastered: [
        "Katrol + gesekan (Hari 00)",
        "Tumbukan elastik (Hari 00)",
        "Energi kinetik proyektil di titik tertinggi (setelah koreksi)",
        "HOTS Hari 02 — 3/3 benar",
      ],
      wrongTopics: [
        "No. 8 · Usaha — arah gaya dan faktor cos θ",
        "No. 28 · Rangkaian paralel — tegangan sama, arus terbagi",
        "No. 29 · Gaya kontak — pisahkan sistem dan satu benda",
      ],
      unansweredTopics: [
        "No. 3 · Entropi dan ekspansi bebas",
        "No. 6 · Tegangan tali katrol",
        "No. 7 · Proyektil pesawat SAR",
        "No. 27 · Transfer daya maksimum",
        "No. 30 · Gesek statis dua benda",
        "No. 31 · Gerak melingkar vertikal",
        "No. 32 · Mesin Carnot",
        "No. 33 · Tikungan miring tanpa gesek",
      ],
    },
    {
      subject: "matwa",
      label: "Matematika Wajib",
      correct: 8,
      attempted: 12,
      assigned: 17,
      accuracy: 47,
      priority: "Hentikan kesalahan baca sebelum menghitung: cek indeks awal-akhir, faktor dua pada keliling, serta d₁ dan d₂ pada modus. Geometri menara dan balok dipelajari lewat visualisasi.",
      mastered: [
        "Pythagoras dan bentuk akar (Hari 00)",
        "Deret geometri (Hari 00)",
        "Limit dasar (Hari 00)",
        "SPLDV dan pencacahan dasar (Hari 00)",
      ],
      wrongTopics: [
        "No. 19 · Pola bilangan — off-by-one",
        "No. 20 · Keliling dan biaya — faktor dua",
        "No. 21 · Modus data kelompok — d₁/d₂",
      ],
      unansweredTopics: [
        "No. 14 · Data hilang pada diagram batang",
        "No. 17 · Kenaikan month-on-month",
        "No. 34 · SPLTV",
        "No. 36 · Sudut elevasi menara — visualisasi",
        "No. 38 · Geometri balok 3D — visualisasi",
      ],
    },
    {
      subject: "matlan",
      label: "Matematika Lanjutan",
      correct: 2,
      attempted: 4,
      assigned: 11,
      accuracy: 18,
      priority: "Ini prioritas terbesar. Bangun ulang fungsi, limit, turunan, vektor, dan transformasi dari bentuk dasar; setiap ekspansi kuadrat harus diperiksa tanda dan suku silangnya.",
      mastered: [
        "Matriks invers (Hari 00)",
        "Fungsi eksponen (Hari 00)",
        "Vektor (Hari 00)",
        "Dilatasi (Hari 00)",
        "Limit trigonometri dengan tanda tepat (setelah koreksi Hari 00)",
      ],
      wrongTopics: [
        "No. 23 · Eksponen — disiplin operasi pangkat",
        "No. 26 · Lingkaran — tanda saat ekspansi kuadrat",
        "No. 45 · Operator fungsi — ikuti definisi operasi",
      ],
      unansweredTopics: [
        "No. 22 · Matriks invers dari persamaan",
        "No. 24 · Vektor menjadi SPLDV",
        "No. 39 · Turunan implisit",
        "No. 40 · Rasionalisasi",
        "No. 41 · Nilai mutlak",
        "No. 43 · Titik puncak parabola",
        "No. 44 · Energi getaran",
        "No. 46 · Garis singgung bersama",
      ],
    },
  ],
};
