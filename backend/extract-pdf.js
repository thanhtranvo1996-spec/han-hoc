const pdf  = require('pdf-parse')
const fs   = require('fs')
const path = require('path')

const dir   = path.join(__dirname, 'database')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'))

;(async () => {
  for (const f of files) {
    try {
      const buf  = fs.readFileSync(path.join(dir, f))
      const data = await pdf(buf)
      const out  = path.join(dir, f.replace('.pdf', '.txt'))
      fs.writeFileSync(out, data.text, 'utf8')
      console.log('OK:', f, '-', data.numpages, 'pages,', data.text.length, 'chars')
    } catch (e) {
      console.error('ERR:', f, e.message)
    }
  }
})()
