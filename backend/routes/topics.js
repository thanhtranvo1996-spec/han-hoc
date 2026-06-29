const express = require('express')
const Groq    = require('groq-sdk')

const router = express.Router()
const MODEL  = 'llama-3.3-70b-versatile'

function groqClient() {
  const key = (process.env.GROQ_API_KEY || '').trim()
  if (!key || !key.startsWith('gsk_')) throw new Error('Groq API key chưa được cấu hình')
  return new Groq({ apiKey: key })
}

const TOPIC_LABELS = {
  'xuat-nhap-khau':   'Xuất nhập khẩu & Logistics',
  'van-phong':        'Văn phòng & Kinh doanh',
  'nha-hang':         'Nhà hàng & Ẩm thực',
  'it-cong-nghe':     'IT & Công nghệ',
  'y-te':             'Y tế & Sức khỏe',
  'ngan-hang':        'Ngân hàng & Tài chính',
  'bat-dong-san':     'Bất động sản',
  'du-lich':          'Du lịch & Khách sạn',
  'san-xuat':         'Sản xuất & Nhà máy',
  'thuong-mai-dien-tu': 'Thương mại điện tử (Taobao/1688)',
}

const BATCH_SIZE = 25   // mỗi lần gọi AI tối đa bao nhiêu từ

async function generateBatch(groq, label, level, batchCount, exclude = []) {
  const excludeNote = exclude.length
    ? `\nKhông được lặp lại các từ đã có: ${exclude.slice(0, 30).join(', ')}`
    : ''

  const prompt = `Bạn là chuyên gia tiếng Trung thực hành. Tạo ${batchCount} từ vựng tiếng Trung thực tế cho chủ đề: "${label}".

Yêu cầu:
- Cấp độ: ${level}
- Từ phải được dùng thực tế trong công việc/cuộc sống hàng ngày, không phải từ học thuật
- Mỗi từ kèm ví dụ câu thực tế (không quá 15 chữ)
- Ưu tiên từ/cụm từ người Việt hay gặp khi làm việc với đối tác Trung Quốc${excludeNote}

Trả về JSON duy nhất (không markdown, không giải thích):
{"words":[{"chinese":"...","pinyin":"...","vietnamese":"...","example":"...","example_pinyin":"...","example_vietnamese":"..."}]}`

  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 5000,
    temperature: 0.5,
    messages: [
      { role: 'system', content: 'Chỉ trả về JSON thuần, không thêm bất kỳ text nào khác.' },
      { role: 'user',   content: prompt },
    ]
  })

  const raw   = completion.choices[0].message.content.trim()
  const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  const match = clean.match(/\{[\s\S]*/)
  if (!match) throw new Error('AI không trả về JSON hợp lệ')

  let jsonStr = match[0]
  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    const lastClose = jsonStr.lastIndexOf('},')
    if (lastClose === -1) throw new Error('Không thể phục hồi JSON bị cắt')
    jsonStr = jsonStr.slice(0, lastClose + 1) + ']}'
    parsed = JSON.parse(jsonStr)
  }

  if (!Array.isArray(parsed.words)) throw new Error('Thiếu trường words')
  return parsed.words
}

// POST /api/topics/generate
router.post('/generate', async (req, res) => {
  const { topic, topic_label, level = 'trung cấp', count = 20 } = req.body
  if (!topic) return res.status(400).json({ error: 'topic required' })

  const label     = topic_label || TOPIC_LABELS[topic] || topic
  const safeCount = Math.min(Math.max(parseInt(count) || 20, 5), 100)
  const groq      = groqClient()

  try {
    let words = []

    if (safeCount <= BATCH_SIZE) {
      words = await generateBatch(groq, label, level, safeCount)
    } else {
      // Chia thành nhiều batch, truyền từ đã có để tránh trùng
      let remaining = safeCount
      while (remaining > 0) {
        const batchCount = Math.min(remaining, BATCH_SIZE)
        const exclude    = words.map(w => w.chinese)
        const batch      = await generateBatch(groq, label, level, batchCount, exclude)
        words.push(...batch)
        remaining -= batchCount
      }
    }

    // Loại từ trùng (cùng chữ Hán)
    const seen  = new Set()
    const dedup = words.filter(w => {
      if (seen.has(w.chinese)) return false
      seen.add(w.chinese); return true
    })

    res.json({ topic: label, level, words: dedup })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/topics/list  — danh sách chủ đề có sẵn
router.get('/list', (_req, res) => {
  res.json({
    topics: Object.entries(TOPIC_LABELS).map(([id, label]) => ({ id, label }))
  })
})

module.exports = router
