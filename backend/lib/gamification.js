const db = require('../database/db')

// Điểm XP cho từng hành động — quyết định ở server để tránh client tự ý gửi điểm
const XP_RULES = {
  word_known:       2,   // học thuộc 1 từ mới (lần đầu chuyển sang "known")
  lesson_complete:  10,  // hoàn thành 1 bài luyện (nghe / gõ / đặt câu / chat)
  quiz_complete:    10,  // hoàn thành bài kiểm tra
  quiz_great:       20,  // bài kiểm tra đạt ≥ 80%
  writing_complete: 10,  // hoàn thành 1 câu luyện viết
  writing_great:    20,  // câu viết được chấm ≥ 90 điểm
  chat_session:     10,  // hoàn thành 1 buổi trò chuyện AI
}

const BADGES = [
  { id: 'streak_3',   icon: '🔥', name: 'Chuỗi 3 ngày',        desc: 'Học liên tiếp 3 ngày',          check: s => s.streak >= 3 },
  { id: 'streak_7',   icon: '🔥', name: 'Chuỗi 7 ngày',        desc: 'Học liên tiếp 7 ngày',          check: s => s.streak >= 7 },
  { id: 'streak_30',  icon: '🔥', name: 'Chuỗi 30 ngày',       desc: 'Học liên tiếp 30 ngày',         check: s => s.streak >= 30 },
  { id: 'word_50',    icon: '📖', name: '50 từ vựng',          desc: 'Học thuộc 50 từ',               check: s => s.wordsKnown >= 50 },
  { id: 'word_200',   icon: '📚', name: '200 từ vựng',         desc: 'Học thuộc 200 từ',              check: s => s.wordsKnown >= 200 },
  { id: 'word_500',   icon: '🎓', name: '500 từ vựng',         desc: 'Học thuộc 500 từ',              check: s => s.wordsKnown >= 500 },
  { id: 'quiz_10',    icon: '✅', name: '10 bài kiểm tra',     desc: 'Hoàn thành 10 bài kiểm tra',    check: s => s.quizCount >= 10 },
  { id: 'perfect',    icon: '💯', name: 'Điểm tuyệt đối',      desc: 'Đạt điểm 100% trong 1 bài kiểm tra', check: s => s.hasPerfectQuiz },
  { id: 'writing_10', icon: '✍️', name: '10 bài viết',         desc: 'Hoàn thành 10 câu luyện viết',  check: s => s.writingCount >= 10 },
  { id: 'chat_10',    icon: '💬', name: '10 buổi trò chuyện',  desc: 'Trò chuyện AI 10 lần',          check: s => s.chatCount >= 10 },
  { id: 'xp_500',     icon: '⭐', name: '500 XP',              desc: 'Tích lũy 500 XP',               check: s => s.totalXp >= 500 },
  { id: 'xp_2000',    icon: '🌟', name: '2000 XP',             desc: 'Tích lũy 2000 XP',              check: s => s.totalXp >= 2000 },
]

function getTotalXp() {
  return db.prepare('SELECT COALESCE(SUM(amount),0) as n FROM xp_log').get().n
}

function getStreak() {
  const days = db.prepare(`
    SELECT DISTINCT DATE(created_at) as day FROM xp_log
    WHERE created_at >= datetime('now', '-365 days')
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
    } else if (day < expect) {
      break
    }
  }
  return streak
}

function hasPerfectQuiz() {
  const rows = db.prepare("SELECT meta FROM xp_log WHERE reason='quiz_great'").all()
  return rows.some(r => {
    try { return JSON.parse(r.meta || '{}').score >= 100 } catch { return false }
  })
}

function getStats() {
  const wordsKnown  = db.prepare("SELECT COUNT(*) as n FROM progress WHERE status='known'").get().n
  const quizCount   = db.prepare("SELECT COUNT(*) as n FROM xp_log WHERE reason IN ('quiz_complete','quiz_great')").get().n
  const writingCount = db.prepare('SELECT COUNT(*) as n FROM writing_history').get().n
  const chatCount    = db.prepare('SELECT COUNT(*) as n FROM chat_history').get().n

  return {
    wordsKnown,
    quizCount,
    writingCount,
    chatCount,
    hasPerfectQuiz: hasPerfectQuiz(),
    totalXp: getTotalXp(),
    streak:  getStreak(),
  }
}

function computeBadges(stats) {
  return BADGES.map(b => ({ id: b.id, icon: b.icon, name: b.name, desc: b.desc, earned: !!b.check(stats) }))
}

function levelOf(totalXp) {
  return Math.floor(totalXp / 100) + 1
}

function awardXp(reason, meta = {}) {
  const amount = XP_RULES[reason]
  if (!amount) throw new Error('Unknown XP reason: ' + reason)

  const before = computeBadges(getStats()).filter(b => b.earned).map(b => b.id)

  db.prepare(`INSERT INTO xp_log (amount, reason, meta, created_at) VALUES (?, ?, ?, datetime('now'))`)
    .run(amount, reason, JSON.stringify(meta))

  const stats = getStats()
  const after  = computeBadges(stats).filter(b => b.earned).map(b => b.id)
  const newBadges = after.filter(id => !before.includes(id)).map(id => BADGES.find(b => b.id === id))

  return { amount, stats, newBadges }
}

module.exports = { XP_RULES, BADGES, getStats, computeBadges, awardXp, levelOf, getStreak }
