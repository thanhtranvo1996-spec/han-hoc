const express = require('express')
const db      = require('../database/db')

const router = express.Router()

// POST /api/writing-history
router.post('/', (req, res) => {
  const { target_word, user_sentence, score, feedback, corrected_sentence } = req.body
  if (!target_word || !user_sentence) {
    return res.status(400).json({ error: 'Thiếu target_word hoặc user_sentence' })
  }
  const row = db.prepare(`
    INSERT INTO writing_history (target_word, user_sentence, score, feedback, corrected_sentence)
    VALUES (?, ?, ?, ?, ?)
  `).run(target_word, user_sentence, score ?? null, feedback ?? null, corrected_sentence ?? null)

  res.json({ ok: true, id: row.lastInsertRowid })
})

// GET /api/writing-history
router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT * FROM writing_history ORDER BY created_at DESC LIMIT 20
  `).all()
  res.json({ count: rows.length, data: rows })
})

module.exports = router
