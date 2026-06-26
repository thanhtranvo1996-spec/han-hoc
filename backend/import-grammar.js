/**
 * Import ngữ pháp HSK từ PDF vào SQLite dùng Claude AI
 *
 * Cách dùng:
 *   node import-grammar.js <file.pdf> <hsk_level>
 *
 * Ví dụ:
 *   node import-grammar.js "database/NGỮ PHÁP HSK 1.pdf" 1
 *
 * Cần biến môi trường:
 *   ANTHROPIC_API_KEY=sk-ant-...
 */

const Anthropic = require('@anthropic-ai/sdk')
const pdfParse  = require('pdf-parse')
const fs        = require('fs')
const path      = require('path')
const db        = require('./database/db')

async function main() {
  // ─── Tham số ────────────────────────────────────────────────
  const filePath = process.argv[2]
  const hskLevel = parseInt(process.argv[3])

  if (!filePath || isNaN(hskLevel) || hskLevel < 1 || hskLevel > 9) {
    console.error('Cách dùng: node import-grammar.js <file.pdf> <hsk_level>')
    console.error('Ví dụ:     node import-grammar.js "database/NGỮ PHÁP HSK 1.pdf" 1')
    process.exit(1)
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  Thiếu ANTHROPIC_API_KEY')
    console.error('    Chạy trước: $env:ANTHROPIC_API_KEY="sk-ant-..."')
    process.exit(1)
  }

  // ─── Đọc PDF ──────────────────────────────────────────────
  const absPath = path.resolve(filePath)
  console.log(`📂  File  : ${absPath}`)
  console.log(`🎯  Cấp   : HSK ${hskLevel}\n`)

  let pdfText
  try {
    const buf  = fs.readFileSync(absPath)
    const data = await pdfParse(buf)
    pdfText    = data.text
    console.log(`📄  Đọc xong: ${data.numpages} trang, ${pdfText.length} ký tự`)
  } catch (err) {
    console.error(`❌  Không đọc được PDF: ${err.message}`)
    process.exit(1)
  }

  // ─── Gọi Claude AI ──────────────────────────────────────────
  console.log('🤖  Đang phân tích với Claude AI...\n')

  const client = new Anthropic()

  const prompt = `Bạn là công cụ trích xuất dữ liệu ngữ pháp tiếng Trung từ tài liệu PDF.

Dưới đây là nội dung text trích xuất từ tài liệu "Ngữ pháp HSK ${hskLevel}":

<pdf_text>
${pdfText}
</pdf_text>

Hãy trích xuất TẤT CẢ các điểm ngữ pháp trong tài liệu và trả về JSON theo đúng format sau (không có markdown, không giải thích thêm):

[
  {
    "stt": 1,
    "pattern": "Đại từ nghi vấn 什么/shénme/",
    "explanation": "Dùng để hỏi người hoặc sự vật (cái gì, gì).",
    "examples": [
      {
        "chinese": "你叫什么名字？",
        "pinyin": "Nǐ jiào shénme míngzi?",
        "vietnamese": "Tên bạn là gì?"
      }
    ]
  }
]

Quy tắc:
- Trích xuất đúng thứ tự STT trong tài liệu
- "pattern" = tên điểm ngữ pháp (giữ nguyên chữ Hán + pinyin nếu có)
- "explanation" = giải thích ngắn gọn bằng tiếng Việt
- "examples" = mảng các ví dụ, mỗi ví dụ có chinese/pinyin/vietnamese
- Chỉ trả về JSON array, không thêm bất kỳ text nào khác`

  const response = await client.messages.create({
    model:      'claude-sonnet-4-6',
    max_tokens: 8000,
    messages:   [{ role: 'user', content: prompt }],
  })

  const rawJson = response.content[0].text.trim()

  // ─── Parse JSON ─────────────────────────────────────────────
  let grammarItems
  try {
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    grammarItems  = JSON.parse(cleaned)
    console.log(`✅  Claude trích xuất được ${grammarItems.length} điểm ngữ pháp\n`)
  } catch (err) {
    console.error('❌  Không parse được JSON từ Claude:')
    console.error(rawJson.slice(0, 500))
    process.exit(1)
  }

  // ─── Lưu vào SQLite ─────────────────────────────────────────
  const deleted = db.prepare('DELETE FROM grammar WHERE hsk_level = ?').run(hskLevel)
  if (deleted.changes > 0) {
    console.log(`🗑️   Đã xóa ${deleted.changes} điểm ngữ pháp cũ của HSK ${hskLevel}`)
  }

  const insert = db.prepare(`
    INSERT INTO grammar (hsk_level, stt, pattern, explanation, examples)
    VALUES (@hsk_level, @stt, @pattern, @explanation, @examples)
  `)

  const saveAll = db.transaction((items) => {
    let saved = 0
    for (const item of items) {
      if (!item.pattern || !item.explanation) continue
      insert.run({
        hsk_level:   hskLevel,
        stt:         item.stt || null,
        pattern:     item.pattern.trim(),
        explanation: item.explanation.trim(),
        examples:    JSON.stringify(item.examples || []),
      })
      saved++
    }
    return saved
  })

  const saved = saveAll(grammarItems)
  console.log(`💾  Đã lưu ${saved} điểm ngữ pháp vào database`)

  const total = db.prepare('SELECT COUNT(*) as n FROM grammar WHERE hsk_level = ?').get(hskLevel).n
  console.log(`📊  Tổng ngữ pháp HSK ${hskLevel} trong database: ${total}`)

  console.log('\n📋  Preview 3 điểm đầu:')
  db.prepare('SELECT stt, pattern, explanation FROM grammar WHERE hsk_level = ? LIMIT 3')
    .all(hskLevel)
    .forEach(r => console.log(`  ${r.stt}. ${r.pattern}\n     → ${r.explanation}`))

  db.close()
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })
