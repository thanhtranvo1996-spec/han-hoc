import { useState, useEffect, useRef, useCallback } from 'react'
import { pinyin as toPinyin } from 'pinyin-pro'
import { API as BASE } from '../api/config'

function getPinyin(sentence) {
  if (sentence.pinyin) return sentence.pinyin
  try {
    return toPinyin(sentence.chinese, { toneType: 'symbol', separator: ' ' })
  } catch {
    return ''
  }
}

// ─── So sánh từng ký tự ──────────────────────────────────────────────────────
function DiffResult({ typed, target }) {
  if (!typed) return null
  const chars = target.split('')
  return (
    <div className="font-hanzi text-3xl tracking-widest flex flex-wrap gap-1 justify-center mt-3">
      {chars.map((ch, i) => {
        const t = typed[i]
        const cls = t === undefined
          ? 'text-gray-300'
          : t === ch
            ? 'text-green-600'
            : 'text-red-500'
        return (
          <span key={i} className={`relative ${cls}`}>
            {ch}
            {t !== undefined && t !== ch && (
              <span className="absolute -bottom-5 left-0 text-xs text-red-400 font-sans">{t}</span>
            )}
          </span>
        )
      })}
      {typed.length > target.length && (
        <span className="text-red-400 font-hanzi">
          {typed.slice(target.length)}
        </span>
      )}
    </div>
  )
}

