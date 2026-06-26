const express = require('express')
const Groq    = require('groq-sdk')

const router = express.Router()
const MODEL  = 'llama-3.3-70b-versatile'

function client() {
  const key = (process.env.GROQ_API_KEY || '').trim()
  if (!key || key.startsWith('REPLACE_WITH') || key.startsWith('gsk_điền')) {
    throw new Error('Chưa có Groq API key — vào console.groq.com lấy key miễn phí rồi điền vào file .env')
  }
  if (/[^\x00-\x7F]/.test(key)) {
    throw new Error('Groq API key chứa ký tự không hợp lệ — key phải là ký tự ASCII (không có chữ Việt/Trung)')
  }
  if (!key.startsWith('gsk_')) {
    throw new Error('Groq API key sai định dạng — key phải bắt đầu bằng gsk_')
  }
  return new Groq({ apiKey: key })
}

function parseJSON(text) {
  // Bỏ markdown code fence nếu có
  const s = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  // Tìm JSON object đầu tiên trong text (LLM đôi khi thêm text trước/sau)
  const match = s.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Không tìm thấy JSON trong phản hồi')
  return JSON.parse(match[0])
}

async function ask(system, user, maxTokens = 1024) {
  const completion = await client().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
  })
  return completion.choices[0].message.content
}

// ─── POST /api/ai/explain ─────────────────────────────────────────────────────
router.post('/explain', async (req, res) => {
  const { chinese, pinyin, vietnamese, hsk_level } = req.body
  if (!chinese) return res.status(400).json({ error: '"chinese" is required' })

  try {
    const raw = await ask(
      'Bạn là giáo viên tiếng Trung chuyên dạy người Việt Nam. Luôn giải thích bằng tiếng Việt đơn giản, dễ hiểu.',
      `Giải thích từ "${chinese}" (${pinyin}) nghĩa là "${vietnamese}", thuộc HSK ${hsk_level}.

Trả lời theo đúng format JSON sau (chỉ JSON, không thêm text):
{
  "explanation": "giải thích ý nghĩa sâu hơn",
  "usage": "khi nào dùng từ này, ngữ cảnh phù hợp",
  "examples": [
    {"chinese": "câu 1", "pinyin": "pinyin 1", "vietnamese": "nghĩa 1"},
    {"chinese": "câu 2", "pinyin": "pinyin 2", "vietnamese": "nghĩa 2"},
    {"chinese": "câu 3", "pinyin": "pinyin 3", "vietnamese": "nghĩa 3"}
  ],
  "similar_words": "từ dễ nhầm lẫn và cách phân biệt",
  "memory_tip": "mẹo ghi nhớ từ này"
}`
    )
    res.json(parseJSON(raw))
  } catch (e) {
    const status = e.message?.includes('GROQ_API_KEY') ? 503 : 500
    res.status(status).json({ error: e.message })
  }
})

// ─── POST /api/ai/grade ───────────────────────────────────────────────────────
router.post('/grade', async (req, res) => {
  const { target_word, user_sentence, hsk_level } = req.body
  if (!target_word || !user_sentence) {
    return res.status(400).json({ error: 'Thiếu target_word hoặc user_sentence' })
  }

  try {
    const raw = await ask(
      'Bạn là giáo viên tiếng Trung chuyên chấm bài cho người Việt học tiếng Trung.',
      `Người học HSK ${hsk_level} đặt câu với từ "${target_word}":

Câu của học viên: ${user_sentence}

Chấm điểm và trả về JSON (chỉ JSON, không thêm text):
{
  "score": 8,
  "is_correct": true,
  "errors": [
    {"type": "ngữ pháp/từ vựng/cấu trúc", "description": "mô tả lỗi", "wrong": "phần sai", "correct": "cách đúng"}
  ],
  "corrected_sentence": "câu đã sửa đúng",
  "feedback": "nhận xét tổng thể bằng tiếng Việt",
  "encouragement": "lời động viên"
}`
    )
    res.json(parseJSON(raw))
  } catch (e) {
    const status = e.message?.includes('GROQ_API_KEY') ? 503 : 500
    res.status(status).json({ error: e.message })
  }
})

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { messages = [], hsk_level = 1, topic = 'hội thoại tự do' } = req.body

  try {
    // Build history: đảm bảo bắt đầu bằng 'user'
    let history = messages.slice(-20).map(m => ({
      role:    m.role === 'ai' ? 'assistant' : 'user',
      content: (m.role === 'ai' ? m.chinese : m.text) || '',
    })).filter(m => m.content.trim())

    while (history.length && history[0].role === 'assistant') history.shift()
    if (!history.length) history = [{ role: 'user', content: '你好' }]

    const completion = await client().chat.completions.create({
      model: MODEL, max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `Bạn là 李明 (Lǐ Míng), người bản ngữ tiếng Trung thân thiện, đang trò chuyện với người Việt đang học tiếng Trung HSK ${hsk_level}.

Chủ đề hội thoại: ${topic}

Quy tắc:
1. Chỉ dùng từ vựng trong phạm vi HSK ${hsk_level}
2. Câu ngắn, rõ ràng
3. Nếu người dùng viết sai, hãy phản hồi tự nhiên trước, không sửa ngay
4. Sau mỗi 3 tin nhắn, nhẹ nhàng gợi ý từ vựng mới liên quan chủ đề

Format trả lời (chỉ JSON):
{
  "reply_chinese": "câu trả lời tiếng Trung",
  "reply_pinyin": "pinyin",
  "reply_vietnamese": "nghĩa tiếng Việt",
  "suggested_vocab": ["từ gợi ý 1", "từ gợi ý 2"],
  "tip": "mẹo nhỏ nếu có, hoặc null"
}`,
        },
        ...history,
      ],
    })

    res.json(parseJSON(completion.choices[0].message.content))
  } catch (e) {
    const status = e.message?.includes('GROQ_API_KEY') ? 503 : 500
    res.status(status).json({ error: e.message })
  }
})

// ─── POST /api/ai/analyze-message ─────────────────────────────────────────────
router.post('/analyze-message', async (req, res) => {
  const { user_message, hsk_level = 1 } = req.body
  if (!user_message) return res.status(400).json({ error: 'Thiếu user_message' })

  try {
    const raw = await ask(
      'Bạn là giáo viên tiếng Trung, phân tích câu của người học.',
      `Phân tích câu tiếng Trung sau của người học HSK ${hsk_level}: "${user_message}"

Trả về JSON (chỉ JSON):
{
  "has_error": false,
  "errors": [
    {"wrong": "phần sai", "correct": "phần đúng", "explanation": "giải thích ngắn tiếng Việt"}
  ],
  "overall": "tốt/khá/cần cải thiện"
}

Nếu câu đúng: has_error = false, errors = []`
    )
    res.json(parseJSON(raw))
  } catch (e) {
    const status = e.message?.includes('GROQ_API_KEY') ? 503 : 500
    res.status(status).json({ error: e.message })
  }
})

module.exports = router
