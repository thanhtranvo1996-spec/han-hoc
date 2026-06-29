import { useState, useEffect } from 'react'
import { getGrammarByLevel } from '../api/grammar'
import { API } from '../api/config'

// ─── Renderer markdown đơn giản ───────────────────────────────────────────────
function SimpleMarkdown({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 text-sm text-gray-700 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />

        // Heading ##
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-bold text-gray-900 text-base mt-3 mb-1">{line.slice(3)}</h3>
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold text-gray-800 mt-2">{line.slice(4)}</h4>
        }

        // Inline bold **text**
        const parts = line.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
          .replace(/\*(.+?)\*/g, '<i>$1</i>')

        // List item
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <p key={i} className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-red-400"
               dangerouslySetInnerHTML={{ __html: parts.replace(/^[-•]\s*/, '') }} />
          )
        }
        // Numbered list
        if (/^\d+\.\s/.test(line)) {
          return <p key={i} className="pl-4" dangerouslySetInnerHTML={{ __html: parts }} />
        }

        return <p key={i} dangerouslySetInnerHTML={{ __html: parts }} />
      })}
    </div>
  )
}

// ─── Bài tập trắc nghiệm ─────────────────────────────────────────────────────
function ExerciseQuestion({ ex, idx }) {
  const [chosen, setChosen] = useState(null)

  const handleChoose = (i) => {
    if (chosen !== null) return
    setChosen(i)
  }

  const getStyle = (i) => {
    if (chosen === null) return 'border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50'
    if (i === ex.correct)  return 'border-green-500 bg-green-50 text-green-800 font-semibold'
    if (i === chosen)      return 'border-red-400 bg-red-50 text-red-700'
    return 'border-gray-100 text-gray-400'
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-gray-800 text-sm">
        <span className="text-red-600 font-bold mr-2">Câu {idx + 1}.</span>
        <span className="font-hanzi">{ex.question}</span>
      </p>
      <div className="grid grid-cols-1 gap-2">
        {ex.choices.map((ch, i) => (
          <button key={i} onClick={() => handleChoose(i)} disabled={chosen !== null}
            className={`border-2 rounded-xl px-4 py-2.5 text-sm text-left transition-colors ${getStyle(i)}`}>
            <span className="font-bold mr-2 text-gray-500">
              {String.fromCharCode(65 + i)}.
            </span>
            {i === ex.correct && chosen !== null && '✅ '}
            {i === chosen && chosen !== ex.correct && '❌ '}
            <span className="font-hanzi">{ch}</span>
          </button>
        ))}
      </div>
      {chosen !== null && (
        <div className={`rounded-lg px-3 py-2 text-xs ${chosen === ex.correct ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-800'}`}>
          💡 {ex.explanation}
        </div>
      )}
    </div>
  )
}

function ExercisesPanel({ exercises, loading, error, onLoad }) {
  if (loading) return <div className="text-center text-gray-400 py-8 text-sm">AI đang tạo bài tập...</div>
  if (error)   return (
    <div className="text-center space-y-2 py-4">
      <p className="text-red-500 text-sm">{error}</p>
      <button onClick={onLoad} className="text-xs text-red-600 underline">Thử lại</button>
    </div>
  )
  if (!exercises) return (
    <div className="text-center py-6">
      <p className="text-gray-500 text-sm mb-3">Nhấn để AI tạo bài tập luyện tập cho điểm ngữ pháp này</p>
      <button onClick={onLoad}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
        Tạo bài tập ✨
      </button>
    </div>
  )
  return (
    <div className="space-y-5">
      {exercises.map((ex, i) => <ExerciseQuestion key={i} ex={ex} idx={i} />)}
      <button onClick={onLoad}
        className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
        🔄 Tạo bài tập mới
      </button>
    </div>
  )
}

