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

// Thêm cột SRS vào progress nếu chưa có
const progressCols = db.prepare('PRAGMA table_info(progress)').all().map(c => c.name)
if (!progressCols.includes('next_review'))  db.exec('ALTER TABLE progress ADD COLUMN next_review TEXT')
if (!progressCols.includes('interval'))     db.exec('ALTER TABLE progress ADD COLUMN interval INTEGER DEFAULT 1')
if (!progressCols.includes('ease_factor'))  db.exec('ALTER TABLE progress ADD COLUMN ease_factor REAL DEFAULT 2.5')

// Seed sample data if table is empty
const count = db.prepare('SELECT COUNT(*) as n FROM vocabulary').get()
if (count.n === 0) {
  const insert = db.prepare(`
    INSERT INTO vocabulary (chinese, pinyin, vietnamese, example, hsk_level)
    VALUES (@chinese, @pinyin, @vietnamese, @example, @hsk_level)
  `)

  const seed = db.transaction((words) => {
    for (const w of words) insert.run(w)
  })

  seed([
    // HSK 1
    { chinese: '你好', pinyin: 'nǐ hǎo',   vietnamese: 'Xin chào',          example: '你好！我是小明。',     hsk_level: 1 },
    { chinese: '谢谢', pinyin: 'xiè xie',  vietnamese: 'Cảm ơn',             example: '谢谢你的帮助！',      hsk_level: 1 },
    { chinese: '再见', pinyin: 'zài jiàn', vietnamese: 'Tạm biệt',           example: '明天见！再见！',       hsk_level: 1 },
    { chinese: '水',   pinyin: 'shuǐ',     vietnamese: 'Nước',               example: '我想喝水。',          hsk_level: 1 },
    { chinese: '吃',   pinyin: 'chī',      vietnamese: 'Ăn',                 example: '你吃饭了吗？',        hsk_level: 1 },
    { chinese: '喝',   pinyin: 'hē',       vietnamese: 'Uống',               example: '我喝咖啡。',          hsk_level: 1 },
    { chinese: '大',   pinyin: 'dà',       vietnamese: 'To, lớn',            example: '这个房子很大。',      hsk_level: 1 },
    { chinese: '小',   pinyin: 'xiǎo',     vietnamese: 'Nhỏ, bé',           example: '我有一只小猫。',      hsk_level: 1 },
    // HSK 2
    { chinese: '学习', pinyin: 'xué xí',   vietnamese: 'Học tập',            example: '我喜欢学习汉语。',    hsk_level: 2 },
    { chinese: '工作', pinyin: 'gōng zuò', vietnamese: 'Công việc / Làm việc', example: '他的工作很忙。',   hsk_level: 2 },
    { chinese: '朋友', pinyin: 'péng yǒu', vietnamese: 'Bạn bè',             example: '她是我的好朋友。',    hsk_level: 2 },
    { chinese: '时间', pinyin: 'shí jiān', vietnamese: 'Thời gian',          example: '你有时间吗？',        hsk_level: 2 },
    { chinese: '觉得', pinyin: 'jué de',   vietnamese: 'Cảm thấy, cho rằng', example: '我觉得这个很好。',   hsk_level: 2 },
    // HSK 3
    { chinese: '环境', pinyin: 'huán jìng', vietnamese: 'Môi trường',         example: '保护环境很重要。',   hsk_level: 3 },
    { chinese: '方便', pinyin: 'fāng biàn', vietnamese: 'Tiện lợi',           example: '住在这里很方便。',   hsk_level: 3 },
    { chinese: '经验', pinyin: 'jīng yàn',  vietnamese: 'Kinh nghiệm',        example: '他有很多工作经验。', hsk_level: 3 },
    { chinese: '认为', pinyin: 'rèn wéi',   vietnamese: 'Cho rằng, nghĩ',     example: '我认为这个方法很好。', hsk_level: 3 },
    // HSK 4
    { chinese: '影响', pinyin: 'yǐng xiǎng', vietnamese: 'Ảnh hưởng',         example: '天气影响了我们的计划。', hsk_level: 4 },
    { chinese: '解决', pinyin: 'jiě jué',    vietnamese: 'Giải quyết',         example: '我们需要解决这个问题。', hsk_level: 4 },
    { chinese: '表示', pinyin: 'biǎo shì',   vietnamese: 'Biểu thị, bày tỏ',  example: '他表示同意。',          hsk_level: 4 },
    // HSK 5
    { chinese: '逐渐', pinyin: 'zhú jiàn',   vietnamese: 'Dần dần, từng bước', example: '他的汉语逐渐提高了。',  hsk_level: 5 },
    { chinese: '尽管', pinyin: 'jǐn guǎn',   vietnamese: 'Mặc dù, tuy nhiên', example: '尽管很难，他还是坚持了。', hsk_level: 5 },
    // HSK 6
    { chinese: '融合', pinyin: 'róng hé',    vietnamese: 'Hòa nhập, hợp nhất', example: '文化融合促进了发展。',  hsk_level: 6 },
    { chinese: '彰显', pinyin: 'zhāng xiǎn', vietnamese: 'Thể hiện rõ, nêu bật', example: '这彰显了我们的价值观。', hsk_level: 6 },
  ])

  console.log('✅ Database seeded with sample vocabulary')
}

module.exports = db
