import { useState, useEffect, useRef } from 'react'
import SentenceBuilder from '../components/SentenceBuilder'
import { API } from '../api/config'

// ─── Tab 1: Sắp xếp câu ──────────────────────────────────────────────────────
function SentenceOrderTab({ level }) {
  const [items,   setItems]   = useState([])
  const [idx,     setIdx]     = useState(0)
  const [score,   setScore]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const load = () => {
    setLoading(true); setError(null)
    fetch(`${API}/vocabulary/sentences?level=${level}&limit=20`)
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setIdx(0) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [level])

  const handleNext = () => setIdx(i => i + 1)

  if (loading) return <div className="text-center text-gray-400 py-20">Đang tải câu...</div>
  if (error)   return <div className="text-red-500 text-sm p-4">{error}</div>
  if (!items.length) return <div className="text-center text-gray-400 py-16">HSK {level} chưa có câu ví dụ.</div>

  if (idx >= items.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-5xl">🎉</p>
        <p className="text-xl font-bold text-gray-800">Xong {items.length} câu!</p>
        <p className="text-gray-500">Đúng: <span className="text-green-600 font-bold">{score}</span> / {items.length}</p>
        <button onClick={() => { load(); setScore(0) }}
          className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold">Làm lại</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Câu {idx + 1} / {items.length}</span>
        <span className="text-green-600 font-semibold">✅ {score} đúng</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 transition-all" style={{ width: `${(idx / items.length) * 100}%` }} />
      </div>
      <SentenceBuilder
        key={`${level}-${idx}`}
        item={items[idx]}
        onCorrect={() => setScore(s => s + 1)}
        onWrong={() => {}}
        onNext={handleNext}
      />
    </div>
  )
}

