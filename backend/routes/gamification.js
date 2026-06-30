const express = require('express')
const { XP_RULES, awardXp, getStats, computeBadges, levelOf } = require('../lib/gamification')

const router = express.Router()

// POST /api/gamification/award — { reason, meta? }
router.post('/award', (req, res) => {
  const { reason, meta } = req.body
  if (!reason || !XP_RULES[reason]) {
    return res.status(400).json({ error: 'reason không hợp lệ' })
  }

  try {
    const { amount, stats, newBadges } = awardXp(reason, meta || {})
    res.json({
      xpGained:      amount,
      totalXp:       stats.totalXp,
      level:         levelOf(stats.totalXp),
      levelProgress: stats.totalXp % 100,
      streak:        stats.streak,
      newBadges,
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/gamification/summary
router.get('/summary', (_req, res) => {
  const stats = getStats()
  res.json({
    totalXp:       stats.totalXp,
    level:         levelOf(stats.totalXp),
    levelProgress: stats.totalXp % 100,
    streak:        stats.streak,
    badges:        computeBadges(stats),
  })
})

module.exports = router
