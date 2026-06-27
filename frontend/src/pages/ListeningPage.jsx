import { useState, useEffect, useRef, useCallback } from 'react'

import { API as BASE } from '../api/config'

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _aud = null
function playTTS(text, speed = 'normal') {
  if (_aud) { _aud.pause(); _aud = null }
  _aud = new Audio(`${BASE}/tts?text=${encodeURIComponent(text)}&speed=${speed}`)
  _aud.play().catch(() => {})
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function blankSentence(sentence, word) {
  const i = sentence.indexOf(word)
  if (i === -1) return null
  return [sentence.slice(0, i), sentence.slice(i + word.length)]
}

// ─── Thanh cài đặt ────────────────────────────────────────────────────────────
function SettingsBar({ level, mode, speed, score, onLevel, onMode, onSpeed }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-14 z-40">
      <div className="max-w-2xl mx-auto flex flex-wrap items-center gap-2">
        <select value={level} onChange={e => onLevel(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
          {[1,2,3,4,5,6,7,8,9].map(lv => <option key={lv} value={lv}>HSK {lv}</option>)}
        </select>

        <select value={mode} onChange={e => onMode(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
          <option value="listen-choose">Nghe → Chọn nghĩa</option>
          <option value="listen-fill">Nghe → Điền từ</option>
        </select>

        <div className="flex gap-1">
          {[
            { v: 'slow',   l: '🐢', t: 'Chậm'         },
            { v: 'normal', l: '▶',  t: 'Bình thường'   },
            { v: 'fast',   l: '⚡', t: 'Nhanh'         },
          ].map(({ v, l, t }) => (
            <button key={v} title={t} onClick={() => onSpeed(v)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                speed === v
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
              }`}>
              {l}
            </button>
          ))}
        </div>

        <div className="ml-auto text-sm font-semibold tabular-nums">
          <span className="text-green-600">✅ {score.correct}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-red-500">❌ {score.wrong}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Chế độ 1: Nghe → Chọn nghĩa ─────────────────────────────────────────────
function ListenChooseMode({ word, pool, speed, onCorrect, onWrong, onAdvance }) {
  const [choices,  setChoices]  = useState([])
  const [selected, setSelected] = useState(null)
  const advancedRef = useRef(false)
  const speedRef    = useRef(speed)
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => {
    advancedRef.current = false
    const others = shuffle(pool.filter(w => w.id !== word.id)).slice(0, 3)
    setChoices(shuffle([word, ...others]))
    setSelected(null)
    playTTS(word.chinese, speedRef.current)
  }, [word.id])

  const safeAdvance = useCallback(() => {
    if (!advancedRef.current) { advancedRef.current = true; onAdvance() }
  }, [onAdvance])

  const handleSelect = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (choices[i].id === word.id) { onCorrect(); setTimeout(safeAdvance, 1200) }
    else onWrong()
  }

  const correctIdx = choices.findIndex(c => c.id === word.id)

  const cellStyle = (i) => {
    if (selected === null) return 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50'
    if (i === correctIdx)  return 'bg-green-50 border-green-500 text-green-700 font-semibold'
    if (i === selected)    return 'bg-red-50 border-red-500 text-red-700'
    return 'bg-white border-gray-200 text-gray-400'
  }

  return (
    <div className="space-y-5">
      {/* Ô câu hỏi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        <p className="text-sm text-gray-400">Nghe và chọn nghĩa đúng</p>
        <div className="text-7xl select-none">🎧</div>
        <div className="flex justify-center gap-3">
          <button onClick={() => playTTS(word.chinese, speed)}
            title="Phát lại"
            className="w-12 h-12 rounded-full bg-red-50 hover:bg-red-100 text-xl transition-colors">
            🔊
          </button>
          <button onClick={() => playTTS(word.chinese, 'slow')}
            title="Phát chậm"
            className="w-12 h-12 rounded-full bg-orange-50 hover:bg-orange-100 text-xl transition-colors">
            🐢
          </button>
        </div>
        {selected !== null && (
          <div className="pt-1 animate-[fadeIn_0.3s_ease]">
            <span className="font-hanzi text-4xl text-gray-800">{word.chinese}</span>
            <span className="text-red-500 text-lg ml-3">{word.pinyin}</span>
          </div>
        )}
      </div>

      {/* 4 đáp án 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {choices.map((ch, i) => (
          <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null}
            className={`border-2 rounded-xl px-4 py-4 text-sm text-left leading-snug transition-colors ${cellStyle(i)}`}>
            {selected !== null && i === correctIdx && <span className="mr-1">✅</span>}
            {ch.vietnamese}
          </button>
        ))}
      </div>

      {/* Nút tiếp tục (chỉ khi sai) */}
      {selected !== null && selected !== correctIdx && (
        <button onClick={safeAdvance}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors">
          Tiếp tục →
        </button>
      )}
    </div>
  )
}

// ─── Chế độ 2: Nghe → Điền từ ────────────────────────────────────────────────
function ListenFillMode({ word, speed, onCorrect, onWrong, onAdvance }) {
  const [input,       setInput]       = useState('')
  const [checked,     setChecked]     = useState(false)
  const [isCorrect,   setIsCorrect]   = useState(false)
  const [showPinyin,  setShowPinyin]  = useState(false)
  const inputRef  = useRef(null)
  const speedRef  = useRef(speed)
  useEffect(() => { speedRef.current = speed }, [speed])

  useEffect(() => {
    setInput(''); setChecked(false); setIsCorrect(false); setShowPinyin(false)
    playTTS(word.example, speedRef.current)
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [word.id])

  const handleCheck = () => {
    if (checked) return
    const correct = input.trim() === word.chinese
    setIsCorrect(correct)
    setChecked(true)
    if (correct) { onCorrect(); setTimeout(onAdvance, 1600) }
    else onWrong()
  }

  const parts = blankSentence(word.example, word.chinese) // [before, after]

  return (
    <div className="space-y-5">
      {/* Câu có ô trống */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <p className="text-sm text-gray-400 text-center">Nghe câu và điền từ còn thiếu</p>

        <p className="font-hanzi text-2xl text-center leading-relaxed text-gray-800 break-all">
          {parts ? (
            <>
              {parts[0]}
              <span className={`inline-block border-b-2 px-1 mx-0.5 min-w-[2.5ch] text-center align-middle transition-colors ${
                checked && isCorrect  ? 'border-green-500 text-green-600' :
                checked && !isCorrect ? 'border-red-400   text-red-500'   :
                                       'border-gray-500   text-transparent'}`}>
                {word.chinese}
              </span>
              {parts[1]}
            </>
          ) : (
            <span>{word.example}</span>
          )}
        </p>

        {/* Nút audio + gợi ý */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button onClick={() => playTTS(word.example, speed)}
            title="Phát lại" className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-lg transition-colors">
            🔊
          </button>
          <button onClick={() => playTTS(word.example, 'slow')}
            title="Phát chậm" className="w-10 h-10 rounded-full bg-orange-50 hover:bg-orange-100 text-lg transition-colors">
            🐢
          </button>
          <button onClick={() => setShowPinyin(v => !v)}
            className="px-3 h-10 rounded-full bg-blue-50 hover:bg-blue-100 text-sm text-blue-600 font-medium transition-colors">
            {showPinyin ? 'Ẩn pinyin' : 'Xem pinyin'}
          </button>
        </div>

        {showPinyin && (
          <p className="text-center text-blue-500 text-sm font-medium">{word.pinyin}</p>
        )}
      </div>

      {/* Input + kiểm tra */}
      <div className="flex gap-3">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !checked && handleCheck()}
          disabled={checked}
          placeholder="Gõ chữ Hán..."
          className={`flex-1 border-2 rounded-xl px-4 py-3 font-hanzi text-xl focus:outline-none transition-colors ${
            checked && isCorrect  ? 'border-green-500 bg-green-50'  :
            checked && !isCorrect ? 'border-red-400   bg-red-50'    :
                                   'border-gray-300 focus:border-red-400'}`}
        />
        {!checked && (
          <button onClick={handleCheck}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shrink-0">
            Kiểm tra
          </button>
        )}
      </div>

      {/* Kết quả */}
      {checked && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect
            ? '✅ Chính xác!'
            : <span>
                ❌ Đáp án đúng:{' '}
                <span className="font-hanzi text-base font-bold">{word.chinese}</span>
                {' '}({word.pinyin}) — {word.vietnamese}
              </span>
          }
        </div>
      )}

      {checked && !isCorrect && (
        <button onClick={onAdvance}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors">
          Tiếp tục →
        </button>
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ListeningPage() {
  const [level,   setLevel]   = useState(1)
  const [mode,    setMode]    = useState('listen-choose')
  const [speed,   setSpeed]   = useState('normal')
  const [pool,    setPool]    = useState([])
  const [idx,     setIdx]     = useState(0)
  const [score,   setScore]   = useState({ correct: 0, wrong: 0 })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`${BASE}/vocabulary/${level}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => {
        let words = d.data || []
        if (mode === 'listen-fill') {
          words = words.filter(w => w.example && w.example.includes(w.chinese))
        }
        setPool(shuffle(words))
        setIdx(0)
        setScore({ correct: 0, wrong: 0 })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [level, mode])

  const currentWord = pool[idx] ?? null
  const advance = useCallback(() => setIdx(i => (i + 1) % pool.length), [pool.length])
  const addCorrect = useCallback(() => setScore(s => ({ ...s, correct: s.correct + 1 })), [])
  const addWrong   = useCallback(() => setScore(s => ({ ...s, wrong:   s.wrong   + 1 })), [])

  return (
    <div>
      <SettingsBar
        level={level} mode={mode} speed={speed} score={score}
        onLevel={setLevel} onMode={setMode} onSpeed={setSpeed}
      />

      <div className="max-w-lg mx-auto px-4 py-8">
        {loading && <div className="text-center text-gray-400 py-20 text-lg">Đang tải...</div>}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">Lỗi: {error}</div>
        )}

        {!loading && !error && pool.length === 0 && (
          <div className="text-center text-gray-400 py-20 space-y-2">
            <div className="text-5xl">😕</div>
            <p>Không có dữ liệu cho HSK {level}{mode === 'listen-fill' ? ' (không có câu ví dụ)' : ''}</p>
          </div>
        )}

        {!loading && !error && currentWord && mode === 'listen-choose' && (
          <ListenChooseMode
            key={`choose-${level}-${idx}`}
            word={currentWord} pool={pool} speed={speed}
            onCorrect={addCorrect} onWrong={addWrong} onAdvance={advance}
          />
        )}

        {!loading && !error && currentWord && mode === 'listen-fill' && (
          <ListenFillMode
            key={`fill-${level}-${idx}`}
            word={currentWord} speed={speed}
            onCorrect={addCorrect} onWrong={addWrong} onAdvance={advance}
          />
        )}
      </div>
    </div>
  )
}
