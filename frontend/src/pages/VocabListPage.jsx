import { useState, useEffect } from 'react'
import { getVocabularyByLevel } from '../api/vocabulary'

const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-[#C0392B]/20 border-t-[#C0392B] rounded-full animate-spin" />
    </div>
  )
}

function VocabCard({ item }) {
  // Làm sạch pinyin: bỏ dấu /.../ nếu có
  const pinyin = item.pinyin.replace(/^\/|\/$/g, '').trim()

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4 hover:shadow-md hover:border-[#C0392B]/20 transition-all">
      <span className="font-hanzi text-3xl font-bold text-[#C0392B] leading-none mt-1 min-w-[2.5rem]">
        {item.chinese}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-blue-500 font-medium">{pinyin}</p>
        <p className="text-gray-700 font-medium mt-0.5">{item.vietnamese}</p>
        {item.example && (
          <p className="font-hanzi text-gray-400 text-sm mt-1 truncate">{item.example}</p>
        )}
      </div>
    </div>
  )
}

export default function VocabListPage() {
  const [level, setLevel]   = useState(1)
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getVocabularyByLevel(level)
      .then(res => { if (!cancelled) setData(res.data ?? []) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [level])

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách từ vựng</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-1">
              HSK {level} — <span className="font-semibold text-[#C0392B]">{data.length} từ</span>
            </p>
          )}
        </div>

        {/* Dropdown cấp HSK */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Cấp HSK:</span>
          <div className="flex gap-1 flex-wrap">
            {HSK_LEVELS.map(lv => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-colors
                  ${level === lv
                    ? 'bg-[#C0392B] text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-[#C0392B]/10 hover:text-[#C0392B]'
                  }`}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* States */}
      {loading && <Spinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-[#C0392B] font-semibold mb-1">Không thể kết nối backend</p>
          <p className="text-gray-500 text-sm">Hãy chắc chắn server đang chạy tại <code className="bg-gray-100 px-1 rounded">localhost:3001</code></p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Chưa có từ vựng cho HSK {level}</p>
        </div>
      )}

      {/* Word list */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map(item => (
            <VocabCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}