// ─── Tab 2: Tự đặt câu ───────────────────────────────────────────────────────
function FreeWriteTab({ level }) {
  const [word,        setWord]        = useState(null)
  const [sentence,    setSentence]    = useState('')
  const [showExample, setShowExample] = useState(false)
  const [grading,     setGrading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history,     setHistory]     = useState([])
  const [histDetail,  setHistDetail]  = useState(null)
  const textRef = useRef(null)

  const loadWord = () => {
    fetch(`${API}/vocabulary/${level}`)
      .then(r => r.json())
      .then(d => {
        const words = d.data || []
        setWord(words[Math.floor(Math.random() * words.length)] || null)
        setSentence(''); setShowExample(false); setResult(null)
      })
  }

  const loadHistory = () => {
    fetch(`${API}/writing-history`)
      .then(r => r.json())
      .then(d => setHistory(d.data || []))
  }

  useEffect(() => { loadWord() }, [level])

  const handleGrade = async () => {
    if (!sentence.trim() || !word) return
    setGrading(true)
    try {
      const r = await fetch(`${API}/ai/grade`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_word: word.chinese, user_sentence: sentence, hsk_level: level }),
      })
      const data = await r.json()
      setResult(data)
      // lưu lịch sử
      await fetch(`${API}/writing-history`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_word: word.chinese, user_sentence: sentence,
          score: data.score, feedback: data.feedback,
          corrected_sentence: data.corrected_sentence,
        }),
      })
    } catch (e) {
      setResult({ error: e.message })
    }
    setGrading(false)
  }

  const stars = (score) => {
    if (score >= 9) return '⭐⭐⭐'
    if (score >= 7) return '⭐⭐'
    if (score >= 5) return '⭐'
    return ''
  }

  if (!word) return <div className="text-center text-gray-400 py-20">Đang tải...</div>

  if (historyOpen) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setHistoryOpen(false); setHistDetail(null) }}
          className="text-sm text-gray-500 hover:text-red-600">← Quay lại</button>
        <h3 className="font-bold text-gray-700">Lịch sử 20 câu gần nhất</h3>
        {history.length === 0 && <p className="text-gray-400 text-sm">Chưa có lịch sử.</p>}
        <div className="space-y-2">
          {history.map(h => (
            <button key={h.id} onClick={() => setHistDetail(histDetail?.id === h.id ? null : h)}
              className="w-full text-left bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-red-400 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-hanzi text-lg">{h.target_word}</span>
                <span className="text-sm">{h.score ? `${h.score}/10 ${stars(h.score)}` : '—'}</span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{new Date(h.created_at).toLocaleDateString('vi-VN')}</p>
              {histDetail?.id === h.id && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="text-gray-600"><span className="font-semibold">Câu bạn viết:</span> {h.user_sentence}</p>
                  {h.corrected_sentence && <p className="text-green-700"><span className="font-semibold">✅ Câu đúng:</span> {h.corrected_sentence}</p>}
                  {h.feedback && <p className="text-gray-500">💬 {h.feedback}</p>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Từ cần đặt câu */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 text-center space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Đặt câu với từ</p>
        <p className="font-hanzi text-5xl text-gray-800">{word.chinese}</p>
        <p className="text-red-500">{word.pinyin}</p>
        <p className="text-gray-500 text-sm">{word.vietnamese}</p>
        <div className="flex justify-center gap-2 pt-1">
          <button onClick={() => setShowExample(v => !v)}
            className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:border-red-400">
            {showExample ? 'Ẩn' : 'Xem câu mẫu'}
          </button>
          <button onClick={loadWord}
            className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:border-red-400">
            Từ khác
          </button>
        </div>
        {showExample && word.example && (
          <p className="font-hanzi text-base text-gray-600 bg-gray-50 rounded-xl px-4 py-2">{word.example}</p>
        )}
      </div>

      {/* Textarea */}
      {!result && (
        <>
          <textarea
            ref={textRef}
            value={sentence}
            onChange={e => setSentence(e.target.value)}
            placeholder="Gõ câu tiếng Trung của bạn tại đây..."
            rows={3}
            className="w-full border-2 border-gray-300 focus:border-red-400 rounded-xl px-4 py-3 font-hanzi text-xl resize-none focus:outline-none"
          />
          <button
            onClick={handleGrade}
            disabled={!sentence.trim() || grading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
              sentence.trim() && !grading
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {grading ? 'AI đang chấm bài...' : 'Nhờ AI chấm ✨'}
          </button>
        </>
      )}

      {/* Kết quả */}
      {result && !result.error && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-5 py-4 text-center">
            <p className="text-3xl font-black text-gray-800">{result.score}<span className="text-lg text-gray-400">/10</span></p>
            <p className="text-2xl">{stars(result.score)}</p>
          </div>
          <div className="px-5 py-4 divide-y divide-gray-100 space-y-3">
            <div className="pb-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Câu bạn viết</p>
              <p className="font-hanzi text-lg text-gray-700">{sentence}</p>
            </div>
            {result.corrected_sentence && (
              <div className="pt-3 pb-3">
                <p className="text-xs font-semibold text-green-600 mb-1">✅ Câu đúng</p>
                <p className="font-hanzi text-lg text-green-700">{result.corrected_sentence}</p>
              </div>
            )}
            {result.errors?.length > 0 && (
              <div className="pt-3 pb-3">
                <p className="text-xs font-semibold text-orange-600 mb-2">⚠️ Lỗi cần sửa</p>
                <ul className="space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-sm text-gray-600">
                      <span className="text-red-500">• [{e.type}]</span> {e.description}
                      {e.wrong && <span className="mx-1 text-red-400 line-through">{e.wrong}</span>}
                      {e.correct && <span className="text-green-600">→ {e.correct}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.feedback && (
              <div className="pt-3 pb-1">
                <p className="text-sm text-gray-600">💬 {result.feedback}</p>
                {result.encouragement && <p className="text-sm text-blue-600 mt-1">💪 {result.encouragement}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {result?.error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">{result.error}</div>
      )}

      {result && (
        <div className="flex gap-3">
          <button onClick={loadWord}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm">Câu tiếp theo</button>
          <button onClick={() => { loadHistory(); setHistoryOpen(true) }}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Xem lịch sử
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function WritingPage() {
  const [tab,   setTab]   = useState('order')
  const [level, setLevel] = useState(1)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Đặt câu & Sắp xếp</h1>
        <select value={level} onChange={e => setLevel(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
          {[1,2,3,4,5,6].map(lv => <option key={lv} value={lv}>HSK {lv}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {[
          { id: 'order', label: '🧩 Sắp xếp câu' },
          { id: 'free',  label: '✍️ Tự đặt câu'  },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'order' && <SentenceOrderTab key={`order-${level}`} level={level} />}
      {tab === 'free'  && <FreeWriteTab     key={`free-${level}`}  level={level} />}
    </div>
  )
}
