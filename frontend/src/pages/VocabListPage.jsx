import { useState, useEffect, useRef } from 'react'
import { getVocabularyByLevel } from '../api/vocabulary'
import { API } from '../api/config'

const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-[#C0392B]/20 border-t-[#C0392B] rounded-full animate-spin" />
    </div>
  )
}

function VocabCard({ item }) {
  const pinyin  = (item.pinyin || '').replace(/^\/|\/$/g, '').trim()
  const [playing, setPlaying] = useState(false)
  const audRef = useRef(null)

  const handlePlay = (e) => {
    e.stopPropagation()
    if (audRef.current) { audRef.current.pause(); audRef.current = null }
    setPlaying(true)
    const a = new Audio(`${API}/tts?text=${encodeURIComponent(item.chinese)}&speed=normal`)
    audRef.current = a
    a.onended = () => setPlaying(false)
    a.onerror = () => setPlaying(false)
    a.play().catch(() => setPlaying(false))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 hover:shadow-md hover:border-[#C0392B]/20 transition-all">
      <button
        onClick={handlePlay}
        title="Phát âm"
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors text-base
          ${playing ? 'bg-[#C0392B] text-white' : 'bg-red-50 hover:bg-red-100 text-[#C0392B]'}`}
      >
        {playing ? '🔊' : '🔈'}
      </button>
      <span className="font-hanzi text-3xl font-bold text-[#C0392B] leading-none min-w-[2.5rem]">
        {item.chinese}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-base text-blue-500 font-medium">{pinyin}</p>
        <p className="text-gray-700 font-semibold text-base mt-0.5">{item.vietnamese}</p>
        {item.example && (
          <p className="font-hanzi text-gray-400 text-sm mt-0.5 truncate">{item.example}</p>
        )}
      </div>
    </div>
  )
}

export default function VocabListPage() {
  const [level,   setLevel]   = useState(1)
  const [data,    setData]    = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setSearch('')

    getVocabularyByLevel(level)
      .then(res => { if (!cancelled) setData(res.data ?? []) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [level])

  const filtered = search.trim()
    ? data.filter(w =>
        w.chinese.includes(search) ||
        (w.pinyin || '').toLowerCase().includes(search.toLowerCase()) ||
        (w.vietnamese || '').toLowerCase().includes(search.toLowerCase())
      )
    : data

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách từ vựng</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-1">
              HSK {level} — <span className="font-semibold text-[#C0392B]">
                {search ? `${filtered.length} / ` : ''}{data.length} từ
              </span>
            </p>
          )}
        </div>

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

      {/* Thanh tìm kiếm */}
      {!loading && !error && data.length > 0 && (
        <div className="relative mb-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo chữ Hán, pinyin hoặc nghĩa tiếng Việt..."
            className="w-full border border-gray-300 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C0392B]/30 focus:border-[#C0392B]"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none">
              ×
            </button>
          )}
        </div>
      )}

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

      {!loading && !error && search && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p>Không tìm thấy từ nào khớp với "<span className="font-medium text-gray-600">{search}</span>"</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map(item => (
            <VocabCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  )
}
