/**
 * Seed từ vựng HSK 1-6 từ file Excel vào SQLite
 * Dùng: node seed-vocabulary.js
 */
const path = require('path')
const XLSX = require('xlsx')
const db   = require('./database/db')

function cleanPinyin(raw) {
  if (!raw) return ''
  return String(raw).replace(/^\/\s*/, '').replace(/\s*\/$/, '').trim()
}

function cleanChinese(raw) {
  if (!raw) return ''
  // "爸爸 | 爸" → "爸爸"
  return String(raw).split(/[|｜]/)[0].trim()
}

function parseExcel(filePath, hskLevel) {
  const wb   = XLSX.readFile(filePath)
  const ws   = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  const words = []
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i]
    const chinese = cleanChinese(r[1])
    if (!chinese || !/[一-鿿]/.test(chinese)) continue

    const pinyin     = cleanPinyin(r[2])
    const vietnamese = r[4] ? String(r[4]).trim() : ''
    const example    = r[5] ? String(r[5]).trim() : ''
    if (!vietnamese) continue

    words.push({ chinese, pinyin, vietnamese, example, hsk_level: hskLevel })
  }
  return words
}

const DB_DIR = path.join(__dirname, 'database')

const insert = db.prepare(`
  INSERT OR IGNORE INTO vocabulary (chinese, pinyin, vietnamese, example, hsk_level)
  VALUES (@chinese, @pinyin, @vietnamese, @example, @hsk_level)
`)

const seedAll = db.transaction(() => {
  db.prepare('DELETE FROM vocabulary').run()
  let total = 0
  for (let lv = 1; lv <= 6; lv++) {
    const file  = path.join(DB_DIR, `HSK${lv}.xlsx`)
    const words = parseExcel(file, lv)
    for (const w of words) insert.run(w)
    console.log(`  HSK ${lv}: ${words.length} từ`)
    total += words.length
  }
  return total
})

const total = seedAll()
console.log(`✅ Đã import ${total} từ vựng HSK 1-6`)