// ─── Card ngữ pháp ─────────────────────────────────────────────────────────────
function GrammarCard({ item }) {
  const [open,      setOpen]      = useState(false)
  const [tab,       setTab]       = useState('overview')  // 'overview' | 'detail' | 'exercise'

  const [detail,    setDetail]    = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailErr, setDetailErr] = useState(null)

  const [exercises, setExercises] = useState(null)
  const [exLoading, setExLoading] = useState(false)
  const [exErr,     setExErr]     = useState(null)

  const loadDetail = async () => {
    setDetailLoading(true); setDetailErr(null)
    try {
      const r = await fetch(`${API}/grammar/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern:     item.pattern,
          explanation: item.explanation,
          hsk_level:   item.hsk_level,
          examples:    item.examples,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Lỗi server')
      setDetail(d.content)
    } catch (e) {
      setDetailErr(e.message)
    }
    setDetailLoading(false)
  }

  const loadExercises = async () => {
    setExLoading(true); setExErr(null)
    try {
      const r = await fetch(`${API}/grammar/exercise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern:     item.pattern,
          explanation: item.explanation,
          hsk_level:   item.hsk_level,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Lỗi server')
      setExercises(d.exercises || [])
    } catch (e) {
      setExErr(e.message)
    }
    setExLoading(false)
  }

  const handleTab = (t) => {
    setTab(t)
    if (t === 'detail' && !detail && !detailLoading) loadDetail()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-red-50 transition-colors"
      >
        <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 text-sm font-bold flex items-center justify-center">
          {item.stt}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm leading-snug">{item.pattern}</p>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.explanation}</p>
        </div>
        <span className="flex-shrink-0 text-gray-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {[
              { id: 'overview', label: '📖 Tổng quan'         },
              { id: 'detail',   label: '🔍 Giải thích chi tiết' },
              { id: 'exercise', label: '✏️ Bài tập'            },
            ].map(t => (
              <button key={t.id} onClick={() => handleTab(t.id)}
                className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  tab === t.id
                    ? 'border-red-500 text-red-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-5 py-4">

            {/* Tab: Tổng quan */}
            {tab === 'overview' && (
              <div className="space-y-3">
                <p className="text-gray-700 text-sm">{item.explanation}</p>
                {item.examples.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ví dụ</p>
                    {item.examples.map((ex, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                        <p className="font-hanzi text-xl text-gray-800">{ex.chinese}</p>
                        <p className="text-blue-600 text-sm mt-0.5">{ex.pinyin}</p>
                        <p className="text-gray-600 text-sm mt-0.5">{ex.vietnamese}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Giải thích chi tiết */}
            {tab === 'detail' && (
              <div>
                {detailLoading && (
                  <div className="text-center text-gray-400 py-8 text-sm">
                    <div className="inline-block w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mb-2" />
                    <p>AI đang giải thích...</p>
                  </div>
                )}
                {detailErr && (
                  <div className="text-center space-y-2 py-4">
                    <p className="text-red-500 text-sm">{detailErr}</p>
                    <button onClick={loadDetail} className="text-xs text-red-600 underline">Thử lại</button>
                  </div>
                )}
                {detail && <SimpleMarkdown text={detail} />}
              </div>
            )}

            {/* Tab: Bài tập */}
            {tab === 'exercise' && (
              <ExercisesPanel
                exercises={exercises}
                loading={exLoading}
                error={exErr}
                onLoad={loadExercises}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function GrammarPage() {
  const [level,   setLevel]   = useState(1)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getGrammarByLevel(level)
      .then(d => setItems(d.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [level])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Ngữ pháp</h1>
      <p className="text-gray-500 text-sm mb-6">Chọn cấp HSK để xem các điểm ngữ pháp</p>

      <div className="flex gap-2 flex-wrap mb-8">
        {[1,2,3,4,5,6].map(lv => (
          <button
            key={lv}
            onClick={() => setLevel(lv)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              level === lv
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            HSK {lv}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-16 text-gray-400">Đang tải...</div>}

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">Lỗi: {error}</div>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm text-gray-500 mb-4">{items.length} điểm ngữ pháp</p>
          <div className="space-y-3">
            {items.map(item => (
              <GrammarCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
