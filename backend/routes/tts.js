const express = require('express')
const https   = require('https')

const router = express.Router()

const SPEED_MAP = { slow: 0.5, normal: 1, fast: 1.5 }

// GET /api/tts?text=你好&speed=slow|normal|fast
router.get('/', (req, res) => {
  const text  = (req.query.text || '').trim()
  const speed = req.query.speed || 'normal'

  if (!text) return res.status(400).json({ error: 'Query param "text" is required' })
  if (text.length > 200) return res.status(400).json({ error: 'Text too long (max 200 chars)' })

  const ttsspeed = SPEED_MAP[speed] ?? 1

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob` +
              `&q=${encodeURIComponent(text)}&ttsspeed=${ttsspeed}`

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      'Referer':    'https://translate.google.com/',
    },
  }

  https.get(url, options, (upstream) => {
    if (upstream.statusCode !== 200) {
      return res.status(502).json({ error: `Google TTS returned ${upstream.statusCode}` })
    }
    res.setHeader('Content-Type', upstream.headers['content-type'] || 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    upstream.pipe(res)
  }).on('error', (err) => {
    res.status(502).json({ error: `TTS request failed: ${err.message}` })
  })
})

module.exports = router
