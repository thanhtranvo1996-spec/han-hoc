import { useState, useEffect } from 'react'
import { API } from '../api/config'

let _aud = null
function speak(text) {
  if (_aud) { _aud.pause(); _aud = null }
  _aud = new Audio(`${API}/tts?text=${encodeURIComponent(text)}&speed=normal`)
  _aud.play().catch(() => {})
}

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
}

function Section({ icon, title, children }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gray-700">{icon} {title}</p>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  )
}

export default function WordDetail({ word, onClose }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`${API}/ai/explain`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        chinese:   word.chinese,
        pinyin:    word.pinyin,
        vietnamese: word.vietnamese,
        hsk_level: word.hsk_level,
      }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [word.id])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-hanzi text-4xl text-gray-800">{word.chinese}</span>
              <button onClick={() => speak(word.chinese)} className="text-xl">🔊</button>
            </div>
            <p className="text-red-500 text-sm mt-0.5">{word.pinyin}</p>
            <p className="text-gray-500 text-sm">{word.vietnamese}</p>
            <span className="inline-block mt-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              HSK {word.hsk_level}
            </span>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {loading && (
            <>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-xl p-4">
              {error.includes('CLAUDE_API_KEY')
                ? 'Chưa cấu hình CLAUDE_API_KEY trong backend.'
                : `Lỗi: ${error}`}
            </div>
          )}

          {data && (
            <>
              <Section icon="📖" title="Giải thích">
                {data.explanation}
              </Section>

              <Section icon="💡" title="Cách dùng">
                {data.usage}
              </Section>

              <Section icon="📝" title="Câu ví dụ">
                <div className="space-y-2 mt-1">
                  {(data.examples || []).map((ex, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 flex gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-hanzi text-lg text-gray-800">{ex.chinese}</p>
                        <p className="text-blue-500 text-xs">{ex.pinyin}</p>
                        <p className="text-gray-500 text-xs">{ex.vietnamese}</p>
                      </div>
                      <button onClick={() => speak(ex.chinese)} className="shrink-0 text-lg self-center">🔊</button>
                    </div>
                  ))}
                </div>
              </Section>

              {data.similar_words && (
                <Section icon="⚠️" title="Từ dễ nhầm">
                  {data.similar_words}
                </Section>
              )}

              {data.memory_tip && (
                <Section icon="🧠" title="Mẹo ghi nhớ">
                  {data.memory_tip}
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
