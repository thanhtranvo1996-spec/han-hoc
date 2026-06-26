const express = require('express')
const db = require('../database/db')

const router = express.Router()

// GET /api/grammar/:level
router.get('/:level', (req, res) => {
  const level = parseInt(req.params.level)
  if (isNaN(level) || level < 1 || level > 9) {
    return res.status(400).json({ error: 'HSK level must be between 1 and 9' })
  }

  const rows = db.prepare(
    'SELECT * FROM grammar WHERE hsk_level = ? ORDER BY stt ASC'
  ).all(level)

  const parsed = rows.map(r => ({ ...r, examples: JSON.parse(r.examples || '[]') }))
  res.json({ hsk_level: level, count: parsed.length, data: parsed })
})

module.exports = router
