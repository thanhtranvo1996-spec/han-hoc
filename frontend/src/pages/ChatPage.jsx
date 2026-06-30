import { useState, useEffect, useRef } from 'react'
import { API } from '../api/config'
import { award } from '../api/gamification'
import WordDetail from '../components/WordDetail'

const TOPICS = [
  { id: 'mua-sam',   label: '🛒 Mua sắm'   },
  { id: 'an-uong',   label: '🍜 Ăn uống'   },
  { id: 'du-lich',   label: '✈️ Du lịch'   },
  { id: 'hoc-tap',   label: '🏫 Học tập'   },
  { id: 'cong-viec', label: '💼 Công việc'  },
]

let _aud = null
function playAudio(text) {
  if (_aud) { _aud.pause(); _aud = null }
  _aud = new Audio(`${API}/tts?text=${encodeURIComponent(text)}`)
  _aud.play().catch(() => {})
}

// ─── ErrorBadge ───────────────────────────────────────────────────────────────
function ErrorBadge({ analysis }) {
  const [open, setOpen] = useState(false)
  if (!analysis) return null
  return (
    <div className="relative mt-1 self-end">
      <button
        onClick={() => setOpen(v => !v)}
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          analysis.has_error
            ? 'bg-orange-100 text-orange-700'
            : 'bg-green-100 text-green-700'}`}>
        {analysis.has_error ? `⚠️ ${analysis.errors?.length ?? 1} lỗi` : '✅ Chính xác'}
      </button>
      {open && analysis.has_error && (
        <div className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64 space-y-2">
          <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 text-xs">✕</button>
          {analysis.errors?.map((e, i) => (
            <div key={i} className="text-xs text-gray-700">
              <span className="text-red-500 font-hanzi">{e.wrong}</span>
              {' → '}
              <span className="text-green-600 font-hanzi">{e.correct}</span>
              <p className="text-gray-500 mt-0.5">{e.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Bubbles ──────────────────────────────────────────────────────────────────
function AiBubble({ msg, showViet, onToggleViet }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">👨</div>
      <div>
        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
          <p className="font-hanzi text-lg text-gray-800 leading-snug">{msg.chinese}</p>
          {msg.pinyin && <p className="text-gray-400 text-xs mt-1">{msg.pinyin}</p>}
          {showViet && msg.vietnamese && (
            <p className="text-blue-500 text-xs mt-0.5 border-t border-gray-100 pt-1">{msg.vietnamese}</p>
          )}
        </div>
        <div className="flex gap-3 mt-1 ml-1">
          <button onClick={() => playAudio(msg.chinese)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors">🔊</button>
          <button onClick={onToggleViet}
            className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
            {showViet ? 'Ẩn nghĩa' : 'Xem nghĩa'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserBubble({ msg }) {
  return (
    <div className="flex flex-col items-end">
      <div className="bg-red-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] shadow-sm">
        <p className="font-hanzi text-base">{msg.text}</p>
      </div>
      <ErrorBadge analysis={msg.analysis} />
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-lg shrink-0">👨</div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Vocab Panel (overlay on mobile, sidebar on desktop) ──────────────────────
function VocabPanel({ vocab, level, onClose, onWordClick }) {
  return (
    <>
      {/* Mobile: overlay backdrop */}
      <div className="fixed inset-0 bg-black/30 z-20 sm:hidden" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl z-30 flex flex-col sm:static sm:z-auto sm:shadow-none sm:w-64 sm:border-l sm:border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-sm text-gray-700">📚 Từ vựng buổi học</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 sm:hidden">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-wrap gap-2 content-start">
          {vocab.length === 0
            ? <p className="text-xs text-gray-400 p-2 w-full text-center">Chưa có từ vựng nào.<br/>Hãy bắt đầu trò chuyện!</p>
            : vocab.map(v => (
              <button key={v.id}
                onClick={() => onWordClick({ chinese: v.word, pinyin: '', vietnamese: '', hsk_level: level })}
                className="font-hanzi text-base bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200 transition-colors">
                {v.word}
              </button>
            ))
          }
        </div>
      </div>
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [topic,      setTopic]      = useState('an-uong')
  const [level,      setLevel]      = useState(1)
  const [typing,     setTyping]     = useState(false)
  const [aiError,    setAiError]    = useState(null)    // lỗi khởi động
  const [showViet,   setShowViet]   = useState({})
  const [vocab,      setVocab]      = useState([])
  const [wordDetail, setWordDetail] = useState(null)
  const [showPanel,  setShowPanel]  = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef   = useRef(null)   // abort controller cho request đang chạy

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Khởi đầu / reset khi đổi topic hoặc level
  useEffect(() => {
    // Huỷ request cũ nếu đang chạy
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    setMessages([])
    setVocab([])
    setErrorCount(0)
    setAiError(null)
    setTyping(true)

    const topicLabel = TOPICS.find(t => t.id === topic)?.label ?? topic

    fetch(`${API}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', text: '你好' }],
        hsk_level: level,
        topic: topicLabel,
      }),
      signal,
    })
      .then(r => r.json())
      .then(data => {
        if (signal.aborted) return
        if (data.error) { setAiError(data.error); return }
        const aiMsg = {
          id: Date.now(), role: 'ai',
          chinese: data.reply_chinese,
          pinyin:  data.reply_pinyin,
          vietnamese: data.reply_vietnamese,
        }
        setMessages([aiMsg])
        playAudio(data.reply_chinese)
        collectVocab(data.reply_chinese)
      })
      .catch(e => { if (e.name !== 'AbortError') setAiError('Không kết nối được AI. Thử lại sau.') })
      .finally(() => { if (!signal.aborted) setTyping(false) })

    return () => abortRef.current?.abort()
  }, [topic, level])

  const collectVocab = (text) => {
    const words = text.match(/[一-鿿]+/g) || []
    setVocab(prev => {
      const seen = new Set(prev.map(v => v.word))
      const next = words.filter(w => !seen.has(w)).map(w => ({ word: w, id: `${Date.now()}-${w}` }))
      return [...prev, ...next].slice(-30)
    })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || typing) return
    setInput('')
    setAiError(null)

    const userMsg = { id: Date.now(), role: 'user', text, analysis: null }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setTyping(true)

    const topicLabel = TOPICS.find(t => t.id === topic)?.label ?? topic

    const [chatResult, analysisResult] = await Promise.allSettled([
      fetch(`${API}/ai/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, hsk_level: level, topic: topicLabel }),
      }).then(r => r.json()),

      fetch(`${API}/ai/analyze-message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: text, hsk_level: level }),
      }).then(r => r.json()).catch(() => null),
    ])

    // Gắn analysis vào userMsg
    const analysis = analysisResult.status === 'fulfilled' ? analysisResult.value : null
    if (analysis?.has_error) setErrorCount(n => n + 1)
    setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, analysis } : m))

    if (chatResult.status === 'fulfilled' && !chatResult.value.error) {
      const d = chatResult.value
      const aiMsg = {
        id: Date.now() + 1, role: 'ai',
        chinese: d.reply_chinese,
        pinyin:  d.reply_pinyin,
        vietnamese: d.reply_vietnamese,
      }
      setMessages(prev => [...prev, aiMsg])
      playAudio(d.reply_chinese)
      collectVocab(d.reply_chinese)
    } else {
      const errMsg = chatResult.value?.error ?? 'Không nhận được phản hồi từ AI.'
      setAiError(errMsg)
    }

    setTyping(false)
    inputRef.current?.focus()
  }

  const handleNewConversation = async () => {
    if (messages.length > 1) {
      fetch(`${API}/chat-history`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, hsk_level: level, messages, error_count: errorCount }),
      }).catch(() => {})
      award('chat_session', { topic, message_count: messages.length }).catch(() => {})
    }
    // Reset topic trigger sẽ gọi lại useEffect
    setTopic(t => t) // không đổi topic → dùng trick để re-trigger
    // Dùng cách thực tế hơn: đặt lại messages và gọi lại
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    const topicLabel = TOPICS.find(t => t.id === topic)?.label ?? topic

    setMessages([]); setVocab([]); setErrorCount(0); setAiError(null); setTyping(true)

    fetch(`${API}/ai/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', text: '你好' }], hsk_level: level, topic: topicLabel }),
      signal,
    })
      .then(r => r.json())
      .then(data => {
        if (signal.aborted || data.error) return
        const aiMsg = { id: Date.now(), role: 'ai', chinese: data.reply_chinese, pinyin: data.reply_pinyin, vietnamese: data.reply_vietnamese }
        setMessages([aiMsg])
        playAudio(data.reply_chinese)
        collectVocab(data.reply_chinese)
      })
      .catch(() => {})
      .finally(() => { if (!signal.aborted) setTyping(false) })
  }

  const toggleViet = (id) => setShowViet(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="flex h-screen overflow-hidden relative">

      {/* ── Chat area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 py-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-xl shrink-0">👨</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm font-hanzi leading-none">李明
              <span className="font-sans font-normal text-gray-500 text-xs ml-1">(Lǐ Míng)</span>
            </p>
            <p className="text-xs text-green-500 mt-0.5">Đang online</p>
          </div>
          <select value={topic} onChange={e => setTopic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none max-w-[110px]">
            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none w-[68px]">
            {[1,2,3,4,5,6].map(lv => <option key={lv} value={lv}>HSK {lv}</option>)}
          </select>
          <button onClick={() => setShowPanel(v => !v)}
            className={`text-xs border rounded-lg px-2 py-1 shrink-0 transition-colors ${
              showPanel ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
            📚
          </button>
          <button onClick={handleNewConversation}
            className="text-gray-400 hover:text-red-600 text-lg shrink-0" title="Cuộc trò chuyện mới">🔄</button>
        </div>

        {/* Error banner */}
        {aiError && (
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
            <span className="text-orange-600 text-xs flex-1">⚠️ {aiError}</span>
            <button onClick={() => setAiError(null)} className="text-orange-400 text-xs">✕</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages.length === 0 && !typing && !aiError && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <p className="text-3xl mb-2">👨</p>
              <p>Đang chờ 李明 chào bạn...</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai'
                ? <AiBubble msg={msg} showViet={!!showViet[msg.id]} onToggleViet={() => toggleViet(msg.id)} />
                : <UserBubble msg={msg} />
              }
            </div>
          ))}
          {typing && <TypingBubble />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-3 py-3">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Nhập tiếng Trung... (Enter để gửi)"
              disabled={typing}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 font-hanzi text-base focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-50"
            />
            <button onClick={() => input.trim() && playAudio(input)} disabled={!input.trim()}
              className="w-11 h-11 rounded-xl bg-gray-100 text-lg hover:bg-gray-200 disabled:opacity-40 shrink-0">🔊</button>
            <button onClick={handleSend} disabled={!input.trim() || typing}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:bg-red-700 shrink-0">
              Gửi
            </button>
          </div>
        </div>
      </div>

      {/* ── Vocab panel ─────────────────────────────────────────────────────── */}
      {showPanel && (
        <VocabPanel
          vocab={vocab}
          level={level}
          onClose={() => setShowPanel(false)}
          onWordClick={setWordDetail}
        />
      )}

      {wordDetail && <WordDetail word={wordDetail} onClose={() => setWordDetail(null)} />}
    </div>
  )
}
