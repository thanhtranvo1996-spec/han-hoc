import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveProgress } from '../api/vocabulary'
import WordDetail from '../components/WordDetail'

import { API as BASE } from '../api/config'

async function fetchQuiz(level, mode, limit) {
  const res = await fetch(`${BASE}/vocabulary/quiz?level=${level}&mode=${mode}&limit=${limit}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.data
}

let _quizAud = null
function speak(text) {
  if (_quizAud) { _quizAud.pause(); _quizAud = null }
  _quizAud = new Audio(`${BASE}/tts?text=${encodeURIComponent(text)}&speed=normal`)
  _quizAud.play().catch(() => {})
}

// ─── Màn hình 1: Cài đặt ─────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [level,  setLevel]  = useState(1)
  const [mode,   setMode]   = useState('han-to-viet')
  const [limit,  setLimit]  = useState(10)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 pb-24 flex flex-col items-center gap-8">
      <div className="text-center">
        <span className="text-5xl">📝</span>
        <h1 className="text-3xl font-bold text-gray-800 mt-3">Quiz Trắc nghiệm</h1>
        <p className="text-gray-500 text-base mt-1">Kiểm tra từ vựng của bạn</p>
      </div>

      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        {/* Cấp HSK */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Cấp độ HSK</label>
          <select
            value={level}
            onChange={e => setLevel(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {[1,2,3,4,5,6,7,8,9].map(lv => (
              <option key={lv} value={lv}>HSK {lv}</option>
            ))}
          </select>
        </div>

        {/* Chế độ */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Chế độ</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'han-to-viet', label: '汉 → Việt' },
              { value: 'viet-to-han', label: 'Việt → 汉' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  mode === opt.value
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Số câu */}
        <div>
          <label className="block text-base font-semibold text-gray-700 mb-2">Số câu hỏi</label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 50].map(n => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  limit === n
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                }`}
              >
                {n} câu
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onStart({ level, mode, limit })}
        className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-base transition-colors shadow-md"
      >
        Bắt đầu
      </button>
    </div>
  )
}

// ─── Màn hình 2: Đang làm quiz ───────────────────────────────────────────────
const COLORS = {
  default: 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50',
  correct: 'bg-green-50 border-green-500 text-green-700 font-bold',
  wrong:   'bg-red-50 border-red-500 text-red-700',
}

