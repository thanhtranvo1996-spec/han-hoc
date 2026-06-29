const express = require('express')
const Groq    = require('groq-sdk')
const db      = require('../database/db')

const router = express.Router()
const MODEL  = 'llama-3.3-70b-versatile'

function groqClient() {
  const key = (process.env.GROQ_API_KEY || '').trim()
  if (!key || !key.startsWith('gsk_')) throw new Error('Groq API key chưa được cấu hình')
  return new Groq({ apiKey: key })
}

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

// POST /api/grammar/explain  — AI giải thích chi tiết 1 điểm ngữ pháp
router.post('/explain', async (req, res) => {
  const { pattern, explanation, hsk_level, examples } = req.body
  if (!pattern) return res.status(400).json({ error: 'pattern required' })

  const exStr = (examples || [])
    .map(e => `  • ${e.chinese} (${e.pinyin}) — ${e.vietnamese}`)
    .join('\n')

  try {
    const completion = await groqClient().chat.completions.create({
      model: MODEL,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'Bạn là giáo viên tiếng Trung chuyên dạy người Việt Nam. Giải thích ngữ pháp chi tiết, rõ ràng, dùng tiếng Việt. Dùng ký hiệu markdown (* ** ## •) để định dạng.'
        },
        {
          role: 'user',
          content: `Giải thích chi tiết điểm ngữ pháp HSK ${hsk_level} sau đây cho người học Việt Nam:

**Điểm ngữ pháp:** ${pattern}
**Giải thích sơ lược:** ${explanation}
**Ví dụ có sẵn:**
${exStr}

Hãy viết phần giải thích đầy đủ gồm:
1. **Cấu trúc câu** (ghi rõ vị trí các thành phần: S/V/O...)
2. **Cách dùng chi tiết** (các trường hợp dùng, ngữ cảnh)
3. **Lưu ý quan trọng** (lỗi thường gặp, điểm cần tránh)
4. **So sánh** với điểm ngữ pháp tương tự nếu có
5. **Thêm ví dụ** (2-3 câu mới, có pinyin và nghĩa Việt)

Trả lời bằng tiếng Việt, markdown.`
        }
      ]
    })
    res.json({ content: completion.choices[0].message.content })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/grammar/exercise  — AI tạo bài tập trắc nghiệm
router.post('/exercise', async (req, res) => {
  const { pattern, explanation, hsk_level } = req.body
  if (!pattern) return res.status(400).json({ error: 'pattern required' })

  try {
    const completion = await groqClient().chat.completions.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: 'Bạn là giáo viên tiếng Trung. Tạo bài tập trắc nghiệm chính xác. Chỉ trả về JSON, không giải thích thêm.'
        },
        {
          role: 'user',
          content: `Tạo đúng 4 câu hỏi trắc nghiệm để luyện tập điểm ngữ pháp HSK ${hsk_level}: "${pattern}".

Yêu cầu:
- Câu hỏi là câu tiếng Trung có chỗ trống (___) hoặc câu hỏi về cách dùng
- 4 lựa chọn A/B/C/D
- Chỉ 1 đáp án đúng
- Giải thích ngắn gọn tại sao đáp án đúng (tiếng Việt)

Trả về JSON duy nhất:
{"exercises":[{"question":"...","choices":["A...","B...","C...","D..."],"correct":0,"explanation":"..."}]}`
        }
      ]
    })

    const raw   = completion.choices[0].message.content
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI không trả về JSON hợp lệ')
    const parsed = JSON.parse(match[0])
    res.json(parsed)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
