const express = require('express')
const db      = require('../database/db')

const router = express.Router()

// POST /api/progress — lưu hoặc cập nhật trạng thái 1 từ
router.post('/', (req, res) => {
  const { word_id, status } = req.body

  if (!word_id || !status) {
    return res.status(400).json({ error: 'Thiếu word_id hoặc status' })
  }
  if (!['known', 'unknown'].includes(status)) {
    return res.status(400).json({ error: 'status phải là "known" hoặc "unknown"' })
  }

  // Kiểm tra từ tồn tại
  const word = db.prepare('SELECT id, hsk_level FROM vocabulary WHERE id = ?').get(word_id)
  if (!word) return res.status(404).json({ error: 'Không tìm thấy từ vựng' })

  // Tính SRS (Spaced Repetition)
  const existing = db.prepare('SELECT interval FROM progress WHERE word_id = ?').get(word_id)
  let newInterval
  if (status === 'known') {
    newInterval = Math.min((existing?.interval ?? 1) * 2, 365)
  } else {
    newInterval = 1
  }
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)
  const nextReviewStr = nextReview.toISOString().slice(0, 10)

  db.prepare(`
    INSERT INTO progress (hsk_level, word_id, status, updated_at, interval, next_review)
    VALUES (?, ?, ?, datetime('now'), ?, ?)
    ON CONFLICT(word_id) DO UPDATE SET
      status      = excluded.status,
      updated_at  = excluded.updated_at,
      interval    = excluded.interval,
      next_review = excluded.next_review
  `).run(word.hsk_level, word_id, status, newInterval, nextReviewStr)

  res.json({ ok: true, word_id, status })
})

// GET /api/progress/:level — lấy tiến độ theo cấp HSK
router.get('/:level', (req, res) => {
  const level = parseInt(req.params.level)
  if (isNaN(level) || level < 1 || level > 9) {
    return res.status(400).json({ error: 'HSK level phải từ 1 đến 9' })
  }

  const rows = db.prepare(`
    SELECT p.word_id, p.status, p.updated_at,
           v.chinese, v.pinyin, v.vietnamese
    FROM   progress p
    JOIN   vocabulary v ON v.id = p.word_id
    WHERE  p.hsk_level = ?
    ORDER  BY p.updated_at DESC
  `).all(level)

  const known   = rows.filter(r => r.status === 'known').length
  const unknown = rows.filter(r => r.status === 'unknown').length

  res.json({ hsk_level: level, known, unknown, total: rows.length, data: rows })
})

module.exports = router
