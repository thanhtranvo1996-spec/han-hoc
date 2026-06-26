require('dotenv').config()
const express = require('express')
const cors    = require('cors')

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

app.get('/', (_req, res) => res.send(`
  <html><head><meta charset="utf-8"><title>Hán Học API</title>
  <style>body{font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 20px}h1{color:#C0392B}a{color:#C0392B}</style></head>
  <body><h1>🏮 Hán Học API</h1><ul>
    <li><a href="/api/health">/api/health</a></li>
    <li><a href="/api/vocabulary/1">/api/vocabulary/1</a></li>
    <li><a href="/api/vocabulary/due-today">/api/vocabulary/due-today</a></li>
    <li><a href="/api/grammar/1">/api/grammar/1</a></li>
    <li>/api/ai/explain — POST</li>
    <li>/api/ai/grade — POST</li>
    <li>/api/ai/chat — POST</li>
    <li>/api/ai/analyze-message — POST</li>
    <li><a href="/api/stats/overview">/api/stats/overview</a></li>
    <li><a href="/api/writing-history">/api/writing-history</a></li>
    <li><a href="/api/chat-history">/api/chat-history</a></li>
  </ul></body></html>
`))

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

app.listen(PORT, () => console.log(`🏮 Hán Học API → http://localhost:${PORT}`))
