import { useState, useRef } from 'react'
import { API } from '../api/config'

const PRESET_TOPICS = [
  { id: 'xuat-nhap-khau',     label: 'Xuất nhập khẩu & Logistics', icon: '📦' },
  { id: 'van-phong',          label: 'Văn phòng & Kinh doanh',      icon: '💼' },
  { id: 'nha-hang',           label: 'Nhà hàng & Ẩm thực',          icon: '🍜' },
  { id: 'it-cong-nghe',       label: 'IT & Công nghệ',              icon: '💻' },
  { id: 'y-te',               label: 'Y tế & Sức khỏe',             icon: '🏥' },
  { id: 'ngan-hang',          label: 'Ngân hàng & Tài chính',       icon: '🏦' },
  { id: 'bat-dong-san',       label: 'Bất động sản',                icon: '🏠' },
  { id: 'du-lich',            label: 'Du lịch & Khách sạn',         icon: '✈️' },
  { id: 'san-xuat',           label: 'Sản xuất & Nhà máy',          icon: '🏭' },
  { id: 'thuong-mai-dien-tu', label: 'TM điện tử (Taobao/1688)',    icon: '🛒' },
]

const LEVELS = [
  { value: 'cơ bản',    label: 'Cơ bản — Mới bắt đầu' },
  { value: 'trung cấp', label: 'Trung cấp — Đã biết HSK 2-3' },
  { value: 'nâng cao',  label: 'Nâng cao — HSK 4+ / đi làm thực tế' },
]

const COUNTS = [10, 20, 30, 50, 75, 100]

// ─── TTS helper (dùng chung toàn file) ───────────────────────────────────────
let _topicAud = null
async function playTTS(text) {
  const clean = (text || '').trim()
  if (!clean) return
  if (_topicAud) { _topicAud.pause(); _topicAud = null }
  const a = new Audio(`${API}/tts?text=${encodeURIComponent(clean)}&speed=normal`)
  _topicAud = a
  await a.play()
}

