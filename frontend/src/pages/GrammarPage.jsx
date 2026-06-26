import { useState, useEffect } from 'react'
import { getGrammarByLevel } from '../api/grammar'

function GrammarCard({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          <p className="text-gray-700 text-sm">{item.explanation}</p>
          {item.examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ví dụ</p>
              {item.examples.map((ex, i) => (
                <div key={i} className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                  <p className="font-hanzi text-xl text-gray-800">{ex.chinese}</p>
                  <p className="text-blue-600 text-sm mt-0.5">{ex.pinyin}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{ex.vietnamese}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GrammarPage() {
  const [level, setLevel]     = useState(1)
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

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

      {/* Level selector */}
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

      {loading && (
        <div className="flex justify-center py-16 text-gray-400">Đang tải...</div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">
          Lỗi: {error}
        </div>
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
