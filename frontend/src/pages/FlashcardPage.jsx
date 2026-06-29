import { useState, useEffect, useCallback } from 'react'
import FlashCard from '../components/FlashCard'
import WordDetail from '../components/WordDetail'
import { getVocabularyByLevel, saveProgress } from '../api/vocabulary'
import { API } from '../api/config'

const MAX_LEVEL = 6

function Spinner() {
  return (
    <div className="flex justify-center items-center py-24">
      <div className="w-10 h-10 border-4 border-[#C0392B]/20 border-t-[#C0392B] rounded-full animate-spin" />
    </div>
  )
}

export default function FlashcardPage() {
  const [level, setLevel]       = useState(1)
  const [deck, setDeck]         = useState([])
  const [index, setIndex]       = useState(0)
  const [known, setKnown]       = useState([])
  const [unknown, setUnknown]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [done, setDone]         = useState(false)
  const [shuffled, setShuffled]   = useState(false)
  const [wordDetail, setWordDetail] = useState(null)
  const [dueCount,   setDueCount]   = useState(0)
  const [srsMode,    setSrsMode]    = useState(false)

  // Load từ vựng khi đổi level
  useEffect(() => {
    setLoading(true)
    setError(null)
    setDone(false)
    setIndex(0)
    setKnown([])
    setUnknown([])
    setShuffled(false)

    if (srsMode) {
      fetch(`${API}/vocabulary/due-today`)
        .then(r => r.json())
        .then(res => setDeck(res.data ?? []))
        .catch(() => setError('Không thể kết nối backend.'))
        .finally(() => setLoading(false))
    } else {
      getVocabularyByLevel(level)
        .then(res => setDeck(res.data ?? []))
        .catch(() => setError('Không thể kết nối backend. Hãy chắc chắn server đang chạy tại localhost:3001'))
        .finally(() => setLoading(false))
    }
  }, [level, srsMode])

  // Lấy số từ cần ôn hôm nay
  useEffect(() => {
    fetch(`${API}/vocabulary/due-today`)
      .then(r => r.json())
      .then(d => setDueCount(d.count ?? 0))
      .catch(() => {})
  }, [])

  const advance = useCallback((nextIndex) => {
    if (nextIndex >= deck.length) setDone(true)
    else setIndex(nextIndex)
  }, [deck.length])

  function handleKnow(word) {
    setKnown(k => [...k, word])
    saveProgress(word.id, 'known').catch(() => {})   // fire-and-forget
    advance(index + 1)
  }

  function handleUnknow(word) {
    setUnknown(u => [...u, word])
    saveProgress(word.id, 'unknown').catch(() => {}) // fire-and-forget
    advance(index + 1)
  }

  function handleShuffle() {
    const copy = [...deck].sort(() => Math.random() - 0.5)
    setDeck(copy)
    setIndex(0)
    setKnown([])
    setUnknown([])
    setDone(false)
    setShuffled(true)
  }

  function reviewUnknown() {
    setDeck([...unknown].sort(() => Math.random() - 0.5))
    setIndex(0)
    setKnown([])
    setUnknown([])
    setDone(false)
  }

  function nextLevel() {
    if (level < MAX_LEVEL) setLevel(l => l + 1)
  }

  const current  = deck[index]
  const total    = deck.length
  const progress = total ? Math.round((index / total) * 100) : 0

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* ── HEADER ───────────────────────────────── */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Flashcard</h1>

          {/* SRS mode */}
          {dueCount > 0 && (
            <button
              onClick={() => setSrsMode(v => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${srsMode ? 'bg-orange-100 border-orange-400 text-orange-700' : 'border-orange-300 text-orange-500 hover:bg-orange-50'}`}>
              📅 {srsMode ? 'Đang ôn' : `${dueCount} từ cần ôn`}
            </button>
          )}
          {/* Nút xáo trộn */}
          <button
            onClick={handleShuffle}
            disabled={loading || done}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                       border border-gray-200 text-gray-500 hover:border-[#C0392B] hover:text-[#C0392B]
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            🔀 {shuffled ? 'Xáo lại' : 'Xáo trộn'}
          </button>
        </div>

        {/* Dropdown HSK */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 shrink-0">Cấp HSK:</span>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map(lv => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-colors
                  ${level === lv
                    ? 'bg-[#C0392B] text-white shadow'
                    : 'bg-gray-100 text-gray-500 hover:bg-[#C0392B]/10 hover:text-[#C0392B]'
                  }`}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {!loading && !done && total > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span className="font-medium text-gray-600">
                {index} / {total} từ
              </span>
              <div className="flex gap-3">
                <span className="text-green-500 font-medium">✅ {known.length} thuộc</span>
                <span className="text-[#C0392B] font-medium">❌ {unknown.length} chưa</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C0392B] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── STATES ───────────────────────────────── */}
      {loading && <Spinner />}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-[#C0392B] font-semibold mb-1">Lỗi kết nối</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      )}

      {/* ── MÀN HÌNH TỔNG KẾT ────────────────────── */}
      {!loading && !error && done && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-6xl mb-4">
            {known.length === total ? '🏆' : known.length >= total / 2 ? '🎉' : '💪'}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Hoàn thành!</h2>
          <p className="text-gray-500 text-lg mb-6">
            Thuộc{' '}
            <span className="font-black text-[#C0392B] text-2xl">{known.length}</span>
            {' '}/ {total} từ HSK {level}
          </p>

          {/* Thống kê mini */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-black text-green-500">{known.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Thuộc rồi ✅</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="text-center">
              <p className="text-3xl font-black text-[#C0392B]">{unknown.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Chưa thuộc ❌</p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-3">
            {unknown.length > 0 && (
              <button
                onClick={reviewUnknown}
                className="flex-1 py-3 rounded-xl border-2 border-[#C0392B] text-[#C0392B]
                           font-semibold hover:bg-[#C0392B] hover:text-white transition-all"
              >
                🔁 Ôn lại {unknown.length} từ chưa thuộc
              </button>
            )}
            {level < MAX_LEVEL && (
              <button
                onClick={nextLevel}
                className="flex-1 py-3 rounded-xl bg-[#C0392B] text-white font-semibold
                           hover:bg-[#96281B] transition-colors"
              >
                Học HSK {level + 1} →
              </button>
            )}
            {level === MAX_LEVEL && unknown.length === 0 && (
              <p className="text-gray-400 text-sm py-2">
                🎓 Bạn đã hoàn thành tất cả các cấp!
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── FLASHCARD ────────────────────────────── */}
      {!loading && !error && !done && current && (
        <>
          <FlashCard
            key={`${current.id}-${index}`}
            word={current}
            onKnow={handleKnow}
            onUnknow={handleUnknow}
          />
          <div className="mt-3 flex justify-center">
            <button onClick={() => setWordDetail(current)}
              className="text-xs text-gray-400 hover:text-red-600 underline underline-offset-2">
              Chi tiết từ này
            </button>
          </div>
        </>
      )}

      {wordDetail && <WordDetail word={wordDetail} onClose={() => setWordDetail(null)} />}
    </main>
  )
}