function QuizScreen({ questions, mode, onFinish }) {
  const [idx,      setIdx]      = useState(0)
  const [chosen,   setChosen]   = useState(null)   // index chọn
  const [wrongs,   setWrongs]   = useState([])     // { question, correctAnswer }
  const [score,    setScore]    = useState(0)

  const q = questions[idx]

  // Auto-play khi câu mới xuất hiện (chỉ chế độ hán → việt)
  useEffect(() => {
    if (mode === 'han-to-viet') speak(q.question.chinese)
  }, [idx])

  const handleChoose = useCallback((i) => {
    if (chosen !== null) return
    setChosen(i)

    const isCorrect = i === q.correct
    if (isCorrect) {
      setScore(s => s + 1)
      saveProgress(q.word_id, 'known').catch(() => {})
      setTimeout(() => advance(i, isCorrect), 1000)
    } else {
      saveProgress(q.word_id, 'unknown').catch(() => {})
    }
  }, [chosen, q])

  const advance = useCallback((chosenIdx, wasCorrect) => {
    const newWrongs = !wasCorrect
      ? [...wrongs, { q, chosenIdx }]
      : wrongs

    if (idx + 1 >= questions.length) {
      const finalScore = wasCorrect ? score + 1 : score
      onFinish({ score: finalScore, total: questions.length, wrongs: newWrongs })
    } else {
      setWrongs(newWrongs)
      setIdx(i => i + 1)
      setChosen(null)
    }
  }, [idx, wrongs, score, questions, q, onFinish])

  const getColor = (i) => {
    if (chosen === null) return COLORS.default
    if (i === q.correct)  return COLORS.correct
    if (i === chosen)     return COLORS.wrong
    return COLORS.default
  }

  const isHanMode = mode === 'han-to-viet'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 flex flex-col gap-6">
      {/* Tiến trình */}
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-1.5">
          <span>Câu {idx + 1}/{questions.length}</span>
          <span className="font-semibold text-green-600">{score} đúng</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${((idx) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Câu hỏi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 text-center min-h-[160px] flex flex-col items-center justify-center gap-3">
        {isHanMode ? (
          <>
            <p className="font-hanzi text-[96px] leading-none text-gray-800">{q.question.chinese}</p>
            <button
              onClick={() => speak(q.question.chinese)}
              className="text-2xl hover:scale-110 transition-transform"
              title="Nghe phát âm"
            >
              🔊
            </button>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-800">{q.question.vietnamese}</p>
            <p className="text-sm text-gray-400">Chọn chữ Hán tương ứng</p>
          </>
        )}
      </div>

      {/* 4 đáp án — 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {q.answers.map((ans, i) => (
          <button
            key={i}
            onClick={() => handleChoose(i)}
            disabled={chosen !== null}
            className={`border-2 rounded-xl px-4 py-5 text-base transition-colors leading-snug
              ${getColor(i)}
              ${i === q.correct && chosen !== null ? COLORS.correct : ''}
            `}
          >
            {chosen !== null && i === q.correct && <span className="mr-1">✅</span>}
            {isHanMode
              ? <span>{ans}</span>
              : <span className="font-hanzi text-2xl">{ans}</span>
            }
          </button>
        ))}
      </div>

      {/* Nút Tiếp tục (chỉ hiện khi trả lời sai) */}
      {chosen !== null && chosen !== q.correct && (
        <button
          onClick={() => advance(chosen, false)}
          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Tiếp tục →
        </button>
      )}
    </div>
  )
}

// ─── Màn hình 3: Kết quả ─────────────────────────────────────────────────────
function ResultScreen({ score, total, wrongs, mode, onRetry, onHome }) {
  const pct = Math.round((score / total) * 100)

  const { emoji, label, color } =
    pct >= 90 ? { emoji: '🎉', label: 'Xuất sắc!',     color: 'text-green-600' } :
    pct >= 70 ? { emoji: '💪', label: 'Tốt lắm!',      color: 'text-blue-600'  } :
                { emoji: '📚', label: 'Cần ôn thêm',   color: 'text-orange-500' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 flex flex-col gap-6">
      {/* Điểm */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-6xl font-black text-gray-800">{score}<span className="text-3xl text-gray-400">/{total}</span></p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{pct}%</p>
        <p className={`text-xl mt-3 font-semibold ${color}`}>{label} {emoji}</p>
      </div>

      {/* Câu sai */}
      {wrongs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-red-50">
            <p className="text-sm font-semibold text-red-700">Câu trả lời sai ({wrongs.length})</p>
          </div>
          <div className="divide-y divide-gray-100">
            {wrongs.map(({ q }, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <span className="font-hanzi text-2xl text-gray-800 w-12 flex-shrink-0">
                  {q.question.chinese || '—'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">{q.question.pinyin || q.question.vietnamese}</p>
                  <p className="text-sm font-medium text-green-700">{q.answers[q.correct]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Làm lại
        </button>
        <button
          onClick={onHome}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-300 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  )
}

// Thêm nút "Chi tiết" trong ResultScreen
function ResultScreenWithDetail({ score, total, wrongs, mode, onRetry, onHome }) {
  const [detail, setDetail] = useState(null)
  const pct = Math.round((score / total) * 100)
  const { emoji, label, color } =
    pct >= 90 ? { emoji: '🎉', label: 'Xuất sắc!',   color: 'text-green-600'  } :
    pct >= 70 ? { emoji: '💪', label: 'Tốt lắm!',    color: 'text-blue-600'   } :
                { emoji: '📚', label: 'Cần ôn thêm', color: 'text-orange-500' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-6xl font-black text-gray-800">{score}<span className="text-3xl text-gray-400">/{total}</span></p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{pct}%</p>
        <p className={`text-xl mt-3 font-semibold ${color}`}>{label} {emoji}</p>
      </div>
      {wrongs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-red-50">
            <p className="text-sm font-semibold text-red-700">Câu trả lời sai ({wrongs.length})</p>
          </div>
          <div className="divide-y divide-gray-100">
            {wrongs.map(({ q }, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <span className="font-hanzi text-2xl text-gray-800 w-12 flex-shrink-0">{q.question.chinese || '—'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{q.question.pinyin || q.question.vietnamese}</p>
                  <p className="text-sm font-medium text-green-700">{q.answers[q.correct]}</p>
                </div>
                {q.question.chinese && (
                  <button onClick={() => setDetail({ chinese: q.question.chinese, pinyin: q.question.pinyin || '', vietnamese: q.answers[q.correct], hsk_level: 1 })}
                    className="text-xs text-blue-500 hover:text-blue-700 shrink-0">Chi tiết</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onRetry}  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">Làm lại</button>
        <button onClick={onHome}   className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl border border-gray-300">Về trang chủ</button>
      </div>
      {detail && <WordDetail word={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate()
  const [screen,    setScreen]    = useState('setup')   // 'setup' | 'quiz' | 'result'
  const [config,    setConfig]    = useState(null)
  const [questions, setQuestions] = useState([])
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const handleStart = async (cfg) => {
    setLoading(true)
    setError(null)
    try {
      const qs = await fetchQuiz(cfg.level, cfg.mode, cfg.limit)
      setConfig(cfg)
      setQuestions(qs)
      setScreen('quiz')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = (res) => {
    setResult(res)
    setScreen('result')
  }

  const handleRetry = () => {
    setScreen('setup')
    setResult(null)
    setQuestions([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-lg">
        Đang tải câu hỏi...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-600 font-semibold">Lỗi: {error}</p>
        <button onClick={() => setError(null)} className="text-sm text-gray-500 underline">
          Thử lại
        </button>
      </div>
    )
  }

  if (screen === 'setup') return <SetupScreen onStart={handleStart} />

  if (screen === 'quiz') return (
    <QuizScreen
      questions={questions}
      mode={config.mode}
      onFinish={handleFinish}
    />
  )

  if (screen === 'result') return (
    <ResultScreenWithDetail
      {...result}
      mode={config.mode}
      onRetry={handleRetry}
      onHome={() => navigate('/')}
    />
  )
}
