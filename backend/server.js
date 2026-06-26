require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')

const vocabularyRoutes    = require('./routes/vocabulary')
const progressRoutes      = require('./routes/progress')
const grammarRoutes       = require('./routes/grammar')
const ttsRoutes           = require('./routes/tts')
const aiRoutes            = require('./routes/ai')
const writingHistoryRoutes = require('./routes/writing-history')
const chatHistoryRoutes   = require('./routes/chat-history')
const statsRoutes         = require('./routes/stats')

const app  = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
  cb(new Error('Not allowed by CORS'))
}}))
app.use(express.json())

app.use('/api/vocabulary',     vocabularyRoutes)
app.use('/api/progress',       progressRoutes)
app.use('/api/grammar',        grammarRoutes)
app.use('/api/tts',            ttsRoutes)
app.use('/api/ai',             aiRoutes)
app.use('/api/writing-history', writingHistoryRoutes)
app.use('/api/chat-history',   chatHistoryRoutes)
app.use('/api/stats',          statsRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Serve React frontend (production build)
const DIST = path.join(__dirname, '../frontend/dist')
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST))
  // SPA fallback — Express 5 dùng app.use thay vì app.get('*')
  app.use((_req, res) => res.sendFile(path.join(DIST, 'index.html')))
} else {
  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
}

app.listen(PORT, () => console.log(`🏮 Hán Học API → http://localhost:${PORT}`))