// ─── Card từ vựng ─────────────────────────────────────────────────────────────
function WordCard({ word, idx }) {
  const [flipped,  setFlipped]  = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const [audioErr, setAudioErr] = useState(false)

  const play = async (text, e) => {
    e?.stopPropagation()
    if (playing) return
    setAudioErr(false)
    setPlaying(true)
    try {
      await playTTS(text)
    } catch {
      setAudioErr(true)
      setTimeout(() => setAudioErr(false), 2000)
    }
    setPlaying(false)
  }

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-red-200 transition-all select-none"
      style={{ minHeight: 160 }}
    >
      {!flipped ? (
        /* Mặt trước — chữ Hán */
        <div className="flex flex-col items-center justify-center gap-2 p-5 h-full min-h-[160px]">
          <span className="text-xs text-gray-400 self-start">#{idx + 1}</span>
          <p className="font-hanzi text-5xl font-bold text-gray-900 leading-none">{word.chinese}</p>
          <p className="text-red-500 text-base font-medium">{word.pinyin}</p>
          <button
            onClick={e => play(word.chinese, e)}
            className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors
              ${audioErr ? 'bg-orange-100 text-orange-500' : playing ? 'bg-red-500 text-white' : 'bg-red-50 hover:bg-red-100 text-red-500'}`}
          >
            {audioErr ? '⚠️' : '🔊'}
          </button>
          <p className="text-xs text-gray-400 mt-1">{audioErr ? 'Lỗi âm thanh' : 'Bấm để xem nghĩa'}</p>
        </div>
      ) : (
        /* Mặt sau — nghĩa + ví dụ */
        <div className="flex flex-col gap-3 p-5 h-full min-h-[160px]">
          <div className="flex items-baseline gap-2">
            <span className="font-hanzi text-3xl font-bold text-red-600">{word.chinese}</span>
            <span className="text-gray-500 text-sm">{word.pinyin}</span>
          </div>
          <p className="text-gray-900 font-semibold text-lg">{word.vietnamese}</p>
          {word.example && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1 border border-gray-100">
              <div className="flex items-center justify-between gap-2">
                <p className="font-hanzi text-base text-gray-800">{word.example}</p>
                <button
                  onClick={e => play(word.example, e)}
                  className="text-lg shrink-0 hover:scale-110 transition-transform"
                >🔊</button>
              </div>
              {word.example_pinyin && (
                <p className="text-blue-500 text-sm">{word.example_pinyin}</p>
              )}
              {word.example_vietnamese && (
                <p className="text-gray-500 text-sm">{word.example_vietnamese}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Màn hình cài đặt ─────────────────────────────────────────────────────────
function SetupScreen({ onGenerate, loading }) {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [customTopic,   setCustomTopic]   = useState('')
  const [level,         setLevel]         = useState('trung cấp')
  const [count,         setCount]         = useState(20)
  const [useCustom,     setUseCustom]     = useState(false)

  const topicId    = useCustom ? 'custom' : selectedTopic?.id
  const topicLabel = useCustom ? customTopic.trim() : selectedTopic?.label
  const canStart   = !loading && topicLabel && topicLabel.length >= 2

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Học theo chủ đề</h1>
        <p className="text-gray-500 text-base mt-1">AI tạo từ vựng thực tế theo ngành nghề của bạn</p>
      </div>

      {/* Chọn chủ đề preset */}
      <div className="space-y-3">
        <p className="font-semibold text-gray-700">Chọn chủ đề</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => { setSelectedTopic(t); setUseCustom(false) }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left transition-all
                ${!useCustom && selectedTopic?.id === t.id
                  ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50'
                }`}
            >
              <span className="text-xl shrink-0">{t.icon}</span>
              <span className="text-sm leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Chủ đề tuỳ chỉnh */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => { setUseCustom(true); setSelectedTopic(null) }}
            className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
              ${useCustom
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-600 hover:border-red-300'
              }`}
          >
            ✏️ Nhập chủ đề khác
          </button>
          {useCustom && (
            <input
              autoFocus
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="vd: Ngành dệt may, Luật pháp..."
              className="flex-1 border-2 border-red-300 rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-red-500"
            />
          )}
        </div>
      </div>

      {/* Cấp độ + số từ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className="font-semibold text-gray-700">Cấp độ</p>
          <div className="space-y-2">
            {LEVELS.map(l => (
              <label key={l.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all
                  ${level === l.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                  }`}
              >
                <input type="radio" name="level" value={l.value}
                  checked={level === l.value}
                  onChange={() => setLevel(l.value)}
                  className="accent-red-600" />
                <span className="text-sm text-gray-700">{l.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-gray-700">Số từ muốn học <span className="text-xs text-gray-400 font-normal">(50+ từ sẽ mất ~15–30 giây)</span></p>
          <div className="grid grid-cols-3 gap-2">
            {COUNTS.map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`py-3 rounded-xl border-2 font-bold text-base transition-all
                  ${count === n
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
              >
                {n} từ
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nút generate */}
      <button
        disabled={!canStart}
        onClick={() => onGenerate({ topicId, topicLabel, level, count })}
        className={`w-full py-4 rounded-2xl text-lg font-bold transition-all
          ${canStart
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
      >
        {loading ? '✨ AI đang tạo từ vựng...' : '✨ Tạo từ vựng với AI'}
      </button>
    </div>
  )
}

// ─── Màn hình kết quả ─────────────────────────────────────────────────────────
function ResultScreen({ result, onReset }) {
  const [view, setView]         = useState('cards')   // 'cards' | 'list'
  const [quizMode, setQuizMode] = useState(false)
  const [quizIdx,  setQuizIdx]  = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [chosen,   setChosen]   = useState(null)

  const { topic, level, words } = result
  const q = words[quizIdx]

  // Tạo 4 đáp án cho quiz
  const makeChoices = (word) => {
    const others = words.filter(w => w !== word)
      .sort(() => Math.random() - 0.5).slice(0, 3)
    const all = [word, ...others].sort(() => Math.random() - 0.5)
    return { choices: all.map(w => w.vietnamese), correct: all.indexOf(word) }
  }
  const [quizData] = useState(() => words.map(w => ({ ...w, ...makeChoices(w) })))

  const handleQuizChoose = (i) => {
    if (chosen !== null) return
    setChosen(i)
    if (i === quizData[quizIdx].correct) setQuizScore(s => s + 1)
    setTimeout(() => {
      if (quizIdx + 1 >= words.length) {
        setQuizMode(false)
      } else {
        setQuizIdx(n => n + 1)
        setChosen(null)
      }
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header kết quả */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{topic}</h2>
          <p className="text-gray-500 text-base mt-0.5">{words.length} từ · {level}</p>
        </div>
        <button onClick={onReset}
          className="px-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 font-medium">
          ← Tạo bộ mới
        </button>
      </div>

      {/* Tab chuyển đổi */}
      {!quizMode && (
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'cards', label: '🃏 Flashcard' },
            { id: 'list',  label: '📋 Danh sách' },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${view === t.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Flashcard grid */}
      {!quizMode && view === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {words.map((w, i) => <WordCard key={i} word={w} idx={i} />)}
        </div>
      )}

      {/* Danh sách */}
      {!quizMode && view === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {words.map((w, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <span className="font-hanzi text-2xl font-bold text-red-600 w-12 shrink-0">{w.chinese}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-blue-600 font-medium">{w.pinyin}</p>
                  <p className="text-gray-800 text-base">{w.vietnamese}</p>
                </div>
                <button
                  onClick={() => playTTS(w.chinese).catch(() => {})}
                  className="text-xl hover:scale-110 transition-transform shrink-0"
                >🔊</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nút quiz */}
      {!quizMode && (
        <button
          onClick={() => { setQuizMode(true); setQuizIdx(0); setQuizScore(0); setChosen(null) }}
          className="w-full py-3.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition-colors text-base"
        >
          🎯 Kiểm tra nhanh
        </button>
      )}

      {/* Mini quiz */}
      {quizMode && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">Câu {quizIdx + 1}/{words.length} · ✅ {quizScore} đúng</p>
            <button onClick={() => { setQuizMode(false); setChosen(null) }}
              className="text-sm text-gray-400 hover:text-gray-600">Dừng lại</button>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all"
              style={{ width: `${(quizIdx / words.length) * 100}%` }} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 text-center">
            <p className="font-hanzi text-7xl font-bold text-gray-900 leading-none">{q.chinese}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quizData[quizIdx].choices.map((ch, i) => {
              let cls = 'border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50'
              if (chosen !== null) {
                if (i === quizData[quizIdx].correct) cls = 'border-green-500 bg-green-50 text-green-700 font-bold'
                else if (i === chosen) cls = 'border-red-500 bg-red-50 text-red-700'
                else cls = 'border-gray-100 text-gray-400'
              }
              return (
                <button key={i} onClick={() => handleQuizChoose(i)} disabled={chosen !== null}
                  className={`border-2 rounded-xl px-4 py-4 text-base transition-colors ${cls}`}>
                  {chosen !== null && i === quizData[quizIdx].correct && '✅ '}{ch}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TopicPage() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleGenerate = async ({ topicId, topicLabel, level, count }) => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`${API}/topics/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId, topic_label: topicLabel, level, count }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Lỗi server')
      setResult(data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
      {error && (
        <div className="mb-4 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-base flex items-center gap-2">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xl">×</button>
        </div>
      )}

      {!result
        ? <SetupScreen onGenerate={handleGenerate} loading={loading} />
        : <ResultScreen result={result} onReset={() => setResult(null)} />
      }
    </div>
  )
}
