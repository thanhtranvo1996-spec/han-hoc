const express = require('express')
const db = require('../database/db')

const router = express.Router()

// GET /api/vocabulary — lấy tất cả từ (hỗ trợ ?limit=&offset= để phân trang)
router.get('/', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 100, 500)
  const offset = parseInt(req.query.offset) || 0

  const rows  = db.prepare('SELECT * FROM vocabulary LIMIT ? OFFSET ?').all(limit, offset)
  const total = db.prepare('SELECT COUNT(*) as n FROM vocabulary').get().n

  res.json({ total, limit, offset, data: rows })
})

// GET /api/vocabulary/search?q=từ — tìm kiếm
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.status(400).json({ error: 'Query param "q" is required' })

  const pattern = `%${q}%`
  const rows = db.prepare(`
    SELECT * FROM vocabulary
    WHERE chinese LIKE ? OR pinyin LIKE ? OR vietnamese LIKE ?
    LIMIT 50
  `).all(pattern, pattern, pattern)

  res.json({ query: q, count: rows.length, data: rows })
})

// GET /api/vocabulary/quiz?level=1&mode=han-to-viet&limit=10
router.get('/quiz', (req, res) => {
  const level = parseInt(req.query.level)
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)
  const mode  = req.query.mode === 'viet-to-han' ? 'viet-to-han' : 'han-to-viet'

  if (isNaN(level) || level < 1 || level > 9) {
    return res.status(400).json({ error: 'Query param "level" must be between 1 and 9' })
  }

  const pool = db.prepare('SELECT * FROM vocabulary WHERE hsk_level = ?').all(level)
  if (pool.length < 4) {
    return res.status(400).json({ error: 'Not enough words in this level (need at least 4)' })
  }

  // Fisher-Yates shuffle
  const shuffle = arr => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const questions = shuffle(pool).slice(0, limit).map(correct => {
    const distractors = shuffle(pool.filter(w => w.id !== correct.id)).slice(0, 3)
    const choices     = shuffle([correct, ...distractors])
    const correctIdx  = choices.findIndex(w => w.id === correct.id)

    if (mode === 'han-to-viet') {
      return {
        word_id:  correct.id,
        question: { chinese: correct.chinese, pinyin: correct.pinyin },
        answers:  choices.map(w => w.vietnamese),
        correct:  correctIdx,
      }
    } else {
      return {
        word_id:  correct.id,
        question: { vietnamese: correct.vietnamese, chinese: correct.chinese, pinyin: correct.pinyin },
        answers:  choices.map(w => w.chinese),
        correct:  correctIdx,
      }
    }
  })

  res.json({ level, mode, count: questions.length, data: questions })
})

// GET /api/vocabulary/due-today — từ cần ôn theo SRS
router.get('/due-today', (_req, res) => {
  const rows = db.prepare(`
    SELECT v.*, p.status, p.next_review, p.interval
    FROM vocabulary v
    JOIN progress p ON p.word_id = v.id
    WHERE DATE(p.next_review) <= DATE('now')
    ORDER BY p.next_review ASC
    LIMIT 100
  `).all()
  res.json({ count: rows.length, data: rows })
})

// GET /api/vocabulary/sentences?level=1&limit=10
router.get('/sentences', (req, res) => {
  const level = parseInt(req.query.level)
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)

  if (isNaN(level) || level < 1 || level > 9) {
    return res.status(400).json({ error: 'Query param "level" must be between 1 and 9' })
  }

  const pool = db.prepare(`
    SELECT * FROM vocabulary
    WHERE hsk_level = ? AND example IS NOT NULL AND example != ''
  `).all(level)

  if (pool.length === 0) return res.json({ level, count: 0, data: [] })

  const shuffle = arr => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // dùng unicode escape để tránh lỗi smart-quote trong editor
  const PUNCTS = new Set([
    '，','。','！','？','、','；','：',
    '“','”','‘','’','（','）',
    '【','】','…','—',
  ])

  // Tách câu thành mảng token, join lại phải bằng câu gốc
  function tokenize(sentence) {
    const segments = []
    let buf = ''
    for (const ch of sentence) {
      if (PUNCTS.has(ch)) {
        buf += ch
        if (buf.trim()) segments.push(buf.trim())
        buf = ''
      } else {
        buf += ch
      }
    }
    if (buf.trim()) segments.push(buf.trim())

    const result = []
    for (const seg of segments) {
      const lastCh   = seg[seg.length - 1]
      const hasPunct = PUNCTS.has(lastCh)
      const text     = hasPunct ? seg.slice(0, -1) : seg
      const punct    = hasPunct ? lastCh : ''

      if (text.length <= 3) {
        result.push(seg)
      } else {
        // chia thành chunk 2 ký tự, gắn dấu câu vào chunk cuối
        const chunks = []
        for (let i = 0; i < text.length; i += 2) {
          chunks.push(text.slice(i, Math.min(i + 2, text.length)))
        }
        chunks[chunks.length - 1] += punct
        result.push(...chunks)
      }
    }
    return result.filter(Boolean)
  }

  const data = shuffle(pool).slice(0, limit).map(w => {
    const inOrder = tokenize(w.example)
    // đảm bảo shuffle khác thứ tự gốc (tối đa 10 lần thử)
    let shuffled = shuffle(inOrder)
    for (let t = 0; t < 10 && inOrder.every((tk, i) => tk === shuffled[i]); t++) {
      shuffled = shuffle(inOrder)
    }
    return {
      word:          { id: w.id, chinese: w.chinese, pinyin: w.pinyin, vietnamese: w.vietnamese },
      sentence:      w.example,
      words_in_order: inOrder,
      words_shuffled: shuffled,
    }
  })

  res.json({ level, count: data.length, data })
})

// GET /api/vocabulary/:level — lấy từ theo cấp HSK
router.get('/:level', (req, res) => {
  const level = parseInt(req.params.level)
  if (isNaN(level) || level < 1 || level > 9) {
    return res.status(400).json({ error: 'HSK level must be a number between 1 and 9' })
  }

  const rows = db.prepare('SELECT * FROM vocabulary WHERE hsk_level = ?').all(level)
  res.json({ hsk_level: level, count: rows.length, data: rows })
})

module.exports = router
