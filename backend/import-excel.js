/**
 * Import từ vựng HSK từ file Excel vào SQLite
 *
 * Cách dùng:
 *   node import-excel.js <file.xlsx> <hsk_level>
 *
 * Ví dụ:
 *   node import-excel.js database/HSK1.xlsx 1
 *   node import-excel.js database/HSK2.xlsx 2
 *
 * Cấu trúc file Excel được hỗ trợ (cột theo thứ tự):
 *   Cột 0: STT        (số thứ tự — dùng để nhận hàng dữ liệu thực)
 *   Cột 1: chinese    (chữ Hán)
 *   Cột 2: pinyin     (phiên âm, dạng /xxx/)
 *   Cột 3: loại từ    (bỏ qua)
 *   Cột 4: vietnamese (nghĩa tiếng Việt)
 *   Cột 5: example    (câu ví dụ tiếng Hán)
 */

const XLSX = require('xlsx')
const path = require('path')
const db   = require('./database/db')

// ─── Đọc tham số ──────────────────────────────────────────────
const filePath = process.argv[2]
const hskArg   = parseInt(process.argv[3])

if (!filePath) {
  console.error('❌  Thiếu đường dẫn file.')
  console.error('    Cách dùng: node import-excel.js <file.xlsx> <hsk_level>')
  console.error('    Ví dụ:     node import-excel.js database/HSK1.xlsx 1')
  process.exit(1)
}

if (isNaN(hskArg) || hskArg < 1 || hskArg > 9) {
  console.error('❌  Thiếu hoặc sai cấp HSK (phải là số từ 1 đến 9).')
  console.error('    Ví dụ: node import-excel.js database/HSK1.xlsx 1')
  process.exit(1)
}

const absPath = path.resolve(filePath)
console.log(`📂  File  : ${absPath}`)
console.log(`🎯  Cấp   : HSK ${hskArg}`)

// ─── Đọc Excel ────────────────────────────────────────────────
let workbook
try {
  workbook = XLSX.readFile(absPath)
} catch (err) {
  console.error(`❌  Không thể đọc file: ${err.message}`)
  process.exit(1)
}

const sheetName = workbook.SheetNames[0]
console.log(`📋  Sheet : "${sheetName}"`)

const sheet = workbook.Sheets[sheetName]
const rows  = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: '',
  raw: true,   // giữ số nguyên để nhận diện STT
})

// ─── Import ───────────────────────────────────────────────────
const insert = db.prepare(`
  INSERT INTO vocabulary (chinese, pinyin, vietnamese, example, hsk_level)
  VALUES (@chinese, @pinyin, @vietnamese, @example, @hsk_level)
`)

// Xóa dữ liệu cũ của cấp này trước khi import lại
const deleted = db.prepare('DELETE FROM vocabulary WHERE hsk_level = ?').run(hskArg)
if (deleted.changes > 0) {
  console.log(`🗑️   Đã xóa ${deleted.changes} từ cũ của HSK ${hskArg}`)
}

const importAll = db.transaction((allRows) => {
  let imported = 0
  let skipped  = 0

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]

    // Chỉ lấy hàng có STT là số nguyên dương (bỏ tiêu đề, PHẦN X, hàng phụ nghĩa)
    const stt = row[0]
    if (typeof stt !== 'number' || !Number.isInteger(stt) || stt < 1) {
      skipped++
      continue
    }

    const chinese    = String(row[1] || '').trim()
    const pinyin     = String(row[2] || '').replace(/\//g, '').trim()
    const vietnamese = String(row[4] || '').trim()
    const example    = String(row[5] || '').trim()

    if (!chinese || !vietnamese) {
      skipped++
      continue
    }

    insert.run({ chinese, pinyin, vietnamese, example, hsk_level: hskArg })
    imported++
  }

  return { imported, skipped }
})

console.log('⏳  Đang import...\n')
const { imported, skipped } = importAll(rows)

console.log(`✅  Đã import ${imported} từ thành công.`)
console.log(`⏭️   Đã bỏ qua ${skipped} hàng (tiêu đề / mục / hàng phụ nghĩa).`)

const total = db.prepare('SELECT COUNT(*) as n FROM vocabulary').get().n
console.log(`📊  Tổng từ trong database: ${total}`)

db.close()
