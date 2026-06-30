const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'han_hoc.db')

const db = new Database(DB_PATH)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS vocabulary (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chinese     TEXT    NOT NULL,
    pinyin      TEXT    NOT NULL,
    vietnamese  TEXT    NOT NULL,
    example     TEXT    DEFAULT '',
    hsk_level   INTEGER NOT NULL CHECK (hsk_level BETWEEN 1 AND 9)
  );

  CREATE TABLE IF NOT EXISTS grammar (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    hsk_level   INTEGER NOT NULL,
    stt         INTEGER,
    pattern     TEXT    NOT NULL,
    explanation TEXT    NOT NULL,
    examples    TEXT    NOT NULL DEFAULT '[]',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    hsk_level   INTEGER NOT NULL,
    word_id     INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    status      TEXT    NOT NULL CHECK (status IN ('known', 'unknown')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE (word_id)
  );
`)

// Thêm bảng mới
db.exec(`
  CREATE TABLE IF NOT EXISTS writing_history (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    target_word        TEXT NOT NULL,
    user_sentence      TEXT NOT NULL,
    score              INTEGER,
    feedback           TEXT,
    corrected_sentence TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    topic         TEXT NOT NULL,
    hsk_level     INTEGER NOT NULL,
    messages      TEXT NOT NULL DEFAULT '[]',
    message_count INTEGER NOT NULL DEFAULT 0,
    error_count   INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// Bảng câu luyện gõ
db.exec(`
  CREATE TABLE IF NOT EXISTS typing_sentences (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    chinese     TEXT    NOT NULL,
    vietnamese  TEXT    NOT NULL,
    pinyin      TEXT,
    source      TEXT    NOT NULL DEFAULT 'claude',
    hsk_level   INTEGER NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Bảng nhật ký XP (gamification: XP, streak, huy hiệu)
db.exec(`
  CREATE TABLE IF NOT EXISTS xp_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    amount      INTEGER NOT NULL,
    reason      TEXT    NOT NULL,
    meta        TEXT    DEFAULT '{}',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`)

// Thêm cột SRS vào progress nếu chưa có
const progressCols = db.prepare('PRAGMA table_info(progress)').all().map(c => c.name)
if (!progressCols.includes('next_review'))  db.exec('ALTER TABLE progress ADD COLUMN next_review TEXT')
if (!progressCols.includes('interval'))     db.exec('ALTER TABLE progress ADD COLUMN interval INTEGER DEFAULT 1')
if (!progressCols.includes('ease_factor'))  db.exec('ALTER TABLE progress ADD COLUMN ease_factor REAL DEFAULT 2.5')


module.exports = db
