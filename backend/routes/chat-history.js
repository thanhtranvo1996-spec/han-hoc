const express = require('express')
const db      = require('../database/db')

const router = express.Router()

// POST /api/chat-history
router.post('/', (req, res) => {
  const { topic, hsk_level, messages = [], error_count = 0 } = req.body
  if (!topic || !hsk_level) return res.status(400).json({ error: 'Thiếu topic hoặc hsk_level' })

  const row = db.prepare(`
    INSERT INTO chat_history (topic, hsk_level, messages, message_count, error_count)
    VALUES (?, ?, ?, ?, ?)
  `).run(topic, hsk_level, JSON.stringify(messages), messages.length, error_count)

  res.json({ ok: true, id: row.lastInsertRowid })
})

// GET /api/chat-history
router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT id, topic, hsk_level, message_count, error_count, created_at
    FROM chat_history ORDER BY created_at DESC LIMIT 10
  `).all()
  res.json({ count: rows.length, data: rows })
})

// GET /api/chat-history/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM chat_history WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json({ ...row, messages: JSON.parse(row.messages || '[]') })
})

module.exports = router
