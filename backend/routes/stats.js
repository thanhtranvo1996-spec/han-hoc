const express = require('express')
const db      = require('../database/db')

const router = express.Router()

// GET /api/stats/overview
router.get('/overview', (_req, res) => {
  const learned  = db.prepare("SELECT COUNT(*) as n FROM progress WHERE status='known'").get().n
  const reviewed = db.prepare('SELECT COUNT(*) as n FROM progress').get().n
  const writingAvg = db.prepare('SELECT AVG(score) as avg FROM writing_history WHERE score IS NOT NULL').get().avg
  const chatSessions = db.prepare('SELECT COUNT(*) as n FROM chat_history').get().n

  // Tiến độ theo cấp HSK
  const hskProgress = db.prepare(`
    SELECT v.hsk_level as level,
           COUNT(DISTINCT v.id) as total,
           COUNT(CASE WHEN p.status='known' THEN 1 END) as learned
    FROM vocabulary v
    LEFT JOIN progress p ON p.word_id = v.id
    GROUP BY v.hsk_level ORDER BY v.hsk_level
  `).all().map(r => ({
    level:   r.level,
    total:   r.total,
    learned: r.learned,
    percent: r.total > 0 ? Math.round((r.learned / r.total) * 100) : 0,
  }))

  // Từ hay sai nhất (unknown gần nhất)
  const weakWords = db.prepare(`
    SELECT v.chinese, v.pinyin, v.vietnamese, v.hsk_level, p.updated_at
    FROM progress p JOIN vocabulary v ON v.id = p.word_id
    WHERE p.status = 'unknown'
    ORDER BY p.updated_at DESC LIMIT 10
  `).all()

  // Hoạt động 7 ngày gần nhất
  const recentActivity = db.prepare(`
    SELECT DATE(updated_at) as day, COUNT(*) as count
    FROM progress
    WHERE updated_at >= datetime('now', '-7 days')
    GROUP BY DATE(updated_at) ORDER BY day
  `).all()

  // Study streak (số ngày liên tiếp kết thúc hôm nay)
  const days = db.prepare(`
    SELECT DISTINCT DATE(updated_at) as day FROM progress
    WHERE updated_at >= datetime('now', '-365 days')
    ORDER BY day DESC
  `).all().map(r => r.day)

  let streak = 0
  const today = new Date().toISOString().slice(0, 10)
  let expect  = today
  for (const day of days) {
    if (day === expect) {
      streak++
      const d = new Date(expect)
      d.setDate(d.getDate() - 1)
      expect = d.toISOString().slice(0, 10)
    } else break
  }

  res.json({
    total_words_learned:  learned,
    total_words_reviewed: reviewed,
    quiz_accuracy:        0,
    listening_accuracy:   0,
    writing_avg_score:    writingAvg ? Math.round(writingAvg * 10) / 10 : null,
    chat_sessions:        chatSessions,
    study_streak:         streak,
    hsk_progress:         hskProgress,
    weak_words:           weakWords,
    recent_activity:      recentActivity,
  })
})

module.exports = router
