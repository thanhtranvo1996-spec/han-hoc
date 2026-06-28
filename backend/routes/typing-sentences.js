const express   = require('express')
const https     = require('https')
const Anthropic = require('@anthropic-ai/sdk')
const db        = require('../database/db')

const router = express.Router()

// Phồn thể detector — bất kỳ ký tự nào sau đây → câu phồn thể, bỏ qua
const TRAD_RE = /[學語愛國書說會來電話時體動點實問聲長頭發關開門還進從後這裡錢萬對歲當運設認讀寫聽講習圖與員歸馬業農應廣帶傳際號機樣辦覺決選擇讓繼續幾歡聯諸風遠報場層記張約區規訓練護標態責製藝龍銀誰號緊強緊總維顯]/

// ─── Tatoeba (chỉ giữ câu giản thể) ─────────────────────────────────────────
function fetchTatoeba() {
  return new Promise((resolve) => {
    const url = 'https://tatoeba.org/en/api_v0/search' +
                '?from=cmn&trans_filter=limit&trans_to=vie&sort=random&page=1'
    https.get(url, { headers: { 'User-Agent': 'HanHocApp/1.0' } }, (res) => {
      let raw = ''
      res.on('data', c => raw += c)
      res.on('end', () => {
        try {
          const json    = JSON.parse(raw)
          const results = []
          for (const item of (json.results || [])) {
            const chinese = (item.text || '').trim()
            if (!chinese) continue
            if (TRAD_RE.test(chinese)) continue  // bỏ câu phồn thể
            let vietnamese = ''
            for (const group of (item.translations || [])) {
              for (const t of (group || [])) {
                if (t.lang === 'vie') { vietnamese = t.text.trim(); break }
              }
              if (vietnamese) break
            }
            if (!vietnamese) continue
            results.push({ chinese, vietnamese, pinyin: null, source: 'tatoeba' })
            if (results.length >= 10) break
          }
          console.log(`[typing] Tatoeba: ${results.length} câu`)
          resolve(results)
        } catch (e) {
          console.error('[typing] Tatoeba parse error:', e.message)
          resolve([])
        }
      })
    }).on('error', (e) => {
      console.error('[typing] Tatoeba fetch error:', e.message)
      resolve([])
    })
  })
}

// ─── Claude ──────────────────────────────────────────────────────────────────
async function fetchClaude(level) {
  try {
    const key = (process.env.ANTHROPIC_API_KEY || '').trim()
    if (!key) throw new Error('ANTHROPIC_API_KEY chưa được set')

    const client = new Anthropic({ apiKey: key })
    const msg = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     'Bạn là giáo viên tiếng Trung chuyên dạy HSK.',
      messages: [{
        role:    'user',
        content: `Tạo 10 câu tiếng Trung phù hợp trình độ HSK ${level}.
Yêu cầu: câu ngắn 5–15 chữ, tự nhiên, đời thường. Chỉ dùng chữ GIẢN THỂ (简体字), tuyệt đối không dùng phồn thể.
Trả về JSON array, không giải thích thêm:
[{"chinese":"...","vietnamese":"...","pinyin":"..."}]`,
      }],
    })

    const text  = msg.content[0].text
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Không tìm thấy JSON array trong response')

    const arr = JSON.parse(match[0])
      .filter(s => s.chinese && s.vietnamese)
      .slice(0, 10)
      .map(s => ({ chinese: s.chinese, vietnamese: s.vietnamese, pinyin: s.pinyin || null, source: 'claude' }))

    console.log(`[typing] Claude: ${arr.length} câu HSK${level}`)
    return arr
  } catch (e) {
    console.error('[typing] Claude fetch error:', e.message)
    return []
  }
}

// Xóa câu phồn thể đã cache (chạy 1 lần khi module load)
try {
  const del = db.prepare(
    "DELETE FROM typing_sentences WHERE chinese REGEXP ?"
  )
  // better-sqlite3 không có REGEXP built-in, dùng cách khác
  const rows = db.prepare('SELECT id, chinese FROM typing_sentences').all()
  const badIds = rows.filter(r => TRAD_RE.test(r.chinese)).map(r => r.id)
  if (badIds.length > 0) {
    const placeholders = badIds.map(() => '?').join(',')
    db.prepare(`DELETE FROM typing_sentences WHERE id IN (${placeholders})`).run(...badIds)
    console.log(`[typing] Đã xóa ${badIds.length} câu phồn thể khỏi cache`)
  }
} catch (e) {
  console.error('[typing] Cleanup error:', e.message)
}

// ─── GET /api/typing-sentences?level=1 ───────────────────────────────────────
router.get('/', async (req, res) => {
  const level = Math.min(Math.max(parseInt(req.query.level) || 1, 1), 9)

  try {
    const count = db.prepare(
      'SELECT COUNT(*) as n FROM typing_sentences WHERE hsk_level = ?'
    ).get(level).n

    if (count >= 20) {
      const rows = db.prepare(
        'SELECT * FROM typing_sentences WHERE hsk_level = ? ORDER BY RANDOM() LIMIT 10'
      ).all(level)
      return res.json({ sentences: rows })
    }

    const [fromTatoeba, fromClaude] = await Promise.all([
      fetchTatoeba(),
      fetchClaude(level),
    ])

    const fresh = [...fromTatoeba, ...fromClaude]

    if (fresh.length > 0) {
      const insert = db.prepare(`
        INSERT INTO typing_sentences (chinese, vietnamese, pinyin, source, hsk_level)
        VALUES (@chinese, @vietnamese, @pinyin, @source, @hsk_level)
      `)
      db.transaction(items => items.forEach(r => insert.run({ ...r, hsk_level: level })))(fresh)
    }

    const rows = db.prepare(
      'SELECT * FROM typing_sentences WHERE hsk_level = ? ORDER BY RANDOM() LIMIT 10'
    ).all(level)
    res.json({ sentences: rows })
  } catch (e) {
    console.error('[typing] Route error:', e)
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
