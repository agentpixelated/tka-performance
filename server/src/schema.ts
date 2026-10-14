import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tkaSessions = sqliteTable("tka_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dayNumber: integer("day_number").notNull(),
  subject: text("subject", { enum: ["fisika", "matwa", "matlan"] }).notNull(),
  sessionDate: text("session_date").notNull(),
  lotsAttempted: integer("lots_attempted").notNull().default(0),
  lotsCorrect: integer("lots_correct").notNull().default(0),
  motsAttempted: integer("mots_attempted").notNull().default(0),
  motsCorrect: integer("mots_correct").notNull().default(0),
  hotsAttempted: integer("hots_attempted").notNull().default(0),
  hotsCorrect: integer("hots_correct").notNull().default(0),
  source: text("source").notNull(),
  topics: text("topics").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
