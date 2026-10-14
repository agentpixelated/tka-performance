DROP TABLE IF EXISTS entries;
--> statement-breakpoint
CREATE TABLE tka_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 15),
  subject TEXT NOT NULL CHECK (subject IN ('fisika', 'matwa', 'matlan')),
  session_date TEXT NOT NULL,
  lots_attempted INTEGER NOT NULL DEFAULT 0 CHECK (lots_attempted >= 0),
  lots_correct INTEGER NOT NULL DEFAULT 0 CHECK (lots_correct >= 0 AND lots_correct <= lots_attempted),
  mots_attempted INTEGER NOT NULL DEFAULT 0 CHECK (mots_attempted >= 0),
  mots_correct INTEGER NOT NULL DEFAULT 0 CHECK (mots_correct >= 0 AND mots_correct <= mots_attempted),
  hots_attempted INTEGER NOT NULL DEFAULT 0 CHECK (hots_attempted >= 0),
  hots_correct INTEGER NOT NULL DEFAULT 0 CHECK (hots_correct >= 0 AND hots_correct <= hots_attempted),
  source TEXT NOT NULL,
  topics TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_tka_sessions_day ON tka_sessions(day_number);
--> statement-breakpoint
CREATE INDEX idx_tka_sessions_date ON tka_sessions(session_date);