// ─── Phát TTS câu hoàn chỉnh ─────────────────────────────────────────────────
function useSentenceAudio() {
  const [loading, setLoading] = useState(false)
  const audioRef = useRef(null)

  const play = useCallback(async (text) => {
    if (loading) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/tts/sentence`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS error ${res.status}`)
      const { audioBase64 } = await res.json()
      const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`)
      audioRef.current = audio
      await audio.play()
    } catch (e) {
      console.error('TTS failed:', e)
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { play, loading }
}

// ─── Card một câu ────────────────────────────────────────────────────────────
function SentenceCard({ sentence, onNext, onCorrect, onWrong }) {
  const [input,    setInput]    = useState('')
  const [checked,  setChecked]  = useState(false)
  const [revealed, setRevealed] = useState(false)
  const inputRef  = useRef(null)
  const { play, loading: ttsLoading } = useSentenceAudio()

  useEffect(() => {
    setInput(''); setChecked(false); setRevealed(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [sentence.id])

  const target  = sentence.chinese
  const isRight = input.trim() === target

  const handleCheck = () => {
    if (checked || !input.trim()) return
    setChecked(true)
    if (isRight) onCorrect()
    else         onWrong()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !checked) handleCheck()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Vietnamese prompt */}
      <div className="bg-red-50 px-6 py-5 border-b border-red-100">
        <p className="text-sm text-red-400 font-medium uppercase tracking-wider mb-1">Nghĩa tiếng Việt</p>
        <p className="text-2xl text-gray-800 font-medium leading-relaxed">{sentence.vietnamese}</p>
        <p className="text-base text-gray-400 mt-1">{getPinyin(sentence)}</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Nút nghe */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => play(target)}
            disabled={ttsLoading}
            title="Nghe câu tiếng Trung"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${ttsLoading
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait'
                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 active:scale-95'}`}
          >
            {ttsLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <span className="text-lg">🔊</span>
            )}
            {ttsLoading ? 'Đang tải...' : 'Nghe tiếng Trung'}
          </button>

          {checked && (
            <button
              onClick={() => setRevealed(v => !v)}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {revealed ? 'Ẩn đáp án' : 'Xem đáp án'}
            </button>
          )}
        </div>

        {/* Đáp án (khi reveal) */}
        {revealed && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-gray-400 mb-1">Đáp án đúng</p>
            <p className="font-hanzi text-3xl text-gray-800 tracking-widest">{target}</p>
          </div>
        )}

        {/* Input gõ tiếng Trung */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Gõ câu tiếng Trung
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => !checked && setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={checked}
              placeholder="输入中文..."
              lang="zh"
              className={`flex-1 border-2 rounded-xl px-4 py-3 font-hanzi text-xl focus:outline-none transition-colors
                ${checked && isRight  ? 'border-green-500 bg-green-50'
                : checked && !isRight ? 'border-red-400   bg-red-50'
                                      : 'border-gray-300  focus:border-red-400'}`}
            />
            {!checked && (
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors shrink-0"
              >
                Kiểm tra
              </button>
            )}
          </div>
        </div>

        {/* Kết quả so sánh */}
        {checked && (
          <div className={`rounded-xl px-4 py-4 ${isRight ? 'bg-green-50' : 'bg-red-50'}`}>
            {isRight ? (
              <p className="text-green-700 font-semibold text-center text-lg">✅ Chính xác!</p>
            ) : (
              <div className="space-y-3">
                <p className="text-red-600 font-semibold text-base">❌ Chưa đúng — xem chi tiết:</p>
                <div className="pb-6">
                  <DiffResult typed={input.trim()} target={target} />
                </div>
                <div className="mt-2 text-sm text-gray-500 flex gap-4 justify-center">
                  <span><span className="text-green-600 font-bold">Xanh</span> = đúng</span>
                  <span><span className="text-red-500 font-bold">Đỏ</span> = sai / thừa</span>
                  <span><span className="text-gray-300 font-bold">Mờ</span> = thiếu</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nút tiếp theo */}
        {checked && (
          <button
            onClick={onNext}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Câu tiếp theo →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TypingPage() {
  const [level,   setLevel]   = useState(1)
  const [pool,    setPool]    = useState([])
  const [idx,     setIdx]     = useState(0)
  const [score,   setScore]   = useState({ correct: 0, wrong: 0 })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const loadSentences = useCallback((lv) => {
    setLoading(true); setError(null)
    fetch(`${BASE}/typing-sentences?level=${lv}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => {
        setPool(d.sentences || [])
        setIdx(0)
        setScore({ correct: 0, wrong: 0 })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadSentences(level) }, [level])

  const advance = useCallback(() => {
    setIdx(i => {
      const next = i + 1
      if (next >= pool.length) { loadSentences(level); return 0 }
      return next
    })
  }, [pool.length, level, loadSentences])

  const current = pool[idx] ?? null

  return (
    <div>
      {/* Thanh cài đặt */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-3">
          <select
            value={level}
            onChange={e => setLevel(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {[1,2,3,4,5,6].map(lv => (
              <option key={lv} value={lv}>HSK {lv}</option>
            ))}
          </select>

          <div className="text-sm text-gray-500">
            Câu <span className="font-semibold text-gray-800">{idx + 1}</span>
            {pool.length > 0 && <> / {pool.length}</>}
          </div>

          <div className="ml-auto text-sm font-semibold tabular-nums">
            <span className="text-green-600">✅ {score.correct}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-red-500">❌ {score.wrong}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {loading && (
          <div className="text-center text-gray-400 py-20 text-lg">
            Đang tải câu luyện tập...
            <p className="text-sm mt-2 text-gray-300">Lần đầu có thể mất 10–20 giây</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">
            Lỗi: {error}
            <button onClick={() => loadSentences(level)} className="ml-3 underline">Thử lại</button>
          </div>
        )}

        {!loading && !error && !current && (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-3">😕</div>
            <p>Không có câu cho HSK {level}</p>
          </div>
        )}

        {!loading && !error && current && (
          <SentenceCard
            key={`${level}-${idx}-${current.id}`}
            sentence={current}
            onNext={advance}
            onCorrect={() => setScore(s => ({ ...s, correct: s.correct + 1 }))}
            onWrong={()   => setScore(s => ({ ...s, wrong:   s.wrong   + 1 }))}
          />
        )}
      </div>
    </div>
  )
}
